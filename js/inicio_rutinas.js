document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = "4fdf61499cc74efb81d9a21c3a9cb977";
    const BASE_URL = `https://newsapi.org/v2/everything?q=fitness&language=es&apiKey=${API_KEY}`;
    const pageSize = 3; // Número de artículos a mostrar inicialmente
    const maxNews = 6; // Máximo de noticias a mostrar (3 iniciales + 3 adicionales)
    let allNews = [];
    let currentDisplayedNews = pageSize; // Inicialmente se muestran 3 noticias

    const newsContainer = document.getElementById("news-cards-container");
    const toggleButton = document.getElementById("toggle-news-button"); // Solo un botón para "Ver más" / "Ver menos"

    if (!newsContainer) {
        console.error("El contenedor de noticias no fue encontrado en el DOM.");
        return;
    }

    // Función para obtener noticias
    async function fetchNews() {
        try {
            // Solicitamos solo las 6 noticias que necesitamos
            const URL = `${BASE_URL}&pageSize=${maxNews}&page=1`;
            const response = await fetch(URL);
            const data = await response.json();
            return data.articles.map((articulo, index) => ({
                titulo: articulo.title,
                descripcion: articulo.description || "Sin descripción disponible.",
                imagen: articulo.urlToImage || `https://picsum.photos/300/200?random=${index + 1}`,
                url: articulo.url
            }));
        } catch (error) {
            console.error("Error al obtener noticias:", error);
            newsContainer.innerHTML = `<p class="text-center text-danger">No se pudieron cargar las noticias. Por favor, inténtalo de nuevo más tarde.</p>`;
            if (toggleButton) toggleButton.style.display = 'none';
            return [];
        }
    }

    // Función para renderizar tarjetas de noticias
    function renderNewsCards(numToShow) {
        newsContainer.innerHTML = ''; // Limpiamos el contenedor
        for (let i = 0; i < numToShow && i < allNews.length; i++) {
            const noticia = allNews[i];
            const cardHtml = `
                <div class="col-md-4 d-flex mb-4">
                    <div class="card h-100">
                        <img src="${noticia.imagen}" class="card-img-top" alt="${noticia.titulo}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${noticia.titulo}</h5>
                            <p class="card-text">${noticia.descripcion}</p>
                            <a href="${noticia.url}" target="_blank" class="btn btn-primary mt-auto">Ver más</a>
                        </div>
                    </div>
                </div>
            `;
            newsContainer.insertAdjacentHTML('beforeend', cardHtml);
        }
        currentDisplayedNews = numToShow;
        updateButtonState();
    }

    // Función para actualizar el estado del botón (texto y visibilidad)
    function updateButtonState() {
        if (toggleButton) {
            if (currentDisplayedNews < allNews.length && currentDisplayedNews < maxNews) {
                // Si hay más noticias por mostrar (hasta 6)
                toggleButton.textContent = 'Ver más';
                toggleButton.style.display = 'block';
            } else if (currentDisplayedNews === maxNews) {
                // Si se muestran las 6 noticias
                toggleButton.textContent = 'Ver menos';
                toggleButton.style.display = 'block';
            } else if (allNews.length <= pageSize) {
                // Si solo hay 3 o menos noticias disponibles en total
                toggleButton.style.display = 'none';
            } else {
                // Si se han vuelto a las 3 iniciales
                toggleButton.textContent = 'Ver más';
                toggleButton.style.display = 'block';
            }
        }
    }

    // Carga inicial de noticias
    async function initializeNews() {
        allNews = await fetchNews();
        if (allNews.length > 0) {
            renderNewsCards(pageSize); // Mostrar las primeras 3
        } else {
            if (toggleButton) toggleButton.style.display = 'none';
        }
    }

    // Funcionalidad del botón único
    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            if (currentDisplayedNews === pageSize) { // Si se están mostrando 3, mostrar 6
                renderNewsCards(maxNews);
            } else { // Si se están mostrando 6, volver a mostrar 3
                renderNewsCards(pageSize);
            }
        });
    }

    initializeNews();
});