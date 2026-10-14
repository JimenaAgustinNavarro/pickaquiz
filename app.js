/**
 * PICKADELI - PickaQuiz
 * Archivo principal de JavaScript vanilla
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initUserProfile();
  initQuiz();
  actualizarPuntosUI();
});

/**
 * 1. Efecto de sombra en el Navbar al hacer scroll
 */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 2. Menú Responsive tipo Hamburguesa
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggleBtn.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Función global para consultar los puntos acumulados del usuario.
 */
window.obtenerPuntos = function() {
  const pts = localStorage.getItem('pickadeli_puntos');
  return pts !== null ? parseInt(pts, 10) : 0;
};

/**
 * Función global auxiliar para obtener intentos de quiz
 */
window.obtenerIntentos = function() {
  const intentos = localStorage.getItem('pickadeli_intentos');
  return intentos !== null ? parseInt(intentos, 10) : 0;
};

/**
 * Función global para obtener los vales canjeados
 */
window.obtenerVales = function() {
  try {
    const vales = localStorage.getItem('pickadeli_vales');
    return vales ? JSON.parse(vales) : [];
  } catch (e) {
    console.warn('Error al leer pickadeli_vales de localStorage:', e);
    return [];
  }
};

/**
 * Sincroniza la cantidad de puntos en la UI (Navbar y modal de perfil si está abierto)
 */
function actualizarPuntosUI() {
  const puntos = window.obtenerPuntos();
  const navBadge = document.getElementById('nav-points-badge');

  if (navBadge) {
    navBadge.textContent = `⭐ ${puntos} pts`;
    navBadge.classList.remove('badge-updated');
    void navBadge.offsetWidth; // Forzar reflow
    navBadge.classList.add('badge-updated');
  }

  // Si el modal de perfil está en el DOM, sincronizar nivel y botón
  actualizarNivelUsuario(puntos);
}

/**
 * Calcula y actualiza el nivel de Picker según los puntos
 */
function actualizarNivelUsuario(puntos) {
  const levelBadge = document.getElementById('profile-level-badge');
  if (!levelBadge) return;

  if (puntos >= 100) {
    levelBadge.textContent = "🏆 Picker Nivel 3";
  } else if (puntos >= 50) {
    levelBadge.textContent = "🌟 Picker Nivel 2";
  } else {
    levelBadge.textContent = "🌱 Picker Nivel 1";
  }
}

/**
 * Genera un código único de cupón con formato "PICKA-XXXX"
 */
function generarCodigoVale() {
  const digitos = Math.floor(1000 + Math.random() * 9000);
  return `PICKA-${digitos}`;
}


/* ==========================================================
   3. VISTA DE PERFIL DE DANIELA (PROMPT 3)
   ========================================================== */

function initUserProfile() {
  const btnProfile = document.getElementById('btn-profile');
  const modalProfile = document.getElementById('profile-modal');
  const btnCloseX = document.getElementById('btn-profile-close-x');
  const btnCloseBottom = document.getElementById('btn-profile-close-bottom');
  const btnRedeem = document.getElementById('btn-redeem-coupon');

  if (!btnProfile || !modalProfile) return;

  // Abrir perfil al hacer click en el navbar
  btnProfile.addEventListener('click', () => {
    abrirPerfil();
  });

  // Accesibilidad por teclado
  btnProfile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrirPerfil();
    }
  });

  // Cerrar perfil
  if (btnCloseX) btnCloseX.addEventListener('click', cerrarPerfil);
  if (btnCloseBottom) btnCloseBottom.addEventListener('click', cerrarPerfil);

  // Cerrar al presionar Escape o clic fuera
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalProfile.classList.contains('open')) {
      cerrarPerfil();
    }
  });

  modalProfile.addEventListener('click', (e) => {
    if (e.target === modalProfile) {
      cerrarPerfil();
    }
  });

  // Botón de canje de vale
  if (btnRedeem) {
    btnRedeem.addEventListener('click', () => {
      canjearVale();
    });
  }
}

/**
 * Abre el modal de perfil y refresca los datos desde localStorage
 */
function abrirPerfil() {
  const modalProfile = document.getElementById('profile-modal');
  const pointsDisplay = document.getElementById('profile-points-display');
  const successCard = document.getElementById('coupon-success-card');

  if (!modalProfile) return;

  modalProfile.classList.add('open');
  modalProfile.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Ocultar mensaje de cupón reciente al abrir de nuevo
  if (successCard) {
    successCard.style.display = 'none';
  }

  const puntosActuales = window.obtenerPuntos();

  // Animar contador de puntos desde 0 hasta el valor real
  animarPuntosPerfil(0, puntosActuales, 800);

  // Actualizar nivel
  actualizarNivelUsuario(puntosActuales);

  // Actualizar estado del botón de canje
  actualizarEstadoCanje(puntosActuales);

  // Renderizar vales canjeados previos
  renderizarValesCanjeados();

  // Renderizar historial de actividad
  renderizarHistorialActividad();
}

/**
 * Cierra el modal de perfil
 */
function cerrarPerfil() {
  const modalProfile = document.getElementById('profile-modal');
  if (!modalProfile) return;

  modalProfile.classList.remove('open');
  modalProfile.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Sincronizar badge en navbar al cerrar
  actualizarPuntosUI();
}

/**
 * Anima el contador de puntos en la tarjeta de perfil
 */
function animarPuntosPerfil(inicio, fin, duracionMs = 800) {
  const display = document.getElementById('profile-points-display');
  if (!display) return;

  if (fin === 0) {
    display.textContent = '0';
    return;
  }

  const diff = fin - inicio;
  const paso = diff > 0 ? Math.max(1, Math.round(diff / 25)) : Math.min(-1, Math.round(diff / 25));
  let valor = inicio;
  const intervaloMs = duracionMs / Math.abs(diff / paso);

  const timer = setInterval(() => {
    valor += paso;
    if ((paso > 0 && valor >= fin) || (paso < 0 && valor <= fin)) {
      valor = fin;
      clearInterval(timer);
    }
    display.textContent = valor;
  }, Math.max(16, intervaloMs));
}

/**
 * Actualiza el estado visual y habilitación del botón de canje
 */
function actualizarEstadoCanje(puntos) {
  const btnRedeem = document.getElementById('btn-redeem-coupon');
  const statusMsg = document.getElementById('reward-status-msg');

  if (!btnRedeem || !statusMsg) return;

  const COSTO_VALE = 50;

  if (puntos >= COSTO_VALE) {
    btnRedeem.disabled = false;
    btnRedeem.querySelector('span').textContent = "Canjear";
    statusMsg.textContent = "¡Tienes puntos suficientes para canjear!";
    statusMsg.className = "reward-status-msg status-ok";
  } else {
    btnRedeem.disabled = true;
    btnRedeem.querySelector('span').textContent = "Canjear";
    const faltan = COSTO_VALE - puntos;
    statusMsg.textContent = `Te faltan ${faltan} puntos para canjear este vale.`;
    statusMsg.className = "reward-status-msg status-error";
  }
}

/**
 * Lógica de canje de vale (resta 50 pts, genera código, guarda en localStorage)
 */
function canjearVale() {
  const puntosActuales = window.obtenerPuntos();
  const COSTO_VALE = 50;

  if (puntosActuales < COSTO_VALE) return;

  // 1. Restar 50 puntos
  const nuevosPuntos = puntosActuales - COSTO_VALE;
  localStorage.setItem('pickadeli_puntos', nuevosPuntos.toString());

  // 2. Generar código de vale
  const codigo = generarCodigoVale();
  const fechaActual = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 3. Guardar en pickadeli_vales
  const vales = window.obtenerVales();
  const nuevoVale = {
    id: Date.now(),
    codigo: codigo,
    fecha: fechaActual,
    descuento: '10%'
  };
  vales.unshift(nuevoVale);
  localStorage.setItem('pickadeli_vales', JSON.stringify(vales));

  // 4. Actualizar contador animado en perfil
  animarPuntosPerfil(puntosActuales, nuevosPuntos, 500);

  // 5. Actualizar badge del navbar y nivel
  actualizarPuntosUI();

  // 6. Mostrar tarjeta de cupón canjeado con éxito
  const successCard = document.getElementById('coupon-success-card');
  const codeValEl = document.getElementById('new-coupon-code');
  if (successCard && codeValEl) {
    codeValEl.textContent = codigo;
    successCard.style.display = 'block';
  }

  // 7. Actualizar botón y estado de canje
  actualizarEstadoCanje(nuevosPuntos);

  // 8. Renderizar vales e historial de actividad
  renderizarValesCanjeados();
  renderizarHistorialActividad();

  console.log(`PickaQuiz: Vale canjeado exitosamente con código ${codigo}. Puntos restantes: ${nuevosPuntos}`);
}

/**
 * Renderiza la lista de vales canjeados por el usuario
 */
function renderizarValesCanjeados() {
  const wrapper = document.getElementById('claimed-coupons-wrapper');
  const listEl = document.getElementById('coupons-list');
  if (!wrapper || !listEl) return;

  const vales = window.obtenerVales();

  if (vales.length === 0) {
    wrapper.style.display = 'none';
    listEl.innerHTML = '';
    return;
  }

  wrapper.style.display = 'block';
  listEl.innerHTML = '';

  vales.forEach(v => {
    const item = document.createElement('div');
    item.className = 'coupon-item';
    item.innerHTML = `
      <div class="coupon-item-left">
        <span class="coupon-item-code">${v.codigo}</span>
        <span class="coupon-item-desc">10% de descuento</span>
      </div>
      <span class="coupon-item-date">${v.fecha}</span>
    `;
    listEl.appendChild(item);
  });
}

/**
 * Renderiza el historial de actividad reciente del usuario
 */
function renderizarHistorialActividad() {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;

  activityList.innerHTML = '';

  const intentos = window.obtenerIntentos();
  const vales = window.obtenerVales();

  if (intentos === 0 && vales.length === 0) {
    activityList.innerHTML = `
      <p class="activity-empty-msg">Aún no tienes actividad. ¡Juega el quiz para ganar tus primeros puntos!</p>
    `;
    return;
  }

  // Actividades de vales canjeados
  vales.forEach(v => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="activity-desc">
        <span>🎟️</span>
        <span>Canjeaste un vale de 10% (${v.codigo})</span>
      </span>
      <span class="activity-pts-loss">-50 pts</span>
    `;
    activityList.appendChild(item);
  });

  // Actividad de partidas de quiz jugadas
  if (intentos > 0) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="activity-desc">
        <span>🎮</span>
        <span>Completaste el Quiz (${intentos} ${intentos === 1 ? 'partida' : 'partidas'})</span>
      </span>
      <span class="activity-pts-gain">+ Puntos acumulados</span>
    `;
    activityList.appendChild(item);
  }
}


/* ==========================================================
   4. LÓGICA COMPLETA DEL QUIZ PICKADELI
   ========================================================== */

/**
 * Banco de preguntas temáticas sobre el menú y nutrición de Pickadeli
 */
const BANCO_PREGUNTAS = [
  {
    pregunta: "¿Cuál de estos es un ingrediente estrella y saludable en nuestras ensaladas?",
    opciones: ["Palta fuerte fresca", "Aceite vegetal hidrogenado", "Embutidos ultraprocesados", "Aderezos con azúcar añadida"],
    correcta: "Palta fuerte fresca"
  },
  {
    pregunta: "¿Qué bebida 100% natural acompaña mejor un bowl saludable en Pickadeli?",
    opciones: ["Jugo natural de maracuyá y chía", "Gaseosa oscura con azúcar", "Bebida energética con taurina", "Refresco en polvo con colorantes"],
    correcta: "Jugo natural de maracuyá y chía"
  },
  {
    pregunta: "¿Cuál de los siguientes es un postre saludable libre de azúcares refinados?",
    opciones: ["Mousse de palta y cacao al 70%", "Torta industrial con chantilly", "Donas fritas glaseadas", "Churros rellenos de manjar"],
    correcta: "Mousse de palta y cacao al 70%"
  },
  {
    pregunta: "¿Qué superalimento andino de alto valor proteico es la base de nuestros bowls nutritivos?",
    opciones: ["Quinua perlada orgánica", "Fideos blancos precocidos", "Harina de trigo refinada", "Snacks salados fritos"],
    correcta: "Quinua perlada orgánica"
  },
  {
    pregunta: "¿Cuál es el lema principal que inspira la cocina y filosofía de Pickadeli?",
    opciones: ["Comida rica, vida sana.", "Rápido y sin nutrientes.", "Solo grasas saturadas.", "Come poco y apurado."],
    correcta: "Comida rica, vida sana."
  }
];

/**
 * Función utilitaria para desordenar un arreglo (Fisher-Yates)
 */
function mezclarArreglo(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Módulo principal del Quiz
 */
function initQuiz() {
  // Elementos del DOM
  const modalOverlay = document.getElementById('quiz-modal');
  const btnOpenQuiz = document.getElementById('btn-open-quiz');
  const btnCloseX = document.getElementById('btn-quiz-close-x');
  const btnCloseStart = document.getElementById('btn-quiz-close-start');
  const btnCloseResults = document.getElementById('btn-quiz-close-results');
  const btnStartQuiz = document.getElementById('btn-quiz-start');
  const btnNext = document.getElementById('btn-quiz-next');
  const btnRetry = document.getElementById('btn-quiz-retry');

  // Pantallas
  const screenStart = document.getElementById('quiz-screen-start');
  const screenQuestion = document.getElementById('quiz-screen-question');
  const screenResults = document.getElementById('quiz-screen-results');

  // Elementos dinámicos de la pregunta
  const questionCounter = document.getElementById('quiz-question-counter');
  const progressBar = document.getElementById('quiz-progress-bar');
  const questionTitle = document.getElementById('quiz-question-title');
  const optionsContainer = document.getElementById('quiz-options-container');
  const floatingFeedback = document.getElementById('quiz-floating-feedback');

  // Elementos de resultados
  const finalScoreEl = document.getElementById('quiz-final-score');
  const resultMessageEl = document.getElementById('quiz-result-message');
  const summaryListEl = document.getElementById('quiz-summary-list');
  const confettiContainer = document.getElementById('quiz-confetti-container');
  const resultsIconEl = document.getElementById('quiz-results-icon');

  if (!modalOverlay || !btnOpenQuiz) return;

  // Estado del juego
  let preguntasPartida = [];
  let indiceActual = 0;
  let puntajeActual = 0;
  let respondido = false;
  let registroRespuestas = [];

  // 1. Abrir y Cerrar Modal Quiz
  const abrirModal = () => {
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mostrarPantalla(screenStart);
  };

  const cerrarModal = () => {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    limpiarConfetti();
    // Al cerrar el quiz, actualizar badge de puntos en el navbar
    actualizarPuntosUI();
  };

  btnOpenQuiz.addEventListener('click', abrirModal);
  if (btnCloseX) btnCloseX.addEventListener('click', cerrarModal);
  if (btnCloseStart) btnCloseStart.addEventListener('click', cerrarModal);
  if (btnCloseResults) btnCloseResults.addEventListener('click', cerrarModal);

  // Cerrar al presionar Escape o hacer click en el overlay oscuro
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      cerrarModal();
    }
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      cerrarModal();
    }
  });

  // 2. Cambiar entre pantallas del Modal
  function mostrarPantalla(pantalla) {
    [screenStart, screenQuestion, screenResults].forEach(s => {
      if (s) {
        s.classList.remove('active');
      }
    });
    if (pantalla) {
      pantalla.classList.add('active');
    }
  }

  // 3. Iniciar Partida
  function comenzarPartida() {
    limpiarConfetti();
    preguntasPartida = mezclarArreglo(BANCO_PREGUNTAS).map(item => ({
      pregunta: item.pregunta,
      correcta: item.correcta,
      opciones: mezclarArreglo(item.opciones)
    }));

    indiceActual = 0;
    puntajeActual = 0;
    registroRespuestas = [];
    respondido = false;

    mostrarPantalla(screenQuestion);
    renderizarPregunta();
  }

  btnStartQuiz.addEventListener('click', comenzarPartida);
  btnRetry.addEventListener('click', comenzarPartida);

  // 4. Renderizar Pregunta
  function renderizarPregunta() {
    respondido = false;
    btnNext.disabled = true;

    const total = preguntasPartida.length;
    const item = preguntasPartida[indiceActual];

    questionCounter.textContent = `Pregunta ${indiceActual + 1} de ${total}`;
    const porcentajeProgreso = ((indiceActual + 1) / total) * 100;
    progressBar.style.width = `${porcentajeProgreso}%`;

    questionTitle.textContent = item.pregunta;

    floatingFeedback.classList.remove('show-pop');

    optionsContainer.innerHTML = '';
    item.opciones.forEach((opcionTexto) => {
      const botonOpcion = document.createElement('button');
      botonOpcion.className = 'quiz-option-btn';
      botonOpcion.type = 'button';
      botonOpcion.innerHTML = `
        <span class="option-text">${opcionTexto}</span>
        <span class="option-badge"></span>
      `;

      botonOpcion.addEventListener('click', () => {
        seleccionarOpcion(botonOpcion, opcionTexto, item);
      });

      optionsContainer.appendChild(botonOpcion);
    });
  }

  // 5. Manejo de Selección de Opción
  function seleccionarOpcion(botonSeleccionado, textoSeleccionado, datosPregunta) {
    if (respondido) return;
    respondido = true;

    const esCorrecta = textoSeleccionado === datosPregunta.correcta;
    botonSeleccionado.classList.add('selected');

    const todosBotones = optionsContainer.querySelectorAll('.quiz-option-btn');
    todosBotones.forEach(btn => btn.classList.add('disabled'));

    if (esCorrecta) {
      botonSeleccionado.classList.add('correct');
      const badge = botonSeleccionado.querySelector('.option-badge');
      if (badge) badge.textContent = '✓';

      puntajeActual += 20;

      floatingFeedback.classList.remove('show-pop');
      void floatingFeedback.offsetWidth;
      floatingFeedback.classList.add('show-pop');
    } else {
      botonSeleccionado.classList.add('incorrect');
      const badge = botonSeleccionado.querySelector('.option-badge');
      if (badge) badge.textContent = '✗';

      todosBotones.forEach(btn => {
        const txt = btn.querySelector('.option-text')?.textContent;
        if (txt === datosPregunta.correcta) {
          btn.classList.add('correct');
          const correctBadge = btn.querySelector('.option-badge');
          if (correctBadge) correctBadge.textContent = '✓';
        }
      });
    }

    registroRespuestas.push({
      pregunta: datosPregunta.pregunta,
      elegida: textoSeleccionado,
      correcta: datosPregunta.correcta,
      esCorrecta: esCorrecta
    });

    setTimeout(() => {
      btnNext.disabled = false;
      btnNext.focus();
    }, 800);
  }

  // 6. Botón Siguiente Pregunta o Resultados
  btnNext.addEventListener('click', () => {
    if (!respondido) return;

    if (indiceActual < preguntasPartida.length - 1) {
      indiceActual++;
      renderizarPregunta();
    } else {
      mostrarResultados();
    }
  });

  // 7. Pantalla de Resultados y Persistencia
  function mostrarResultados() {
    mostrarPantalla(screenResults);

    guardarPuntosLocalStorage(puntajeActual);
    animarPuntaje(puntajeActual);
    definirMensajeResultado(puntajeActual);
    renderizarResumen();

    if (puntajeActual === 100) {
      dispararConfetti();
    }

    // Actualizar puntos inmediatamente en el navbar
    actualizarPuntosUI();
  }

  function guardarPuntosLocalStorage(puntosNuevos) {
    try {
      const puntosPrevios = parseInt(localStorage.getItem('pickadeli_puntos') || '0', 10);
      const totalPuntos = puntosPrevios + puntosNuevos;
      localStorage.setItem('pickadeli_puntos', totalPuntos.toString());

      const intentosPrevios = parseInt(localStorage.getItem('pickadeli_intentos') || '0', 10);
      localStorage.setItem('pickadeli_intentos', (intentosPrevios + 1).toString());

      console.log(`PickaQuiz: Guardados ${puntosNuevos} pts. Total acumulado: ${totalPuntos} pts.`);
    } catch (err) {
      console.warn('No se pudo guardar en localStorage:', err);
    }
  }

  function animarPuntaje(target) {
    let actual = 0;
    finalScoreEl.textContent = '0';
    if (target === 0) return;

    const duracion = 1200;
    const paso = Math.max(1, Math.round(target / 30));
    const intervaloMs = duracion / (target / paso);

    const timer = setInterval(() => {
      actual += paso;
      if (actual >= target) {
        actual = target;
        clearInterval(timer);
      }
      finalScoreEl.textContent = actual;
    }, intervaloMs);
  }

  function definirMensajeResultado(puntos) {
    if (puntos === 100) {
      resultMessageEl.textContent = "¡PERFECTO! Eres un Picker experto 🏆";
      resultMessageEl.style.color = "var(--verde-oscuro)";
      resultsIconEl.textContent = "🏆";
    } else if (puntos >= 60) {
      resultMessageEl.textContent = "¡Muy bien! Casi perfecto 🌟";
      resultMessageEl.style.color = "var(--verde-principal)";
      resultsIconEl.textContent = "🌟";
    } else if (puntos === 40) {
      resultMessageEl.textContent = "Buen intento, sigue practicando 💪";
      resultMessageEl.style.color = "var(--naranja-acento)";
      resultsIconEl.textContent = "💪";
    } else {
      resultMessageEl.textContent = "¡Vuelve a intentarlo! 🍀";
      resultMessageEl.style.color = "var(--gris-medio)";
      resultsIconEl.textContent = "🍀";
    }
  }

  function renderizarResumen() {
    summaryListEl.innerHTML = '';

    registroRespuestas.forEach((item, index) => {
      const summaryItem = document.createElement('div');
      summaryItem.className = `quiz-summary-item ${item.esCorrecta ? 'correct' : 'incorrect'}`;

      summaryItem.innerHTML = `
        <span class="summary-icon">${item.esCorrecta ? '✓' : '✗'}</span>
        <div class="summary-info">
          <p class="summary-q-text">${index + 1}. ${item.pregunta}</p>
          ${!item.esCorrecta ? `<p class="summary-corr-ans">Respuesta correcta: <strong>${item.correcta}</strong></p>` : ''}
        </div>
      `;

      summaryListEl.appendChild(summaryItem);
    });
  }

  function dispararConfetti() {
    limpiarConfetti();
    const colores = ['#7CB342', '#558B2F', '#FF9800', '#FFC107', '#FFFFFF'];
    const cantidad = 45;

    for (let i = 0; i < cantidad; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 1.5}s`;
      piece.style.animationDuration = `${2 + Math.random() * 2}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.width = `${6 + Math.random() * 8}px`;
      piece.style.height = `${8 + Math.random() * 10}px`;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confettiContainer.appendChild(piece);
    }
  }

  function limpiarConfetti() {
    if (confettiContainer) {
      confettiContainer.innerHTML = '';
    }
  }
}
