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
                <div class="language-menu" data-language-menu>
                    <button class="language-button" type="button" data-language-button aria-haspopup="true" aria-expanded="false">
                        <span data-language-current>日本語</span>
                    </button>
                    <div class="language-list" data-language-list hidden>
                        <button type="button" data-language-option value="ja">日本語</button>
                        <button type="button" data-language-option value="en">English</button>
                        <button type="button" data-language-option value="mn">Монгол</button>
                    </div>
                </div>
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

                <section class="signup-panel">
                    <div>
                        <p class="eyebrow" data-i18n="createAccount">Create account</p>
                        <p class="signup-note" data-i18n="accountRule">4 digit ID. IDs ending in 9 become admin.</p>
                    </div>

                    @if (session('account_registered'))
                        <div class="result-alert is-visible">{{ session('account_registered') }}</div>
                    @endif
                    @if ($errors->register->any())
                        <div class="result-alert is-visible">{{ $errors->register->first() }}</div>
                    @endif

                    <form method="POST" action="{{ route('account.register') }}" class="login-form">
                        @csrf
                        <label>
                            <span data-i18n="accountId">Account ID</span>
                            <input name="username" inputmode="numeric" maxlength="4" value="{{ old('username') }}" placeholder="1234">
                        </label>
                        <label>
                            <span data-i18n="displayName">Display name</span>
                            <input name="display_name" maxlength="80" value="{{ old('display_name') }}" placeholder="Taku">
                        </label>
                        <div class="field-grid">
                            <label>
                                <span data-i18n="password">Password</span>
                                <input name="password" type="password" autocomplete="new-password">
                            </label>
                            <label>
                                <span data-i18n="confirmPassword">Confirm password</span>
                                <input name="password_confirmation" type="password" autocomplete="new-password">
                            </label>
                        </div>
                        <button class="button success" type="submit" data-i18n="registerAccount">Register account</button>
                    </form>
                </section>
            </section>
        </main>
    </body>
</html>
