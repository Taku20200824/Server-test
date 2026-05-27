import { BrowserMultiFormatReader } from '@zxing/browser';

const form = document.querySelector('[data-iris-form]');
const statusBadge = document.querySelector('[data-status]');
const barcodeResult = document.querySelector('[data-barcode-result]');
const clearButton = document.querySelector('[data-clear]');
const barcodeInput = form?.querySelector('input[name="barcode"]');
const searchButton = form?.querySelector('[data-action="search"]');
const registerToggle = form?.querySelector('[data-register-toggle]');
const registerPanel = form?.querySelector('[data-register-panel]');
const scannerVideo = document.querySelector('[data-scanner-video]');
const scannerStatus = document.querySelector('[data-scanner-status]');
const cameraNote = document.querySelector('[data-camera-note]');
const cameraHelp = document.querySelector('[data-camera-help]');
const cameraStart = document.querySelector('[data-camera-start]');
const cameraStop = document.querySelector('[data-camera-stop]');
const cameraToggle = document.querySelector('[data-camera-toggle]');
const scannerPanel = document.querySelector('[data-scanner-panel]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const languageMenu = document.querySelector('[data-language-menu]');
const languageButton = document.querySelector('[data-language-button]');
const languageCurrent = document.querySelector('[data-language-current]');
const languageList = document.querySelector('[data-language-list]');
const languageOptions = document.querySelectorAll('[data-language-option]');
const resultPanel = document.querySelector('.result-panel');
const accountToggle = document.querySelector('[data-account-toggle]');
const accountPanel = document.querySelector('[data-account-panel]');
const signupToggle = document.querySelector('[data-signup-toggle]');
const signupPanel = document.querySelector('[data-signup-panel]');
const signupForm = signupPanel?.querySelector('form');
const saveRecordButton = form?.querySelector('[data-save-record]');
const deleteRecordButton = form?.querySelector('[data-delete-record]');
const canEdit = document.querySelector('meta[name="iris-can-edit"]')?.content === '1';


const codeReader = new BrowserMultiFormatReader();
let scannerControls = null;

const routes = {
    search: '/iris-test/search',
    register: '/iris-test/register',
    update: '/iris-test/update',
    delete: '/iris-test/delete',
    ping: '/iris-test/ping',
};

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
let selectedRecord = null;
let lastResultPayload = null;
let lastRecordTable = null;
let lastRegisterResult = null;

const languageLabels = {
    ja: '日本語',
    en: 'English',
    mn: 'Монгол',
};

const translations = {
    ja: {
        darkMode: 'ダークモード',
        whiteMode: 'ライトモード',
        cameraScan: 'カメラスキャン',
        logout: 'ログアウト',
        roleAdmin: '管理者',
        roleViewer: '閲覧者',
        barcode: 'バーコード',
        name: '名前',
        kanji: '漢字',
        katakana: 'カタカナ',
        address: '住所',
        delete: '削除',
        save: '保存',
        update: '更新',
        camera: 'カメラ',
        barcodeReader: 'バーコードリーダー',
        stopped: '停止中',
        scanning: '読み取り中',
        found: '検出',
        noCamera: 'カメラなし',
        error: 'エラー',
        startCamera: 'カメラ開始',
        stopCamera: 'カメラ停止',
        cameraNote: 'カメラで読み取るとバーコード欄に入り、検索します。',
        search: '検索',
        register: '登録',
        clear: 'クリア',
        response: '結果',
        barcodeResult: 'バーコード結果',
        noData: 'データがありません',
        noRecords: 'レコードがありません',
        allRecords: '全レコード',
        recentRecords: '最近のレコード',
        loadingData: '読み込み中',
        savingData: '保存中',
        sending: '送信中',
        done: '完了',
        ready: '準備完了',
        edit: '編集',
        deleting: '削除中',
        deleted: '削除しました',
        registered: '登録しました',
        updated: '更新しました',
        status: '状態',
        no: 'No',
        added: '追加日時',
        action: '操作',
        deleteConfirm: 'バーコード {barcode} を削除しますか？',
        httpsNeeded: 'HTTPS が必要です',
        openingSecure: '安全なカメラページを開いています...',
        secureCameraHelp: 'Chrome でカメラを使うには HTTPS が必要です。警告が出たら詳細設定から進み、カメラを許可してください。',
        cameraUnavailable: 'カメラ API が使えません。Chrome のサイト設定とカメラ権限を確認してください。',
        cameraPermissionHelp: 'Chrome 設定 > プライバシーとセキュリティ > サイトの設定 > カメラで、このサイトを許可してください。',
        pointCamera: 'バーコードにカメラを向けてください。',
        scanned: '{barcode} を読み取りました',
        nonJsonResponse: 'サーバーから JSON 以外の応答が返りました。',
        login: 'ログイン',
        username: 'ユーザー名',
        password: 'パスワード',
        createAccount: 'アカウント作成',
        accountRule: '4桁　ID。',
        accountId: 'アカウントID',
        registerAccount: 'アカウント登録',
        accountSettings: 'アカウント設定',
        displayName: '表示名',
        newPassword: '新しいパスワード',
        confirmPassword: 'パスワード確認',
        saveSettings: '設定を保存',
        csvTools: 'CSVツール',
        csvNote: 'IRISレコードをダウンロードまたはアップロードします。',
        downloadCsv: 'CSVダウンロード',
        downloadBarcodes: 'バーコードCSV',
        uploadCsv: 'CSVアップロード',
        chooseCsv: 'CSVを選択',
    },
    en: {
        darkMode: 'Dark mode',
        whiteMode: 'White mode',
        cameraScan: 'Camera scan',
        logout: 'Logout',
        roleAdmin: 'Admin',
        roleViewer: 'Viewer',
        barcode: 'Barcode',
        name: 'Name',
        kanji: 'Kanji',
        katakana: 'Katakana',
        address: 'Address',
        delete: 'Delete',
        save: 'Save',
        update: 'Update',
        camera: 'Camera',
        barcodeReader: 'Barcode reader',
        stopped: 'Stopped',
        scanning: 'Scanning',
        found: 'Found',
        noCamera: 'No camera',
        error: 'Error',
        startCamera: 'Start Camera',
        stopCamera: 'Stop Camera',
        cameraNote: 'Camera fills the barcode field and runs Search.',
        search: 'Search',
        register: 'Register',
        clear: 'Clear',
        response: 'Response',
        barcodeResult: 'Barcode result',
        noData: 'No data',
        noRecords: 'No records',
        allRecords: 'All records',
        recentRecords: 'recent records',
        loadingData: 'Loading data',
        savingData: 'Saving data',
        sending: 'Sending',
        done: 'Done',
        ready: 'Ready',
        edit: 'Edit',
        deleting: 'Deleting',
        deleted: 'Deleted',
        registered: 'Registered',
        updated: 'Updated',
        status: 'Status',
        no: 'No',
        added: 'Added',
        action: 'Action',
        deleteConfirm: 'Delete barcode {barcode}?',
        httpsNeeded: 'HTTPS needed',
        openingSecure: 'Opening the secure camera page...',
        secureCameraHelp: 'Chrome needs HTTPS for camera. If a warning appears, click Advanced, proceed, then allow Camera.',
        cameraUnavailable: 'Camera API is unavailable. Check Chrome site settings and camera permissions.',
        cameraPermissionHelp: 'Chrome Settings > Privacy and security > Site settings > Camera: allow this site and pick a camera device.',
        pointCamera: 'Point the camera at a barcode.',
        scanned: 'Scanned {barcode}',
        nonJsonResponse: 'The server returned a non-JSON response.',
        login: 'Login',
        username: 'Username',
        password: 'Password',
        createAccount: 'Create account',
        accountRule: '4 digit ID.',
        accountId: 'Account ID',
        registerAccount: 'Register account',
        accountSettings: 'Account settings',
        displayName: 'Display name',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        saveSettings: 'Save settings',
        csvTools: 'CSV tools',
        csvNote: 'Download or upload IRIS records.',
        downloadCsv: 'Download CSV',
        downloadBarcodes: 'Download barcodes',
        uploadCsv: 'Upload CSV',
        chooseCsv: 'Choose CSV',
    },
    mn: {
        darkMode: 'Харанхуй',
        whiteMode: 'Цагаан',
        cameraScan: 'Камер уншуулах',
        logout: 'Гарах',
        roleAdmin: 'Админ',
        roleViewer: 'Харагч',
        barcode: 'Бар код',
        name: 'Нэр',
        kanji: 'Канжи',
        katakana: 'Катакана',
        address: 'Хаяг',
        delete: 'Устгах',
        save: 'Хадгалах',
        update: 'Шинэчлэх',
        camera: 'Камер',
        barcodeReader: 'Бар код уншигч',
        stopped: 'Зогссон',
        scanning: 'Уншиж байна',
        found: 'Олдсон',
        noCamera: 'Камер алга',
        error: 'Алдаа',
        startCamera: 'Камер асаах',
        stopCamera: 'Камер унтраах',
        cameraNote: 'Камер уншвал бар код талбарт орж Search ажиллана.',
        search: 'Хайх',
        register: 'Бүртгэх',
        clear: 'Цэвэрлэх',
        response: 'Хариу',
        barcodeResult: 'Бар кодын үр дүн',
        noData: 'Дата алга',
        noRecords: 'Бичлэг алга',
        allRecords: 'Бүх дата',
        recentRecords: 'сүүлийн дата',
        loadingData: 'Уншиж байна',
        savingData: 'Хадгалж байна',
        sending: 'Илгээж байна',
        done: 'Болсон',
        ready: 'Бэлэн',
        edit: 'Засах',
        deleting: 'Устгаж байна',
        deleted: 'Устгасан',
        registered: 'Бүртгэсэн',
        updated: 'Шинэчилсэн',
        status: 'Төлөв',
        no: 'No',
        added: 'Нэмсэн огноо',
        action: 'Үйлдэл',
        deleteConfirm: '{barcode} бар кодыг устгах уу?',
        httpsNeeded: 'HTTPS хэрэгтэй',
        openingSecure: 'Камерын secure хуудсыг нээж байна...',
        secureCameraHelp: 'Chrome дээр камер ажиллуулахын тулд HTTPS хэрэгтэй. Анхааруулга гарвал Advanced дарж ороод Camera-г Allow болго.',
        cameraUnavailable: 'Camera API ажиллахгүй байна. Chrome site settings болон camera permission шалга.',
        cameraPermissionHelp: 'Chrome Settings > Privacy and security > Site settings > Camera дээр энэ сайтыг Allow болго.',
        pointCamera: 'Камераа бар код руу чиглүүл.',
        scanned: '{barcode} уншлаа',
        nonJsonResponse: 'Сервер JSON биш хариу буцаалаа.',
        login: 'Нэвтрэх',
        username: 'Нэвтрэх нэр',
        password: 'Нууц үг',
        createAccount: 'Аккаунт үүсгэх',
        accountRule: '4 оронтой ID.',
        accountId: 'Аккаунт ID',
        registerAccount: 'Аккаунт бүртгэх',
        accountSettings: 'Аккаунтын тохиргоо',
        displayName: 'Харагдах нэр',
        newPassword: 'Шинэ нууц үг',
        confirmPassword: 'Нууц үг давтах',
        saveSettings: 'Тохиргоо хадгалах',
        csvTools: 'CSV хэрэгсэл',
        csvNote: 'IRIS датаг CSV-ээр татах эсвэл оруулах.',
        downloadCsv: 'CSV татах',
        downloadBarcodes: 'Barcode татах',
        uploadCsv: 'CSV оруулах',
        chooseCsv: 'CSV сонгох',
    },
};

function currentLanguage() {
    return localStorage.getItem('iris-language') || document.documentElement.dataset.language || 'ja';
}

function t(key, replacements = {}) {
    const dictionary = translations[currentLanguage()] ?? translations.ja;
    let text = dictionary[key] ?? translations.en[key] ?? key;

    Object.entries(replacements).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, value);
    });

    return text;
}

function setLanguage(language) {
    const nextLanguage = translations[language] ? language : 'ja';

    document.documentElement.dataset.language = nextLanguage;
    document.documentElement.lang = nextLanguage === 'mn' ? 'mn' : nextLanguage;
    localStorage.setItem('iris-language', nextLanguage);

    if (languageCurrent) {
        languageCurrent.textContent = languageLabels[nextLanguage];
    }

    languageOptions.forEach((option) => {
        const isActive = option.value === nextLanguage;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });

    setTheme(document.documentElement.dataset.theme || 'light');
    refreshResultLanguage();
}

function closeLanguageMenu() {
    if (!languageList || !languageButton) {
        return;
    }

    languageList.hidden = true;
    languageButton.setAttribute('aria-expanded', 'false');
}

function toggleLanguageMenu() {
    if (!languageList || !languageButton) {
        return;
    }

    const willOpen = languageList.hidden;
    languageList.hidden = !willOpen;
    languageButton.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function refreshResultLanguage() {
    if (lastResultPayload) {
        showBarcodeResult(lastResultPayload, true);
        return;
    }

    if (lastRecordTable) {
        showRecordTable(lastRecordTable.records, lastRecordTable.limit, lastRecordTable.label, true);
        return;
    }

    if (lastRegisterResult) {
        showRegisterResult(lastRegisterResult.data, lastRegisterResult.action, true);
    }
}

function setTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';

    document.documentElement.classList.add('is-theme-swapping');
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('iris-theme', nextTheme);

    if (themeToggle) {
        themeToggle.textContent = nextTheme === 'dark' ? t('whiteMode') : t('darkMode');
    }

    window.setTimeout(() => {
        document.documentElement.classList.remove('is-theme-swapping');
    }, 420);
}

setTheme(localStorage.getItem('iris-theme') || document.documentElement.dataset.theme || 'light');
setLanguage(currentLanguage());

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    })[char]);
}

function recordToDataset(record) {
    return [
        ['barcode', record.barcode],
        ['name', record.name],
        ['kanji', record.kanji],
        ['katakana', record.katakana],
        ['address', record.address],
    ].map(([key, value]) => `data-${key}="${escapeHtml(value)}"`).join(' ');
}

function pulseElement(element, className = 'is-pulsing') {
    if (!element) {
        return;
    }

    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    window.setTimeout(() => element.classList.remove(className), 900);
}

function vibrate(pattern = 55) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

function renderStableResult(html) {
    barcodeResult.innerHTML = html;

    barcodeResult
        .querySelectorAll('.reveal-item, .result-alert, .empty-state, .table-wrap')
        .forEach((item) => item.classList.add('is-visible'));
}

function showBarcodeResult(payload, isRefresh = false) {
    if (!isRefresh) {
        lastResultPayload = payload;
        lastRecordTable = null;
        lastRegisterResult = null;
    }

    const data = payload?.body?.data;
    const request = payload?.body?.request ?? {};

    if (Array.isArray(data?.records)) {
        showRecordTable(data.records, null, t('allRecords'), isRefresh);
        scrollResultIntoView();
        return;
    }

    if (!data) {
        const message = payload?.body?.message;
        barcodeResult.innerHTML = message
            ? `<div class="result-alert">${escapeHtml(message)}</div>`
            : `<p class="empty-state">${escapeHtml(t('noData'))}</p>`;
        armResultReveal();
        return;
    }

    if ((payload?.action === 'register' || payload?.action === 'update') && payload.ok) {
        const registered = {
            barcode: request.barcode ?? data.barcode,
            name: request.name ?? data.name,
            kanji: request.kanji ?? data.kanji,
            katakana: request.katakana ?? data.katakana,
            address: request.address ?? data.address,
            message: payload.action === 'update' ? t('updated') : (data.message ?? t('registered')),
        };

        showRegisterResult(registered, payload.action, isRefresh);
        collapseRegisterPanel();
        vibrate([35, 35, 55]);
        return;
    }

    if (payload?.action === 'delete' && payload.ok && (data.deleted || data.message === 'Deleted')) {
        renderStableResult(`<div class="register-success">
            <div class="success-ribbon">${escapeHtml(t('deleted'))}</div>
            <div class="result-grid">
                <div class="result-row is-visible">
                    <div class="result-label">${escapeHtml(t('barcode'))}</div>
                    <div class="result-value">${escapeHtml(request.barcode ?? data.barcode)}</div>
                </div>
                <div class="result-row is-visible">
                    <div class="result-label">${escapeHtml(t('status'))}</div>
                    <div class="result-value">${escapeHtml(data.message ?? t('deleted'))}</div>
                </div>
            </div>
        </div>`);
        form?.reset();
        setRegisterMode();
        collapseRegisterPanel();
        vibrate([35, 35, 55]);
        return;
    }

    if (!data.found) {
        const message = data.message ?? payload?.body?.message ?? 'Not Found';
        barcodeResult.innerHTML = `<div class="result-alert">${escapeHtml(message)}</div>`;
        armResultReveal();
        return;
    }

    const rows = [
        [t('no'), data.no],
        [t('barcode'), data.barcode],
        [t('name'), data.name],
        [t('kanji'), data.kanji],
        [t('katakana'), data.katakana],
        [t('address'), data.address],
        [t('added'), data.addedDateTime],
    ];

    const editAttrs = canEdit ? ` data-edit-record ${recordToDataset(data)}` : '';
    const editClass = canEdit ? ' is-editable' : '';

    barcodeResult.innerHTML = `<div class="result-grid${editClass}"${editAttrs}>${rows.map(([label, value], index) => `
        <div class="result-row reveal-item" style="--reveal-delay: ${index * 55}ms">
            <div class="result-label">${escapeHtml(label)}</div>
            <div class="result-value">${escapeHtml(value)}</div>
        </div>
    `).join('')}</div>`;
    armResultReveal();
    pulseElement(resultPanel, 'is-success-pulse');
    scrollResultIntoView();
}

function showLoadingResult(message = t('loadingData')) {
    barcodeResult.innerHTML = `<p class="empty-state is-loading">${escapeHtml(message)}</p>`;
    armResultReveal();
}

function showRegisterResult(data, action = 'register', isRefresh = false) {
    if (!isRefresh) {
        lastRegisterResult = { data, action };
        lastResultPayload = null;
        lastRecordTable = null;
    }

    const rows = [
        [t('status'), data.message],
        [t('barcode'), data.barcode],
        [t('name'), data.name],
        [t('kanji'), data.kanji],
        [t('katakana'), data.katakana],
        [t('address'), data.address],
    ];

    renderStableResult(`<div class="register-success">
        <div class="success-ribbon">${action === 'update' ? escapeHtml(t('updated')) : escapeHtml(t('registered'))}</div>
        <div class="result-grid">${rows.map(([label, value], index) => `
            <div class="result-row is-visible">
                <div class="result-label">${escapeHtml(label)}</div>
                <div class="result-value">${escapeHtml(value)}</div>
            </div>
        `).join('')}</div>
    </div>`);
}

function showRecordTable(records, limit = null, label = t('allRecords'), isRefresh = false) {
    if (!isRefresh) {
        lastRecordTable = { records, limit, label };
        lastResultPayload = null;
        lastRegisterResult = null;
    }

    const visibleRecords = Number.isInteger(limit) ? records.slice(0, limit) : records;

    if (visibleRecords.length === 0) {
        barcodeResult.innerHTML = `<p class="empty-state">${escapeHtml(t('noRecords'))}</p>`;
        armResultReveal();
        return;
    }

    const tableLabel = Number.isInteger(limit) ? `${visibleRecords.length} ${t('recentRecords')}` : `${t('allRecords')}: ${visibleRecords.length}`;

    barcodeResult.innerHTML = `<div class="result-mode-badge reveal-item">${escapeHtml(tableLabel)}</div>
    <div class="table-wrap">
        <table class="records-table">
            <thead>
                <tr>
                    <th>${escapeHtml(t('no'))}</th>
                    <th>${escapeHtml(t('barcode'))}</th>
                    <th>${escapeHtml(t('name'))}</th>
                    <th>${escapeHtml(t('kanji'))}</th>
                    <th>${escapeHtml(t('katakana'))}</th>
                    <th>${escapeHtml(t('address'))}</th>
                    <th>${escapeHtml(t('added'))}</th>
                    ${canEdit ? `<th>${escapeHtml(t('action'))}</th>` : ''}
                </tr>
            </thead>
            <tbody>
                ${visibleRecords.map((record, index) => `
                    <tr class="reveal-row${canEdit ? ' is-editable' : ''}" ${canEdit ? `data-edit-record ${recordToDataset(record)}` : ''} style="--reveal-delay: ${Math.min(index * 35, 420)}ms">
                        <td data-label="${escapeHtml(t('no'))}">${escapeHtml(record.no)}</td>
                        <td data-label="${escapeHtml(t('barcode'))}">${escapeHtml(record.barcode)}</td>
                        <td data-label="${escapeHtml(t('name'))}">${escapeHtml(record.name)}</td>
                        <td data-label="${escapeHtml(t('kanji'))}">${escapeHtml(record.kanji)}</td>
                        <td data-label="${escapeHtml(t('katakana'))}">${escapeHtml(record.katakana)}</td>
                        <td data-label="${escapeHtml(t('address'))}">${escapeHtml(record.address)}</td>
                        <td data-label="${escapeHtml(t('added'))}">${escapeHtml(record.addedDateTime)}</td>
                        ${canEdit ? `<td data-label="${escapeHtml(t('action'))}"><button class="mini-delete" type="button" data-delete-barcode="${escapeHtml(record.barcode)}">${escapeHtml(t('delete'))}</button></td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
    armResultReveal();
}

async function loadInitialRecords() {
    if (!barcodeResult || !form) {
        return;
    }

    try {
        const response = await fetch(routes.search, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ barcode: '' }),
        });
        const body = await response.json();
        const records = body?.data?.records;

        if (response.ok && Array.isArray(records)) {
            showRecordTable(records, 5, t('recentRecords'));
            return;
        }
    } catch (error) {
        // Keep the first screen quiet if IRIS is not reachable yet.
    }

    barcodeResult.innerHTML = `<p class="empty-state">${escapeHtml(t('noData'))}</p>`;
    armResultReveal();
}

function armResultReveal() {
    const revealItems = barcodeResult.querySelectorAll('.reveal-item, .result-alert, .empty-state, .table-wrap');

    window.requestAnimationFrame(() => {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    });

    const tableWrap = barcodeResult.querySelector('.table-wrap');
    const rows = barcodeResult.querySelectorAll('.reveal-row');

    if (!tableWrap || rows.length === 0) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        rows.forEach((row) => row.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: tableWrap,
        threshold: 0.16,
    });

    rows.forEach((row) => observer.observe(row));
}

function scrollResultIntoView() {
    const panel = barcodeResult.closest('.result-panel');

    window.setTimeout(() => {
        panel?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, 140);
}

function setStatus(text, isError = false) {
    if (!statusBadge) {
        return;
    }

    statusBadge.textContent = text;
    statusBadge.classList.toggle('is-error', isError);
}

function setScannerStatus(text, mode = 'idle') {
    scannerStatus.textContent = text;
    scannerStatus.classList.toggle('is-live', mode === 'live');
    scannerStatus.classList.toggle('is-error', mode === 'error');
}

function expandPanel(panel) {
    panel?.classList.remove('is-collapsed');
    panel?.setAttribute('aria-hidden', 'false');
}

function collapsePanel(panel) {
    panel?.classList.add('is-collapsed');
    panel?.setAttribute('aria-hidden', 'true');
}

function isPanelCollapsed(panel) {
    return panel?.classList.contains('is-collapsed');
}
function toggleSignupPanel() {
    if (!signupPanel) {
        return;
    }

    const willOpen = isPanelCollapsed(signupPanel);

    if (willOpen) {
        expandPanel(signupPanel);

        window.setTimeout(() => {
            signupPanel.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });

            signupPanel.querySelector('input[name="username"]')?.focus();
        }, 160);
    } else {
        collapsePanel(signupPanel);
    }

    if (signupToggle) {
        signupToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

        // Button text-г Close болгохгүй. Үргэлж "Аккаунт үүсгэх" хэвээр байна.
        signupToggle.textContent = t('createAccount');
    }
}
function setRegisterMode() {
    selectedRecord = null;

    if (!saveRecordButton) {
        return;
    }

    saveRecordButton.dataset.action = 'register';
    saveRecordButton.textContent = t('save');
    saveRecordButton.classList.add('success');

    if (deleteRecordButton) {
        deleteRecordButton.hidden = true;
    }
}

function setEditMode(record) {
    if (!canEdit || !form) {
        return;
    }

    selectedRecord = record;

    form.querySelector('input[name="barcode"]').value = record.barcode ?? '';
    form.querySelector('input[name="name"]').value = record.name ?? '';
    form.querySelector('input[name="kanji"]').value = record.kanji ?? '';
    form.querySelector('input[name="katakana"]').value = record.katakana ?? '';
    form.querySelector('input[name="address"]').value = record.address ?? '';

    if (saveRecordButton) {
        saveRecordButton.dataset.action = 'update';
        saveRecordButton.textContent = t('update');
        saveRecordButton.classList.add('success');
    }

    if (deleteRecordButton) {
        deleteRecordButton.hidden = false;
    }

    expandRegisterPanel(t('edit'));
    pulseElement(registerPanel, 'is-success-pulse');
}

function requestDelete(barcode) {
    const clean = cleanBarcode(barcode);

    if (!clean || !canEdit || !deleteRecordButton) {
        return;
    }

    if (!window.confirm(t('deleteConfirm', { barcode: clean }))) {
        return;
    }

    barcodeInput.value = clean;
    deleteRecordButton.disabled = true;
    setStatus(t('deleting'));

    sendRequest('delete', deleteRecordButton).catch((error) => {
        barcodeResult.innerHTML = `<div class="result-alert">${escapeHtml(error.message)}</div>`;
        setStatus(t('error'), true);
        deleteRecordButton.disabled = false;
        form?.classList.remove('is-searching');
    });
}

function expandRegisterPanel(status = t('register')) {
    expandPanel(registerPanel);
    setStatus(status);
    window.setTimeout(() => {
        registerPanel?.querySelector('input[name="name"]')?.focus();
    }, 280);
}

function collapseRegisterPanel() {
    collapsePanel(registerPanel);
}

function toggleRegisterPanel() {
    if (isPanelCollapsed(registerPanel)) {
        setRegisterMode();
        expandRegisterPanel();
        return;
    }

    collapseRegisterPanel();
    setStatus(t('ready'));
    barcodeInput?.focus();
}

function expandCameraPanel() {
    expandPanel(scannerPanel);
    window.setTimeout(() => {
        scannerPanel?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, 120);
}

function toggleCameraPanel() {
    if (isPanelCollapsed(scannerPanel)) {
        expandCameraPanel();
        return;
    }

    stopScanner();
    collapsePanel(scannerPanel);
}

function cleanBarcode(value) {
    return String(value ?? '').replaceAll('*', '').trim().toUpperCase();
}

function showCameraHelp(message) {
    cameraHelp.hidden = false;
    cameraHelp.textContent = message;
}

function buildPayload() {
    return Object.fromEntries(new FormData(form));
}

async function sendRequest(action, trigger) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    const options = action === 'ping' ? {
        method: 'GET',
        signal: controller.signal,
        headers: {
            Accept: 'application/json',
        },
    } : {
        method: 'POST',
        signal: controller.signal,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(buildPayload(action)),
    };

    let response;

    try {
        response = await fetch(routes[action], options);
    } finally {
        window.clearTimeout(timeout);
    }

    const body = await response.json().catch(() => ({
        message: t('nonJsonResponse'),
    }));

    showBarcodeResult({
        ok: response.ok,
        status: response.status,
        action,
        body,
    });

    setStatus(response.ok ? t('done') : t('error'), !response.ok);
    trigger.disabled = false;
    form?.classList.remove('is-searching');
}

form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const action = event.submitter?.dataset.action;

    if (!routes[action]) {
        return;
    }

    event.submitter.disabled = true;
    setStatus(t('sending'));
    form?.classList.toggle('is-searching', action === 'search' || action === 'register' || action === 'update');

    if (action === 'search') {
        showLoadingResult(t('loadingData'));
    }

    sendRequest(action, event.submitter).catch((error) => {
        barcodeResult.innerHTML = `<div class="result-alert">${escapeHtml(error.message)}</div>`;
        setStatus(t('error'), true);
        event.submitter.disabled = false;
        form?.classList.remove('is-searching');
    });
});

document.querySelector('[data-action="ping"]')?.addEventListener('click', (event) => {
    event.currentTarget.disabled = true;
    setStatus(t('sending'));

    sendRequest('ping', event.currentTarget).catch((error) => {
        barcodeResult.innerHTML = `<div class="result-alert">${escapeHtml(error.message)}</div>`;
        setStatus(t('error'), true);
        event.currentTarget.disabled = false;
    });
});

cameraToggle?.addEventListener('click', () => {
    toggleCameraPanel();
});

registerToggle?.addEventListener('click', () => {
    toggleRegisterPanel();
});
signupToggle?.addEventListener('click', () => {
    toggleSignupPanel();
});

signupForm?.addEventListener('submit', () => {
    expandPanel(signupPanel);
    signupToggle?.setAttribute('aria-expanded', 'true');
});

accountToggle?.addEventListener('click', () => {
    const willOpen = isPanelCollapsed(accountPanel);

    if (willOpen) {
        expandPanel(accountPanel);
    } else {
        collapsePanel(accountPanel);
    }

    accountToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
});

deleteRecordButton?.addEventListener('click', () => {
    requestDelete(selectedRecord?.barcode ?? barcodeInput?.value);
});

barcodeResult?.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete-barcode]');

    if (deleteButton) {
        event.stopPropagation();
        requestDelete(deleteButton.dataset.deleteBarcode);
        return;
    }

    const target = event.target.closest('[data-edit-record]');

    if (!target || !canEdit) {
        return;
    }

    setEditMode({
        barcode: target.dataset.barcode,
        name: target.dataset.name,
        kanji: target.dataset.kanji,
        katakana: target.dataset.katakana,
        address: target.dataset.address,
    });
});

themeToggle?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

languageButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleLanguageMenu();
});

languageOptions.forEach((option) => {
    option.addEventListener('click', (event) => {
        event.stopPropagation();
        setLanguage(event.currentTarget.value);
        closeLanguageMenu();
    });
});

document.addEventListener('click', (event) => {
    if (!languageMenu?.contains(event.target)) {
        closeLanguageMenu();
    }
});

async function stopScanner() {
    if (scannerControls) {
        scannerControls.stop();
        scannerControls = null;
    }

    if (scannerVideo?.srcObject) {
        scannerVideo.srcObject.getTracks().forEach((track) => track.stop());
        scannerVideo.srcObject = null;
    }

    cameraStart.disabled = false;
    cameraStop.disabled = true;
    scannerPanel?.classList.remove('is-scanning');
    setScannerStatus(t('stopped'));
}

async function startScanner() {
    expandCameraPanel();

    if (!window.isSecureContext) {
        const secureUrl = new URL(window.location.href);

        secureUrl.protocol = 'https:';
        secureUrl.port = '9443';
        cameraNote.textContent = t('openingSecure');
        showCameraHelp(t('secureCameraHelp'));
        setScannerStatus(t('httpsNeeded'), 'error');
        window.setTimeout(() => {
            window.location.href = secureUrl.toString();
        }, 900);
        return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        cameraNote.textContent = t('cameraUnavailable');
        showCameraHelp(t('cameraPermissionHelp'));
        setScannerStatus(t('noCamera'), 'error');
        return;
    }

    cameraStart.disabled = true;
    cameraStop.disabled = false;
    scannerPanel?.classList.add('is-scanning');
    setScannerStatus(t('scanning'), 'live');
    cameraNote.textContent = t('pointCamera');
    cameraHelp.hidden = true;

    try {
        scannerControls = await codeReader.decodeFromVideoDevice(undefined, scannerVideo, (decoded) => {
            const barcode = cleanBarcode(decoded?.getText());

            if (!barcode) {
                return;
            }

            barcodeInput.value = barcode;
            cameraNote.textContent = t('scanned', { barcode });
            setScannerStatus(t('found'), 'live');
            pulseElement(barcodeInput, 'is-scan-pulse');
            pulseElement(scannerPanel, 'is-scan-pulse');
            vibrate(80);
            stopScanner();
            searchButton?.click();
        });
    } catch (error) {
        cameraNote.textContent = error.message;
        showCameraHelp(t('cameraPermissionHelp'));
        setScannerStatus(t('error'), 'error');
        scannerPanel?.classList.remove('is-scanning');
        cameraStart.disabled = false;
        cameraStop.disabled = true;
    }
}

cameraStart?.addEventListener('click', startScanner);
cameraStop?.addEventListener('click', stopScanner);

clearButton?.addEventListener('click', () => {
    if (barcodeInput) {
        barcodeInput.value = '';
    }

    setStatus(t('ready'));
    barcodeInput?.focus();
});

loadInitialRecords();
