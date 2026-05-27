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
                const language = localStorage.getItem('iris-language') || 'ja';
                document.documentElement.dataset.theme = theme;
                document.documentElement.dataset.language = language;
                document.documentElement.lang = language === 'mn' ? 'mn' : language;
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
            <div class="login-controls">
                <select class="language-select" data-language-select aria-label="Language">
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                    <option value="mn">Монгол</option>
                </select>
                <button class="theme-float" type="button" data-theme-toggle data-i18n="darkMode">Dark mode</button>
            </div>
            <section class="login-card" aria-label="IRIS login">
                <p class="eyebrow">IRIS Console</p>
                <h1 data-i18n="login">Login</h1>

                <form method="POST" action="{{ route('login.submit') }}" class="login-form">
                    @csrf

                    <label>
                        <span data-i18n="username">Username</span>
                        <input name="username" autocomplete="username" value="{{ old('username') }}" autofocus>
                    </label>

                    <label>
                        <span data-i18n="password">Password</span>
                        <input name="password" type="password" autocomplete="current-password">
                    </label>

                    @if ($errors->any())
                        <div class="result-alert is-visible">{{ $errors->first() }}</div>
                    @endif

                    <button class="button primary" type="submit" data-i18n="login">Login</button>
                </form>
            </section>
        </main>
    </body>
</html>
