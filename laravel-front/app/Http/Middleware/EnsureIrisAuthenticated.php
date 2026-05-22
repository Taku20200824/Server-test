<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIrisAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->get('iris_logged_in')) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Login required.',
            ], 401);
        }

        return redirect()->guest(route('login'));
    }
}
