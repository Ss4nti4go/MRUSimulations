// Variables globales
let posA, velA, posB, velB;
let xA, xB;
let escala = 1; 
let t;
let tiempoIncremento = 0.0025;
let simulando = false;
let tiempoEncuentro = null;
let posicionEncuentro = null;
let canvas;
let animacionID;
let windowWidth;
let marcaDistancia;
const aplicarEscalaBut = document.getElementById("aplicarEscalaBut");
const activarAutoEscalado = document.getElementById("activarAutoEscala");
const multTiempoSimulacion = document.getElementById("velocidadSimulacion");
const resultado = document.getElementById("resultadoEncuentro");
const escalaInput = document.getElementById("escalaInput");
const limpiarBtn = document.getElementById("limpiar");
activarAutoEscalado.addEventListener('change', () => {
  if (activarAutoEscalado.checked) {
    escalaInput.disabled = true;
    aplicarEscalaBut.disabled = true;
  } else {
    escalaInput.disabled = false;
    aplicarEscalaBut.disabled = false;
  }
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
  if (multTiempoSimulacion.value == 50) {
    tiempoIncremento = 0.5;
  }
})
document.querySelector('input').addEventListener('change', ajustarEscala);
document.querySelector('select').addEventListener('change', redrawSimulation);
document.addEventListener('DOMContentLoaded', function () {
  redrawSimulation();
  // Configurar el botón de limpiar
  limpiarBtn.addEventListener('click', limpiarSimulacion);

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

/**
 * Ajusta la escala manualmente según el valor ingresado por el usuario
 */
function ajustarEscala() {

  const nuevaEscala = parseFloat(escalaInput.value);
  if (!isNaN(nuevaEscala) && nuevaEscala > 0) {
    escala = nuevaEscala;
    console.log("Nueva escala aplicada:", escala, "px por metro");

    // Si hay una simulación en curso, actualizar la visualización
    if (simulando) {
      redrawSimulation();
    }
  } else {
    mostrarError("Por favor, ingrese un valor válido y mayor que cero para la escala.");
  }
}
/**
 * Ajusta la escala automáticamente basada en las posiciones y velocidades
 */
function ajustarEscalaAuto() {
  // Convertir todas las unidades a metros y m/s

    
    const posAMetros = convertirDistancia(posA, document.getElementById("unidadPosA").value);
    const posBMetros = convertirDistancia(posB, document.getElementById("unidadPosB").value);
    const velAMps = convertirVelocidad(velA, document.getElementById("unidadVelA").value);
    const velBMps = convertirVelocidad(velB, document.getElementById("unidadVelB").value);

    // Calcular la distancia máxima que podrían recorrer en 20 segundos (tiempo arbitrario para visualización)
    const tiempoSimulacion = 10; // segundos
    const distanciaMaximaA = posAMetros + Math.abs(velAMps) * tiempoSimulacion;
    const distanciaMaximaB = posBMetros + Math.abs(velBMps) * tiempoSimulacion;
    const distanciaTotal = Math.max(distanciaMaximaA, distanciaMaximaB);

    // Calcular la escala para que la distancia total quepa en el canvas con un margen
    const margen = 100; // píxeles de margen
    const nuevaEscala = (canvas.width - margen) / distanciaTotal;

    // Limitar la escala para que no sea ni muy pequeña ni muy grande
    escala = Math.min(Math.max(nuevaEscala, 0.1), 50);

    // Actualizar el input de escala
    escalaInput.value = escala.toFixed(2);
    console.log("Escala ajustada automáticamente:", escala, "px por metro");
    redrawSimulation();

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

  // Obtener datos del formulario
  const posAInput = parseFloat(document.getElementById("posA").value);
  const posBInput = parseFloat(document.getElementById("posB").value);
  const velAInput = parseFloat(document.getElementById("velA").value);
  const velBInput = parseFloat(document.getElementById("velB").value);

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

  // Ajustar escala automáticamente
  if(activarAutoEscalado.checked){
  ajustarEscalaAuto();
  }else{
    escala = parseFloat(document.getElementById("escalaInput").value);
  }

  // Calcular el punto de encuentro
  const encuentro = calcularEncuentro();

  if (encuentro) {
    tiempoEncuentro = encuentro.tiempo;
    posicionEncuentro = encuentro.posicion;

    // Mostrar resultado con unidades originales
    const unidadPosOriginal = document.getElementById("unidadPosA").value;
    const posicionMostrar = unidadPosOriginal === "km" ? posicionEncuentro / 1000 : posicionEncuentro;

    resultado.textContent = `Se encontrarán a los ${tiempoEncuentro.toFixed(2)} s en la posición ${posicionMostrar.toFixed(2)} ${unidadPosOriginal}`;
    resultado.style.color = "green";
  } else {
    tiempoEncuentro = null;
    posicionEncuentro = null;
    resultado.textContent = "No se detecta un encuentro con los datos proporcionados.";
    resultado.style.color = "orange";
  }

  // Reiniciar simulación
  t = 0;
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

/**
 * Dibuja un frame de la simulación
 */
function draw() {
  background(240);

  // Dibujar línea de referencia (eje X)
  stroke(180);
  line(0, height / 2, width, height / 2);
  //si esta en km que haga marcas cada 1000 metros
  if (document.getElementById("unidadPosB").value === "km" || document.getElementById("unidadPosA").value === "km") {
    marcaDistancia = 1000;
    escala = 0.1;
  } else {
    if (escala <= 0.3)
      marcaDistancia = 100;
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
  text("0", centroCanvas, height / 2 + 15);

  if (simulando) {
    // Calcular posiciones actuales
    const posActualA = posA + velA * t;
    const posActualB = posB + velB * t;

    // Convertir a coordenadas de pantalla (centradas en el canvas)
    xA = centroCanvas + posActualA * escala;
    xB = centroCanvas + posActualB * escala;

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

    // Mostrar velocidades
    fill(255, 100, 100);
    text(`v = ${velA.toFixed(2)} m/s`, xA, height / 2 - 40);
    fill(100, 100, 255);
    text(`v = ${velB.toFixed(2)} m/s`, xB, height / 2 + 40);

    // Verificar si hay encuentro
    const distanciaActual = Math.abs(posActualA - posActualB);
    const tolerancia = 0.1; // metros de tolerancia para detectar encuentro

    if (distanciaActual < tolerancia) {
      // Marcar punto de encuentro
      fill(0, 200, 0);
      noStroke();
      ellipse((xA + xB) / 2, height / 2, 20, 20);

      // Mostrar mensaje de encuentro
      const posEncuentro = (posActualA + posActualB) / 2;
      const unidadPosOriginal = document.getElementById("unidadPosA").value;
      const posicionMostrar = unidadPosOriginal === "km" ? posEncuentro / 1000 : posEncuentro;

      resultado.textContent = `¡Encuentro! A los ${t.toFixed(2)} s en la posición ${posicionMostrar.toFixed(2)} ${unidadPosOriginal}`;
      resultado.style.color = "green";

      // Detener simulación después de un breve momento
      if (tiempoEncuentro === null || Math.abs(t - tiempoEncuentro) < 0.1) {
        setTimeout(() => {
          simulando = false;
          cancelAnimationFrame(animacionID);
        }, 1000);
      }
    }
    
    // Incrementar tiempo
    t += tiempoIncremento;

    // Detener si los móviles salen del canvas
    if (xA < -50 || xA > width + 50 || xB < -50 || xB > width + 50) {
      if (t > 10) { // Solo detener después de cierto tiempo para dar oportunidad al encuentro
        simulando = false;
        cancelAnimationFrame(animacionID);
        resultado.textContent += " (Los móviles han salido del área visible)";
      }
    }
  } else {
    // Mostrar posición inicial cuando no hay simulación
    const centroCanvas = width / 2;

    // Dibujar móvil A (rojo)
    fill(255, 100, 100);
    noStroke();
    ellipse(centroCanvas, height / 2 - 20, 30, 30);
    fill(0);
    text("A", centroCanvas, height / 2 - 20);

    // Dibujar móvil B (azul)
    fill(100, 100, 255);
    noStroke();
    ellipse(centroCanvas, height / 2 + 20, 30, 30);
    fill(0);
    text("B", centroCanvas, height / 2 + 20);

    // Instrucciones
    fill(80);
    textSize(14);
    text("Ingresa los datos y presiona 'Iniciar Simulación'", width / 2, height / 2 - 60);
  }
}

/**
 * Calcula si hay un encuentro entre los dos móviles
 */
function calcularEncuentro() {
  // Si las velocidades son iguales, solo hay encuentro si las posiciones son iguales
  if (velA === velB) {
    if (posA === posB) {
      return { tiempo: 0, posicion: posA };
    }
    return null;
  }

  // Calcular tiempo de encuentro: t = (posB - posA) / (velA - velB)
  const tiempo = (posB - posA) / (velA - velB);

  // Si el tiempo es negativo, el encuentro ya ocurrió en el pasado
  if (tiempo < 0) {
    return null;
  }

  // Calcular posición de encuentro
  const posicion = posA + velA * tiempo;

  return { tiempo, posicion };
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

  // Restablecer unidades
  document.getElementById("unidadPosA").selectedIndex = 0;
  document.getElementById("unidadVelA").selectedIndex = 0;
  document.getElementById("unidadPosB").selectedIndex = 0;
  document.getElementById("unidadVelB").selectedIndex = 0;

  // Limpiar resultado
  resultado.textContent = "El resultado se mostrará aquí";
  resultado.style.color = "inherit";

  // Redibujar canvas vacío
  t = 0;
  tiempoEncuentro = null;
  posicionEncuentro = null;
  draw();
}

/**
 * Redibuja la simulación con la nueva escala
 */
function redrawSimulation() {
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