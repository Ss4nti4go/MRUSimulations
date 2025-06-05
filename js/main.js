const ContenedorVelocidad = document.getElementById("velocidadContenedor");
const ContenedorTiempo = document.getElementById("tiempoContenedor");
const ContenedorDistancia = document.getElementById("distanciaContenedor");
const radios = document.querySelectorAll('.radioMRU');
const botonCalcular = document.getElementById("calcular");
const botonLimpiar = document.getElementById("limpiar");
const resultadoContenedor = document.getElementById("resultado");
const contenedorResultado = document.getElementsByClassName("resultado")[0];

let resultado = '';
let modoSeleccionado = 'velocidad';
let graficoMRU = null;

// Función para mostrar solo el contenedor activo
function mostrarContenedorActivo() {
    ContenedorVelocidad.style.display = (modoSeleccionado === 'velocidad') ? "flex" : "none";
    ContenedorTiempo.style.display = (modoSeleccionado === 'tiempo') ? "flex" : "none";
    ContenedorDistancia.style.display = (modoSeleccionado === 'distancia') ? "flex" : "none";
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
    const tiempo = parseFloat(document.getElementById("tiempoVelocidad").value);
    const unidadDistancia = document.getElementById("distanciaUnidadesVelocidad").value;
    const unidadTiempo = document.getElementById("tiempoUnidadesVelocidad").value;
    let posInicial = Math.abs(parseFloat(document.getElementById("posicionInicialVelocidad").value));
    let posFinal = Math.abs(parseFloat(document.getElementById("posicionFinalVelocidad").value));
    const sentidoPosicionInicial = document.getElementById("sentidoPosicionInicialVelocidad").value;
    const sentidoPosicionFinal = document.getElementById("sentidoPosicionFinalVelocidad").value;

    let vel = 0;

    if (sentidoPosicionInicial === "izquierda") {
        posInicial *= -1;
    }

    if (sentidoPosicionFinal === "izquierda") {
        posFinal *= -1;
    }

    distancia = (posFinal - posInicial);

    if (unidadDistancia === "metros" && unidadTiempo === "segundos") {
        vel = calculoVelocidad(distancia, tiempo);
        dibujoGrafica(tiempo, vel, 'Tiempo (seg)', 'Velocidad (m/s)', 'Velocidad en Funcion de Tiempo');
        resultado = `${vel.toFixed(3)} m/s lo cual equivale a ${(vel * 3.6).toFixed(3)} km/h`;
    } else if (unidadDistancia === "metros" && unidadTiempo === "minutos") {
        vel = calculoVelocidad(distancia, tiempo * 60);
        dibujoGrafica(tiempo, vel, 'Tiempo (min)', 'Velocidad (m/s)', 'Velocidad en Funcion de Tiempo');
        resultado = `${vel.toFixed(3)} m/s lo cual equivale a ${(vel * 3.6).toFixed(3)} km/h`;
    } else if (unidadDistancia === "kilometros" && unidadTiempo === "horas") {
        vel = calculoVelocidad(distancia, tiempo);
        dibujoGrafica(tiempo, vel, 'Tiempo (h)', 'Velocidad (Km/h)', 'Velocidad en Funcion de Tiempo');
        (posInicial, posFinal, vel, tiempo);
        resultado = `${vel.toFixed(3)} km/h lo cual equivale a ${(vel / 3.6).toFixed(3)} m/s`;
        vel = (vel).toFixed(3);
    } else {
        alert("Estas mezclando unidades, usa: metros/segundos, metros/minutos o kilometros/horas.");
    }

    //Guardo las variables como globales para poder usarlas por fuera despues
    window.posicionInicial = posInicial;
    window.posicionFinal = posFinal;
    window.vel = vel;
    window.tiemp = tiempo;
    window.unidadDistancia = unidadDistancia;
    window.unidadTiempo = unidadTiempo;
    window.modoSeleccionado = modoSeleccionado;

    //dibujar representacion
    document.getElementById('contenedorRepresentacion').innerHTML = '';
    new p5(sketch, 'contenedorRepresentacion');
}

function calcularTiempo() {

    const unidadDistancia = document.getElementById("distanciaUnidadesTiempo").value;
    let posInicial = Math.abs(parseFloat(document.getElementById("posicionInicialTiempo").value));
    let posFinal = Math.abs(parseFloat(document.getElementById("posicionFinalTiempo").value));
    const velocidad = parseFloat(document.getElementById("velocidadTiempo").value);
    const unidadVelocidad = document.getElementById("velocidadUnidadesTiempo").value;

    let tiempo = 0;

    const sentidoPosicionInicial = document.getElementById("sentidoPosicionInicialTiempo").value;
    const sentidoPosicionFinal = document.getElementById("sentidoPosicionFinalTiempo").value;

    if (sentidoPosicionInicial === "izquierda") {
        posInicial *= -1;
    }

    if (sentidoPosicionFinal === "izquierda") {
        posFinal *= -1;
    }

    distancia = (posFinal - posInicial);

    if (unidadDistancia === "metros" && unidadVelocidad === "metrosPorSegundo") {
        tiempo = Math.abs(calculoTiempo(distancia, velocidad));
        resultado = `${tiempo.toFixed(3)} s lo cual equivale a ${(tiempo / 60).toFixed(3)} min y ${(tiempo / 3600).toFixed(2)} h`;
    } else if (unidadDistancia === "kilometros" && unidadVelocidad === "kilometrosPorHora") {
        tiempo = Math.abs(calculoTiempo(distancia, velocidad));
        resultado = `${tiempo.toFixed(3)} h lo cual equivale a ${(tiempo * 3600).toFixed(3)} s`;
    } else {
        alert("Estas mezclando unidades, usa: metros con m/s o kilómetros con km/h.");
    }

    //Guardo las variables como globales para poder usarlas por fuera despues
    window.posicionInicial = posInicial;
    window.posicionFinal = posFinal;
    if (posFinal < 0) {
        window.vel = -1 * velocidad;
    } else {
        window.vel = velocidad;

    }

    window.tiemp = tiempo;
    window.unidadDistancia = unidadDistancia;
    window.unidadVelocidad = unidadVelocidad;
    window.modoSeleccionado = modoSeleccionado;


    //dibujar representacion
    document.getElementById('contenedorRepresentacion').innerHTML = '';
    new p5(sketch, 'contenedorRepresentacion');
}

function calcularDistancia() {
    let velocidad = Math.abs(parseFloat(document.getElementById("velocidadDistancia").value));
    const tiempo = parseFloat(document.getElementById("tiempoDistancia").value);
    const unidadVelocidad = document.getElementById("velocidadUnidadesDistancia").value;
    const unidadTiempo = document.getElementById("tiempoUnidadesDistancia").value;
    const sentidoVelocidad = document.getElementById("sentidoVelocidadDistancia").value;

    if (sentidoVelocidad === "izquierda") {
        velocidad *= -1;
    }

    let dist = 0;

    if (unidadVelocidad === "metrosPorSegundo" && unidadTiempo === "segundos") {
        dist = calculoDistancia(velocidad, tiempo);
        dibujoGrafica(tiempo, dist, 'Tiempo (seg)', 'Distancia (m)', 'Distancia en Funcion de Tiempo');
        resultado = `${dist.toFixed(3)} m lo cual equivale a ${(dist / 1000).toFixed(3)} km`;
    } else if (unidadVelocidad === "metrosPorSegundo" && unidadTiempo === "minutos") {
        dist = calculoDistancia(velocidad, tiempo * 60);
        dibujoGrafica(tiempo, dist, 'Tiempo (min)', 'Distancia (m)', 'Distancia en Funcion de Tiempo');
        resultado = `${dist.toFixed(3)} m lo cual equivale a ${(dist / 1000).toFixed(3)} km`;
    } else if (unidadVelocidad === "kilometrosPorHora" && unidadTiempo === "horas") {
        dist = calculoDistancia(velocidad, tiempo);
        dibujoGrafica(tiempo, dist, 'Tiempo (h)', 'Distancia (m)', 'Distancia en Funcion de Tiempo');
        resultado = `${dist.toFixed(3)} km lo cual equivale a ${(dist * 1000).toFixed(3)} m`;
    } else {
        alert("Estas mezclando unidades, usa: m/s y s, m/s y min o km/h y h.");
    }

    //Guardo las variables como globales para poder usarlas por fuera despues
    window.vel = velocidad;
    window.tiemp = tiempo;
    window.posicionInicial = 0;
    window.posicionFinal = dist;
    window.unidadVelocidad = unidadVelocidad;
    window.unidadTiempo = unidadTiempo;
    window.modoSeleccionado = modoSeleccionado;


    //dibujar representacion
    document.getElementById('contenedorRepresentacion').innerHTML = '';
    new p5(sketch, 'contenedorRepresentacion');
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
            valoYArreglo.push((valorY / tiempo) * i);
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

//Representacion
let sketch = (p) => {

    p.setup = function () {
        p.createCanvas(1000, 400);
        p.background(255);
        p.noLoop();

        //5 pixeles = 1m
        let escala = 5;
        let yBase = 250;
        let xOrigen = p.width / 2;
        const margen = 20;
        const margenIzquierdo = margen;
        const margenDerecho = p.width - margen;


        //Variables que se cargan en el calculo (globales)
        let posInicial = window.posicionInicial;
        let posFinal = window.posicionFinal;
        let desplazamiento = posFinal - posInicial;
        let velocidad = window.vel;
        let tiempo = window.tiemp;
        let xInicial = xOrigen + posInicial * escala;
        let xFinal = xOrigen + posFinal * escala;


        while (escala > 0) {
            xInicial = xOrigen + posInicial * escala;
            xFinal = xOrigen + posFinal * escala;

            if (xInicial > margenDerecho || xFinal > margenDerecho || xInicial < margenIzquierdo || xFinal < margenIzquierdo) {
                escala *= 0.5;
            } else {
                break;
            }
        }

        p.stroke(0);
        p.strokeWeight(2);
        p.line(0, yBase, p.width, yBase);

        largoXFlechaNaranja = xInicial - xOrigen
        largoXFlechaVerde = xFinal - xOrigen

        if (largoXFlechaNaranja > 0 || largoXFlechaVerde > 0) {
            if (largoXFlechaNaranja > largoXFlechaVerde) {
                drawArrow(p, xOrigen, yBase, xInicial - xOrigen, 0, p.color(255, 165, 0)); // naranja
                drawArrow(p, xOrigen, yBase, xFinal - xOrigen, 0, p.color(0, 180, 0)); // verde
            } else {
                drawArrow(p, xOrigen, yBase, xFinal - xOrigen, 0, p.color(0, 180, 0)); // verde
                drawArrow(p, xOrigen, yBase, xInicial - xOrigen, 0, p.color(255, 165, 0)); // naranja
            }
        } else {
            if (largoXFlechaNaranja < largoXFlechaVerde) {
                drawArrow(p, xOrigen, yBase, xInicial - xOrigen, 0, p.color(255, 165, 0)); // naranja
                drawArrow(p, xOrigen, yBase, xFinal - xOrigen, 0, p.color(0, 180, 0)); // verde
            } else {
                drawArrow(p, xOrigen, yBase, xFinal - xOrigen, 0, p.color(0, 180, 0)); // verde
                drawArrow(p, xOrigen, yBase, xInicial - xOrigen, 0, p.color(255, 165, 0)); // naranja
            }
        }


        drawArrow(p, xInicial, yBase + 40, xFinal - xInicial, 0, p.color(180, 0, 255)); // violeta        
        p.fill(255, 0, 0);
        p.noStroke();
        p.ellipse(xInicial, yBase - 40, 30, 30);

        drawArrow(p, xInicial, yBase - 40, velocidad * escala, 0, p.color(0, 200, 255)); // celeste

        p.stroke(10);
        p.strokeWeight(2);
        p.line(xOrigen, yBase - 5, xOrigen, yBase + 5);

        p.noStroke();
        p.fill(0);
        p.textSize(14);
        p.textAlign(p.CENTER);
        p.text("0", xOrigen, yBase - 10);
        if (modoSeleccionado == "velocidad") {
            if (unidadDistancia == "metros" && unidadTiempo == "segundos") {
                p.text(`Posicion Inicial (${posInicial}m)`, xInicial, yBase + 20); //naranja
                p.text(`Posicion Final (${posFinal}m)`, xFinal, yBase - 16); //verde
                p.text(`Desplazamiento (${desplazamiento}m)`, (xInicial + xFinal) / 2, yBase + 60); //violeta
                p.text(`Velocidad (${velocidad}m/s)`, xInicial + velocidad * escala / 2, yBase - 60); //celeste
                p.text(`Tiempo (${tiempo}s)`, xInicial + velocidad * escala / 2, yBase - 100);
            } else if (unidadDistancia == "metros" && unidadTiempo == "minutos") {
                p.text(`Posicion Inicial (${posInicial}m)`, xInicial, yBase + 20); //naranja
                p.text(`Posicion Final (${posFinal}m)`, xFinal, yBase - 16); //verde
                p.text(`Desplazamiento (${desplazamiento}m)`, (xInicial + xFinal) / 2, yBase + 60); //violeta
                p.text(`Velocidad (${velocidad}m/s)`, xInicial + velocidad * escala / 2, yBase - 60); //celeste
                p.text(`Tiempo (${tiempo}m)`, xInicial + velocidad * escala / 2, yBase - 100);
            } else {
                p.text(`Posicion Inicial (${posInicial}Km)`, xInicial, yBase + 20); //naranja
                p.text(`Posicion Final (${posFinal}Km)`, xFinal, yBase - 16); //verde
                p.text(`Desplazamiento (${desplazamiento}Km)`, (xInicial + xFinal) / 2, yBase + 60); //violeta
                p.text(`Velocidad (${velocidad}Km/h)`, xInicial + velocidad * escala / 2, yBase - 60); //celeste
                p.text(`Tiempo (${tiempo}h)`, xInicial + velocidad * escala / 2, yBase - 100);
            }
        } else if (modoSeleccionado == "tiempo") {
            if (unidadDistancia == "metros" && unidadVelocidad == "metrosPorSegundo") {
                p.text(`Posicion Inicial (${posInicial}m)`, xInicial, yBase + 20); //naranja
                p.text(`Posicion Final (${posFinal}m)`, xFinal, yBase - 16); //verde
                p.text(`Desplazamiento (${desplazamiento}m)`, (xInicial + xFinal) / 2, yBase + 60); //violeta
                p.text(`Velocidad (${velocidad}m/s)`, xInicial + velocidad * escala / 2, yBase - 60); //celeste
                p.text(`Tiempo (${tiempo}s)`, xInicial + velocidad * escala / 2, yBase - 100);
            } else {
                p.text(`Posicion Inicial (${posInicial}Km)`, xInicial, yBase + 20); //naranja
                p.text(`Posicion Final (${posFinal}Km)`, xFinal, yBase - 16); //verde
                p.text(`Desplazamiento (${desplazamiento}Km)`, (xInicial + xFinal) / 2, yBase + 60); //violeta
                p.text(`Velocidad (${velocidad}Km/h)`, xInicial + velocidad * escala / 2, yBase - 60); //celeste
                p.text(`Tiempo (${tiempo}h)`, xInicial + velocidad * escala / 2, yBase - 100);
            }
        } else {
            if (unidadVelocidad == "metrosPorSegundo" && unidadTiempo == "segundos") {
                p.text(`Posicion Inicial (${posInicial}m)`, xInicial, yBase + 20); //naranja
                p.text(`Posicion Final (${posFinal}m)`, xFinal, yBase - 16); //verde
                p.text(`Desplazamiento (${desplazamiento}m)`, (xInicial + xFinal) / 2, yBase + 60); //violeta
                p.text(`Velocidad (${velocidad}m/s)`, xInicial + velocidad * escala / 2, yBase - 60); //celeste
                p.text(`Tiempo (${tiempo}s)`, xInicial + velocidad * escala / 2, yBase - 100);
            } else if (unidadVelocidad == "metrosPorSegundo" && unidadTiempo == "minutos") {
                p.text(`Posicion Inicial (${posInicial}m)`, xInicial, yBase + 20); //naranja
                p.text(`Posicion Final (${posFinal}m)`, xFinal, yBase - 16); //verde
                p.text(`Desplazamiento (${desplazamiento}m)`, (xInicial + xFinal) / 2, yBase + 60); //violeta
                p.text(`Velocidad (${velocidad}m/s)`, xInicial + velocidad * escala / 2, yBase - 60); //celeste
                p.text(`Tiempo (${tiempo}m)`, xInicial + velocidad * escala / 2, yBase - 100);
            } else {
                p.text(`Posicion Inicial (${posInicial}Km)`, xInicial, yBase + 20); //naranja
                p.text(`Posicion Final (${posFinal}Km)`, xFinal, yBase - 16); //verde
                p.text(`Desplazamiento (${desplazamiento}Km)`, (xInicial + xFinal) / 2, yBase + 60); //violeta
                p.text(`Velocidad (${velocidad}Km/h)`, xInicial + velocidad * escala / 2, yBase - 60); //celeste
                p.text(`Tiempo (${tiempo}h)`, xInicial + velocidad * escala / 2, yBase - 100);
            }
        }
    };
};

function drawArrow(p, x, y, dx, dy, col) {
    p.push();
    p.stroke(col);
    p.strokeWeight(3);
    p.fill(col);
    p.translate(x, y);
    p.line(0, 0, dx, dy);
    let arrowSize = 8;
    let angle = Math.atan2(dy, dx);
    p.translate(dx, dy);
    p.rotate(angle);
    p.triangle(0, 0, -arrowSize, arrowSize / 2, -arrowSize, -arrowSize / 2);
    p.pop();
}