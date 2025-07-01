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
document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('resetPasswordForm').classList.remove('d-none');
});
document.getElementById('checkCorreoBtn').addEventListener('click', () => {
    const correo = document.getElementById('resetCorreo').value.trim();
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.correo === correo);

    if (userIndex !== -1) {
        document.getElementById('newPasswordFields').classList.remove('d-none');
        document.getElementById('checkCorreoBtn').classList.add('d-none');
        document.getElementById('confirmResetBtn').dataset.userIndex = userIndex;
    } else {
        alert('Correo no encontrado.');
    }
});
//cambio de contraseña
document.getElementById('confirmResetBtn').addEventListener('click', () => {
    const newPassword = document.getElementById('newPassword').value;
    const repeatPassword = document.getElementById('repeatPassword').value;
    const userIndex = document.getElementById('confirmResetBtn').dataset.userIndex;
    if (!newPassword || !repeatPassword) {
        alert("Debes completar ambos campos.");
        return;
    }

    if (newPassword !== repeatPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert("¡Contraseña actualizada con éxito!");
    location.reload();
});