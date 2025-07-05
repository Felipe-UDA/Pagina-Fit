document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = "4fdf61499cc74efb81d9a21c3a9cb977"; 
    const URL = `https://newsapi.org/v2/everything?q=fitness&language=es&pageSize=6&apiKey=${API_KEY}`;

    fetch(URL)
        .then(response => response.json())
        .then(data => {
            const noticias = data.articles.map((articulo, index) => ({
                titulo: articulo.title,
                descripcion: articulo.description || "Sin descripción disponible.",
                imagen: articulo.urlToImage || `https://picsum.photos/300/200?random=${index + 1}`
            }));
            mostrarCarrusel(noticias);
        })
        .catch(error => {
            console.error("Error al obtener noticias:", error);
        });

    function mostrarCarrusel(noticias) {
        const seccion = document.getElementById("rutinas-destacadas");

        seccion.innerHTML = `
            <h2 class="mb-4 text-center fw-bold">Noticias Fitness</h2>
            <div id="carouselTarjetas" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                    ${crearSlides(noticias)}
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselTarjetas" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
                    <span class="visually-hidden">Anterior</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselTarjetas" data-bs-slide="next">
                    <span class="carousel-control-next-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
                    <span class="visually-hidden">Siguiente</span>
                </button>
            </div>
        `;
    }

    function crearSlides(lista) {
        const slides = [];
        for (let i = 0; i < lista.length; i += 3) {
            const grupo = lista.slice(i, i + 3);
            const activo = i === 0 ? "active" : "";
            const columnas = grupo.map(noticia => `
                <div class="col-md-4 d-flex">
                    <div class="card h-100">
                        <img src="${noticia.imagen}" class="card-img-top" alt="${noticia.titulo}">
                        <div class="card-body">
                            <h5 class="card-title">${noticia.titulo}</h5>
                            <p class="card-text">${noticia.descripcion}</p>
                        </div>
                    </div>
                </div>
            `).join("");

            slides.push(`
                <div class="carousel-item ${activo}">
                    <div class="row">
                        ${columnas}
                    </div>
                </div>
            `);
        }
        return slides.join("");
    }
});
