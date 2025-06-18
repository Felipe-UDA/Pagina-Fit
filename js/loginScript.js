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
        window.location.href = "seguimiento.html"; //redireccionamiento a otra página
    } else {
        alert("Correo o contraseña incorrectos.");
    }
});
//falta agregar funcionalidad a olvido de contraseña