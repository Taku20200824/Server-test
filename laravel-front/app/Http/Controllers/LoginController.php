<?php

namespace App\Http\Controllers;

use App\Support\IrisAccountStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function show(Request $request)
    {
        if ($request->session()->get('iris_logged_in')) {
            return redirect()->route('iris.index');
        }

        return view('login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $store = new IrisAccountStore();
        $account = $store->find($credentials['username']);

        if ($account === null || ! $this->passwordMatches($account, $credentials['password'])) {
            return back()
                ->withInput($request->only('username'))
                ->withErrors(['username' => 'Username or password is incorrect.']);
        }

        $request->session()->regenerate();
        $request->session()->put('iris_logged_in', true);
        $request->session()->put('iris_login_user', $credentials['username']);
        $request->session()->put('iris_login_name', $account['display_name'] ?? $credentials['username']);
        $request->session()->put('iris_login_role', $account['role']);

        return redirect()->intended(route('iris.index'));
    }

    public function registerAccount(Request $request)
    {
        $validated = $request->validateWithBag('register', [
            'username' => ['required', 'regex:/^\d{4}$/'],
            'display_name' => ['nullable', 'string', 'max:80'],
            'password' => ['required', 'string', 'min:4', 'confirmed'],
        ], [
            'username.regex' => 'Account ID must be 4 digits. IDs ending in 9 become admin accounts.',
        ]);

        try {
            (new IrisAccountStore())->create(
                $validated['username'],
                $validated['password'],
                $validated['display_name'] ?? ''
            );
        } catch (\RuntimeException $exception) {
            throw ValidationException::withMessages([
                'username' => $exception->getMessage(),
            ])->errorBag('register');
        }

        return back()
            ->withInput(['username' => $validated['username']])
            ->with('account_registered', 'Account registered. You can log in now.');
    }

    public function updateAccount(Request $request)
    {
        $username = (string) $request->session()->get('iris_login_user');

        $validated = $request->validateWithBag('account', [
            'display_name' => ['nullable', 'string', 'max:80'],
            'password' => ['nullable', 'string', 'min:4', 'confirmed'],
        ]);

        $account = (new IrisAccountStore())->update(
            $username,
            $validated['display_name'] ?? $username,
            $validated['password'] ?? null
        );

        $request->session()->put('iris_login_name', $account['display_name']);

        return back()->with('account_updated', 'Account settings updated.');
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function passwordMatches(array $account, string $password): bool
    {
        if (isset($account['password_hash'])) {
            return Hash::check($password, $account['password_hash']);
        }

        return hash_equals((string) ($account['password'] ?? ''), $password);
    }
}
