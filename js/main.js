// Legacy entry - kept for compatibility. Real logic is in components.js
// If you load only main.js (old pages), it still works.

(function() {
    const htmlEl = document.documentElement;

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
        const light = document.getElementById('theme-icon-light');
        const dark = document.getElementById('theme-icon-dark');
        const toggle = document.getElementById('theme-toggle');
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

    // sync if inline guard failed
    try {
        const expected = resolveTheme();
        if (!htmlEl.classList.contains(expected)) {
            htmlEl.classList.remove('light','dark');
            htmlEl.classList.add(expected);
        }
    } catch(e){}

    // delegation so it works even if header injected later
    document.addEventListener('click', (e) => {
        const menuBtn = e.target.closest('#mobile-menu-btn');
        if (menuBtn) {
            const menu = document.getElementById('mobile-menu');
            if (!menu) return;
            const isOpen = !menu.classList.contains('hidden');
            menu.classList.toggle('hidden');
            const icon = menuBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isOpen ? 'menu' : 'close';
        }
        const themeBtn = e.target.closest('#theme-toggle');
        if (themeBtn) {
            const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
            applyTheme(next);
        }
    });

    window.addEventListener('scroll', () => {
        const header = document.getElementById('site-header') || document.querySelector('header');
        if (!header) return;
        if (window.scrollY > 20) header.classList.add('shadow-lg');
        else header.classList.remove('shadow-lg');
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateIcon);
    } else {
        updateIcon();
    }

    window.__applyTheme = applyTheme;
    window.__getCurrentTheme = getCurrentTheme;
})();
