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

const codeReader = new BrowserMultiFormatReader();
let scannerControls = null;

const routes = {
    search: '/iris-test/search',
    register: '/iris-test/register',
    ping: '/iris-test/ping',
};

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

function setTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('iris-theme', nextTheme);

    if (themeToggle) {
        themeToggle.textContent = nextTheme === 'dark' ? 'White mode' : 'Dark mode';
    }
}

setTheme(localStorage.getItem('iris-theme') || document.documentElement.dataset.theme || 'light');

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    })[char]);
}

function showBarcodeResult(payload) {
    const data = payload?.body?.data;
    const request = payload?.body?.request ?? {};

    if (Array.isArray(data?.records)) {
        showRecordTable(data.records);
        scrollResultIntoView();
        return;
    }

    if (!data) {
        const message = payload?.body?.message;
        barcodeResult.innerHTML = message
            ? `<div class="result-alert">${escapeHtml(message)}</div>`
            : '<p class="empty-state">No data</p>';
        armResultReveal();
        return;
    }

    if (payload?.action === 'register' && payload.ok) {
        const registered = {
            barcode: request.barcode ?? data.barcode,
            name: request.name ?? data.name,
            kanji: request.kanji ?? data.kanji,
            katakana: request.katakana ?? data.katakana,
            address: request.address ?? data.address,
            message: data.message ?? 'Registered',
        };

        showRegisterResult(registered);
        collapseRegisterPanel();
        scrollResultIntoView();
        return;
    }

    if (!data.found) {
        const message = data.message ?? payload?.body?.message ?? 'Not Found';
        barcodeResult.innerHTML = `<div class="result-alert">${escapeHtml(message)}</div>`;
        armResultReveal();
        return;
    }

    const rows = [
        ['No', data.no],
        ['Barcode', data.barcode],
        ['Name', data.name],
        ['Kanji', data.kanji],
        ['Katakana', data.katakana],
        ['Address', data.address],
        ['Added DateTime', data.addedDateTime],
    ];

    barcodeResult.innerHTML = `<div class="result-grid">${rows.map(([label, value], index) => `
        <div class="result-row reveal-item" style="--reveal-delay: ${index * 55}ms">
            <div class="result-label">${escapeHtml(label)}</div>
            <div class="result-value">${escapeHtml(value)}</div>
        </div>
    `).join('')}</div>`;
    armResultReveal();
    scrollResultIntoView();
}

function showLoadingResult(message = 'Loading data') {
    barcodeResult.innerHTML = `<p class="empty-state is-loading">${escapeHtml(message)}</p>`;
    armResultReveal();
}

function showRegisterResult(data) {
    const rows = [
        ['Status', data.message],
        ['Barcode', data.barcode],
        ['Name', data.name],
        ['Kanji', data.kanji],
        ['Katakana', data.katakana],
        ['Address', data.address],
    ];

    barcodeResult.innerHTML = `<div class="register-success">
        <div class="success-ribbon">Registered</div>
        <div class="result-grid">${rows.map(([label, value], index) => `
            <div class="result-row reveal-item" style="--reveal-delay: ${index * 70}ms">
                <div class="result-label">${escapeHtml(label)}</div>
                <div class="result-value">${escapeHtml(value)}</div>
            </div>
        `).join('')}</div>
    </div>`;
    armResultReveal();
}

function showRecordTable(records, limit = null) {
    const visibleRecords = Number.isInteger(limit) ? records.slice(0, limit) : records;

    if (visibleRecords.length === 0) {
        barcodeResult.innerHTML = '<p class="empty-state">No records</p>';
        armResultReveal();
        return;
    }

    barcodeResult.innerHTML = `<div class="table-wrap">
        <table class="records-table">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Barcode</th>
                    <th>Name</th>
                    <th>Kanji</th>
                    <th>Katakana</th>
                    <th>Address</th>
                    <th>Added</th>
                </tr>
            </thead>
            <tbody>
                ${visibleRecords.map((record, index) => `
                    <tr class="reveal-row" style="--reveal-delay: ${Math.min(index * 35, 420)}ms">
                        <td data-label="No">${escapeHtml(record.no)}</td>
                        <td data-label="Barcode">${escapeHtml(record.barcode)}</td>
                        <td data-label="Name">${escapeHtml(record.name)}</td>
                        <td data-label="Kanji">${escapeHtml(record.kanji)}</td>
                        <td data-label="Katakana">${escapeHtml(record.katakana)}</td>
                        <td data-label="Address">${escapeHtml(record.address)}</td>
                        <td data-label="Added">${escapeHtml(record.addedDateTime)}</td>
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
            showRecordTable(records, 5);
            return;
        }
    } catch (error) {
        // Keep the first screen quiet if IRIS is not reachable yet.
    }

    barcodeResult.innerHTML = '<p class="empty-state">No data</p>';
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

function expandRegisterPanel() {
    expandPanel(registerPanel);
    setStatus('Register');
    window.setTimeout(() => {
        registerPanel?.querySelector('input[name="name"]')?.focus();
    }, 280);
}

function collapseRegisterPanel() {
    collapsePanel(registerPanel);
}

function toggleRegisterPanel() {
    if (isPanelCollapsed(registerPanel)) {
        expandRegisterPanel();
        return;
    }

    collapseRegisterPanel();
    setStatus('Ready');
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
        message: 'The server returned a non-JSON response.',
    }));

    showBarcodeResult({
        ok: response.ok,
        status: response.status,
        action,
        body,
    });

    setStatus(response.ok ? 'Done' : 'Error', !response.ok);
    trigger.disabled = false;
}

form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const action = event.submitter?.dataset.action;

    if (!routes[action]) {
        return;
    }

    event.submitter.disabled = true;
    setStatus('Sending');
    showLoadingResult(action === 'register' ? 'Saving data' : 'Loading data');

    sendRequest(action, event.submitter).catch((error) => {
        barcodeResult.innerHTML = `<div class="result-alert">${escapeHtml(error.message)}</div>`;
        setStatus('Error', true);
        event.submitter.disabled = false;
    });
});

document.querySelector('[data-action="ping"]')?.addEventListener('click', (event) => {
    event.currentTarget.disabled = true;
    setStatus('Sending');

    sendRequest('ping', event.currentTarget).catch((error) => {
        barcodeResult.innerHTML = `<div class="result-alert">${escapeHtml(error.message)}</div>`;
        setStatus('Error', true);
        event.currentTarget.disabled = false;
    });
});

cameraToggle?.addEventListener('click', () => {
    toggleCameraPanel();
});

registerToggle?.addEventListener('click', () => {
    toggleRegisterPanel();
});

themeToggle?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
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
    setScannerStatus('Stopped');
}

async function startScanner() {
    expandCameraPanel();

    if (!window.isSecureContext) {
        const secureUrl = new URL(window.location.href);

        secureUrl.protocol = 'https:';
        secureUrl.port = '9443';
        cameraNote.textContent = 'Opening the secure camera page...';
        showCameraHelp(`Chrome needs HTTPS for camera. If a warning appears, click Advanced, proceed to ${secureUrl.hostname}, then allow Camera.`);
        setScannerStatus('HTTPS needed', 'error');
        window.setTimeout(() => {
            window.location.href = secureUrl.toString();
        }, 900);
        return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        cameraNote.textContent = 'Camera API is unavailable. Check Chrome site settings and camera permissions.';
        showCameraHelp('Chrome Settings > Privacy and security > Site settings > Camera: allow this site and pick a camera device.');
        setScannerStatus('No camera', 'error');
        return;
    }

    cameraStart.disabled = true;
    cameraStop.disabled = false;
    setScannerStatus('Scanning', 'live');
    cameraNote.textContent = 'Point the camera at a barcode.';
    cameraHelp.hidden = true;

    try {
        scannerControls = await codeReader.decodeFromVideoDevice(undefined, scannerVideo, (decoded) => {
            const barcode = cleanBarcode(decoded?.getText());

            if (!barcode) {
                return;
            }

            barcodeInput.value = barcode;
            cameraNote.textContent = `Scanned ${barcode}`;
            setScannerStatus('Found', 'live');
            stopScanner();
            searchButton?.click();
        });
    } catch (error) {
        cameraNote.textContent = error.message;
        showCameraHelp('If Chrome did not ask for permission, open Site settings for this address and set Camera to Allow.');
        setScannerStatus('Error', 'error');
        cameraStart.disabled = false;
        cameraStop.disabled = true;
    }
}

cameraStart?.addEventListener('click', startScanner);
cameraStop?.addEventListener('click', stopScanner);

clearButton?.addEventListener('click', () => {
    form?.reset();
    collapseRegisterPanel();
    collapsePanel(scannerPanel);
    barcodeResult.innerHTML = '<p class="empty-state">No data</p>';
    setStatus('Ready');
    barcodeInput?.focus();
    armResultReveal();
});

loadInitialRecords();
