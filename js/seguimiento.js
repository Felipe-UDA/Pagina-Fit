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
let ejercicios = [];
//cargar datos de gráfico
const cargarEstado = () => {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    const progreso = `progresoEjercicios-${user?.correo || "anonimo"}`;
    const marcados = JSON.parse(localStorage.getItem(progreso)) || []; //conversión de string JSON a array de datos guardado en localStorage (ejercicios marcados)
    inicializarGrafico();
    actualizarGrafico();
};
//actualizar datos de gráfico
const actualizarGrafico = () => {
    const hoy = new Date();
    function getInicioSemana(date) {
        const day = date.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const inicio = new Date(date);
        inicio.setDate(date.getDate() + diff);
        return inicio;
    }
    const inicioSemana = getInicioSemana(hoy);
    const diasSemana = 7;
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    let total = 0;
    let completos = 0;
    for (let i = 0; i < diasSemana; i++) {
        const fecha = new Date(inicioSemana);
        fecha.setDate(inicioSemana.getDate() + i);
        const fechaStr = fecha.toISOString().split("T")[0];
        const claveStorage = `tareas-${user?.correo || "anonimo"}-${fechaStr}`;
        const estadoGuardado = JSON.parse(localStorage.getItem(claveStorage)) || {};
        for (let tarea in estadoGuardado) {
            total++;
            if (estadoGuardado[tarea] === true) {
                completos++;
            }
        }
    }
    const incompletos = total - completos;
    const porcentajeCompletos = total === 0 ? 0 : Math.round((completos / total) * 100);
    const porcentajeIncompletos = 100 - porcentajeCompletos;
    grafico.data.datasets[0].data = [completos, incompletos];
    grafico.data.labels = [
        `Completos (${porcentajeCompletos}%)`,
        `Incompletos (${porcentajeIncompletos}%)`
    ];
    grafico.update();
};
function getInicioSemana(date) {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const inicio = new Date(date);
    inicio.setDate(date.getDate() + diff);
    return inicio;
}
const calendario = () => {
    const calendario = document.getElementById("calendarioSemanal");
    const tareasDia = document.getElementById("listaTareas");
    const hoy = new Date();
    const diaActual = hoy.getDay();
    
    const inicioSemana = getInicioSemana(hoy);
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const tareasPorDia = {};
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(inicioSemana);
        fecha.setDate(inicioSemana.getDate() + i);
        const fechaStr = fecha.toISOString().split("T")[0];
        tareasPorDia[fechaStr] = [
            `Ejercicio A`,
            `Ejercicio B`,
            `Ejercicio C`
        ];
    }
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(inicioSemana);
        fecha.setDate(inicioSemana.getDate() + i);
        const fechaStr = fecha.toISOString().split("T")[0];
        const esHoy = fecha.toDateString() === hoy.toDateString();
        const div = document.createElement("div");
        div.classList.add("dia", "text-center");
        if (esHoy) div.classList.add("hoy");
        div.innerHTML = `
            <strong>${diasSemana[i]}</strong><br>
            ${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}
        `;
        div.dataset.fecha = fechaStr;
        div.addEventListener("click", () => {
            document.querySelectorAll(".dia").forEach(el => el.classList.remove("seleccionado"));
            div.classList.add("seleccionado");
            const tareas = tareasPorDia[fechaStr] || ["No hay tareas asignadas"];
            tareasDia.innerHTML = "";
            const user = JSON.parse(localStorage.getItem("loggedUser"));
            const claveStorage = `tareas-${user?.correo || "anonimo"}-${fechaStr}`;
            const estadoGuardado = JSON.parse(localStorage.getItem(claveStorage)) || {};
            tareas.forEach((t, index) => {
                const div = document.createElement("div");
                div.className = "form-check";
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "form-check-input";
                checkbox.id = `tarea-${index}`;
                checkbox.checked = estadoGuardado[t] === true;
                const label = document.createElement("label");
                label.className = "form-check-label";
                label.htmlFor = `tarea-${index}`;
                label.textContent = t;
                checkbox.addEventListener("change", () => {
                    estadoGuardado[t] = checkbox.checked;
                    localStorage.setItem(claveStorage, JSON.stringify(estadoGuardado));
                    actualizarGrafico(); // ✅ ACTUALIZA DESPUÉS DE CAMBIAR
                });
                div.appendChild(checkbox);
                div.appendChild(label);
                tareasDia.appendChild(div);
            });
            document.querySelectorAll("#listaTareas .form-check-input").forEach(ej => {
                ej.addEventListener("change", actualizarGrafico);
            });
            actualizarGrafico();
            if (tareas.length === 0) {
                const li = document.createElement("li");
                li.textContent = "No hay tareas asignadas";
                tareasDia.appendChild(li);
            }
        });
        calendario.appendChild(div);
    }

    document.querySelector(".dia.hoy")?.click();
}
const cargarTareasSemana = () => {
    const hoy = new Date();
    const inicioSemana = getInicioSemana(hoy);
    const diasSemana = 7;
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    if (!user) return;

    for (let i = 0; i < diasSemana; i++) {
        const fecha = new Date(inicioSemana);
        fecha.setDate(inicioSemana.getDate() + i);
        const fechaStr = fecha.toISOString().split("T")[0];
        const claveStorage = `tareas-${user?.correo || "anonimo"}-${fechaStr}`;
        const existe = localStorage.getItem(claveStorage);
        if (!existe) {
            const tareas = ["Ejercicio A", "Ejercicio B", "Ejercicio C"];
            const estadoInicial = {};
            tareas.forEach(t => estadoInicial[t] = false);
            localStorage.setItem(claveStorage, JSON.stringify(estadoInicial));
        }
    }
};
window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedUser")); //cargar usuario logueado
    if (user){
        document.getElementById("inicia").style.display = "none";
        document.getElementById("seguimiento").style.display = "flex";
        cargarTareasSemana();
        inicializarGrafico();
        actualizarGrafico();
        calendario();
    }else{
        document.getElementById("inicia").style.display = "block";
        document.getElementById("seguimiento").style.display = "none";
    }
});