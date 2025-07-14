//data-group de musculos de la malla
const grupoMusculos = {
    abd: ["abductors"],
    abs: ["abs"],
    add: ["adductors"],
    biceps: ["biceps"],
    calves: ["calves"],
    cardio: ["cardiovascular system"],
    delts: ["delts"],
    forearms: ["forearms"],
    glutes: ["glutes"],
    hams: ["hamstrings"],
    lats: ["lats"],
    levator: ["levator scapulae"],
    pectorals: ["pectorals"],
    quads: ["quads"],
    serratus: ["serratus anterior"],
    spine: ["spine"],
    traps: ["traps"],
    triceps: ["triceps"],
    upper: ["upper back"]
};
//convertir los data-group en clave de musculo
const obtenerMusculosDesdeGrupo = (dataGroup) => {
    const grupos = dataGroup.split(',').map(grupo => grupo.trim()); //en caso de que haya más de un grupo asignado a un g de la malla
    const targets = new Set();//targetList sin repeticiones
    grupos.forEach(g => {
        const musculos = grupoMusculos[g];//data-group
        if (musculos) {
            musculos.forEach(m => targets.add(m));//se agrega cada grupo de musculo targetList 
        } else {
            console.log("Grupo muscular no reconocido.");
        }
    });
    return Array.from(targets);//retorna array sin repeticiones
}
//buscar ejercicios desde API
const buscarEjerciciosPorMusculo = async (nombreMusculo,dificultad,equipo) => {
    try {
        const response = await fetch(
        `https://exercisedb.p.rapidapi.com/exercises/target/${encodeURIComponent(nombreMusculo)}?limit=500`,
        {
            method: 'GET',
            headers: {
            'X-RapidAPI-Key': 'c7166c798bmshf6dca26c4bbfb35p174f11jsn27fc23749844',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        }
        );
        if (!response.ok) throw new Error("Error al consultar la API.");
        const ejercicios = await response.json();
        const filtrados = ejercicios.filter(e =>(!dificultad || e.difficulty === dificultad)&&(!equipo || e.equipment === equipo)); //filtra segun dificultad y equipo
        return filtrados;
    } catch (error) {
    console.error("Error: "+error);
    return [];
  }
}
//buscar imagen GIF según id de ejercicio
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
}
//cargar/ocultar imagen GIF de un ejercicio
const botonImagen = async (id,contenedor,boton) => {
    const existeImg = contenedor.querySelector("img.gif-ejercicio"); //verifica si existe ya una imagen
    if (existeImg) {
        contenedor.innerHTML = ""; //se cierra la imagen
        boton.textContent = "Ver imagen"; //se vuelve al btn original
        boton.disabled = false; //se habilita el btn
        return;
    }
    boton.textContent = "Cargando..."; //msj de carga mientra carga la imagen
    boton.disabled = true; //se deshabilita el btn hasta que cargue la imagen
    try {
        const gifUrl = await buscarImagen(id); //se obtiene la url de la imagen
        if (gifUrl) { //si es que existe
            const img = document.createElement("img"); //se crea el tag de img
            img.src = gifUrl; //direccion de img
            img.alt = "Imagen ejercicio";
            img.className = "gif-ejercicio img-fluid mt-2"; //clase para identificar img
            img.style.maxWidth = "100%"; //tamaño maximo de imagen
            img.style.height = "200px"; //altura de imagen
            contenedor.appendChild(img); //se agrega a contenedor
            boton.textContent = "Cerrar imagen"; //se cambia btn para poder cerrar img
            boton.disabled = false; //se habilita el btn
        } else { //si es que no se puede cargar la imagen
            contenedor.innerHTML = "<p>No se pudo cargar la imagen.</p>";
            boton.textContent = "Ver imagen";
            boton.disabled = false;
        }
    } catch (error) {
        contenedor.innerHTML = "<p>Error al cargar la imagen.</p>";
        boton.textContent = "Ver imagen";
        boton.disabled = false;
        console.error("Error: "+error);
    }
}
//mostrar div cards de ejercicios
const mostrarEjercicios = (listaEjercicios) => {
    const contenedor = document.getElementById("resultados-ejercicios"); //contenedor para los ejercicios
    contenedor.innerHTML = ""; //limpiar contenedor
    const ejercicios = new Set();
    listaEjercicios.flat().forEach(ejercicio => { //debe estar .flat para desanidar la lista y poder agregarlos a ejercicios, sino da error
        ejercicios.add(ejercicio);
    });
    if(ejercicios.size === 0){ //si es que la lista está vacía
        contenedor.textContent = "No se encontraron resultados de la búsqueda.";
    } else { //si es que la lista no está vacía
        ejercicios.forEach(ejercicio => {
            const card = document.createElement("div");
            const nombre = ejercicio.name;
            card.className = 'col mb-4'; //mb para agregar espacio entre cards
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title color text-center" data-exercise-h-id="${ejercicio.id}">${nombre.toUpperCase()}</h5>
                        <div class="d-flex flex-column align-items-center mb-3 mt-3">
                            <button class="btn btn-primary ver-imagen-btn" data-exercise-id="${ejercicio.id}">Ver imagen</button>
                            <div class="imagen-container mt-3" data-exercise-id-image-container="${ejercicio.id}"></div>
                        </div>
                        <p class="card-text"><strong>Dificultad:</strong> ${ejercicio.difficulty}</p>
                        <p class="card-text"><strong>Parte:</strong> ${ejercicio.bodyPart}</p>
                        <p class="card-text"><strong>Grupo muscular:</strong> ${ejercicio.target}</p>
                        <p class="card-text"><strong>Categoría:</strong> ${ejercicio.category}</p>
                        <p class="card-text"><strong>Equipamiento:</strong> ${ejercicio.equipment}</p>
                        <p class="card-text">
                            <strong>Instrucciones:</strong><br>
                            ${Array.isArray(ejercicio.instructions)? `<ol class="mb-0 ps-3">${ejercicio.instructions.slice(0, 10).map(inst => `<li>${inst}</li>`).join('')}</ol>`: 'No disponible'}
                        </p>
                    </div>
                    <div class="d-flex justify-content-end m-3">
                        <button class="btn btn-secondary agregar-btn" title="Agregar"><i class="bi bi-plus"></i></button>
                    </div>
                </div>
            `; //slice a 10 por si hay más indicaciones
            contenedor.appendChild(card);
            //manejo boton que muestra/cierra la imagen
            const verImagenBtn = card.querySelector(`.ver-imagen-btn[data-exercise-id="${ejercicio.id}"]`);
            const imagenContainer = card.querySelector(`.imagen-container[data-exercise-id-image-container="${ejercicio.id}"]`);
            if (verImagenBtn && imagenContainer) {
                verImagenBtn.addEventListener('click', () => {
                    botonImagen(ejercicio.id,imagenContainer,verImagenBtn);
                });
            }
        });
    }
    console.log("Ejercicios recibidos: "+ejercicios.size); //verifico si recibo datos
}
//evento de click en la malla cuerpo
document.querySelectorAll('g[data-group]').forEach(grupo => { //selecciono todos los grupos de los musculos de la malla
    grupo.addEventListener('click', async () => { //si se hace click en ese grupo
        const dataGroup = grupo.dataset.group; //datagrupo correspondiente a ese grupo
        const musculosTarget = obtenerMusculosDesdeGrupo(dataGroup); 
        const equipo = document.getElementById("equipment").value; //valor seleccionado desde select de equipamiento
        const dificultad = document.querySelector('input[name="difficulty"]:checked').value; //valor de radio de dificultad seleccionado
        try {
            const resultados = await Promise.all(musculosTarget.map(musculo => buscarEjerciciosPorMusculo(musculo, dificultad, equipo))); //promesa de obtener resultados de los musculos buscados segun dificultad y equipamiento
            mostrarEjercicios(resultados);
        } catch (error) {
            console.error("Error en solicitud: "+error); //puede haber error cuando hay demasiadas solicitudes por limitacion de la api
        } 
    });
});
//cargar select de equipamientos
const cargarEquipment = async () => {
  const equipo = document.getElementById("equipment");
  try{
    const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/equipmentList`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'c7166c798bmshf6dca26c4bbfb35p174f11jsn27fc23749844',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
    const data = await response.json();
    const equips = new Set(data); //lista de equipamientos
    equips.forEach(eq => {
      const op = document.createElement("option"); //se crea cada opcion del select por equipamiento
      op.value = eq;
      op.textContent = eq;
      equipo.appendChild(op); //se agrega a option
    });
  }catch(error){
    console.error("Error: "+error);
  }
};
//carga la lista de equipamiento al cargar la pagina
window.onload = () => {
    cargarEquipment();
}

// ===============================
// Generar cuadrícula de días
// ===============================

const user = JSON.parse(localStorage.getItem("loggedUser"));
const diasSelect = document.getElementById("diasEntrenamiento");
const cuadriculaDias = document.getElementById("cuadriculaDias");
const contenedorDias = document.getElementById("contenedorDias");
const div = document.createElement("div");
diasSelect.addEventListener("change", () => {
  const dias = parseInt(diasSelect.value);
  const userr = JSON.parse(localStorage.getItem("loggedUser"));
  contenedorDias.innerHTML = ""; // Limpiar cuadrícula previa

  if (!dias || dias < 1 || dias > 7) {
    cuadriculaDias.style.display = "none";
    return;
  }

  cuadriculaDias.style.display = "block";

  for (let i = 1; i <= dias; i++) {
    const col = document.createElement("div");
    col.className = "col-md";
    col.innerHTML = `
      <div class="card shadow-sm mb-3">
        <div class="card-header text-center fw-bold">
          Día ${i}
        </div>
        <div class="card-body p-2">
          <ul class="list-group list-group-flush" id="dia-${i}-lista">
            <li class="list-group-item text-muted small">Sin ejercicios asignados</li>
          </ul>
        </div>
      </div>
    `;
    contenedorDias.appendChild(col);
  }
  div.className="d-flex justify-content-end align-items-center";
    div.innerHTML='<button class="btn btn-primary" id="agregar" title="Agregar" onclick="abrirModal()">Agregar días</button>';
    contenedorDias.appendChild(div);
  if(!userr){
    div.classList.remove("d-flex");
    div.classList.add("d-none");
  }else{
    div.classList.remove("d-none");
    div.classList.add("d-flex");
  }
  
});

document.getElementById("resultados-ejercicios").addEventListener("click", (e) => {
    if (e.target.closest(".agregar-btn")) {
        if(user){
            // Mostrar modal al hacer clic en "+"
            const boton = e.target.closest(".agregar-btn");
            const card = boton.closest(".card");
            const ejercicio = card.querySelector(".card-title");
            const titulo = card.querySelector(".card-title").textContent;
            const ejercicioId = ejercicio ? ejercicio.dataset.exerciseHId : null;

            // Guardar el nombre del ejercicio
            document.getElementById("ejercicioSeleccionado").value = titulo;
            document.getElementById("ejercicioSeleccionado").dataset.realId = ejercicioId;

            // Rellenar el selector de días según los generados
            const selector = document.getElementById("selectorDia");
            selector.innerHTML = "";
            const numDias = parseInt(document.getElementById("diasEntrenamiento").value);
            for (let i = 1; i <= numDias; i++) {
                const op = document.createElement("option");
                op.value = i;
                op.textContent = `Día ${i}`;
                selector.appendChild(op);
            }

            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById("modalAgregarDia"));
            modal.show();
            
        }else{
            alert("Debes iniciar sesión para agregar ejercicios a tu rutina.");
        }
    }
});

// Agregar ejercicio al día seleccionado
document.getElementById("confirmarAgregar").addEventListener("click", () => {
    const ejercicioName = document.getElementById("ejercicioSeleccionado").value;
    const ejercicioId = document.getElementById("ejercicioSeleccionado").dataset.realId; //id ejercicio
    const diaSeleccionado = document.getElementById("selectorDia").value;
    const listaDia = document.getElementById(`dia-${diaSeleccionado}-lista`);

    const vacio = listaDia.querySelector("li.text-muted");
    if (vacio) vacio.remove();

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.setAttribute('data-exercise-id', ejercicioId); //guardo id en li
    li.innerHTML = `
        ${ejercicioName} 
        <button class="btn btn-sm btn-danger eliminar-ejercicio" title="Eliminar ejercicio">
            <i class="bi bi-trash"></i>
        </button>
    `;
    listaDia.appendChild(li);

    // Eliminar ejercicio al hacer clic en el ícono
    li.querySelector(".eliminar-ejercicio").addEventListener("click", () => {
        li.remove();
        // Si la lista queda vacía, mostrar el mensaje "Sin ejercicios asignados"
        if (listaDia.children.length === 0) {
            const vacio = document.createElement("li");
            vacio.className = "list-group-item text-muted small";
            vacio.textContent = "Sin ejercicios asignados";
            listaDia.appendChild(vacio);
        }
    });
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalAgregarDia"));
    modal.hide();
});
let cantidadDiasElegida = 0;
let diasSeleccionados = [];

//abrir modal para seleccionar días
const abrirModal = () => {
    const numDias = parseInt(document.getElementById("diasEntrenamiento").value);
    let diasCompletos = true;
    for (let i = 1; i <= numDias; i++) { //verificar si los dias seleccionados tienen al menos un ejercicio
        const lista = document.getElementById(`dia-${i}-lista`);
        const tieneEjercicio = Array.from(lista.children).some(li => !li.classList.contains("text-muted"));
        if (!tieneEjercicio) {
            diasCompletos = false;
            break;
        }
    }
    if (!diasCompletos) { //no estan todos los dias completos
        alert("Debes asignar al menos un ejercicio a cada día antes de continuar.");
        return;
    }
    const select = document.getElementById("diasEntrenamiento");
    cantidadDiasElegida = parseInt(select.value);
    if (!cantidadDiasElegida || cantidadDiasElegida < 1 || cantidadDiasElegida > 7) {
        alert("Primero debes seleccionar cuántos días quieres entrenar.");
        return;
    }
    diasSeleccionados = []; //vaciar lista d dias seleccionados
    const checkboxes = document.querySelectorAll('#diasSemana input[type=checkbox]');
    checkboxes.forEach(cb => { //limpiar checkboxs
        cb.checked = false;
        cb.disabled = false;
    });
    actualizarEstadoDias();
    const modalEl = document.getElementById("diasModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show(); //mostrar modal
};

//cerrar modal de seleccion de dias
const cerrarModal = () => {
    const modalEl = document.getElementById("diasModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide(); //ocultar modal
};

//controlar dias seleccionados
const actualizarEstadoDias = () => {
    const checkboxes = document.querySelectorAll('#diasSemana input[type=checkbox]');
    const restantes = cantidadDiasElegida - diasSeleccionados.length;
    document.getElementById("diasRestantes").textContent = `Puedes seleccionar ${restantes} día(s).`;
    checkboxes.forEach(cb => {
        if (!cb.checked) {
            cb.disabled = diasSeleccionados.length >= cantidadDiasElegida;
        } else {
            cb.disabled = false;
        }
    });
};
//listener d los checkboxes de los dias de la semana
document.querySelectorAll('#diasSemana input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', (e) => {
        const dia = e.target.value;
        if (e.target.checked) {
            diasSeleccionados.push(dia);
        } else {
            diasSeleccionados = diasSeleccionados.filter(d => d !== dia);
        }
        actualizarEstadoDias();
    });
});

//confirmar dias seleccionados
document.getElementById("confirmarDiasBtn").addEventListener("click", () => {
    if (diasSeleccionados.length !== cantidadDiasElegida) { //verificar si se seleccionaron la cantidad d dias correspondientes
        alert(`Debes seleccionar exactamente ${cantidadDiasElegida} día(s).`);
        return;
    }
    const contenedorDias = document.getElementById("contenedorDias");
    div.innerHTML="";
    div.className="d-flex justify-content-end align-items-center";
    div.innerHTML='<button class="btn btn-success mt-3" id="agregar" title="Agregar" onclick="guardarRutinaFinal()">Guardar rutina</button>';
    contenedorDias.appendChild(div);
    cerrarModal();
});

//agregar la rutina a la rutina del usuario
const guardarRutinaFinal = () => {
    const rutinasGuardadas = JSON.parse(localStorage.getItem("rutinas")) || [];
    console.log(rutinasGuardadas);
    const rutinaExistente = rutinasGuardadas.find(r => r.usuario === user.correo); //verifica si existe rutina del usuario
    const rutina = rutinaExistente || { //crear rutina nueva
        usuario: user.correo,
        dias: {}
    };
    diasSeleccionados.forEach((nombreDia, index) => { //actualizar rutina de dias seleccionados
        const lista = document.getElementById(`dia-${index + 1}-lista`);
        const ejerciciosNuevos = [];
        lista.querySelectorAll("li").forEach(li => { //acceder a cada ejercicio seleccionado
            if (!li.classList.contains("text-muted")) { //si no esta vacio
                const ejercicioId = li.getAttribute("data-exercise-id"); //acceder a id del ejercicio
                if (ejercicioId) {
                    ejerciciosNuevos.push(ejercicioId); //se agrega la id a la lista
                }
            }
        });
        if (!rutina.dias[nombreDia]) { //verifica si hay rutina para ese dia, sino la crea
            rutina.dias[nombreDia] = [];
        }
        ejerciciosNuevos.forEach(id => { //agregar ejercicios en el dia si no existen
            if (!rutina.dias[nombreDia].includes(id)) {
                rutina.dias[nombreDia].push(id);
            }
        });
    });
    const nuevasRutinas = rutinasGuardadas.filter(r => r.usuario !== user.correo);
    nuevasRutinas.push(rutina); //actualizar rutina de usuario
    localStorage.setItem("rutinas", JSON.stringify(nuevasRutinas));
    alert("¡Rutina actualizada correctamente!");
    console.log("Rutinas guardadas:", nuevasRutinas);
    console.log(rutinasGuardadas);
    const contenedorDias = document.getElementById("contenedorDias");
    contenedorDias.innerHTML = ""; //limpiar contenedor
    document.getElementById("diasEntrenamiento").value = "";
    const cuadriculaDias = document.getElementById("cuadriculaDias");
    cuadriculaDias.style.display = "none";
};