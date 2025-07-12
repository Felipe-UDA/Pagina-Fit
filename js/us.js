document.addEventListener('DOMContentLoaded', () => {
    AOS.init();
    
    function setupMissionVisionCards() {
        const cards = document.querySelectorAll('article .card');

        cards.forEach(card => {
            const upElement = card.querySelector('.up');

            card.addEventListener('mouseover', () => {
                upElement.style.transform = 'translateY(-100%)';
            });

            card.addEventListener('mouseout', () => {
                upElement.style.transform = 'translateY(0)';
            });
        });
    }

    setupMissionVisionCards();
     
    function setupTeamCardInteraction() {
        const teamCard = document.querySelector('section .card.sc');

        if (teamCard) {
            const frontElement = teamCard.querySelector('.front');

            if (frontElement) {
                frontElement.addEventListener('click', () => {
                    teamCard.classList.toggle('is-active');
                });
            }

            document.addEventListener('click', (event) => {
                if (teamCard.classList.contains('is-active') && !teamCard.contains(event.target)) {
                    teamCard.classList.remove('is-active');
                }
            });

            window.addEventListener('scroll', () => {
                if (teamCard.classList.contains('is-active')) {
                    teamCard.classList.remove('is-active');
                }
            });
        };
    };    

    setupTeamCardInteraction();
});