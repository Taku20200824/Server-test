<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class IrisTestController extends Controller
{
    public function index(Request $request)
    {
        return view('welcome', [
            'irisUrl' => $this->maskedBaseUrl(),
        ]);
    }

    public function ping()
    {
        return $this->callIris('/api/ping');
    }

    public function search(Request $request)
    {
        $validated = $request->validate([
            'barcode' => ['nullable', 'string', 'max:80'],
        ]);

        $barcode = $this->cleanBarcode($validated['barcode'] ?? '');

        if ($barcode === '') {
            return $this->listRecords();
        }

        return $this->callIris('/api/search/'.rawurlencode($barcode), [
            'barcode' => $barcode,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'barcode' => ['nullable', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:120'],
            'kanji' => ['nullable', 'string', 'max:120'],
            'katakana' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $configError = $this->configurationError();

        if ($configError !== null) {
            return response()->json([
                'message' => $configError,
            ], 422);
        }

        $barcode = $this->cleanBarcode($validated['barcode'] ?? '');

        if ($barcode === '') {
            try {
                $barcode = $this->nextBarcode();
            } catch (ConnectionException $exception) {
                return response()->json([
                    'message' => 'IRIS server could not be reached.',
                    'detail' => $exception->getMessage(),
                ], 502);
            }
        }

        $payload = [
            'barcode' => $barcode,
            'name' => $validated['name'],
            'kanji' => $validated['kanji'] ?? '',
            'katakana' => $validated['katakana'] ?? '',
            'address' => $validated['address'] ?? '',
        ];

        return $this->callIris('/api/register', $payload, 'post');
    }

    private function callIris(string $path, array $meta = [], string $method = 'get')
    {
        $configError = $this->configurationError();

        if ($configError !== null) {
            return response()->json([
                'message' => $configError,
            ], 422);
        }

        $url = $this->irisBaseUrl().Str::start($path, '/');

        try {
            $request = Http::withBasicAuth(config('services.iris.user'), config('services.iris.password'))
                ->acceptJson()
                ->timeout((int) config('services.iris.timeout', 10));

            $response = $method === 'post'
                ? $request->asJson()->post($url, $meta)
                : $request->get($url);
        } catch (ConnectionException $exception) {
            return response()->json([
                'message' => 'IRIS server could not be reached.',
                'detail' => $exception->getMessage(),
            ], 502);
        }

        return response()->json([
            'called_url' => $url,
            'iris_status' => $response->status(),
            'request' => $meta,
            'data' => $response->json() ?? $response->body(),
        ], $response->successful() ? 200 : $response->status());
    }

    private function listRecords()
    {
        $configError = $this->configurationError();

        if ($configError !== null) {
            return response()->json([
                'message' => $configError,
            ], 422);
        }

        try {
            $listTimeout = max(1, (int) config('services.iris.list_timeout', 2));
            $request = Http::withBasicAuth(config('services.iris.user'), config('services.iris.password'))
                ->acceptJson()
                ->timeout($listTimeout);

            $listUrl = $this->irisBaseUrl().'/api/list';
            $listResponse = $request->get($listUrl);
            $listData = $listResponse->json();

            if ($listResponse->successful() && is_array($listData) && array_key_exists('records', $listData)) {
                return response()->json([
                    'called_url' => $listUrl,
                    'iris_status' => $listResponse->status(),
                    'request' => ['barcode' => ''],
                    'data' => $listData,
                ]);
            }

            $fallbackLimit = max(1, min((int) config('services.iris.list_fallback_max', 80), 500));
            $searched = collect(range(1, $fallbackLimit))
                ->map(fn ($id) => str_pad((string) $id, 6, '0', STR_PAD_LEFT))
                ->all();

            $responses = Http::pool(fn (Pool $pool) => collect($searched)
                ->map(fn ($barcode) => $pool
                    ->withBasicAuth(config('services.iris.user'), config('services.iris.password'))
                    ->acceptJson()
                    ->timeout($listTimeout)
                    ->get($this->irisBaseUrl().'/api/search/'.rawurlencode($barcode)))
                ->all());

            $records = [];

            foreach ($responses as $response) {
                $data = $response->json();

                if ($response->successful() && is_array($data) && ($data['found'] ?? false)) {
                    $records[] = $data;
                }
            }
        } catch (ConnectionException $exception) {
            return response()->json([
                'message' => 'IRIS server could not be reached.',
                'detail' => $exception->getMessage(),
            ], 502);
        }

        return response()->json([
            'called_url' => $listUrl,
            'iris_status' => $listResponse->status(),
            'request' => [
                'barcode' => '',
                'fallback_used' => true,
                'fallback_limit' => count($searched),
                'fallback_search' => $searched,
            ],
            'data' => [
                'count' => count($records),
                'records' => $records,
            ],
        ]);
    }

    private function nextBarcode(): string
    {
        $listTimeout = max(1, (int) config('services.iris.list_timeout', 2));
        $request = Http::withBasicAuth(config('services.iris.user'), config('services.iris.password'))
            ->acceptJson()
            ->timeout($listTimeout);

        $records = [];
        $listResponse = $request->get($this->irisBaseUrl().'/api/list');
        $listData = $listResponse->json();

        if ($listResponse->successful() && is_array($listData) && is_array($listData['records'] ?? null)) {
            $records = $listData['records'];
        } else {
            $fallbackLimit = max(1, min((int) config('services.iris.list_fallback_max', 80), 500));
            $searched = collect(range(1, $fallbackLimit))
                ->map(fn ($id) => str_pad((string) $id, 6, '0', STR_PAD_LEFT))
                ->all();

            $responses = Http::pool(fn (Pool $pool) => collect($searched)
                ->map(fn ($barcode) => $pool
                    ->withBasicAuth(config('services.iris.user'), config('services.iris.password'))
                    ->acceptJson()
                    ->timeout($listTimeout)
                    ->get($this->irisBaseUrl().'/api/search/'.rawurlencode($barcode)))
                ->all());

            foreach ($responses as $response) {
                $data = $response->json();

                if ($response->successful() && is_array($data) && ($data['found'] ?? false)) {
                    $records[] = $data;
                }
            }
        }

        $max = collect($records)
            ->map(fn ($record) => max((int) ($record['no'] ?? 0), (int) $this->cleanBarcode($record['barcode'] ?? '')))
            ->max() ?? 0;

        return str_pad((string) ($max + 1), 6, '0', STR_PAD_LEFT);
    }

    private function cleanBarcode(?string $barcode): string
    {
        return Str::upper(trim(str_replace('*', '', $barcode)));
    }

    private function irisBaseUrl(): string
    {
        return sprintf(
            'http://%s:%s%s',
            config('services.iris.url'),
            config('services.iris.port'),
            Str::start(config('services.iris.api_path'), '/')
        );
    }

    private function maskedBaseUrl(): string
    {
        if (! config('services.iris.url') || ! config('services.iris.port')) {
            return 'IRIS endpoint is not configured';
        }

        return $this->irisBaseUrl();
    }

    private function configurationError(): ?string
    {
        $missing = collect([
            'IRIS_URL' => config('services.iris.url'),
            'IRIS_PORT' => config('services.iris.port'),
            'IRIS_API_PATH' => config('services.iris.api_path'),
            'IRIS_USER' => config('services.iris.user'),
            'IRIS_PASSWORD' => config('services.iris.password'),
        ])->filter(fn ($value) => blank($value))->keys();

        if ($missing->isEmpty()) {
            return null;
        }

        return 'Missing IRIS environment values: '.$missing->implode(', ');
    }
}
