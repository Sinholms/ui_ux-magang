// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        mobileMenuBtn.querySelector('.material-symbols-outlined').textContent = isOpen ? 'menu' : 'close';
    });
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 20) {
        header.classList.add('shadow-lg');
    } else {
        header.classList.remove('shadow-lg');
    }
});
// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const themeIconLight = document.getElementById('theme-icon-light');
const themeIconDark = document.getElementById('theme-icon-dark');

// Check saved theme or system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    html.className = savedTheme;
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.className = 'dark';
}

// Update icon based on current theme
function updateThemeIcon() {
    const isDark = html.className === 'dark';
    themeIconLight.classList.toggle('hidden', isDark);
    themeIconDark.classList.toggle('hidden', !isDark);
}
updateThemeIcon();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = html.className === 'dark';
        html.className = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        updateThemeIcon();
    });
}
