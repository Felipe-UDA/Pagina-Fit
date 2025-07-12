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
                        <h5 class="card-title color text-center">${nombre.toUpperCase()}</h5>
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
const diasSelect = document.getElementById("diasEntrenamiento");
const cuadriculaDias = document.getElementById("cuadriculaDias");
const contenedorDias = document.getElementById("contenedorDias");

diasSelect.addEventListener("change", () => {
  const dias = parseInt(diasSelect.value);
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
});

// Mostrar modal al hacer clic en "+"
document.addEventListener("click", (e) => {
  if (e.target.closest(".agregar-btn")) {
    const boton = e.target.closest(".agregar-btn");
    const card = boton.closest(".card");
    const titulo = card.querySelector(".card-title").textContent;

    // Guardar el nombre del ejercicio
    document.getElementById("ejercicioSeleccionado").value = titulo;

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
  }
});

// Agregar ejercicio al día seleccionado
document.getElementById("confirmarAgregar").addEventListener("click", () => {
  const ejercicio = document.getElementById("ejercicioSeleccionado").value;
  const diaSeleccionado = document.getElementById("selectorDia").value;
  const listaDia = document.getElementById(`dia-${diaSeleccionado}-lista`);

  // Elimina "Sin ejercicios asignados" si existe
  const vacio = listaDia.querySelector("li.text-muted");
  if (vacio) vacio.remove();

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
    ${ejercicio}
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