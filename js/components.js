// Load global header/footer - edit 1 file = all pages updated
// No build step, pure fetch. Works via local server (not file://).
// Supports pages in /pages folder + root index.html

const ACTIVE_CLASSES_DESKTOP = ['text-primary','dark:text-secondary-container','border-b-2','border-primary','dark:border-secondary-container','pb-1'];
const INACTIVE_CLASSES_DESKTOP = ['text-on-surface-variant','dark:text-outline-variant','hover:text-primary','dark:hover:text-primary-fixed'];
const ACTIVE_CLASSES_MOBILE = ['text-primary','bg-primary-fixed'];
const INACTIVE_CLASSES_MOBILE = ['text-on-surface-variant','hover:bg-surface-subtle'];

function getBasePrefix() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) return '../';
    return '';
}

function normalizeHeaderForContext(html, base) {
    // header.html is written for root context: href="pages/XXX" and src="assets/..."
    // When we are inside /pages/, we need: href="XXX" (sibling) and src="../assets/..." and index -> ../index.html
    if (!base) return html; // root, no change
    let out = html;
    out = out.replace(/src="assets\//g, `src="${base}assets/`);
    out = out.replace(/href="pages\//g, 'href="'); // pages/X -> X when inside pages
    // index.html is special: from pages/ it is ../index.html, header currently has href="index.html" after previous replace? Actually header has index bare and pages/ prefixed
    // Fix index links that are now bare index.html but should be ../index.html
    out = out.replace(/href="index\.html"/g, `href="${base}index.html"`);
    return out;
}

function getPageName() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    return file.split('?')[0].split('#')[0] || 'index.html';
}
function isActiveForPage(navAttr, current) {
    // navAttr like "index.html" or "articles.html,article-detail.html"
    const parts = navAttr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    return parts.includes(current.toLowerCase());
}

function applyActiveState(headerRoot, currentPage) {
    const desktopLinks = headerRoot.querySelectorAll('[data-nav]');
    desktopLinks.forEach(a => {
        const navAttr = a.getAttribute('data-nav') || '';
        if (isActiveForPage(navAttr, currentPage)) {
            a.classList.remove(...INACTIVE_CLASSES_DESKTOP);
            a.classList.add(...ACTIVE_CLASSES_DESKTOP);
        } else {
            a.classList.remove(...ACTIVE_CLASSES_DESKTOP);
            a.classList.add(...INACTIVE_CLASSES_DESKTOP);
        }
    });

    const mobileLinks = headerRoot.querySelectorAll('[data-nav-mobile]');
    mobileLinks.forEach(a => {
        const navAttr = a.getAttribute('data-nav-mobile') || '';
        if (isActiveForPage(navAttr, currentPage)) {
            a.classList.remove(...INACTIVE_CLASSES_MOBILE);
            a.classList.add(...ACTIVE_CLASSES_MOBILE);
        } else {
            a.classList.remove(...ACTIVE_CLASSES_MOBILE);
            a.classList.add(...INACTIVE_CLASSES_MOBILE);
        }
    });
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    // avoid double binding
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
        const isOpen = !menu.classList.contains('hidden');
        menu.classList.toggle('hidden');
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = isOpen ? 'menu' : 'close';
    });
}

function initHeaderScroll() {
    // avoid multiple listeners
    if (window.__headerScrollBound) return;
    window.__headerScrollBound = true;
    window.addEventListener('scroll', () => {
        const header = document.getElementById('site-header');
        if (!header) return;
        if (window.scrollY > 20) header.classList.add('shadow-lg');
        else header.classList.remove('shadow-lg');
    });
}

function initTheme() {
    const htmlEl = document.documentElement;
    const getToggle = () => document.getElementById('theme-toggle');
    const getLight = () => document.getElementById('theme-icon-light');
    const getDark = () => document.getElementById('theme-icon-dark');

    function resolveTheme() {
        try {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark' || stored === 'light') return stored;
        } catch(e){}
        if (htmlEl.classList.contains('dark')) return 'dark';
        if (htmlEl.classList.contains('light')) return 'light';
        try {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        } catch(e){}
        return 'light';
    }

    function getCurrentTheme() {
        return htmlEl.classList.contains('dark') ? 'dark' : 'light';
    }

    function updateIcon() {
        const isDark = getCurrentTheme() === 'dark';
        const light = getLight();
        const dark = getDark();
        const toggle = getToggle();
        if (light) {
            light.classList.toggle('hidden', isDark);
            light.setAttribute('aria-hidden', String(isDark));
        }
        if (dark) {
            dark.classList.toggle('hidden', !isDark);
            dark.setAttribute('aria-hidden', String(!isDark));
        }
        if (toggle) toggle.setAttribute('aria-label', isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
    }

    function applyTheme(theme) {
        htmlEl.classList.remove('light','dark');
        htmlEl.classList.add(theme);
        try { localStorage.setItem('theme', theme); } catch(e){}
        updateIcon();
    }

    // initial sync - handle FOUC guard failed
    try {
        const expected = resolveTheme();
        if (!htmlEl.classList.contains(expected)) {
            htmlEl.classList.remove('light','dark');
            htmlEl.classList.add(expected);
        }
    } catch(e){}

    // bind toggle - re-bind each time header injected
    const toggle = getToggle();
    if (toggle && toggle.dataset.themeBound !== '1') {
        toggle.dataset.themeBound = '1';
        toggle.addEventListener('click', () => {
            const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
            applyTheme(next);
        });
    }

    updateIcon();

    // expose for debug
    window.__applyTheme = applyTheme;
    window.__getCurrentTheme = getCurrentTheme;
}

async function loadComponent(url, placeholderId) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return null;
    try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`fetch ${url} failed ${res.status}`);
        let html = await res.text();
        const base = getBasePrefix();
        const isHeader = placeholderId === 'header-placeholder';
        if (isHeader) {
            html = normalizeHeaderForContext(html, base);
        } else {
            // footer: fix index.html link if inside pages/
            if (base) {
                html = html.replace(/href="index\.html"/g, `href="${base}index.html"`);
                html = html.replace(/href="pages\//g, 'href="');
            }
        }
        placeholder.outerHTML = html;
        return document.getElementById(isHeader ? 'site-header' : 'site-footer') || true;
    } catch (e) {
        console.warn(`[components] failed to load ${url}:`, e);
        if (placeholderId === 'header-placeholder') {
            placeholder.innerHTML = `<header class="sticky top-0 z-50 bg-white shadow p-4">Header gagal dimuat. Edit components/header.html</header>`;
        }
        if (placeholderId === 'footer-placeholder') {
            placeholder.innerHTML = `<footer class="bg-primary text-white p-8">Footer gagal dimuat. Edit components/footer.html</footer>`;
        }
        return null;
    }
}

async function init() {
    const currentPage = getPageName();
    const base = getBasePrefix();

    const headerPath = `${base}components/header.html`;
    const footerPath = `${base}components/footer.html`;

    // Load header
    const headerLoaded = await loadComponent(headerPath, 'header-placeholder');
    if (headerLoaded) {
        applyActiveState(document, currentPage);
        initMobileMenu();
        initHeaderScroll();
        initTheme();
    } else {
        initMobileMenu();
        initTheme();
    }

    // Load footer (fix links inside footer similarly)
    await loadComponent(footerPath, 'footer-placeholder');
    // After footer injected, fix footer internal page links if we're in /pages/
    if (base) {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.querySelectorAll('a[href="index.html"]').forEach(a => a.setAttribute('href', `${base}index.html`));
        }
    }
}
// Start after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
