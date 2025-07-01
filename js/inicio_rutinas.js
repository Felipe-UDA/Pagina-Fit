document.addEventListener("DOMContentLoaded", () => {
    const rutinas = [
        {
            titulo: "Cardio Power",
            descripcion: "Rutina intensa para quemar grasa rápidamente.",
            imagen: "https://picsum.photos/300/200?random=1"
        },
        {
            titulo: "Fuerza Total",
            descripcion: "Entrenamiento para ganar músculo de forma progresiva.",
            imagen: "https://picsum.photos/300/200?random=2"
        },
        {
            titulo: "Yoga Flow",
            descripcion: "Mejora tu flexibilidad y reduce el estrés.",
            imagen: "https://picsum.photos/300/200?random=3"
        },
        {
            titulo: "HIIT Express",
            descripcion: "Entrena duro en solo 20 minutos diarios.",
            imagen: "https://picsum.photos/300/200?random=4"
        },
        {
            titulo: "Pilates Fit",
            descripcion: "Tonifica tu cuerpo sin impacto.",
            imagen: "https://picsum.photos/300/200?random=5"
        },
        {
            titulo: "CrossFit Base",
            descripcion: "Inicia con movimientos funcionales y fuerza.",
            imagen: "https://picsum.photos/300/200?random=6"
        }
    ];

    const seccion = document.getElementById("rutinas-destacadas");

    seccion.innerHTML = `
        <h2 class="mb-4 text-center fw-bold">Nuestras Rutinas Destacadas</h2>
        <div id="carouselTarjetas" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                ${crearSlides(rutinas)}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselTarjetas" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselTarjetas" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
            </button>
        </div>
    `;

    function crearSlides(rutinas) {
        const slides = [];
        for (let i = 0; i < rutinas.length; i += 3) {
            const grupo = rutinas.slice(i, i + 3);
            const activo = i === 0 ? "active" : "";
            const columnas = grupo.map(rutina => `
                <div class="col-md-4 d-flex ${grupo.length < 3 ? '' : 'd-none d-md-block'}">
                    <div class="card h-100">
                        <img src="${rutina.imagen}" class="card-img-top" alt="${rutina.titulo}">
                        <div class="card-body">
                            <h5 class="card-title">${rutina.titulo}</h5>
                            <p class="card-text">${rutina.descripcion}</p>
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