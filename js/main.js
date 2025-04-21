const ContenedorVelocidad = document.getElementById("velocidadContenedor");
const ContenedorTiempo = document.getElementById("tiempoContenedor");
const ContenedorDistancia = document.getElementById("distanciaContenedor");
const radios = document.querySelectorAll('.radios');
const botonCalcular = document.getElementById("calcular");
const botonLimpiar = document.getElementById("limpiar");
const resultadoContenedor = document.getElementById("resultado");
const contenedorResultado = document.getElementsByClassName("resultado")[0];

let resultado = '';
let modoSeleccionado = 'velocidad';
let graficoMRU = null;


// Función para mostrar solo el contenedor activo
function mostrarContenedorActivo() {
    ContenedorVelocidad.style.display = (modoSeleccionado === 'velocidad') ? "grid" : "none";
    ContenedorTiempo.style.display = (modoSeleccionado === 'tiempo') ? "grid" : "none";
    ContenedorDistancia.style.display = (modoSeleccionado === 'distancia') ? "grid" : "none";
}

// Evento de cambio de radio
radios.forEach(radio => {
    radio.addEventListener('change', () => {
        modoSeleccionado = radio.value;
        mostrarContenedorActivo();
    });
});
document.querySelectorAll('.ayuda-btn').forEach(boton => {
    boton.addEventListener('click', (e) => {
      // Cerrar otros tooltips
      document.querySelectorAll('.ayuda-btn').forEach(b => {
        if (b !== boton) b.classList.remove('mostrar-tooltip');
      });
  
      // Alternar este tooltip
      boton.classList.toggle('mostrar-tooltip');
    });
  
    // Opcional: cerrar tooltip al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!boton.contains(e.target)) {
        boton.classList.remove('mostrar-tooltip');
      }
    });
  });
botonCalcular.addEventListener('click', () => {
    resultado = ''; // Reiniciamos el valor de la variable resultado antes de calcular
    const contenedorActivo = obtenerContenedorActivo();
    const inputs = contenedorActivo.querySelectorAll("input");
    const hayVacios = Array.from(inputs).some(input => input.value.trim() === '' || isNaN(parseFloat(input.value)));

    if (hayVacios) {
        resultadoContenedor.innerHTML = '';
        alert("Por favor completa todos los campos con valores numéricos válidos.");
        return;
    }
    switch (modoSeleccionado) {
        case 'velocidad':
            calcularVelocidad();
            break;
        case 'tiempo':
            calcularTiempo();
            break;
        case 'distancia':
            calcularDistancia();
            break;
        default:
            alert("No se ha seleccionado un modo de cálculo");
            return;
    }
    typeWriter(resultadoContenedor, resultado);
    contenedorResultado.classList.add('expandido');  
});

//Función para obtener el contenedor activo
const obtenerContenedorActivo = () => {
    const contenedorActivo = {
        'velocidad': ContenedorVelocidad,
        'tiempo': ContenedorTiempo,
        'distancia': ContenedorDistancia
    }[modoSeleccionado];
    return contenedorActivo;
}

botonLimpiar.addEventListener('click', () => {
    const contenedorActivo = obtenerContenedorActivo();
    contenedorActivo.querySelectorAll("input").forEach(input => input.value = '');
    contenedorResultado.classList.remove('expandido');
    resultadoContenedor.innerText = 'Aqui se mostrará el resultado';
    if (graficoMRU) {
        graficoMRU.destroy();
        graficoMRU = null;
    }
});

function calcularVelocidad() {
    const distancia = parseFloat(document.getElementById("distanciaVelocidad").value);
    const tiempo = parseFloat(document.getElementById("tiempoVelocidad").value);
    const unidadDistancia = document.getElementById("distanciaUnidadesVelocidad").value;
    const unidadTiempo = document.getElementById("tiempoUnidadesVelocidad").value;

    if (unidadDistancia === "metros" && unidadTiempo === "segundos") {
        const vel = calculoVelocidad(distancia, tiempo);
        dibujoGrafica(tiempo, vel, 'Tiempo (seg)', 'Velocidad (m/s)', 'Velocidad en Funcion de Tiempo');
        resultado = `${vel.toFixed(3)} m/s lo cual equivale a ${(vel * 3.6).toFixed(3)} km/h`;
    } else if (unidadDistancia === "metros" && unidadTiempo === "minutos") {
        const vel = calculoVelocidad(distancia, tiempo * 60);
        dibujoGrafica(tiempo, vel, 'Tiempo (min)', 'Velocidad (m/s)', 'Velocidad en Funcion de Tiempo');
        resultado = `${vel.toFixed(3)} m/s lo cual equivale a ${(vel * 3.6).toFixed(3)} km/h`;
    } else if (unidadDistancia === "kilometros" && unidadTiempo === "horas") {
        const vel = calculoVelocidad(distancia, tiempo);
        dibujoGrafica(tiempo, vel, 'Tiempo (h)', 'Velocidad (Km/h)', 'Velocidad en Funcion de Tiempo');
        resultado = `${vel.toFixed(3)} km/h lo cual equivale a ${(vel / 3.6).toFixed(3)} m/s`;
    } else {
        alert("Estas mezclando unidades, usa: metros/segundos, metros/minutos o kilometros/horas.");
    }
}

function calcularTiempo() {
    const distancia = parseFloat(document.getElementById("distanciaTiempo").value);
    const velocidad = parseFloat(document.getElementById("velocidadTiempo").value);
    const unidadDistancia = document.getElementById("distanciaUnidadesTiempo").value;
    const unidadVelocidad = document.getElementById("velocidadUnidadesTiempo").value;

    if (unidadDistancia === "metros" && unidadVelocidad === "metrosPorSegundo") {
        const tiempo = calculoTiempo(distancia, velocidad);
        resultado = `${tiempo.toFixed(3)} s lo cual equivale a ${(tiempo / 60).toFixed(3)} min y ${(tiempo / 3600).toFixed(2)} h`;
    } else if (unidadDistancia === "kilometros" && unidadVelocidad === "kilometrosPorHora") {
        const tiempo = calculoTiempo(distancia, velocidad);
        resultado = `${tiempo.toFixed(3)} h lo cual equivale a ${(tiempo * 3600).toFixed(3)} s`;
    } else {
        alert("Estas mezclando unidades, usa: metros con m/s o kilómetros con km/h.");
    }
}

function calcularDistancia() {
    const velocidad = parseFloat(document.getElementById("velocidadDistancia").value);
    const tiempo = parseFloat(document.getElementById("tiempoDistancia").value);
    const unidadVelocidad = document.getElementById("velocidadUnidadesDistancia").value;
    const unidadTiempo = document.getElementById("tiempoUnidadesDistancia").value;

    if (unidadVelocidad === "metrosPorSegundo" && unidadTiempo === "segundos") {
        const dist = calculoDistancia(velocidad, tiempo);
        dibujoGrafica(tiempo, dist, 'Tiempo (seg)', 'Distancia (m)', 'Distancia en Funcion de Tiempo');
        resultado = `${dist.toFixed(3)} m lo cual equivale a ${(dist / 1000).toFixed(3)} km`;
    } else if (unidadVelocidad === "metrosPorSegundo" && unidadTiempo === "minutos") {
        const dist = calculoDistancia(velocidad, tiempo * 60);
        dibujoGrafica(tiempo, dist, 'Tiempo (min)', 'Distancia (m)', 'Distancia en Funcion de Tiempo');
        resultado = `${dist.toFixed(3)} m lo cual equivale a ${(dist / 1000).toFixed(3)} km`;
    } else if (unidadVelocidad === "kilometrosPorHora" && unidadTiempo === "horas") {
        const dist = calculoDistancia(velocidad, tiempo);
        dibujoGrafica(tiempo, dist, 'Tiempo (h)', 'Distancia (m)', 'Distancia en Funcion de Tiempo');
        resultado = `${dist.toFixed(3)} km lo cual equivale a ${(dist * 1000).toFixed(3)} m`;
    } else {
        alert("Estas mezclando unidades, usa: m/s y s, m/s y min o km/h y h.");
    }
}

// FUNCION DIBUJO DE GRAFICAS
function dibujoGrafica(tiempo, valorY, referenciaTiempo, referenciaY, informacionFuncion) {
    let tiempoGrafica = [];
    let valoYArreglo = [];

    if (modoSeleccionado === 'velocidad') {
        for (let i = 0; i <= tiempo; i++) {
            tiempoGrafica.push(i);
            valoYArreglo.push(valorY);
        }
    } else if (modoSeleccionado === 'distancia') {
        for (let i = 0; i <= tiempo; i++) {
            tiempoGrafica.push(i);
            valoYArreglo.push((valorY/tiempo)* i);
        }
    }
    if (graficoMRU) {
        graficoMRU.destroy();
    }

    const ctx = document.getElementById("grafico").getContext("2d");

    graficoMRU = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tiempoGrafica,
            datasets: [{
                label: informacionFuncion,
                data: valoYArreglo,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: referenciaTiempo } },
                y: { title: { display: true, text: referenciaY } }
            }
        }
    });
}

// FUNCIONES BASE DE FÓRMULAS
function calculoVelocidad(distancia, tiempo) {
    return distancia / tiempo;
}

function calculoTiempo(distancia, velocidad) {
    return distancia / velocidad;
}

function calculoDistancia(velocidad, tiempo) {
    return velocidad * tiempo;
}
function typeWriter(element, text, speed = 50) {
    element.innerHTML = ''; // Limpiar el contenido anterior
    element.classList.add('typing-effect');
    
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // Cuando termina de escribir, quita la clase para detener el parpadeo del cursor
        setTimeout(() => {
          element.classList.remove('typing-effect');
        }, 1000);
      }
    }
    
    type();
  }