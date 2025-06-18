//verificar si hay un usuario logueado
window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedUser")); //cargar usuario logueado
    if (user){
        document.getElementById("loginBtn").style.display = "none"; //escondo botón iniciar sesión
        const profile = document.getElementById("userDropdown"); //div de usuario
        const nameSpan = document.getElementById("userName");
        const img = document.getElementById("userImage");
        nameSpan.textContent = user.nombre; //agrego nombre de usuario a span
        img.src = user.foto; //inserto ruta de acceso a foto de usiario en img
        profile.style.display = "flex"; //muestro div de usuario
    }
    //cerrar sesión
    const salirBtn = document.getElementById("botonSalir"); //boton cerrar sesion
    if (salirBtn) {
        salirBtn.addEventListener("click", () => { 
        localStorage.removeItem("loggedUser"); //quitar user logueado
        document.getElementById("userDropdown").style.display = "none"; //esconder dropdown de usuario
        document.getElementById("loginBtn").style.display = "flex"; //mostrar boton de inicio de sesion
        window.location.reload();
      });
    }
});