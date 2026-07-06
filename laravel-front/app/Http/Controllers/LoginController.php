<?php

namespace App\Http\Controllers;

use App\Support\IrisAccountStore;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function show(Request $request)
    {
        if ($request->session()->get('iris_logged_in')) {
            return redirect()->route('iris.index');
        }

        // 古いCSRFトークン入りのページをブラウザが再利用しないようにする（419対策）
        return response()
            ->view('login')
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate')
            ->header('Pragma', 'no-cache');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $store = new IrisAccountStore();

        $username = $store->cleanUsername($credentials['username']);
        $account = $store->verify($username, $credentials['password']);

        if ($account === null) {
            return back()
                ->withInput($request->only('username'))
                ->withErrors(['username' => 'Username or password is incorrect.']);
        }

        $request->session()->regenerate();
        $request->session()->put('iris_logged_in', true);
        $request->session()->put('iris_login_user', $username);
        $request->session()->put('iris_login_name', $account['display_name'] ?? $username);
        $request->session()->put('iris_login_role', $account['role'] ?? $store->roleForUsername($username));

        // url.intended に古いオリジン(例: https://192.168.1.91 ポート無し)が残っていると
        // ログイン後に別ホストへ飛びセッションが切れるため、パス部分だけを現オリジンで使う。
        $intended = (string) $request->session()->pull('url.intended', '');
        $path = $intended !== '' ? (string) parse_url($intended, PHP_URL_PATH) : '';

        if ($path !== '' && $path !== '/login') {
            $query = (string) parse_url($intended, PHP_URL_QUERY);

            return redirect()->to($path.($query !== '' ? '?'.$query : ''));
        }

        return redirect()->route('iris.index');
    }

    public function registerAccount(Request $request)
    {
        $validated = $request->validateWithBag('register', [
            'username' => ['required', 'regex:/^\d{4}$/'],
            'display_name' => ['nullable', 'string', 'max:80'],
            'password' => ['required', 'string', 'min:4', 'confirmed'],
        ], [
            'username.regex' => 'Account ID must be 4 digits.',
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
            ->with('account_registered', 'Account registered. You can log in now.')
            ->with('signup_open', true);
    }

    public function updateAccount(Request $request)
    {
        $username = (string) $request->session()->get('iris_login_user');

        $validated = $request->validateWithBag('account', [
            'display_name' => ['nullable', 'string', 'max:80'],
            'password' => ['nullable', 'string', 'min:4', 'confirmed'],
        ]);

        try {
            $account = (new IrisAccountStore())->update(
                $username,
                $validated['display_name'] ?? $username,
                $validated['password'] ?? null
            );
        } catch (\RuntimeException $exception) {
            throw ValidationException::withMessages([
                'display_name' => $exception->getMessage(),
            ])->errorBag('account');
        }

        $request->session()->put('iris_login_name', $account['display_name']);

        return back()->with('account_updated', 'Account settings updated.');
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}