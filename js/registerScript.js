//comprimir imagen
const reducirImagen = (file, maxWidth = 300, calidad = 0.5) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const base64Reducida = canvas.toDataURL("image/jpeg", calidad);
                resolve(base64Reducida);
            };
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
    });
};
//registro de user imagen comprimida
document.getElementById("registroForm").addEventListener("submit", async function(param) { 
    param.preventDefault();
    const nombre = document.getElementById("name").value;
    const apellido = document.getElementById("lastname").value;
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("pass").value;
    const foto = document.getElementById("foto").files[0];
    let foto64 = "";
    if (foto) {
        try {
            foto64 = await reducirImagen(foto); //redimensionar y comprimir
        } catch (err) {
            alert("Hubo un problema al procesar la imagen.");
            console.error(err);
            return;
        }
    }
    let users = JSON.parse(localStorage.getItem("users") || "[]"); //obtiene usuarios del localStorage
    //verifica si existe algún usuario con ese correo
    if (users.some(ue => ue.correo === correo)) {
        alert("Ya existe un usuario con ese correo.");
        return;
    }
    users.push({ nombre, apellido, correo, password, foto: foto64 }); //se agrega el usuario a la lista
    localStorage.setItem("users", JSON.stringify(users)); //se guarda la lista de usuarios
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    document.getElementById("registroForm").reset(); //se limpia el form
    window.location.href = "login.html"; //redirecciona a login.html
});