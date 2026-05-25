<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>IRIS Login</title>
        <script>
            (() => {
                const theme = localStorage.getItem('iris-theme') || 'light';
                document.documentElement.dataset.theme = theme;
            })();
        </script>

        @php
            $manifestPath = public_path('build/manifest.json');
            $manifest = file_exists($manifestPath) ? json_decode(file_get_contents($manifestPath), true) : [];
            $css = $manifest['resources/css/app.css']['file'] ?? null;
            $js = $manifest['resources/js/app.js']['file'] ?? null;
        @endphp

        @if ($css)
            <link rel="stylesheet" href="/build/{{ $css }}">
        @endif

        @if ($js)
            <script type="module" src="/build/{{ $js }}"></script>
        @endif
    </head>
    <body>
        <main class="login-shell">
            <button class="theme-float" type="button" data-theme-toggle>Dark mode</button>
            <section class="login-card" aria-label="IRIS login">
                <p class="eyebrow">IRIS Console</p>
                <h1>Login</h1>

                <form method="POST" action="{{ route('login.submit') }}" class="login-form">
                    @csrf

                    <label>
                        <span>Username</span>
                        <input name="username" autocomplete="username" value="{{ old('username') }}" autofocus>
                    </label>

                    <label>
                        <span>Password</span>
                        <input name="password" type="password" autocomplete="current-password">
                    </label>

                    @if ($errors->any())
                        <div class="result-alert is-visible">{{ $errors->first() }}</div>
                    @endif

                    <button class="button primary" type="submit">Login</button>
                </form>
            </section>
        </main>
    </body>
</html>
