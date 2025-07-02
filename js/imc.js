document.getElementById("masculino").onclick = () => {
    document.getElementById("masculino").classList.add("selected");
    document.getElementById("femenino").classList.remove("selected");
};
document.getElementById("femenino").onclick = () => {
    document.getElementById("femenino").classList.add("selected");
    document.getElementById("masculino").classList.remove("selected");
};
peso.oninput = () => pesoRange.value = peso.value;
pesoRange.oninput = () => peso.value = pesoRange.value;
altura.oninput = () => alturaRange.value = altura.value;
alturaRange.oninput = () => altura.value = alturaRange.value;
function calcularIMC() {
    const pesoVal = parseFloat(document.getElementById("peso").value);
    const alturaVal = parseFloat(document.getElementById("altura").value);
    const imc = (pesoVal / (alturaVal * alturaVal)).toFixed(1);
    const resultadoDiv = document.getElementById("resultado");
    const formulario = document.getElementById("formulario");
    resultadoDiv.innerHTML = '';
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = `Tu IMC: ${imc}`;
    const arrow = document.createElement("div");
    arrow.className = "arrow";
    const pointer = document.createElement("div");
    pointer.className = "arrow-pointer";
    pointer.innerHTML = '<span></span>';
    if (imc < 18.5) pointer.style.marginLeft = '0%';
    else if (imc < 25) pointer.style.marginLeft = '25%';
    else if (imc < 30) pointer.style.marginLeft = '50%';
    else pointer.style.marginLeft = '75%';
    arrow.appendChild(pointer);
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = `
    <div class="bajo">Bajo peso</div>
    <div class="saludable">Saludable</div>
    <div class="sobrepeso">Sobrepeso</div>
    <div class="obesidad">Obesidad</div>
    `;
    const alturaCm = alturaVal * 100;
    const minPeso = (18.5 * alturaVal * alturaVal).toFixed(0);
    const maxPeso = (24.9 * alturaVal * alturaVal).toFixed(0);
    const rango = document.createElement("p");
    rango.innerHTML = `Su rango de peso saludable sugerido es de <strong>${minPeso} a ${maxPeso} kg</strong>.`;
    let mensaje = document.createElement("p");
    if (imc < 18.5) mensaje.textContent = "La delgadez puede deberse a diversos factores, tales como genéticos y dietéticos. Independiente de su causa, es importante para tu bienestar mantener un peso saludable.";
    else if (imc < 25) mensaje.textContent = "El equilibrio del organismo -su homeostasis- se obtiene con mayor facilidad si el peso de una persona es normal. Una dieta balanceada y ejercicio ayudan a mantenerse en esta categoría.";
    else if (imc < 30) mensaje.textContent = "Una mala alimentación y hábitos sedentarios pueden contribuir a acumular grasa en tu cuerpo, lo que puede llevar a problemas médicos en el futuro.";
    else mensaje.textContent = "Cuidado, la obesidad genera complicaciones mayores en el organismo y acorta la vida. Es esencial abordar este estado con una dieta balanceada, ejercicio y, en determinadas ocasiones, con cirugía.";
    const btnVolver = document.createElement("button");
    btnVolver.textContent = "VOLVER A CALCULAR";
    btnVolver.className = "btn btn-outline-secondary mt-3";
    btnVolver.onclick = volver;
    resultadoDiv.appendChild(tag);
    resultadoDiv.appendChild(arrow);
    resultadoDiv.appendChild(bar);
    resultadoDiv.appendChild(rango);
    resultadoDiv.appendChild(mensaje);
    resultadoDiv.appendChild(btnVolver);
    resultadoDiv.style.display = "block";
    formulario.style.display = "none";
}
function volver() {
    document.getElementById("resultado").style.display = "none";
    document.getElementById("formulario").style.display = "block";
}