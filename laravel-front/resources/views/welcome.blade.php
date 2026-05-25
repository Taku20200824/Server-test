<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>IRIS Console</title>
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
        <main class="app-shell">
            <header class="app-header">
                <div>
                    <p class="eyebrow"></p>
                    <h1></h1>
                </div>
                <div class="header-meta">
                    <button type="button" data-theme-toggle>Dark mode</button>
                    <button type="button" data-camera-toggle>Camera scan</button>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit">Logout</button>
                    </form>
                </div>
            </header>

            <section class="workspace">
                <section class="tool-panel" aria-label="IRIS barcode form">
                    <form class="iris-form" data-iris-form>
                        <label>
                            <span>Barcode</span>
                            <input name="barcode" autocomplete="off" placeholder="000001" maxlength="80" inputmode="numeric">
                        </label>

                        <div class="register-fields is-collapsed" data-register-panel aria-hidden="true">
                            <div class="field-grid">
                                <label>
                                    <span>Name</span>
                                    <input name="name" autocomplete="name" placeholder="NARUTO" maxlength="120">
                                </label>
                                <label>
                                    <span>Kanji</span>
                                    <input name="kanji" autocomplete="off" placeholder="ナルト" maxlength="120">
                                </label>
                            </div>
                            <label>
                                <span>Katakana</span>
                                <input name="katakana" autocomplete="off" placeholder="ナルト" maxlength="120">
                            </label>
                            <label>
                                <span>Address</span>
                                <input name="address" autocomplete="street-address" placeholder="大阪" maxlength="255">
                            </label>
                            <div class="panel-actions">
                                <button class="button success" type="submit" data-action="register">
                                    Save
                                </button>
                            </div>
                        </div>

                        <div class="scanner-panel is-collapsed" data-scanner-panel aria-hidden="true">
                            <div class="scanner-head">
                                <div>
                                    <p class="eyebrow">Camera</p>
                                    <h3>Barcode reader</h3>
                                </div>
                                <span class="scanner-state" data-scanner-status>Stopped</span>
                            </div>
                            <div class="scanner-frame">
                                <video data-scanner-video muted playsinline></video>
                                <div class="scan-line" aria-hidden="true"></div>
                            </div>
                            <div class="actions">
                                <button class="button" type="button" data-camera-start>
                                    Start Camera
                                </button>
                                <button class="button danger" type="button" data-camera-stop disabled>
                                    Stop Camera
                                </button>
                            </div>
                            <p class="camera-note" data-camera-note>Camera fills the barcode field and runs Search.</p>
                            <p class="camera-note camera-help" data-camera-help hidden></p>
                        </div>

                        <div class="actions">
                            <button class="button primary" type="submit" data-action="search">
                                Search
                            </button>
                            <button class="button success" type="button" data-register-toggle>
                                Register
                            </button>
                            <button class="button" type="button" data-clear>
                                Clear
                            </button>
                        </div>
                    </form>
                </section>

                <section class="result-panel" aria-label="IRIS response">
                    <div class="result-heading">
                        <div>
                            <p class="eyebrow">Response</p>
                            <h2>Barcode result</h2>
                        </div>
                    </div>
                    <div class="barcode-result" data-barcode-result>
                        <p class="empty-state">No data</p>
                    </div>
                </section>
            </section>
        </main>
    </body>
</html>
