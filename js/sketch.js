// Variables globales
let posA, velA, posB, velB;

let xA, xB;
let escala = 1;
let t;
let tiempoIncremento = 0.0025;
let simulando = false;
let tiempoEncuentro = null;
let posicionEncuentro = null;
let tEncuentro = 0;
let canvas;
let encontraron = false;
let animacionID;
let windowWidth;
let tolerancia = 1;
let escenarios = "derecha";
let marcaDistancia = 100;
let delayB = 0; // Delay del móvil B
let delayA = 0; // Nueva variable para el delay del móvil A

// Agregar referencias a los inputs de delay (agregar después de las otras constantes)
const delayBInput = document.getElementById("delayB");
const delayAInput = document.getElementById("delayA");
const tiempoSimulado = document.getElementById("tiempo");
delayAInput.addEventListener('change', () => {
  delayA = parseFloat(delayAInput.value) || 0;
  predecirEncuentro();
});
const iniciarSimulacionBut = document.getElementById("iniciarSimulacion");
delayBInput.addEventListener('change', () => {
  delayB = parseFloat(delayBInput.value) || 0;
  predecirEncuentro();
});
document.querySelectorAll("input[name='escenario']").forEach((radio) => radio.addEventListener("change", () => {

  escenarios = radio.value;
  predecirEncuentro();

}));
const aplicarEscalaBut = document.getElementById("aplicarEscalaBut");
const activarAutoEscalado = document.getElementById("activarAutoEscala");
const multTiempoSimulacion = document.getElementById("velocidadSimulacion");
const resultado = document.getElementById("resultadoEncuentro");
const escalaInput = document.getElementById("escalaInput");
const limpiarBtn = document.getElementById("limpiar");
const modoSimulacion = document.getElementById("escenario");

activarAutoEscalado.addEventListener('change', () => {
  if (activarAutoEscalado.checked) {
    escalaInput.disabled = true;
    aplicarEscalaBut.disabled = true;
  } else {
    escalaInput.disabled = false;
    aplicarEscalaBut.disabled = false;
  }
  predecirEncuentro();
});
multTiempoSimulacion.addEventListener('change', () => {

  if (multTiempoSimulacion.value == 1) {
    tiempoIncremento = 0.0025;
  }

  if (multTiempoSimulacion.value == 2) {
    tiempoIncremento = 0.005;
  }

  if (multTiempoSimulacion.value == 3) {
    tiempoIncremento = 0.01;
  }

  if (multTiempoSimulacion.value == 4) {
    tiempoIncremento = 0.02;
  }

  if (multTiempoSimulacion.value == 5) {
    tiempoIncremento = 0.05;
  }

  if (multTiempoSimulacion.value == 10) {
    tiempoIncremento = 0.1;
  }
  if (multTiempoSimulacion.value == 25) {
    tiempoIncremento = 0.2;

  }
  predecirEncuentro()
})
const inputs = Array.from(document.getElementsByClassName('datosInput'));
inputs.forEach(input => {
  input.addEventListener('change', () => {

    const posAInput = parseFloat(document.getElementById("posA").value);
    const posBInput = parseFloat(document.getElementById("posB").value);


    // Convertir unidades a metros y m/s
    posA = convertirDistancia(posAInput, document.getElementById("unidadPosA").value);
    posB = convertirDistancia(posBInput, document.getElementById("unidadPosB").value);
    redrawSimulation();
    simulando = false;


  });;
})
document.querySelector('select').addEventListener('change', redrawSimulation);
document.addEventListener('DOMContentLoaded', function () {

  ajustarEscala();
  redrawSimulation();
  // Configurar el botón de limpiar
  limpiarBtn.addEventListener('click', limpiarSimulacion);
  document.getElementById("detenerSimulacion").addEventListener('click', detenerSimulacion);
  // Configurar los botones de ayuda
  const ayudaBtns = document.querySelectorAll('.ayuda-btn');
  ayudaBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      alert(this.getAttribute('data-mensaje'));
    });
  });

  // Inicializar escalaInput con el valor predeterminado
  escalaInput.value = escala;
});

function detenerSimulacion() {
  if (simulando) {

    clearInterval(animacionID);
    simulando = false;
  }
  resultado.textContent = ``;
  document.getElementById("velocidadSimulacion").disabled = false;
}
function drawVelocityArrow(xPos, velocidad, colorFlecha, height) {
  const largo = Math.max(20, Math.abs(velocidad * escala * 2)); // Largo mínimo para visibilidad
  const dir = velocidad >= 0 ? 1 : -1;

  stroke(colorFlecha);
  strokeWeight(2);
  line(xPos, height / 2, xPos + dir * largo, height / 2);

  // Flecha al final
  line(xPos + dir * largo, height / 2, xPos + dir * largo - 5 * dir, height / 2 - 5);
  line(xPos + dir * largo, height / 2, xPos + dir * largo - 5 * dir, height / 2 + 5);
}
function drawVectorX(pos, etiqueta, colorLinea, distancia, posTemp, alturaFlechas, posfinal, invertir) {
  const centroCanvas = width / 2;
  const xFinal = centroCanvas + pos * escala;

  stroke(colorLinea);
  strokeWeight(3);

  const dir = xFinal >= centroCanvas ? 1 : -1;
  if (posTemp) {
    line(centroCanvas + posTemp * escala, height / 2 + distancia, xFinal, height / 2 + distancia);
  } else {
    line(centroCanvas, height / 2 + distancia, xFinal, height / 2 + distancia);
  }


  if (alturaFlechas) {
    alturaFlechas = distancia
    if (invertir) {
      line(xFinal, height / 2 + alturaFlechas, xFinal + 10  , height / 2 - 5 + alturaFlechas);
      line(xFinal, height / 2 + alturaFlechas, xFinal + 10 , height / 2 + 5 + alturaFlechas);
    } else {
      line(xFinal, height / 2 + alturaFlechas, xFinal - 10, height / 2 - 5 + alturaFlechas);
      line(xFinal, height / 2 + alturaFlechas, xFinal - 10, height / 2 + 5 + alturaFlechas);
    }

  } else {
    line(xFinal, height / 2, xFinal - 10 , height / 2 - 5);
    line(xFinal, height / 2, xFinal - 10 , height / 2 + 5);
  }


  // Etiqueta
  noStroke();
  fill(colorLinea);
  textSize(12);
  text(etiqueta, (centroCanvas + xFinal) / 2, distancia + height / 2 - 15);
}
/**
 * Ajusta la escala manualmente según el valor ingresado por el usuario
 */
function ajustarEscala() {

  const nuevaEscala = parseFloat(escalaInput.value);
  if (!isNaN(nuevaEscala) && nuevaEscala > 0) {
    escala = nuevaEscala;

    if (document.getElementById("unidadPosB").value === "km" || document.getElementById("unidadPosA").value === "km") {


      if (posicionEncuentro < 1000) {
        marcaDistancia = 250;
      }
      if (escala <= 0.4) {
        marcaDistancia = 500;
      }
      if (escala <= 0.2) {
        marcaDistancia = 1000;
      }
      if (escala <= 0.1) {
        marcaDistancia = 1000;
      }
      if (escala <= 0.05) {
        marcaDistancia = 2000;
      }
      if (escala <= 0.01) {
        marcaDistancia = 5000;
      }

    } else {
      if (posicionEncuentro < 100) {
        marcaDistancia = 50;
      }
      if ((velA + velB) % 2 === 0) {
        tolerancia = 1;
      } else {
        marcaDistancia = 100;
        tolerancia = (velA + velB) / 2;
      }
      if (escala <= 0.4) {
        marcaDistancia = 500;
      }
      if (escala <= 0.2) {
        marcaDistancia = 1000;
      }
      if (escala <= 0.1) {
        marcaDistancia = 1500;
      }
      if (escala <= 0.05) {
        marcaDistancia = 2000;
      }
      if (escala <= 0.01) {
        marcaDistancia = 5000;
      }
    }
    // Si hay una simulación en curso, actualizar la visualización
    if (simulando) {
      redrawSimulation();
    }
  } else {
    alert("Por favor, ingrese un valor válido y mayor que cero para la escala.");
  }
}
/**
 * Ajusta la escala automáticamente basada en las posiciones y velocidades
 */
function ajustarEscalaAuto() {
  // Convertir posiciones y velocidades con sus unidades
  const posAMetros = convertirDistancia(posA, document.getElementById("unidadPosA").value);
  const posBMetros = convertirDistancia(posB, document.getElementById("unidadPosB").value);
  let velAMps = convertirVelocidad(velA, document.getElementById("unidadVelA").value);
  let velBMps = convertirVelocidad(velB, document.getElementById("unidadVelB").value);

  // Ajuste de signos según el escenario
  if (escenarios === 'opuestos') {
    velAMps = Math.abs(velAMps);
    velBMps = -Math.abs(velBMps);
  } else if (escenarios === 'izquierda') {
    velAMps = -Math.abs(velAMps);
    velBMps = -Math.abs(velBMps);
  } else {
    velAMps = Math.abs(velAMps);
    velBMps = Math.abs(velBMps);
  }
  if (document.getElementById("unidadPosB").value === "km" || document.getElementById("unidadPosA").value === "km") {
    marcaDistancia = 1000;
    tolerancia = (posicionEncuentro / tEncuentro) * 1;

    if (posicionEncuentro < 25000) {
      escala = 0.01;
    } else if (posicionEncuentro < 85000) {
      escala = 0.005;
    } else if (posicionEncuentro < 500000) {
      escala = 0.0025;
    } else if (posicionEncuentro < 1000000) {
      escala = 0.0001;
    }

    if (posicionEncuentro < 1000) {
      marcaDistancia = 250;
    }
    if (escala <= 0.4) {
      marcaDistancia = 500;
    }
    if (escala <= 0.2) {
      marcaDistancia = 1000;
    }
    if (escala <= 0.1) {
      marcaDistancia = 1000;
    }
    if (escala <= 0.05) {
      marcaDistancia = 2000;
    }
    if (escala <= 0.01) {
      marcaDistancia = 10000;
    }
    if (escala <= 0.001) {
      marcaDistancia = 50000;
    }
    if (escala <= 0.0001) {
      marcaDistancia = 100000;
    }


  } else {
    marcaDistancia = 25

    if ((velA + velB) % 2 === 0) {
      tolerancia = 1;
      marcaDistancia = 100;
    } else {

      tolerancia = (velA + velB) / 2;
    }
    if (escala >= 1) {
      marcaDistancia = 25;
    }
    if (escala > 0.4) {
      marcaDistancia = 50;
    }
    if (escala <= 0.4) {
      marcaDistancia = 500;
    }
    if (escala <= 0.2) {
      marcaDistancia = 1000;
    }
    if (escala <= 0.1) {
      marcaDistancia = 1500;
    }
    if (escala <= 0.05) {
      marcaDistancia = 2000;
    }
    if (escala <= 0.01) {
      marcaDistancia = 5000;
    }
    if ((velA + velB) % 2 === 0) {
      tolerancia = 2;
    } else {

      tolerancia = 1.5;
    }
    {
    }

    const posEncuentro = posAMetros + velAMps * tEncuentro;
    const cantidadCeros = Math.floor(Math.log10(posEncuentro));

    // Calcular los extremos de movimiento
    const posiciones = [posAMetros, posBMetros, posEncuentro];
    const minPos = Math.min(...posiciones);
    const maxPos = Math.max(...posiciones);
    const distanciaTotal = maxPos - minPos;

    // Ajustar la escala al canvas con márgenes
    const margen = 50; // margen en píxeles
    const espacioDisponible = canvas.width - 2 * margen;
    let nuevaEscala = espacioDisponible / distanciaTotal;
    for (let i = 0; i < cantidadCeros; i++) {
      nuevaEscala = nuevaEscala / 2;
    }

    escala = nuevaEscala;
    escalaInput.value = escala.toFixed(2);


    redrawSimulation();
  }
}
/**
 * Convierte una distancia a metros
 */
function convertirDistancia(valor, unidad) {
  if (unidad === "km") {
    return valor * 1000; // km a m
  }
  return valor; // ya está en metros
}

/**
 * Convierte una velocidad a m/s
 */
function convertirVelocidad(valor, unidad) {
  if (unidad === "km/h") {
    return valor * 1000 / 3600; // km/h a m/s
  }
  return valor; // ya está en m/s
}

/**
 * Inicia la simulación con los datos ingresados
 */
function iniciarSimulacion() {
  // Detener cualquier simulación anterior
  if (simulando) {
    cancelAnimationFrame(animacionID);
    simulando = false;
  }

  iniciarSimulacionBut.disabled = true;
  encontraron = false;
  tiempoEncuentro = null;

  // Obtener datos del formulario
  const posAInput = parseFloat(document.getElementById("posA").value);
  const posBInput = parseFloat(document.getElementById("posB").value);
  const velAInput = parseFloat(document.getElementById("velA").value);
  const velBInput = parseFloat(document.getElementById("velB").value);

  // Obtener valores de delay
  delayA = parseFloat(delayAInput?.value) || 0;
  delayB = parseFloat(delayBInput?.value) || 0;

  // Validar que todos los campos estén completos
  if (isNaN(posAInput) || isNaN(velAInput) || isNaN(posBInput) || isNaN(velBInput)) {
    mostrarError("Por favor, completa todos los campos con valores numéricos.");
    return;
  }

  // Convertir unidades a metros y m/s
  posA = convertirDistancia(posAInput, document.getElementById("unidadPosA").value);
  posB = convertirDistancia(posBInput, document.getElementById("unidadPosB").value);
  velA = convertirVelocidad(velAInput, document.getElementById("unidadVelA").value);
  velB = convertirVelocidad(velBInput, document.getElementById("unidadVelB").value);
  document.getElementById("velocidadSimulacion").disabled = true;

  // Ajustar escala automáticamente
  if (activarAutoEscalado.checked) {
    ajustarEscalaAuto();
  } else {
    ajustarEscala();
  }

  t = 0;



  if (escenarios === 'opuestos') {
    velA = Math.abs(velA);
    velB = -Math.abs(velB);
  } else if (escenarios === 'izquierda') {
    velA = Math.abs(velA) * -1;
    velB = Math.abs(velB) * -1;
  } else {
    velA = Math.abs(velA);
    velB = Math.abs(velB);
  }



  // Iniciar simulación
  simulando = true;

  // Iniciar la animación
  animarSimulacion();
}

/**
 * Anima la simulación frame por frame
 */
function animarSimulacion() {
  if (!simulando) return;

  // Dibujar el frame actual
  draw();

  // Programar el siguiente frame
  animacionID = requestAnimationFrame(animarSimulacion);
}

/**
 * Configura el canvas de p5.js
 */
function setup() {
  windowWidth = window.innerWidth;
  canvas = createCanvas(windowWidth - 30, 200);
  canvas.parent("canvas-holder");

  // Configurar texto
  textAlign(CENTER, CENTER);
  textSize(14);
}
function dibujarVectorVelocidad(vel, escala) {
  let x = width / 2 + vel * escala;
  let dx = vel * escala * 1.5; // longitud proporcional a la velocidad
  let endX = x + dx;

  stroke(0);  // Ajustar el color si es necesario
  strokeWeight(2);
  line(x, height / 2, endX, height / 2);

  // Flecha
  push();
  translate(endX, height / 2);
  let angulo = dx >= 0 ? 0 : PI;
  rotate(angulo);
  fill(0);  // Ajustar el color si es necesario
  noStroke();
  triangle(0, -5, 0, 5, 10 * (dx >= 0 ? 1 : -1), 0);
  pop();
  strokeWeight(1);
}
/**
 * Dibuja un frame de la simulación
 */

function predecirEncuentro() {
  // Asegurarse que los valores estén cargados
  const posAInput = parseFloat(document.getElementById("posA").value);
  const posBInput = parseFloat(document.getElementById("posB").value);
  const velAInput = parseFloat(document.getElementById("velA").value);
  const velBInput = parseFloat(document.getElementById("velB").value);
  const delayAValue = parseFloat(delayAInput?.value) || 0;
  const delayBValue = parseFloat(delayBInput?.value) || 0;

  if (isNaN(posAInput) || isNaN(velAInput) || isNaN(posBInput) || isNaN(velBInput)) return;

  // Convertir unidades a m y m/s
  const pA = convertirDistancia(posAInput, document.getElementById("unidadPosA").value);
  const pB = convertirDistancia(posBInput, document.getElementById("unidadPosB").value);
  let vA = convertirVelocidad(velAInput, document.getElementById("unidadVelA").value);
  let vB = convertirVelocidad(velBInput, document.getElementById("unidadVelB").value);

  if (escenarios === 'opuestos') {
    vA = Math.abs(vA);
    vB = -Math.abs(vB);
  } else if (escenarios === 'izquierda') {
    vA = -Math.abs(vA);
    vB = -Math.abs(vB);
  } else {
    vA = Math.abs(vA);
    vB = Math.abs(vB);
  }

  const denominador = vA - vB;
  if (denominador === 0) {
    resultado.textContent = "Los móviles no se encontrarán (misma velocidad).";
    resultado.style.color = "orange";
    return;
  }

  // Ecuación considerando ambos delays:
  // Si t es el tiempo de encuentro desde el inicio de la simulación:
  // pA + vA * (t - delayA) = pB + vB * (t - delayB)
  // pA + vA * t - vA * delayA = pB + vB * t - vB * delayB
  // vA * t - vB * t = pB - pA - vB * delayB + vA * delayA
  // (vA - vB) * t = pB - pA - vB * delayB + vA * delayA
  // t = (pB - pA - vB * delayB + vA * delayA) / (vA - vB)

  tEncuentro = (pB - pA - vB * delayBValue + vA * delayAValue) / (vA - vB);

  // Verificar que el encuentro ocurra después de que ambos móviles hayan comenzado a moverse
  if (tEncuentro < 0 || tEncuentro < delayAValue || tEncuentro < delayBValue) {
    resultado.textContent = "Los móviles no se encontrarán.";
    resultado.style.color = "orange";
    return;
  }

  // La posición de encuentro es la posición del móvil A en el tiempo de encuentro
  const posEncuentro = pA + vA * (tEncuentro - delayAValue);
  posicionEncuentro = posEncuentro;
  const unidad = document.getElementById("unidadPosA").value;
  const posMostrada = unidad === "km" ? (posEncuentro / 1000).toFixed(2) : posEncuentro.toFixed(2);
  resultado.textContent = `Encuentro estimado: en t = ${tEncuentro.toFixed(2)} s, posición = ${posMostrada} ${unidad}`;
  resultado.style.color = "green";
}

function draw() {
  background(240);

  // Dibujar línea de referencia (eje X)
  stroke(180);
  if (tolerancia > 5) tolerancia = 5;
  line(0, height / 2, width, height / 2);

  //drawVectorX(pos, etiqueta, colorLinea, distancia, posTemp, alturaFlechas, posfinal, invertir)
  if(posA<0){
    drawVectorX(posA, "Xi A", color(255, 100, 0), 0, null, 0.5, null, true);
  }else{
    drawVectorX(posA, "Xi A", color(255, 100, 0), 0, null, 0.5, null, false);
  }
  
  if(posB<0){
    drawVectorX(posB, "Xi B", color(0, 100, 255), -10, null, 1, null, true);
  }else{
    drawVectorX(posB, "Xi B", color(0, 100, 255), -10, null, 1, null, false);
  }

  const pixelesPorMarca = marcaDistancia * escala;
  const centroCanvas = width / 2;
  stroke(200);
  fill(100);
  textSize(10);

  // Dibujar marcas a la derecha del centro
  for (let x = centroCanvas; x < width; x += pixelesPorMarca) {
    line(x, height / 2 - 5, x, height / 2 + 5);
    const distancia = ((x - centroCanvas) / escala).toFixed(0);
    text(distancia + "m", x, height / 2 + 10);
  }

  // Dibujar marcas a la izquierda del centro
  for (let x = centroCanvas - pixelesPorMarca; x > 0; x -= pixelesPorMarca) {
    line(x, height / 2 - 5, x, height / 2 + 5);
    const distancia = ((centroCanvas - x) / escala).toFixed(0);
    text("-" + distancia + "m", x, height / 2 + 10);
  }

  // Marcar el centro (origen)
  stroke(100);
  line(centroCanvas, height / 2 - 10, centroCanvas, height / 2 + 10);
  fill(100);
  textSize(19);
  text("0", centroCanvas, height / 2 + 50);

  if (simulando) {
    // Calcular posiciones actuales considerando los delays
    const posActualA = t >= delayA ? posA + velA * (t - delayA) : posA;
    const posActualB = t >= delayB ? posB + velB * (t - delayB) : posB;

    // Convertir a coordenadas de pantalla (centradas en el canvas)
    xA = centroCanvas + posActualA * escala;
    xB = centroCanvas + posActualB * escala;
    textSize(20);

    // Dibujar móvil A (rojo)
    fill(255, 100, 100);
    noStroke();
    ellipse(xA, height / 2 - 20, 30, 30);
    fill(0);
    text("A", xA, height / 2 - 20);

    // Dibujar móvil B (azul)
    fill(100, 100, 255);
    noStroke();
    ellipse(xB, height / 2 + 20, 30, 30);
    fill(0);
    text("B", xB, height / 2 + 20);

    // Mostrar velocidades o mensajes de espera
    fill(255, 100, 100);
    if (t < delayA) {
      text(`Esperando ${(delayA - t).toFixed(2)}s`, xA, height / 2 - 40);
    } else {
      text(`v = ${velA.toFixed(2)} m/s`, xA, height / 2 - 40);
    }

    fill(100, 100, 255);
    if (t < delayB) {
      text(`Esperando ${(delayB - t).toFixed(2)}s`, xB, height / 2 + 40);
    } else {
      text(`v = ${velB.toFixed(2)} m/s`, xB, height / 2 + 40);
    }

    // Verificar si hay encuentro
    let distanciaActual = Math.abs(posActualA - posActualB);
    // metros de tolerancia para detectar encuentro

    if (distanciaActual < tolerancia && t >= delayA && t >= delayB) {
      // Marcar punto de encuentro
      fill(0, 200, 0);
      noStroke();
      ellipse((xA + xB) / 2, height / 2, 20, 20);
      encontraron = true;
      // Mostrar mensaje de encuentro
      const posEncuentro = (posActualA + posActualB) / 2;
      console.log(posA, posB, posEncuentro);
      console.log(velA);
      console.log(velB);
      if (velA < 0) {
        drawVectorX(posEncuentro, "Xf-A", color(0, 200, 100), 75, posA, 1, posEncuentro, true);
      } else {
        drawVectorX(posEncuentro, "Xf-A", color(0, 200, 100), 75, posA, 1, posEncuentro, false);
      }

      if (velB < 0) {
        drawVectorX(posEncuentro, "Xf-B", color(0, 100, 50), -75, posB, 1, posEncuentro, true);
      } else {
        drawVectorX(posEncuentro, "Xf-B", color(0, 100, 50), -75, posB, 1, posEncuentro, false);
      }
      // drawVectorX(posEncuentro, "Xf-A", color(0, 200, 100), 75,  posA, 1, posEncuentro, velA);
      // drawVectorX(posEncuentro, "Xf-B", color(0, 100, 50),-75, posB, 1, posEncuentro, velB);
      iniciarSimulacionBut.disabled = false;
      multTiempoSimulacion.disabled = false;
    }

    tiempoSimulado.textContent = `Tiempo simulado: ${t.toFixed(2)} s`;
    // Incrementar tiempo
    if (!encontraron) t += tiempoIncremento
    else {
      tiempoSimulado.textContent = `Tiempo simulado: ${tEncuentro.toFixed(2)} s`;
    }

    // Detener si los móviles salen del canvas
    if (xA < -50 || xA > width + 50 || xB < -50 || xB > width + 50) {
      if (t > 20) { // Solo detener después de cierto tiempo para dar oportunidad al encuentro
        simulando = false;
        cancelAnimationFrame(animacionID);
      }
    }
  } else {
    // Mostrar posición inicial cuando no hay simulación
    const centroCanvas = width / 2;
    textSize(20);
    // Dibujar móvil A (rojo)
    fill(255, 100, 100);
    noStroke();
    ellipse((centroCanvas + posA * escala) || centroCanvas, height / 2 - 20, 30, 30);
    fill(0);
    text("A", (centroCanvas + posA * escala) || centroCanvas, height / 2 - 20);

    // Dibujar móvil B (azul)
    fill(100, 100, 255);
    noStroke();
    ellipse((centroCanvas + posB * escala) || centroCanvas, height / 2 + 20, 30, 30);
    fill(0);
    text("B", (centroCanvas + posB * escala) || centroCanvas, height / 2 + 20);

    // Instrucciones
    fill(80);
    textSize(20);
    iniciarSimulacionBut.disabled = false;
    text("Ingresa los datos y presiona 'Iniciar Simulación'", width / 2, height / 2 - 60);
  }
}

/**
 * Limpia la simulación y restablece los valores
 */
function limpiarSimulacion() {
  // Detener simulación en curso
  if (simulando) {
    cancelAnimationFrame(animacionID);
    simulando = false;
  }

  // Limpiar campos de entrada
  document.getElementById("posA").value = "";
  document.getElementById("velA").value = "";
  document.getElementById("posB").value = "";
  document.getElementById("velB").value = "";
  if (delayBInput) {
    delayBInput.value = "0";
  }
  if (delayAInput) {
    delayAInput.value = "0";
  }

  // Restablecer unidades
  document.getElementById("unidadPosA").selectedIndex = 0;
  document.getElementById("unidadVelA").selectedIndex = 0;
  document.getElementById("unidadPosB").selectedIndex = 0;
  document.getElementById("unidadVelB").selectedIndex = 0;

  // Limpiar resultado
  resultado.textContent = "El resultado se mostrará aquí";
  resultado.style.color = "inherit";
  document.getElementById("velocidadSimulacion").disabled = false;

  // Redibujar canvas vacío
  t = 0;
  delayA = 0;
  delayB = 0;
  tiempoEncuentro = null;
  posicionEncuentro = null;
  draw();
}
/**
 * Redibuja la simulación con la nueva escala
 */
function redrawSimulation() {
  predecirEncuentro()
  if (!simulando) return;
  draw();
}

/**
 * Muestra un mensaje de error
 */
function mostrarError(mensaje) {
  resultado.textContent = mensaje;
  resultado.style.color = "red";
}

/**
 * Ajusta el tamaño del canvas cuando cambia el tamaño de la ventana
 */
function windowResized() {
  windowWidth = window.innerWidth;
  resizeCanvas(windowWidth - 30, 200);

  // Redibujar la simulación si está en curso
  if (simulando) {
    redrawSimulation();
  } else {
    draw();
  }
}

function inicioEscala() {
  escalaInput.value = 1;
  posAMetros.value = "m"

}
function reiniciarSimulacion() {
  cancelAnimationFrame(animacionID);
  t = 0;
  simulando = false;
  xA = null;
  xB = null;
  tiempoEncuentro = null;
  posicionEncuentro = null;
  encontraron = false;
  predecirEncuentro();
  draw();
}