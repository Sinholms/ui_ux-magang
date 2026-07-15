# Dinkominfo Pekalongan - Portal Informasi

Static website untuk Dinkominfo Kabupaten Pekalongan. No framework, no build step, Tailwind CDN.

## Struktur Profesional (Pro)

```
magang/
├── index.html                  # Beranda (wajib di root untuk hosting)
├── pages/                      # 7 halaman lainnya biar root bersih
│   ├── articles.html
│   ├── article-detail.html
│   ├── content-page.html       # Profil
│   ├── layanan.html
│   ├── galeri.html
│   ├── unduhan.html
│   └── kontak.html
├── assets/
│   └── logo-kominfo.png
├── components/                 # GLOBAL - edit 1 file = all pages update
│   ├── header.html             # ← edit header disini
│   └── footer.html             # ← edit footer disini
├── css/
│   └── style.css               # custom css + dark mode overrides
├── js/
│   ├── main.js                 # theme + mobile menu (fallback)
│   └── components.js           # loader header/footer + active nav logic
└── tailwind-config.js
```

## Kenapa Header/Footer Global?

**Problem lama:** 8 file HTML copy-paste header/footer 200 baris. Ubah 1 typo di footer = edit 8 file.

**Solusi sekarang:**
- `components/header.html` = 1 sumber header
- `components/footer.html` = 1 sumber footer
- `js/components.js` inject via `fetch()` ke `<div id="header-placeholder">` & `<div id="footer-placeholder">`
- Active nav otomatis via `data-nav` attribute

**Mau edit header/footer?** Edit 1 file di `components/` -> semua page ikut.

## Cara Jalan

```bash
# WAJIB pakai server (karena fetch components)
python -m http.server 8000
# atau
npx serve .
```

Buka http://localhost:8000

> Gak bisa double-click file? Karena `fetch('components/header.html')` butuh HTTP, bukan `file://`.

## Theme Toggle Fix

- Inline script di `<head>` baca `localStorage` + `prefers-color-scheme` anti FOUC
- `js/components.js` handle toggle + icon swap + localStorage
- Dark mode overrides di `css/style.css` pakai `html.dark .bg-surface-white`

## Design Tokens

- Primary navy: `primary` (#002a58)
- Secondary yellow: `secondary-container` (#fecb00)
- Surfaces: `surface-white`, `surface-container-low`
- Layout: `max-w-container-max mx-auto px-4 md:px-margin-desktop`

## Pages Map

- `/` → Beranda
- `/pages/content-page.html` → Profil
- `/pages/articles.html` → Berita
- `/pages/article-detail.html` → Detail Berita
- `/pages/layanan.html` → Layanan
- `/pages/galeri.html` → Galeri
- `/pages/unduhan.html` → Informasi
- `/pages/kontak.html` → Pengaduan
