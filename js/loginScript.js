//iniciar sesión al submit
document.getElementById("loginForm").addEventListener("submit", function(form){
    form.preventDefault(); //evita que el form actualice la página
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("pass").value;
    let users = JSON.parse(localStorage.getItem("users") || "[]"); //acceso a lista de usuarios
    const user = users.find(ue => ue.correo === correo && ue.password === password); //busqueda de usuario que coincida con los datos ingresados
    if (user){ //usuario encontrado
        localStorage.setItem("loggedUser", JSON.stringify(user)); //guarda qué usuario inició sesión
        alert("¡Has iniciado sesión, "+user.nombre+"!");
        window.location.href = "inicio.html"; //redireccionamiento a otra página
    } else {
        alert("Correo o contraseña incorrectos.");
    }
});
//abrir form para cambiar password
document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
    e.preventDefault();//evita que el form actualice la página
    document.getElementById("resetPasswordForm").classList.remove("d-none"); //aparece form para recuperar contraseña
});
//verifica que el correo exista
document.getElementById("checkCorreoBtn").addEventListener("click", () => {
    const correo = document.getElementById("resetCorreo").value.trim(); //correo ingresado sin espacios
    let users = JSON.parse(localStorage.getItem("users") || '[]'); //se obtiene a los users del localStorage
    const userIndex = users.findIndex(u => u.correo === correo); //se obtiene el index del usuario según correo
    //usuario encontrado
    if (userIndex !== -1) {
        document.getElementById("newPasswordFields").classList.remove("d-none"); //se esconde el div de cambio contraseña
        document.getElementById("checkCorreoBtn").classList.add("d-none"); //se esconde el div de check correo
        document.getElementById("confirmResetBtn").dataset.userIndex = userIndex; //guarda index de usuario
    } else { //usuario no encontrado
        alert("Correo no encontrado.");
    }
});
//cambio de contraseña
document.getElementById("confirmResetBtn").addEventListener("click", () => {
    const newPassword = document.getElementById("newPassword").value; //valor nueva contraseña
    const repeatPassword = document.getElementById("repeatPassword").value; //nueva contraseña repetida
    const userIndex = document.getElementById("confirmResetBtn").dataset.userIndex;//se obtiene index de usuario
    //verifica si ambos campos están completos
    if (!newPassword || !repeatPassword) {
        alert("Debes completar ambos campos.");
        return;
    }
    //verifica si las contraseñas coinciden
    if (newPassword !== repeatPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }
    let users = JSON.parse(localStorage.getItem("users") || '[]'); //obtiene lista de usuarios
    users[userIndex].password = newPassword; //cambia la contraseña de ese usuario
    localStorage.setItem("users", JSON.stringify(users)); //guarda el cambio en el localStorage
    alert("¡Contraseña actualizada con éxito!");
    location.reload();
});
//cerrar cuadro
document.getElementById("cerrarbtn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("resetPasswordForm").classList.add("d-none"); //se esconde form de cambio de contraseña
});