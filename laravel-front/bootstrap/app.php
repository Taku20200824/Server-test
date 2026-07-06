<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        // ログイン前はセッションCookieが未確立のPCがあり、CSRF検証が419ループになるため
        // ログイン系のみ除外する。ログイン後の全操作は引き続きCSRF保護される。
        $middleware->validateCsrfTokens(except: [
            'login',
            'register-account',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // 419 (CSRFトークン期限切れ) はエラー画面を出さず、
        // ログイン画面へ戻して新しいトークンで再試行させる。
        // TokenMismatchException は内部で HttpException(419) に変換されるため両方を見る。
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            $isTokenMismatch = $e instanceof \Illuminate\Session\TokenMismatchException
                || ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface && $e->getStatusCode() === 419);

            if (! $isTokenMismatch) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Session expired. Please reload.'], 419);
            }

            return redirect()
                ->route('login')
                ->withErrors(['username' => 'セッションの有効期限が切れました。もう一度ログインしてください。 / Session expired, please log in again.']);
        });
    })->create();
