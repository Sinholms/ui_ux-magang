// Simple micro-interactions for header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 20) {
        header.classList.add('h-16', 'bg-opacity-95');
        header.classList.remove('h-20');
    } else {
        header.classList.add('h-20');
        header.classList.remove('h-16', 'bg-opacity-95');
    }
});
