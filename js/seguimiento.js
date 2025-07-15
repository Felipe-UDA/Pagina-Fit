//conexion api
const buscarApi = async (id) => {
    try{
        const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'c7166c798bmshf6dca26c4bbfb35p174f11jsn27fc23749844',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        if (!response.ok) throw new Error("Error al consultar la API.");
        const ejercicio = await response.json();
        return ejercicio;
    }catch(error){
        console.error("Error: "+error);
        return [];
    }
};

//imagen api
const buscarImagen = async (id) => {
    try {
        const response = await fetch(`https://exercisedb.p.rapidapi.com/image?resolution=360&exerciseId=${id}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'c7166c798bmshf6dca26c4bbfb35p174f11jsn27fc23749844',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        if (!response.ok) throw new Error("Error al consultar la API");
        const imagen = await response.blob(); //.blob ya que la respuesta es un objeto, incompatible con .json
        const imageUrl = URL.createObjectURL(imagen); //se crea la url de la imagen (objeto) obtenida
        return imageUrl; //retorna url del GIF del ejercicio
    } catch (error) {
        console.error("Error al cargar imagen: "+error);
        return null; //por si no hay imagen
    }
};

//ocultar spinner cargando
const ocultarCargando = () => {
    const divCargando = document.getElementById("divCargando");
    if (divCargando) {
        divCargando.remove();
    }
};

//mostrar spinner cargando
const mostrarCargando = () => {
    let divCargando = document.getElementById("divCargando");
        divCargando = document.createElement("div");
        divCargando.id = "divCargando";
        divCargando.className = "w-100 d-flex justify-content-center align-items-center";
        divCargando.innerHTML = `
            <div class="spinner-border text-blue" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        `;
        const listaTareas = document.getElementById("listaTareas");
        listaTareas.appendChild(divCargando);
};

//obtener lunes de la semana con su fecha
function getInicioSemana(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); //se establece hora a media noche
    const dayOfWeek = d.getDay();
    let daysToSubtract;
    if (dayOfWeek === 0) { //si es domingo
        daysToSubtract = 6;
    } else { //si es lunes
        daysToSubtract = dayOfWeek - 1; //lunes=0, martes=1, etc
    }
    d.setDate(d.getDate() - daysToSubtract);
    return d;
}

const nombresSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const nombresCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

//creacion gráfico
const ctx = document.getElementById("grafico").getContext("2d");
let grafico;
const inicializarGrafico = () => {
    grafico = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Completos", "Incompletos"],
            datasets: [{
                data: [0, 0],
                backgroundColor: ["#84afe6ff", "#e0e0e0"]
            }]
        },
        options: {
            animation: {
                duration: 200
            }
        }
    });
};

//actualizar datos de gráfico
const actualizarGrafico = () => {
    const hoy = new Date();
    const inicioSemana = getInicioSemana(hoy); 
    const user = JSON.parse(localStorage.getItem("loggedUser")); //se obtiene usuario logueado
    let total = 0;
    let completos = 0;
    if (!user) {
        grafico.data.datasets[0].data = [0, 0];
        grafico.data.labels = [`Completos (0%)`, `Incompletos (100%)`];
        grafico.update();
        return;
    }
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(inicioSemana);
        fecha.setDate(inicioSemana.getDate() + i);
        const diaNombreParaClave = nombresSemana[i]; //i=0 para lunes, i=6 para domingo
        const claveStorage = `tareas-${user?.correo || "anonimo"}-${diaNombreParaClave}`;
        const estadoGuardado = JSON.parse(localStorage.getItem(claveStorage)) || {}; //se obtienen las tareas (completas e incompletas)
        const tareas = Object.values(estadoGuardado); 
        tareas.forEach(t => {
            total++;
            if (t === true) completos++; //t true para los completos
        });
    }
    //se calcula el porcentaje de completos e incompletos según total de ejercicios
    let incompletos = total - completos;
    let porcentajeCompletos = total === 0 ? 0 : Math.round((completos / total) * 100);
    let porcentajeIncompletos = 100 - porcentajeCompletos;
    grafico.data.datasets[0].data = [completos, incompletos];
    grafico.data.labels = [`Completos (${porcentajeCompletos}%)`,`Incompletos (${porcentajeIncompletos}%)`];
    grafico.update();
};
const cardWidth = 300; //ancho de una tarjeta individual
const cardGap = 30;    //espacio entre tarjetas
let cardData = []; //lista con tarjetas
let cardCounter = 0; //contador de tarjetas
let currentCardIndex = 0; //index de tarjeta actual
const visibleCardsCount = 3; //cantidad de tarjetas visibles

//var de carrusel
let carrusel; //.carrusel-container
let carruselWrapper; //carrusel-wrapper
let prevBtn; //btn prev
let nextBtn; //btn next
let containerCard; //container-card

//crear carta segpun ejercicio
const createCardElement = (data, index) => {
    const card = document.createElement("div");
    card.classList.add("card", "text-bg-light", "card-c");
    card.innerHTML = `<img src="${data.image}" alt="${data.name}">
        <h5>${data.name}</h5>
        <p><strong>Grupo muscular: </strong>${data.group}</p>
        <p><strong>Equipamiento: </strong>${data.equipment}</p>
        <p><strong>Categoría: </strong>${data.category}</p>
        <button class="btn btn-primary mb-3 ver-instrucciones-btn" data-exercise-id="${data.id}">VER INSTRUCCIONES</button>
        <div class="card-footer">
            <input type="checkbox" class="form-check-input me-2" id="checkbox-${data.id}" data-task-id="${data.id}">
            <label for="checkbox-${data.id}">Hecho</label>
        </div>`;
    card.dataset.cardIndex = index;
    return card;
};

//centrar tarjeta activa del carrusel
const calculateTransformXForLinear = () => {
    if (!carruselWrapper || carruselWrapper.offsetWidth === 0) { //por si hay error y carruselWrapper no existe o el ancho es 0
        return 0;
    }
    const targetCenterForActiveCard = carruselWrapper.offsetWidth / 2; //punto central tarjeta activa
    const currentActiveCardCenterInContainer = (currentCardIndex * (cardWidth + cardGap)) + (cardWidth / 2); //punto central tarjeta activa si el carrusel empieza en 0
    const transformX = targetCenterForActiveCard - currentActiveCardCenterInContainer; //desplazamiento para mover el carrusel para que la tarjeta activa este centrada
    return transformX;
};

//render de tarjetas para vaciar contenedor y añadir nuevas
const renderCards = () => {
    if (!carrusel || !carruselWrapper || !prevBtn || !nextBtn || !containerCard) { //por si hay error y calendario() no ejecuta
        return;
    }
    carrusel.innerHTML = ''; //limpiar carrusel
    if (cardData.length === 0) { //si es que no hay tareas
        containerCard.style.display = "none";
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    } else { //si es que hay tarjetas
        containerCard.style.display = "flex";
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }
    cardData.forEach((data, index) => { //se añade las tarjetas a carrusel
        const cardElement = createCardElement(data, index);
        carrusel.appendChild(cardElement);
    });
    carrusel.querySelectorAll(".ver-instrucciones-btn").forEach(button => { //mostrar modal de instrucciones
        button.addEventListener("click", async (event) => {
            const exerciseId = event.target.dataset.exerciseId;
            try {
                const ejercicioCompleto = await buscarApi(exerciseId);
                if (ejercicioCompleto) {
                    mostrarModalInstrucciones(ejercicioCompleto);
                } else {
                    console.error("Ejercicio no encontrado para id: "+exerciseId);
                }
            } catch (error) {
                console.error("Error: "+error);
            }
        });
    });
    carrusel.style.transition = "transform 0.2s ease"; //tansition de carrusel
    const cardsInDataSet = cardData.length;
    if (cardsInDataSet > 0) { //por si index de tarjeta actual se sale de los límites
        if (currentCardIndex >= cardsInDataSet) {
            currentCardIndex = cardsInDataSet - 1;
        }
        if (currentCardIndex < 0) {
            currentCardIndex = 0;
        }
    } else {
        currentCardIndex = -1; //no hay tarjetas
    }
    if (cardsInDataSet > 0) { //aplicar transformación de carrusel
        carrusel.style.transform = `translateX(${calculateTransformXForLinear()}px)`;
    } else {
        carrusel.style.transform = `translateX(0px)`;
    }
    updateCardsClasses();
    updateButtonStates();
};

//resaltar tarjeta actual
const updateCardsClasses = () => {
    if (!carrusel) return;
    const cards = carrusel.querySelectorAll(".card");
    cards.forEach((card, index) => {
        card.classList.remove("active");
        if (index === currentCardIndex) {
            card.classList.add("active");
        }
    });
};

//deshabilitar o habilitar botones de carrusel cuando llega al límite
const updateButtonStates = () => {
    if (!prevBtn || !nextBtn) return;

    prevBtn.classList.remove('disabled');
    nextBtn.classList.remove('disabled');

    const cardsInDataSet = cardData.length;

    if (cardsInDataSet <= 1) {
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
    } else if (currentCardIndex === 0) {
        prevBtn.classList.add('disabled');
    } else if (currentCardIndex === cardsInDataSet - 1) {
        nextBtn.classList.add('disabled');
    }
};

//animacion desplazamiento carrusel
const animateShift = (direction) => {
    if (!carrusel) return; //si no existe carrusel
    carrusel.style.transition = "transform 0.2s ease"; //se agrega transicion
    const cardsInDataSet = cardData.length; //length de lista tarjetas
    if (cardsInDataSet <= 1) { //si es una sola o menos no hay animacion
        return;
    }
    let newCardIndex = currentCardIndex;
    if (direction === 'right') { //derecha
        newCardIndex++;
    } else { //izquiera
        newCardIndex--;
    }
    if (newCardIndex < 0 || newCardIndex >= cardsInDataSet) {//verifica si index está fuera d los limites
        return;
    }
    currentCardIndex = newCardIndex;
    carrusel.style.transform = `translateX(${calculateTransformXForLinear()}px)`; //mover tarjeta
    setTimeout(() => { //se asigna tiempo de animacion
        updateCardsClasses();
        updateButtonStates();
    }, 200);
};

let modalInstrucciones = null;
let modalBodyInstrucciones = null;
let modalTitleInstrucciones = null;

//modal de instruccioens
const inicializarModalInstrucciones = () => {
    if (modalInstrucciones) return; //si es q existe
    modalInstrucciones = document.createElement("div");
    modalInstrucciones.classList.add("modal", "fade");
    modalInstrucciones.id = "instruccionesModal";
    modalInstrucciones.setAttribute("tabindex", "-1");
    modalInstrucciones.setAttribute("aria-labelledby", "instruccionesModalLabel");
    modalInstrucciones.setAttribute("aria-hidden", "true"); //escondido
    modalInstrucciones.innerHTML = `<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="instruccionesModalLabel">Instrucciones de Ejercicio</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modalInstrucciones);
    modalTitleInstrucciones = modalInstrucciones.querySelector("#instruccionesModalLabel");
    modalBodyInstrucciones = modalInstrucciones.querySelector(".modal-body");
};

//mostrar modal instruccioens
const mostrarModalInstrucciones = (ejercicio) => {
    if (!modalInstrucciones || !modalTitleInstrucciones || !modalBodyInstrucciones) { //verifico si existe modal de instrucciones, solo en caso de algún error
        console.error("No existe.");
        return;
    }
    modalTitleInstrucciones.classList.add("text-blue");
    modalTitleInstrucciones.textContent = "Instrucciones";
    let instruccionesHtml = '';
    if (Array.isArray(ejercicio.instructions) && ejercicio.instructions.length > 0) { //debiese existir instrucciones para cada ejercicio, pero x si acaso
        instruccionesHtml = `<p class="card-text">
                <ol class="mb-0 ps-3">
                    ${ejercicio.instructions.slice(0, 10).map(inst => `<li>${inst}</li>`).join('')}
                    ${ejercicio.instructions.length > 10 ? '<li>... y más (ver la fuente original para instrucciones completas)</li>' : ''}
                </ol>
            </p>`;
    } else {
        instruccionesHtml = '<p class="text-muted">No hay instrucciones disponibles para este ejercicio.</p>';
    }
    modalBodyInstrucciones.innerHTML = instruccionesHtml;
    const bsModal = new bootstrap.Modal(modalInstrucciones);
    bsModal.show(); //mostrar modal
};

//construir div de calendario semanal con sus tareas
const calendario = async () => {
    const calendarioDiv = document.getElementById("calendarioSemanal");
    const tareasDiaDiv = document.getElementById("tareasDia");
    const hoy = new Date();
    const inicioSemana = getInicioSemana(hoy);
    const user = JSON.parse(localStorage.getItem("loggedUser")); //user logueado
    const correo = user?.correo || "anonimo";
    const p = document.createElement("p");
    p.classList.add("text-center");
    p.textContent = "No hay tareas asignadas para este día.";
    tareasDiaDiv.appendChild(p);
    calendarioDiv.innerHTML = ""; //limpiar contenido
    containerCard = document.createElement("div"); //.container-card
    containerCard.classList.add("container-card");
    tareasDiaDiv.appendChild(containerCard);
    carruselWrapper = document.createElement("div"); //.carrusel-wrapper
    carruselWrapper.classList.add("carrusel-wrapper");
    containerCard.appendChild(carruselWrapper);
    carrusel = document.createElement("div"); //.carrusel-container
    carrusel.classList.add("carrusel-container");
    carrusel.id = "carrusel";
    carruselWrapper.appendChild(carrusel);
    prevBtn = document.createElement("button"); //btn prev
    prevBtn.classList.add("carousel-control-prev");
    prevBtn.type = "button";
    prevBtn.id = "prev";
    prevBtn.innerHTML = `<span class="carousel-control-prev-icon" aria-hidden="true"></span>`;
    carruselWrapper.appendChild(prevBtn);
    nextBtn = document.createElement("button"); //btn next
    nextBtn.classList.add("carousel-control-next");
    nextBtn.type = "button";
    nextBtn.id = "next";
    nextBtn.innerHTML = `<span class="carousel-control-next-icon" aria-hidden="true"></span>`;
    carruselWrapper.appendChild(nextBtn);
    prevBtn.addEventListener("click", () => animateShift('left')); //listener click para btn prev
    nextBtn.addEventListener("click", () => animateShift('right')); //listener click para btn next
    window.addEventListener('resize', () => { //carrusel responsive
        if (this.resizeTimeout) { //controlar tiempo redimensión rapida
            clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(() => {
            if (cardData.length > 0) { //si hay tarjetas
                carrusel.style.transition = "none";
                carrusel.style.transform = `translateX(${calculateTransformXForLinear()}px)`;
                setTimeout(() => {
                    carrusel.style.transition = "transform 0.2s ease";
                }, 0);
            }
            updateButtonStates();
        }, 100); //tiempo para redimensionado completo
    });
    for (let i = 0; i < 7; i++) { //se genera el calendario senmanal
        const fecha = new Date(inicioSemana);
        fecha.setDate(inicioSemana.getDate() + i);
        fecha.setHours(0, 0, 0, 0);
        const year = fecha.getFullYear();
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const day = fecha.getDate().toString().padStart(2, '0');
        const fechaStrParaDataset = `${year}-${month}-${day}`;
        const esHoy = fecha.toDateString() === hoy.toDateString();
        const diaNombreParaClave = nombresSemana[i];
        const claveStorageDelDia = `tareas-${correo}-${diaNombreParaClave}`;
        const div = document.createElement("div");
        div.classList.add("dia", "text-center");
        if (esHoy) div.classList.add("hoy");
        const estadoGuardadoActual = JSON.parse(localStorage.getItem(claveStorageDelDia));
        if (!estadoGuardadoActual || Object.keys(estadoGuardadoActual).length === 0) { //si no hay ejercicios pa i día
            div.classList.add("disabled");
            div.style.opacity = "0.4";
        } else { //si hay ejercicios pa i dia
            div.classList.remove("disabled");
            div.style.opacity = "1";
        }
        div.innerHTML = `<strong>${nombresCortos[i]}</strong><br> ${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`; //div de calendario con cada dia
        div.dataset.fecha = fechaStrParaDataset;
        div.addEventListener("click", async () => {
            calendarioDiv.classList.add('loading-calendar'); //deshabilitar clic
            document.querySelectorAll(".dia").forEach(el => el.classList.remove("seleccionado"));
            div.classList.add("seleccionado");
            cardData = [];
            currentCardIndex = 0;
            renderCards();
            const clickedDate = new Date(div.dataset.fecha);
            let diaIndexEnOrden = clickedDate.getDay();
            const diaNombreClickadoParaClave = nombresSemana[diaIndexEnOrden];
            const claveStorageClickedDay = `tareas-${correo}-${diaNombreClickadoParaClave}`;
            const estadoGuardado = JSON.parse(localStorage.getItem(claveStorageClickedDay)) || {};
            const tareas = Object.keys(estadoGuardado);
            
            if (tareas.length === 0) { //si no hay tareas
                p.style.display = "block";
                containerCard.style.display = "none";
                containerCard.classList.remove('loading-state', 'loaded-state');
                calendarioDiv.classList.remove('loading-calendar'); //habilitar clic
            } else { //si hay tareas
                p.style.display = "none";
                containerCard.style.display = "flex";
                containerCard.classList.add('loading-state'); //deshabilitar clic
                containerCard.classList.remove('loaded-state');
                containerCard.style.opacity = "0";
                containerCard.style.pointerEvents = "none"; //para no poder hacer clic en otros dias si se está cargando la api
                mostrarCargando(); //mostrar spinner
                try {
                    const promesasEjercicios = tareas.map(t_id => buscarApi(t_id));
                    const promesasGif = tareas.map(t_id => buscarImagen(t_id)); //
                    const ejercicios = await Promise.all(promesasEjercicios);
                    const gifUrls = await Promise.all(promesasGif);
                    cardData = ejercicios.map((ejercicio, index) => ({ //datos de carrusel
                        id: tareas[index],
                        name: ejercicio.name,
                        group: ejercicio.bodyPart,
                        equipment: ejercicio.equipment,
                        category: ejercicio.category,
                        image: gifUrls[index],
                        completed: estadoGuardado[tareas[index]]
                    }));
                    renderCards();
                    const cards = carrusel.querySelectorAll(".card");
                    cards.forEach(card => {
                        const taskId = card.querySelector('input[type="checkbox"]').dataset.taskId;
                        const checkbox = card.querySelector(`input[data-task-id="${taskId}"]`); //id e ejercicio
                        if (checkbox) {
                            checkbox.checked = estadoGuardado[taskId] === true; //si hay tarea hecha
                            checkbox.onchange = () => { //se actualiza el grafico cada vez q se marca o desmarca una checkbox
                                estadoGuardado[taskId] = checkbox.checked;
                                localStorage.setItem(claveStorageClickedDay, JSON.stringify(estadoGuardado));
                                actualizarGrafico();
                            };
                        }
                    });
                } catch (error) {
                    console.error("Error cargando ejercicios: "+error);
                    containerCard.style.display = "none";
                    containerCard.classList.remove('loading-state', 'loaded-state');
                    calendarioDiv.classList.remove('loading-calendar');
                } finally { //si todo sale bien
                    ocultarCargando(); //ocultar spinner
                    containerCard.classList.remove('loading-state'); //se habilita clic
                    containerCard.classList.add('loaded-state');
                    containerCard.style.opacity = "1"; //visible
                    containerCard.style.pointerEvents = "auto";
                    calendarioDiv.classList.remove('loading-calendar');
                }
            }
            actualizarGrafico();
        });
        calendarioDiv.appendChild(div);
    }
    document.querySelector(".dia.hoy")?.click(); //clic ebn dia actual
};

const user = JSON.parse(localStorage.getItem("loggedUser"));
const deletebtn = document.getElementById("delete-btn")
const rutinasGuardadas = JSON.parse(localStorage.getItem("rutinas") || "[]");
try{
    if(user){ //si no hay logguedUser se desactiva el btn de eliminar
        if(rutinasGuardadas.filter(r => r.usuario === user.correo).length !== 0){
            deletebtn.disabled = false;
        }else{
            deletebtn.disabled = true;
        }
    }
}catch(error){
    console.error(error);
}

//verificar eliminacion d rutina
const verificar = () => {
    if (confirm("¿Estás seguro de que quieres eliminar tu rutina? Esto borrará también tu progreso y no se podrá recuperar.")) {
        eliminar();
    } else {
        alert("Eliminación de rutina cancelada.");
    }
};

//eliminacion de rutina
const eliminar = () => {
    if (!user || !user.correo) {
        alert("No hay un usuario logueado para eliminar la rutina.");
        return;
    }
    const correoUsuarioActual = user.correo;
    const rutinasGuardadas = JSON.parse(localStorage.getItem("rutinas")) || [];
    const nuevasRutinas = rutinasGuardadas.filter(r => r.usuario !== correoUsuarioActual); //rutina guardada del usuario
    localStorage.setItem("rutinas", JSON.stringify(nuevasRutinas)); //se borra del localStorage
    for (let i = 0; i < localStorage.length; i++) { //borrar las tareas segun key
        const key = localStorage.key(i);
        if (key.startsWith(`tareas-${correoUsuarioActual}-`)) {
            localStorage.removeItem(key);
        }
    }
    alert("¡Tu rutina ha sido eliminada correctamente!");
    window.location.reload(); 
};

//cargar tareas  si existen o no
const cargarTareasSemana = () => {
    const hoy = new Date();
    const inicioSemana = getInicioSemana(hoy);
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    if (!user) return;
    const correo = user.correo;
    const rutinas = JSON.parse(localStorage.getItem("rutinas")) || [];
    const rutinaUsuario = rutinas.find(r => r.usuario === correo);
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(inicioSemana);
        fecha.setDate(inicioSemana.getDate() + i);
        fecha.setHours(0, 0, 0, 0); //medianoche
        const diaNombreParaClave = nombresSemana[i];  //nombre del dia segun i
        const claveStorage = `tareas-${correo}-${diaNombreParaClave}`;
        const diaNombreRutina = nombresSemana[i]; 
        if (rutinaUsuario && rutinaUsuario.dias[diaNombreRutina]) { //si hay rutina de usuario
            const ejerciciosDeLaRutina = rutinaUsuario.dias[diaNombreRutina];
            if (!localStorage.getItem(claveStorage)) { //crear tarea si no existe
                const estadoInicial = {};
                ejerciciosDeLaRutina.forEach(e_id => estadoInicial[e_id] = false); 
                localStorage.setItem(claveStorage, JSON.stringify(estadoInicial));
            } else { //si existe tarea
                const estadoActualTareas = JSON.parse(localStorage.getItem(claveStorage));
                let estadoActualizado = false;
                ejerciciosDeLaRutina.forEach(e_id => {
                    if (!(e_id in estadoActualTareas)) {
                        estadoActualTareas[e_id] = false; 
                        estadoActualizado = true;
                    }
                });
                if (estadoActualizado) {
                    localStorage.setItem(claveStorage, JSON.stringify(estadoActualTareas));
                }
            }
        } else { //si no hay rutina
            localStorage.removeItem(claveStorage);
        }
    }
};
//cuando la apgina cargue
window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    const seccionGrafico = document.getElementById("seccionGrafico");
    if (user){ //si hay usuario logueado
        document.getElementById("inicia").style.display = "none";
        document.getElementById("seguimiento").style.display = "flex";
        document.getElementById("titulo-prog").style.display = "block"
        inicializarModalInstrucciones();
        cargarTareasSemana(); 
        inicializarGrafico(); 
        actualizarGrafico(); 
        calendario(); 
        const rutinas = JSON.parse(localStorage.getItem("rutinas")) || [];
        const rutinaUsuario = rutinas.find(r => r.usuario === user.correo);
        if (rutinaUsuario) {
            seccionGrafico.style.display = "block";
        } else {
            seccionGrafico.style.display = "none";
        }
    } else { //si no hay usuario logueado
        document.getElementById("inicia").style.display = "block";
        document.getElementById("seguimiento").style.display = "none";
        document.getElementById("titulo-prog").style.display = "none"
        seccionGrafico.style.display = "none";
    }
});