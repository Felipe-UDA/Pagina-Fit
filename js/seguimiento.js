//girar boton nav (prueba)
document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("boton");
    const icono = document.getElementById("icono");
    boton.addEventListener("click", () => {
        const expanded = boton.getAttribute("aria-expanded") === "true";
        icono.classList.toggle("rotar", expanded);
    });
});
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
const ejercicios = document.querySelectorAll(".form-check-input"); //nodeList de ejercicios con clase .form-check-input
const progreso = "progresoEjercicios"; //nombre de los datos en el localStorage
//cargar datos de gráfico
const cargarEstado = () => {
    const marcados = JSON.parse(localStorage.getItem(progreso)) || []; //conversión de string JSON a array de datos guardado en localStorage (ejercicios marcados)
    ejercicios.forEach(checkbox => {
        checkbox.checked = marcados.includes(checkbox.id);
        //guarda en el localStorage cada vez que cambia un checkbox
        checkbox.addEventListener("change", () => {
            const marcadosAct = Array.from(ejercicios).filter(ejercicio => ejercicio.checked).map(ejercicio => ejercicio.id); //guardar en una lista checkboxs que esten seleccionados
            localStorage.setItem(progreso, JSON.stringify(marcadosAct)); //se guarda la lista en el localStorage 
            actualizarGrafico();
        });
    });
    inicializarGrafico();
    actualizarGrafico();
};
//actualizar datos de gráfico
const actualizarGrafico = () => {
    const total = ejercicios.length; //numero de ejercicios
    const completos = Array.from(ejercicios).filter(e => e.checked).length; //numero de ejercicios completos
    const incompletos = total - completos; //numero de ejercicios incompletos
    grafico.data.datasets[0].data = [completos, incompletos]; //actualiza los datos del gráfico con los datos nuevos
    grafico.update();
};
cargarEstado();

