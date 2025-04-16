const ContenedorVelocidad = document.getElementById("velocidadContenedor");
const ContenedorTiempo = document.getElementById("tiempoContenedor");
const ContenedorDistancia = document.getElementById("distanciaContenedor");
const radios = document.querySelectorAll('.radios');
const botonCalcular = document.getElementById("calcular");
const resultadoContenedor = document.getElementById("resultado");
let resultado = 0;
const inputDistanciaSolo = document.getElementById("distancia");
const inputTiempoSolo = document.getElementById("tiempo");
const inputVelocidadSolo = document.getElementById("velocidad");
let modoSeleccionado = 'velocidad';

const unidadDistancia = document.getElementById("distanciaUnidades");
const unidadTiempo = document.getElementById("tiempoUnidades");
const unidadVelocidad = document.getElementById("velocidadUnidades");


radios.forEach(radio => {
    radio.addEventListener('change', () => {
        modoSeleccionado = radio.value;
        ContenedorVelocidad.style.display = (modoSeleccionado === 'velocidad') ? "flex" : "none";
        ContenedorTiempo.style.display = (modoSeleccionado === 'tiempo') ? "flex" : "none";
        ContenedorDistancia.style.display = (modoSeleccionado === 'distancia') ? "flex" : "none";
    });
});
botonCalcular.addEventListener('click', () => {
    switch (modoSeleccionado) {
        case 'velocidad':
            if ((unidadDistancia.value === "kilometros" && unidadTiempo.value === "horas") || (unidadDistancia.value === "metros" && unidadTiempo.value === "segundos")){
                resultado = calculoVelocidad(inputDistanciaSolo.value, inputTiempoSolo.value);
                break;
            } else if(unidadDistancia.value === "metros" && unidadTiempo.value === "minutos"){
                resultado = calculoVelocidad(inputDistanciaSolo.value, (inputTiempoSolo.value*60));
                break;
            } else {
                alert("Estas mezclando unidades, recuerda utilizar metros y segundos, kilometros y horas o metros y minutos (ya que nuestra aplicacion convierte minutos a segundos)");
                break;
            }

        case 'tiempo':
            resultado = calculoTiempo(inputDistanciaSolo.value, inputVelocidadSolo.value);
            break;
        case 'distancia':
            resultado = calculoDistancia(inputVelocidadSolo.value, inputTiempoSolo.value);
            break;
        default:
            alert("No se ha seleccionado un modo de calculo");
            return;
    }
    resultadoContenedor.innerHTML = resultado;

})

function calculoVelocidad(distancia, tiempo) {
    return distancia / tiempo;
}


function calculoTiempo(distancia, velocidad) {
    return distancia / velocidad;
}

function calculoDistancia(velocidad, tiempo) {
    return velocidad * tiempo;
}