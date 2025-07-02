// Mostrar/ocultar el botón al hacer scroll
window.addEventListener('scroll', () => {
    const boton = document.querySelector('.go-top-container');
    if (document.documentElement.scrollTop > 50) {
        boton.classList.add('show');
    } else {
        boton.classList.remove('show');
    }
});

// Al hacer clic, subir suavemente
document.addEventListener('DOMContentLoaded', () => {
    const boton = document.querySelector('.go-top-container');
    boton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
