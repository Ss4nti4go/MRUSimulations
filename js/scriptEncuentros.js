function calcularEncuentro() {
    const posA = parseFloat(document.getElementById("posA").value);
    const velA = parseFloat(document.getElementById("velA").value);
    const posB = parseFloat(document.getElementById("posB").value);
    const velB = parseFloat(document.getElementById("velB").value);
  
    const resultado = document.getElementById("resultadoEncuentro");
  
    if (isNaN(posA) || isNaN(velA) || isNaN(posB) || isNaN(velB)) {
      resultado.textContent = "Por favor, completa todos los campos.";
      resultado.style.color = "red";
      return;
    }
  
    const diferenciaVel = velA - velB;
  
    if (diferenciaVel === 0) {
      resultado.textContent = "Los móviles nunca se encuentran (velocidades iguales).";
      resultado.style.color = "red";
      return;
    }
  
    const tiempo = (posB - posA) / diferenciaVel;
    const posicion = posA + velA * tiempo;
  
    if (tiempo < 0) {
      resultado.textContent = "El encuentro ocurrió en el pasado.";
      resultado.style.color = "red";
      return;
    }
  
    resultado.textContent = `Se encuentran a los ${tiempo.toFixed(2)} segundos en la posición ${posicion.toFixed(2)} metros.`;
    resultado.style.color = "green";
  }
  function typeWriter(element, text, speed = 50) {
    element.innerHTML = ''; 
    element.classList.add('typing-effect');
    
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
      
        setTimeout(() => {
          element.classList.remove('typing-effect');
        }, 1000);
      }
    }
    
    type();
  }