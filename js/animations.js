// Animaciones para la página de inicio

document.addEventListener("DOMContentLoaded", () => {
  // Animación de scroll reveal
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate")
      }
    })
  }, observerOptions)

  // Observar elementos con clase scroll-animate
  const scrollElements = document.querySelectorAll(".scroll-animate")
  scrollElements.forEach((el) => observer.observe(el))

  // Efecto de typing para el título principal
  const heroTitle = document.querySelector(".hero-title")
  if (heroTitle) {
    const originalText = heroTitle.textContent
    heroTitle.textContent = ""

    setTimeout(() => {
      typeWriter(heroTitle, originalText, 100)
    }, 1000)
  }

  // Animación de contador para estadísticas (si las hay)
  const counters = document.querySelectorAll(".counter")
  counters.forEach((counter) => {
    const target = Number.parseInt(counter.getAttribute("data-target"))
    const duration = 2000
    const increment = target / (duration / 16)
    let current = 0

    const updateCounter = () => {
      current += increment
      if (current < target) {
        counter.textContent = Math.floor(current)
        requestAnimationFrame(updateCounter)
      } else {
        counter.textContent = target
      }
    }

    // Iniciar contador cuando el elemento sea visible
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateCounter()
          counterObserver.unobserve(entry.target)
        }
      })
    })

    counterObserver.observe(counter)
  })

  // Animación de las tarjetas de características
  const featureCards = document.querySelectorAll(".feature-card")
  featureCards.forEach((card, index) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-15px) scale(1.02)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  })

  // Animación de las fórmulas
  const formulas = document.querySelectorAll(".formula")
  formulas.forEach((formula, index) => {
    formula.addEventListener("mouseenter", function () {
      this.style.transform = "translateX(10px) scale(1.05)"
    })

    formula.addEventListener("mouseleave", function () {
      this.style.transform = "translateX(0) scale(1)"
    })
  })

  // Efecto parallax suave para el hero
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const heroSection = document.querySelector(".hero-inicio")

    if (heroSection) {
      const rate = scrolled * -0.5
      heroSection.style.transform = `translateY(${rate}px)`
    }
  })

  // Animación de botones con efecto ripple
  const buttons = document.querySelectorAll(".btn-primary, .btn-secondary")
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span")
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.width = ripple.style.height = size + "px"
      ripple.style.left = x + "px"
      ripple.style.top = y + "px"
      ripple.classList.add("ripple")

      this.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })

  // Animación de carga progresiva de elementos
  const animateElements = document.querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right")
  animateElements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = "1"
      element.style.transform = "translateY(0) translateX(0)"
    }, index * 100)
  })
})

// Función de typewriter mejorada
function typeWriter(element, text, speed = 50) {
  element.innerHTML = ""
  element.style.borderRight = "2px solid white"

  let i = 0
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
      setTimeout(type, speed)
    } else {
      // Efecto de cursor parpadeante
      setTimeout(() => {
        element.style.borderRight = "none"
      }, 1000)
    }
  }

  type()
}

// Agregar estilos CSS para el efecto ripple
const rippleStyle = document.createElement("style")
rippleStyle.textContent = `
    .btn-primary, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`
document.head.appendChild(rippleStyle)
