let currentCarouselPosition = 0;
let cardTotalWidth = 0; // Se calculará dinámicamente: ancho de carta + margen
let totalCards = 0;
let cardsPerView = 0; // Cuántas cartas son visibles en la pantalla

async function obtenerRecetasFitnessSpoonacular() {
    const API_KEY = 'cfed28d805e24762b2f254f78424d9a5'; // 
    const query = 'healthy chicken';
    const dietType = 'low fat';
    const number = 15;

    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${query}&diet=${dietType}&number=${number}&addRecipeInformation=true&addRecipeNutrition=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP: ${response.status} - ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log(data.results);

        mostrarRecetasSpoonacular(data.results);
        // Llama a setupCarousel DESPUÉS de que las cartas se hayan renderizado
        // y después de un pequeño retraso para asegurar que el navegador calculó los anchos.
        setTimeout(setupCarousel, 100); 
        
    } catch (error) {
        console.error('Hubo un problema con la solicitud fetch a Spoonacular:', error);
        const recetasContainer = document.getElementById('recetas-container');
        recetasContainer.innerHTML = `<p>Error al cargar las recetas: ${error.message}. Por favor, verifica tu clave API y los límites de uso.</p>`;
    }
}

function mostrarRecetasSpoonacular(recetas) {
    const recetasContainer = document.getElementById('recetas-container');
    recetasContainer.innerHTML = ''; 

    if (recetas.length === 0) {
        recetasContainer.innerHTML = '<p>No se encontraron recetas con esos criterios.</p>';
        return;
    }

    totalCards = recetas.length;
    recetas.forEach(receta => {
        const recetaDiv = document.createElement('div');
        recetaDiv.classList.add('receta-card'); 

        const titulo = document.createElement('h3');
        titulo.textContent = receta.title; 

        const imagen = document.createElement('img');
        imagen.src = receta.image; 
        imagen.alt = receta.title;

        const ingredientesTitulo = document.createElement('h4');
        ingredientesTitulo.textContent = 'Ingredientes Principales:'; // Cambiar el título

        const ingredientesLista = document.createElement('ul');
        
        // --- CAMBIOS CLAVE AQUÍ ---
        if (receta.extendedIngredients && receta.extendedIngredients.length > 0) {
            // Muestra un número limitado de ingredientes, por ejemplo, los primeros 5 o 7
            const numIngredientesToShow = 5; // Puedes ajustar este número
            let ingredientsDisplayed = 0;

            for (let i = 0; i < receta.extendedIngredients.length && ingredientsDisplayed < numIngredientesToShow; i++) {
                const ingrediente = receta.extendedIngredients[i];
                // Intentamos usar la "original" o "name" del ingrediente
                const ingredientText = ingrediente.original || ingrediente.name;
                if (ingredientText) { // Asegurarnos de que el texto no esté vacío
                    const li = document.createElement('li');
                    li.textContent = ingredientText; 
                    ingredientesLista.appendChild(li);
                    ingredientsDisplayed++;
                }
            }

            // Si hay más ingredientes de los que mostramos, añadir un "..."
            if (receta.extendedIngredients.length > numIngredientesToShow) {
                const li = document.createElement('li');
                li.textContent = '...y más';
                ingredientesLista.appendChild(li);
            }

        } else {
            // Mensaje si los ingredientes no están disponibles
            const li = document.createElement('li');
            li.textContent = 'Ingredientes no detallados. Ver receta completa.';
            ingredientesLista.appendChild(li);
        }
        // --- FIN CAMBIOS CLAVE ---

        const link = document.createElement('a');
        link.href = receta.sourceUrl; 
        link.textContent = 'Ver Receta Completa';
        link.target = '_blank'; 

        recetaDiv.appendChild(titulo);
        recetaDiv.appendChild(imagen);
        recetaDiv.appendChild(ingredientesTitulo);
        recetaDiv.appendChild(ingredientesLista);
        recetaDiv.appendChild(link);

        recetasContainer.appendChild(recetaDiv);
    });
}

function setupCarousel() {
    const carouselTrack = document.getElementById('recetas-container');
    const carouselContainer = document.querySelector('.carousel-container');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    // ¡Importante! Calcular el ancho real de una carta después de que se ha renderizado
    // Usa `offsetWidth` para obtener el ancho total de una carta, incluyendo padding y border.
    // También añade el margen horizontal.
    const firstCard = carouselTrack.querySelector('.receta-card');
    if (firstCard) {
        const cardComputedStyle = getComputedStyle(firstCard);
        const cardMarginLeft = parseFloat(cardComputedStyle.marginLeft);
        const cardMarginRight = parseFloat(cardComputedStyle.marginRight);
        cardTotalWidth = firstCard.offsetWidth + cardMarginLeft + cardMarginRight;
    } else {
        console.warn("No se encontraron cartas para calcular el ancho. El carrusel no funcionará correctamente.");
        return; // Salir si no hay cartas
    }
    
    // Función para calcular cuántas cartas caben en la vista
    function calculateCardsPerView() {
        // Restamos el padding horizontal del carousel-track para el cálculo
        const trackPadding = parseFloat(getComputedStyle(carouselTrack).paddingLeft) + parseFloat(getComputedStyle(carouselTrack).paddingRight);
        cardsPerView = Math.floor((carouselContainer.offsetWidth - trackPadding) / cardTotalWidth);
        // Asegurarse de que al menos una carta sea visible si hay contenido
        if (totalCards > 0 && cardsPerView === 0) {
            cardsPerView = 1;
        }
    }

    function updateCarouselPosition() {
        const offset = currentCarouselPosition * cardTotalWidth;
        carouselTrack.style.transform = `translateX(-${offset}px)`;
        
        // Actualizar el estado de los botones
        prevButton.disabled = currentCarouselPosition === 0;
        // nextButton.disabled si la última carta visible es la última carta total
        nextButton.disabled = currentCarouselPosition >= (totalCards - cardsPerView);
        
        // Si no hay suficientes cartas para llenar toda la vista, o si solo hay una vista, deshabilitar ambos
        if (totalCards <= cardsPerView) {
            prevButton.disabled = true;
            nextButton.disabled = true;
        }
    }

    // Event Listeners para los botones
    prevButton.addEventListener('click', () => {
        if (currentCarouselPosition > 0) {
            currentCarouselPosition--;
            updateCarouselPosition();
        }
    });

    nextButton.addEventListener('click', () => {
        // Solo avanza si no hemos llegado al final de las cartas visibles
        if (currentCarouselPosition < (totalCards - cardsPerView)) {
            currentCarouselPosition++;
            updateCarouselPosition();
        }
    });

    // Ajusta el carrusel cuando la ventana cambie de tamaño (responsividad)
    window.addEventListener('resize', () => {
        // Recalcular cardsPerView al redimensionar
        calculateCardsPerView();
        // Asegúrate de que la posición actual no se salga de los límites después del resize
        // currentCarouselPosition = Math.min(currentCarouselPosition, Math.max(0, totalCards - cardsPerView));
        // Mejor: si la nueva posición es inválida, retrocede a la última posición válida
        if (currentCarouselPosition > (totalCards - cardsPerView)) {
            currentCarouselPosition = Math.max(0, totalCards - cardsPerView);
        }
        updateCarouselPosition();
    });

    // Llama a updateCarouselPosition y calculateCardsPerView una vez al inicio
    calculateCardsPerView();
    updateCarouselPosition();
}


// Llama a la función principal para obtener y mostrar las recetas al cargar la página
document.addEventListener('DOMContentLoaded', obtenerRecetasFitnessSpoonacular);