<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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

        $user = (string) config('services.iris_login.user');
        $password = (string) config('services.iris_login.password');

        if (! hash_equals($user, $credentials['username']) || ! hash_equals($password, $credentials['password'])) {
            return back()
                ->withInput($request->only('username'))
                ->withErrors(['username' => 'Username or password is incorrect.']);
        }

        $request->session()->regenerate();
        $request->session()->put('iris_logged_in', true);
        $request->session()->put('iris_login_user', $credentials['username']);

        return redirect()->intended(route('iris.index'));
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
