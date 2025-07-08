document.addEventListener('DOMContentLoaded', () => {
    const articleCards = document.querySelectorAll('article .container .card');

    articleCards.forEach(card => {
        
        card.addEventListener('mouseover', () => {
            card.classList.add('is-hovered');
        });

        card.addEventListener('mouseout', () => {
            card.classList.remove('is-hovered');
        });
    });

    const sectionCardImages = document.querySelectorAll('section .container .card .front img');

    sectionCardImages.forEach(image => {
        image.addEventListener('click', () => {
            const card = image.closest('.card');
            if (card) {
                card.classList.toggle('is-revealed');
            }
        });
    });
});