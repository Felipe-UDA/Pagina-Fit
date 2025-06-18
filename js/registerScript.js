//convertir imagen a Base64
const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    });
}
//registro de usuario
document.getElementById("registroForm").addEventListener("submit", async function(param) { 
    param.preventDefault(); //previene que se actualice la pag
    const nombre = document.getElementById("name").value;
    const apellido = document.getElementById("lastname").value;
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("pass").value;
    const foto = document.getElementById("foto").files[0];
    const foto64 = await toBase64(foto); //transformar foto a base64
    let users = JSON.parse(localStorage.getItem("users") || "[]"); //lista de usuarios ya registrados
    if (users.some(ue => ue.correo === correo)) { //se verifica si existe un usuario con ese correo
        alert("Ya existe un usuario con ese correo.");
        return;
    }
    users.push({ nombre, apellido, correo, password, foto: foto64 }); //se guarda la info del usuario en la lista
    localStorage.setItem("users", JSON.stringify(users)); //se sube al localStorage la info de esa lista
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    document.getElementById("registroForm").reset();
    window.location.href = "login.html"; //redirecciona a login
});