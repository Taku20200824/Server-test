<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="iris-can-edit" content="{{ $isAdmin ? '1' : '0' }}">

        <title>IRIS Console</title>
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
        <main class="app-shell">
            <header class="app-header">
                <div>
                    <p class="eyebrow"></p>
                    <h1></h1>
                </div>
                <div class="header-meta">
                    <button class="user-pill" type="button" data-account-toggle aria-expanded="{{ session('account_updated') || $errors->account->any() ? 'true' : 'false' }}">
                        <span class="user-name">{{ $loginName }}</span>
                        <span class="role-chip" data-i18n="{{ $isAdmin ? 'roleAdmin' : 'roleViewer' }}">{{ $isAdmin ? 'Admin' : 'Viewer' }}</span>
                    </button>
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
                    <button type="button" data-theme-toggle data-i18n="darkMode">Dark mode</button>
                    <button type="button" data-camera-toggle data-i18n="cameraScan">Camera scan</button>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" data-i18n="logout">Logout</button>
                    </form>
                </div>
            </header>

            <section class="account-panel {{ session('account_updated') || $errors->account->any() ? '' : 'is-collapsed' }}" data-account-panel aria-hidden="{{ session('account_updated') || $errors->account->any() ? 'false' : 'true' }}">
                <div>
                    <p class="eyebrow" data-i18n="accountSettings">Account settings</p>
                    <h2>{{ $loginUser }}</h2>
                </div>
                @if (session('account_updated'))
                    <div class="result-alert is-visible">{{ session('account_updated') }}</div>
                @endif
                @if ($errors->account->any())
                    <div class="result-alert is-visible">{{ $errors->account->first() }}</div>
                @endif
                <form method="POST" action="{{ route('account.update') }}" class="account-form">
                    @csrf
                    <label>
                        <span data-i18n="displayName">Display name</span>
                        <input name="display_name" value="{{ old('display_name', $loginName) }}" maxlength="80">
                    </label>
                    <div class="field-grid">
                        <label>
                            <span data-i18n="newPassword">New password</span>
                            <input name="password" type="password" autocomplete="new-password">
                        </label>
                        <label>
                            <span data-i18n="confirmPassword">Confirm password</span>
                            <input name="password_confirmation" type="password" autocomplete="new-password">
                        </label>
                    </div>
                    <div class="panel-actions">
                        <button class="button success" type="submit" data-i18n="saveSettings">Save settings</button>
                    </div>
                </form>
            </section>

            <section class="workspace">
                <section class="tool-panel" aria-label="IRIS barcode form">
                    <form class="iris-form" data-iris-form>
                        <label>
                            <span data-i18n="barcode">Barcode</span>
                            <input name="barcode" autocomplete="off" placeholder="000001" maxlength="80" inputmode="numeric">
                        </label>

                        <div class="register-fields is-collapsed" data-register-panel aria-hidden="true">
                            <div class="field-grid">
                                <label>
                                    <span data-i18n="name">Name</span>
                                    <input name="name" autocomplete="name" placeholder="NARUTO" maxlength="120">
                                </label>
                                <label>
                                    <span data-i18n="kanji">Kanji</span>
                                    <input name="kanji" autocomplete="off" placeholder="ナルト" maxlength="120">
                                </label>
                            </div>
                            <label>
                                <span data-i18n="katakana">Katakana</span>
                                <input name="katakana" autocomplete="off" placeholder="ナルト" maxlength="120">
                            </label>
                            <label>
                                <span data-i18n="address">Address</span>
                                <input name="address" autocomplete="street-address" placeholder="大阪" maxlength="255">
                            </label>
                            <div class="panel-actions">
                                @if ($isAdmin)
                                <button class="button danger" type="button" data-delete-record data-i18n="delete" hidden>Delete</button>
                                @endif
                                <button class="button success" type="submit" data-action="register" data-save-record data-i18n="save">Save</button>
                            </div>
                        </div>

                        <div class="scanner-panel is-collapsed" data-scanner-panel aria-hidden="true">
                            <div class="scanner-head">
                                <div>
                                    <p class="eyebrow" data-i18n="camera">Camera</p>
                                    <h3 data-i18n="barcodeReader">Barcode reader</h3>
                                </div>
                                <span class="scanner-state" data-scanner-status data-i18n="stopped">Stopped</span>
                            </div>
                            <div class="scanner-frame">
                                <video data-scanner-video muted playsinline></video>
                                <div class="scan-line" aria-hidden="true"></div>
                            </div>
                            <div class="actions">
                                <button class="button" type="button" data-camera-start data-i18n="startCamera">Start Camera</button>
                                <button class="button danger" type="button" data-camera-stop data-i18n="stopCamera" disabled>Stop Camera</button>
                            </div>
                            <p class="camera-note" data-camera-note data-i18n="cameraNote">Camera fills the barcode field and runs Search.</p>
                            <p class="camera-note camera-help" data-camera-help hidden></p>
                        </div>

                        <div class="actions">
                            <button class="button primary" type="submit" data-action="search" data-i18n="search">Search</button>
                            @if ($isAdmin)
                            <button class="button success" type="button" data-register-toggle data-i18n="register">Register</button>
                            @endif
                            <button class="button" type="button" data-clear data-i18n="clear">Clear</button>
                        </div>
                    </form>
                </section>

                <section class="result-panel" aria-label="IRIS response">
                    <div class="result-heading">
                        <div>
                            <p class="eyebrow" data-i18n="response">Response</p>
                            <h2 data-i18n="barcodeResult">Barcode result</h2>
                        </div>
                    </div>
                    <div class="barcode-result" data-barcode-result>
                        <p class="empty-state" data-i18n="noData">No data</p>
                    </div>
                </section>
            </section>
        </main>
    </body>
</html>
