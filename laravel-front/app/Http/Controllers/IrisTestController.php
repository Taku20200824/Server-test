<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class IrisTestController extends Controller
{
    public function index(Request $request)
    {
        return view('welcome', [
            'irisUrl' => $this->maskedBaseUrl(),
            'isAdmin' => $this->isAdmin($request),
            'loginUser' => $request->session()->get('iris_login_user', ''),
            'loginName' => $request->session()->get('iris_login_name', $request->session()->get('iris_login_user', '')),
            'loginRole' => $request->session()->get('iris_login_role', 'viewer'),
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
        if (! $this->isAdmin($request)) {
            return $this->adminOnlyResponse();
        }

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

        $fieldErrors = $this->validateNameScripts($validated);

        if ($fieldErrors !== []) {
            return response()->json([
                'message' => 'Kanji/Katakana check failed.',
                'errors' => $fieldErrors,
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
        } else {
            try {
                if ($this->barcodeExists($barcode)) {
                    return response()->json([
                        'message' => 'This ID already exists. Please change the ID.',
                        'errors' => [
                            'barcode' => ['This ID already exists. Please change the ID.'],
                        ],
                    ], 422);
                }
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

    public function update(Request $request)
    {
        if (! $this->isAdmin($request)) {
            return $this->adminOnlyResponse();
        }

        $validated = $request->validate([
            'barcode' => ['required', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:120'],
            'kanji' => ['nullable', 'string', 'max:120'],
            'katakana' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $barcode = $this->cleanBarcode($validated['barcode']);

        if ($barcode === '') {
            return response()->json([
                'message' => 'Barcode is required for edit.',
                'errors' => [
                    'barcode' => ['Barcode is required for edit.'],
                ],
            ], 422);
        }

        $fieldErrors = $this->validateNameScripts($validated);

        if ($fieldErrors !== []) {
            return response()->json([
                'message' => 'Kanji/Katakana check failed.',
                'errors' => $fieldErrors,
            ], 422);
        }

        return $this->callIris('/api/register', [
            'barcode' => $barcode,
            'name' => $validated['name'],
            'kanji' => $validated['kanji'] ?? '',
            'katakana' => $validated['katakana'] ?? '',
            'address' => $validated['address'] ?? '',
        ], 'post');
    }

    public function delete(Request $request)
    {
        if (! $this->isAdmin($request)) {
            return $this->adminOnlyResponse();
        }

        $validated = $request->validate([
            'barcode' => ['required', 'string', 'max:80'],
        ]);

        $barcode = $this->cleanBarcode($validated['barcode']);

        if ($barcode === '') {
            return response()->json([
                'message' => 'Barcode is required for delete.',
                'errors' => [
                    'barcode' => ['Barcode is required for delete.'],
                ],
            ], 422);
        }

        return $this->callIris('/api/delete', [
            'barcode' => $barcode,
        ], 'post');
    }

    public function downloadCsv(Request $request): StreamedResponse
    {
        if (! $this->isAdmin($request)) {
            abort(403);
        }

        if ($this->configurationError() !== null) {
            abort(422, $this->configurationError());
        }

        try {
            $records = $this->fetchRecords()['records'];
        } catch (ConnectionException $exception) {
            abort(502, 'IRIS server could not be reached.');
        }

        $filename = 'iris-records-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($records) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['id', 'barcode', 'name', 'kanji', 'katakana', 'address', 'addedDateTime']);

            foreach ($records as $record) {
                fputcsv($output, [
                    (string) ($record['no'] ?? ''),
                    $this->excelText($this->csvBarcode($record)),
                    $record['name'] ?? '',
                    $record['kanji'] ?? '',
                    $record['katakana'] ?? '',
                    $record['address'] ?? '',
                    $record['addedDateTime'] ?? '',
                ]);
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    public function downloadBarcodes(Request $request): StreamedResponse
    {
        if (! $this->isAdmin($request)) {
            abort(403);
        }

        if ($this->configurationError() !== null) {
            abort(422, $this->configurationError());
        }

        try {
            $records = $this->fetchRecords()['records'];
        } catch (ConnectionException $exception) {
            abort(502, 'IRIS server could not be reached.');
        }

        $filename = 'iris-barcodes-'.now()->format('Ymd-His').'.html';

        return response()->streamDownload(function () use ($records) {
            echo "<!doctype html>\n<html lang=\"en\">\n<head>\n";
            echo "<meta charset=\"utf-8\">\n<title>IRIS Barcodes</title>\n";
            echo "<style>
                *{box-sizing:border-box}
                body{margin:0;padding:24px;background:#f7f7f4;color:#111;font-family:Arial,'Helvetica Neue',sans-serif}
                h1{margin:0 0 18px;font-size:22px;letter-spacing:.08em;text-transform:uppercase}
                .sheet{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
                .label{break-inside:avoid;background:#fff;border:1px solid #d8d8d2;border-radius:12px;padding:14px;box-shadow:0 8px 24px #00000014}
                .meta{display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#666}
                .barcode{display:flex;justify-content:center;padding:10px 6px;background:#fff;border-radius:8px}
                .number{text-align:center;margin-top:8px;font-size:18px;font-weight:800;letter-spacing:.16em}
                @media print{body{background:#fff;padding:10mm}.label{box-shadow:none;border-color:#111}h1{display:none}}
            </style>\n";
            echo "</head>\n<body>\n<h1>IRIS Barcodes</h1>\n<div class=\"sheet\">\n";

            foreach ($records as $record) {
                $id = (string) ($record['no'] ?? '');
                $barcode = $this->csvBarcode($record);

                echo "<section class=\"label\">\n";
                echo "<div class=\"meta\"><span>ID ".e($id)."</span><span>".e($barcode)."</span></div>\n";
                echo "<div class=\"barcode\">".$this->code39Svg($barcode)."</div>\n";
                echo "<div class=\"number\">".e($barcode)."</div>\n";
                echo "</section>\n";
            }

            echo "</div>\n</body>\n</html>\n";
        }, $filename, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    public function uploadCsv(Request $request)
    {
        if (! $this->isAdmin($request)) {
            return $this->adminOnlyResponse();
        }

        if ($this->configurationError() !== null) {
            return back()->withErrors([
                'csv_file' => $this->configurationError(),
            ], 'csv');
        }

        $validated = $request->validateWithBag('csv', [
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $rows = $this->readCsvRows($validated['csv_file']->getRealPath());
        $imported = 0;
        $failed = [];

        foreach ($rows as $index => $row) {
            $payload = [
                'barcode' => $this->cleanBarcode($row['barcode'] ?? $row['id'] ?? $row['no'] ?? ''),
                'name' => trim((string) ($row['name'] ?? '')),
                'kanji' => trim((string) ($row['kanji'] ?? '')),
                'katakana' => trim((string) ($row['katakana'] ?? '')),
                'address' => trim((string) ($row['address'] ?? '')),
            ];

            if ($payload['barcode'] === '' || $payload['name'] === '') {
                $failed[] = 'row '.($index + 2).': barcode/name required';
                continue;
            }

            $fieldErrors = $this->validateNameScripts($payload);

            if ($fieldErrors !== []) {
                $failed[] = 'row '.($index + 2).': kanji/katakana check failed';
                continue;
            }

            try {
                $response = $this->postIrisRegister($payload);
            } catch (ConnectionException $exception) {
                $failed[] = 'row '.($index + 2).': IRIS connection failed';
                continue;
            }

            if ($response->successful()) {
                $imported++;
            } else {
                $failed[] = 'row '.($index + 2).': IRIS '.$response->status();
            }
        }

        return back()->with('csv_import', sprintf('CSV imported: %d, failed: %d%s', $imported, count($failed), $failed === [] ? '' : ' ('.implode('; ', array_slice($failed, 0, 4)).')'));
    }

    private function validateNameScripts(array $validated): array
    {
        $errors = [];
        $kanji = trim((string) ($validated['kanji'] ?? ''));
        $katakana = trim((string) ($validated['katakana'] ?? ''));

        if ($kanji !== '' && ! preg_match('/^[\p{Han}\p{Hiragana}\p{Katakana}\x{30FC}\s　]+$/u', $kanji)) {
            $errors['kanji'] = ['Kanji must use kanji or hiragana characters.'];
        }

        if ($katakana !== '' && ! preg_match('/^[\p{Katakana}\x{FF66}-\x{FF9F}\x{30FC}\x{30FB}\s　]+$/u', $katakana)) {
            $errors['katakana'] = ['Katakana must use katakana characters.'];
        }

        return $errors;
    }

    private function isAdmin(Request $request): bool
    {
        return $request->session()->get('iris_login_role') === 'admin';
    }

    private function adminOnlyResponse()
    {
        return response()->json([
            'message' => 'Admin login is required to edit records.',
        ], 403);
    }

    private function barcodeExists(string $barcode): bool
    {
        $request = Http::withBasicAuth(config('services.iris.user'), config('services.iris.password'))
            ->acceptJson()
            ->timeout((int) config('services.iris.timeout', 10));

        $response = $request->get($this->irisBaseUrl().'/api/search/'.rawurlencode($barcode));
        $data = $response->json();

        return $response->successful() && is_array($data) && (bool) ($data['found'] ?? false);
    }

    private function postIrisRegister(array $payload)
    {
        return Http::withBasicAuth(config('services.iris.user'), config('services.iris.password'))
            ->acceptJson()
            ->timeout((int) config('services.iris.timeout', 10))
            ->asJson()
            ->post($this->irisBaseUrl().'/api/register', $payload);
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
            $result = $this->fetchRecords();
        } catch (ConnectionException $exception) {
            return response()->json([
                'message' => 'IRIS server could not be reached.',
                'detail' => $exception->getMessage(),
            ], 502);
        }

        return response()->json([
            'called_url' => $result['called_url'],
            'iris_status' => $result['iris_status'],
            'request' => $result['request'],
            'data' => [
                'count' => count($result['records']),
                'records' => $result['records'],
            ],
        ]);
    }

    private function fetchRecords(): array
    {
        $listUrl = $this->irisBaseUrl().'/api/list';

        $listTimeout = max(1, (int) config('services.iris.list_timeout', 2));
        $request = Http::withBasicAuth(config('services.iris.user'), config('services.iris.password'))
            ->acceptJson()
            ->timeout($listTimeout);

        $listResponse = $request->get($listUrl);
        $listData = $listResponse->json();

        if ($listResponse->successful() && is_array($listData) && is_array($listData['records'] ?? null)) {
            return [
                'called_url' => $listUrl,
                'iris_status' => $listResponse->status(),
                'request' => ['barcode' => ''],
                'records' => $listData['records'],
            ];
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

        return [
            'called_url' => $listUrl,
            'iris_status' => $listResponse->status(),
            'request' => [
                'barcode' => '',
                'fallback_used' => true,
                'fallback_limit' => count($searched),
                'fallback_search' => $searched,
            ],
            'records' => $records,
        ];
    }

    private function readCsvRows(string $path): array
    {
        $handle = fopen($path, 'r');
        $header = null;
        $rows = [];

        while (($line = fgetcsv($handle)) !== false) {
            if ($header === null) {
                $header = array_map(fn ($value) => Str::of((string) $value)->lower()->trim()->toString(), $line);
                $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0] ?? '');
                continue;
            }

            $row = [];

            foreach ($header as $index => $name) {
                $row[$name] = $line[$index] ?? '';
            }

            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    private function csvBarcode(array $record): string
    {
        $barcode = $this->cleanBarcode((string) ($record['barcode'] ?? ''));

        if ($barcode !== '') {
            return ctype_digit($barcode) && strlen($barcode) < 6
                ? str_pad($barcode, 6, '0', STR_PAD_LEFT)
                : $barcode;
        }

        $no = $this->cleanBarcode((string) ($record['no'] ?? ''));

        return $no !== '' && ctype_digit($no)
            ? str_pad($no, 6, '0', STR_PAD_LEFT)
            : $no;
    }

    private function excelText(string $value): string
    {
        return $value === '' ? '' : '="'.$value.'"';
    }

    private function code39Svg(string $value): string
    {
        $patterns = [
            '0' => 'nnnwwnwnn', '1' => 'wnnwnnnnw', '2' => 'nnwwnnnnw', '3' => 'wnwwnnnnn',
            '4' => 'nnnwwnnnw', '5' => 'wnnwwnnnn', '6' => 'nnwwwnnnn', '7' => 'nnnwnnwnw',
            '8' => 'wnnwnnwnn', '9' => 'nnwwnnwnn', 'A' => 'wnnnnwnnw', 'B' => 'nnwnnwnnw',
            'C' => 'wnwnnwnnn', 'D' => 'nnnnwwnnw', 'E' => 'wnnnwwnnn', 'F' => 'nnwnwwnnn',
            'G' => 'nnnnnwwnw', 'H' => 'wnnnnwwnn', 'I' => 'nnwnnwwnn', 'J' => 'nnnnwwwnn',
            'K' => 'wnnnnnnww', 'L' => 'nnwnnnnww', 'M' => 'wnwnnnnwn', 'N' => 'nnnnwnnww',
            'O' => 'wnnnwnnwn', 'P' => 'nnwnwnnwn', 'Q' => 'nnnnnnwww', 'R' => 'wnnnnnwwn',
            'S' => 'nnwnnnwwn', 'T' => 'nnnnwnwwn', 'U' => 'wwnnnnnnw', 'V' => 'nwwnnnnnw',
            'W' => 'wwwnnnnnn', 'X' => 'nwnnwnnnw', 'Y' => 'wwnnwnnnn', 'Z' => 'nwwnwnnnn',
            '-' => 'nwnnnnwnw', '.' => 'wwnnnnwnn', ' ' => 'nwwnnnwnn', '*' => 'nwnnwnwnn',
            '$' => 'nwnwnwnnn', '/' => 'nwnwnnnwn', '+' => 'nwnnnwnwn', '%' => 'nnnwnwnwn',
        ];

        $clean = preg_replace('/[^0-9A-Z\-. $\/+%]/', '', $this->cleanBarcode($value));
        $encoded = '*'.($clean === '' ? '0' : $clean).'*';
        $narrow = 2;
        $wide = 5;
        $height = 74;
        $x = 10;
        $bars = '';

        foreach (str_split($encoded) as $char) {
            $pattern = $patterns[$char] ?? $patterns['0'];

            foreach (str_split($pattern) as $index => $widthCode) {
                $width = $widthCode === 'w' ? $wide : $narrow;

                if ($index % 2 === 0) {
                    $bars .= '<rect x="'.$x.'" y="0" width="'.$width.'" height="'.$height.'" fill="#111"/>';
                }

                $x += $width;
            }

            $x += $narrow;
        }

        $width = $x + 10;

        return '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barcode '.e($value).'" viewBox="0 0 '.$width.' '.$height.'" width="100%" height="74" preserveAspectRatio="xMidYMid meet">'.$bars.'</svg>';
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
        $barcode = trim(str_replace('*', '', (string) $barcode));

        if (preg_match('/^="([^"]*)"$/', $barcode, $matches)) {
            $barcode = $matches[1];
        }

        return Str::upper($barcode);
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
