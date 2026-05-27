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
        $username = $this->cleanUsername($username);

        return $this->all()[$username] ?? null;
    }

    public function create(string $username, string $password, string $displayName = ''): array
    {
        $username = $this->cleanUsername($username);

        if ($username === '') {
            throw new \RuntimeException('Account ID is required.');
        }

        if ($password === '') {
            throw new \RuntimeException('Password is required.');
        }

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

        if ($username === '') {
            throw new \RuntimeException('Account ID is required.');
        }

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
        } elseif (isset($account['password'])) {
            $next['password'] = (string) $account['password'];
        } else {
            $next['password_hash'] = Hash::make('');
        }

        $stored[$username] = $next;

        $this->saveStoredAccounts($stored);

        return $next + ['username' => $username];
    }

    public function verify(string $username, string $password): ?array
    {
        $username = $this->cleanUsername($username);

        if ($username === '' || $password === '') {
            return null;
        }

        $account = $this->find($username);

        if ($account === null) {
            return null;
        }

        if (isset($account['password_hash'])) {
            if (Hash::check($password, $account['password_hash'])) {
                return $account + ['username' => $username];
            }

            return null;
        }

        if (isset($account['password']) && hash_equals((string) $account['password'], $password)) {
            return $account + ['username' => $username];
        }

        return null;
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
        $accounts = [];

        $adminUser = (string) config('services.iris_login.user');
        $adminPassword = (string) config('services.iris_login.password');

        if ($adminUser !== '') {
            $accounts[$adminUser] = [
                'display_name' => $adminUser,
                'password' => $adminPassword,
                'role' => 'admin',
            ];
        }

        $viewerUser = (string) config('services.iris_login.viewer_user');
        $viewerPassword = (string) config('services.iris_login.viewer_password');

        if ($viewerUser !== '') {
            $accounts[$viewerUser] = [
                'display_name' => $viewerUser,
                'password' => $viewerPassword,
                'role' => 'viewer',
            ];
        }

        return $accounts;
    }

    private function storedAccounts(): array
    {
        $path = $this->path();

        if (! Storage::disk('local')->exists($path)) {
            return [];
        }

        $json = Storage::disk('local')->get($path);
        $accounts = json_decode($json, true);

        return is_array($accounts) ? $accounts : [];
    }

    private function saveStoredAccounts(array $accounts): void
    {
        $path = $this->path();
        $directory = dirname($path);

        if ($directory !== '.' && ! Storage::disk('local')->exists($directory)) {
            Storage::disk('local')->makeDirectory($directory);
        }

        Storage::disk('local')->put(
            $path,
            json_encode($accounts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }

    private function path(): string
    {
        return (string) config('services.iris_login.accounts_path', 'iris_accounts.json');
    }
}