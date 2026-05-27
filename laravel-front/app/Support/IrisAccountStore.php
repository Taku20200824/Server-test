<?php

namespace App\Support;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class IrisAccountStore
{
    public function all(): array
    {
        return array_replace($this->defaultAccounts(), $this->storedAccounts());
    }

    public function find(string $username): ?array
    {
        return $this->all()[$username] ?? null;
    }

    public function create(string $username, string $password, string $displayName = ''): array
    {
        $username = $this->cleanUsername($username);

        if (isset($this->all()[$username])) {
            throw new \RuntimeException('Account ID already exists. Please change the ID.');
        }

        $accounts = $this->storedAccounts();
        $accounts[$username] = [
            'display_name' => trim($displayName) !== '' ? trim($displayName) : $username,
            'password_hash' => Hash::make($password),
            'role' => $this->roleForUsername($username),
        ];

        $this->saveStoredAccounts($accounts);

        return $accounts[$username] + ['username' => $username];
    }

    public function update(string $username, string $displayName, ?string $password = null): array
    {
        $username = $this->cleanUsername($username);
        $account = $this->find($username);

        if ($account === null) {
            throw new \RuntimeException('Account was not found.');
        }

        $stored = $this->storedAccounts();
        $next = [
            'display_name' => trim($displayName) !== '' ? trim($displayName) : $username,
            'role' => $account['role'] ?? $this->roleForUsername($username),
        ];

        if ($password !== null && $password !== '') {
            $next['password_hash'] = Hash::make($password);
        } elseif (isset($account['password_hash'])) {
            $next['password_hash'] = $account['password_hash'];
        } else {
            $next['password_hash'] = Hash::make((string) ($account['password'] ?? ''));
        }

        $stored[$username] = $next;
        $this->saveStoredAccounts($stored);

        return $next + ['username' => $username];
    }

    public function roleForUsername(string $username): string
    {
        return Str::endsWith($username, '9') ? 'admin' : 'viewer';
    }

    public function cleanUsername(string $username): string
    {
        return trim($username);
    }

    private function defaultAccounts(): array
    {
        return [
            (string) config('services.iris_login.user') => [
                'display_name' => (string) config('services.iris_login.user'),
                'password' => (string) config('services.iris_login.password'),
                'role' => 'admin',
            ],
            (string) config('services.iris_login.viewer_user') => [
                'display_name' => (string) config('services.iris_login.viewer_user'),
                'password' => (string) config('services.iris_login.viewer_password'),
                'role' => 'viewer',
            ],
        ];
    }

    private function storedAccounts(): array
    {
        $path = $this->path();

        if (! Storage::disk('local')->exists($path)) {
            return [];
        }

        $accounts = json_decode(Storage::disk('local')->get($path), true);

        return is_array($accounts) ? $accounts : [];
    }

    private function saveStoredAccounts(array $accounts): void
    {
        Storage::disk('local')->put($this->path(), json_encode($accounts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private function path(): string
    {
        return (string) config('services.iris_login.accounts_path', 'iris_accounts.json');
    }
}
