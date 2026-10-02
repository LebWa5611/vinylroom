document.addEventListener('DOMContentLoaded', () => {
    const burgerToggle = document.getElementById('burgerToggle');
    const burgerClose = document.getElementById('burgerClose');
    const mobileMenu = document.getElementById('mobileMenu');

    if (burgerToggle && mobileMenu) {
        burgerToggle.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenu.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });
    }

    if (burgerClose && mobileMenu) {
        burgerClose.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenu.classList.remove('is-open');
            document.body.style.overflow = '';
        });
    }
});