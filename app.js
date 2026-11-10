/**
 * PICKADELI - PickaQuiz
 * Archivo principal de JavaScript vanilla
 */

function crearReceta(id, nombre, emoji, dificultad, descripcion, ingredientes) {
  return { id, nombre, emoji, dificultad, descripcion, ingredientes, ordenMemorizar: [...ingredientes] };
}

const RECETAS = [
  crearReceta('hamburguesa', 'Hamburguesa Picka', '🍔', '⭐', 'Arma una hamburguesa clásica, capa por capa.', [
    { emoji: '🍞', nombre: 'Pan de abajo' },
    { emoji: '🥩', nombre: 'Carne' },
    { emoji: '🧀', nombre: 'Queso' },
    { emoji: '🥬', nombre: 'Lechuga' },
    { emoji: '🍅', nombre: 'Tomate' },
    { emoji: '🍞', nombre: 'Pan de arriba' }
  ]),
  crearReceta('bowl', 'Bowl Saludable', '🥗', '⭐⭐', 'Combina ingredientes frescos en el orden ideal.', [
    { emoji: '🍚', nombre: 'Base de quinua' },
    { emoji: '🥑', nombre: 'Palta' },
    { emoji: '🍗', nombre: 'Pollo grillado' },
    { emoji: '🍅', nombre: 'Tomate cherry' },
    { emoji: '🥬', nombre: 'Espinaca' },
    { emoji: '🌽', nombre: 'Maíz' },
    { emoji: '🥫', nombre: 'Aderezo' }
  ]),
  crearReceta('jugo', 'Jugo Natural', '🥤', '⭐⭐⭐', 'Prepara una mezcla refrescante de frutas.', [
    { emoji: '💧', nombre: 'Agua' },
    { emoji: '🍊', nombre: 'Naranja' },
    { emoji: '🍓', nombre: 'Fresa' },
    { emoji: '🍯', nombre: 'Miel' },
    { emoji: '🧊', nombre: 'Hielo' }
  ])
];

const RECOMPENSAS = [
  { id: 'descuento10', nombre: 'Vale de 10% de descuento', emoji: '🎟️', costo: 50, descripcion: '10% de descuento en tu próximo pedido.' },
  { id: 'bebida', nombre: 'Bebida gratis', emoji: '🥤', costo: 80, descripcion: 'Una bebida natural gratis en tu próxima compra.' },
  { id: 'postre', nombre: 'Postre gratis', emoji: '🍰', costo: 120, descripcion: 'Un postre saludable de cortesía.' },
  { id: 'combo', nombre: 'Combo sorpresa', emoji: '🎁', costo: 200, descripcion: 'Un combo sorpresa elegido por nuestros pickers.' }
];

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

window.guardarPuntos = function(puntosNuevos) {
  if (!Number.isFinite(puntosNuevos) || puntosNuevos < 0) {
    throw new TypeError('La cantidad de puntos debe ser un número válido y no negativo.');
  }
  const puntosActuales = window.obtenerPuntos();
  if (!Number.isFinite(puntosActuales) || puntosActuales < 0) {
    throw new Error('El total de puntos guardado no es válido.');
  }
  const totalPuntos = puntosActuales + puntosNuevos;
  localStorage.setItem('pickadeli_puntos', String(totalPuntos));
  return totalPuntos;
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
    const parsed = vales ? JSON.parse(vales) : [];
    if (!Array.isArray(parsed)) throw new TypeError('El historial de vales no tiene el formato esperado.');
    return parsed.filter(vale => vale && typeof vale === 'object');
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
 * Genera un código único de vale con formato "PICKA-XXXXXX".
 */
function generarCodigoVale() {
  const codigosExistentes = new Set(window.obtenerVales().map(vale => vale.codigo).filter(Boolean));
  let digitos;
  let codigo;
  do {
    digitos = Math.floor(100000 + Math.random() * 900000);
    codigo = `PICKA-${digitos}`;
  } while (codigosExistentes.has(codigo));
  return codigo;
}

function generarQR(contenedor, texto, tamaño) {
  if (!contenedor) throw new Error('No se encontró el contenedor del código QR.');
  if (typeof window.QRCode !== 'function') throw new Error('La librería para generar códigos QR no está disponible.');
  contenedor.replaceChildren();
  contenedor.setAttribute('aria-label', `Código QR ${texto}`);
  return new window.QRCode(contenedor, {
    text: texto,
    width: tamaño,
    height: tamaño,
    colorDark: '#2E2E2E',
    colorLight: '#FFFFFF',
    correctLevel: window.QRCode.CorrectLevel.H
  });
}

function descargarQR(contenedorQR, nombreArchivo) {
  if (!contenedorQR) throw new Error('No se encontró el código QR para descargar.');
  const canvas = contenedorQR.querySelector('canvas');
  const image = contenedorQR.querySelector('img');
  let dataUrl;
  if (canvas) {
    dataUrl = canvas.toDataURL('image/png');
  } else if (image && image.src.startsWith('data:image/png')) {
    dataUrl = image.src;
  } else {
    throw new Error('El código QR todavía no está listo para descargar.');
  }
  const link = document.createElement('a');
  link.download = `${nombreArchivo}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function obtenerRecompensa(idRecompensa) {
  return RECOMPENSAS.find(recompensa => recompensa.id === idRecompensa);
}

function normalizarVale(vale) {
  const idRecompensa = vale.tipo || 'descuento10';
  const recompensa = obtenerRecompensa(idRecompensa) || obtenerRecompensa('descuento10');
  return {
    ...vale,
    tipo: idRecompensa,
    nombre: vale.nombre || recompensa.nombre,
    emoji: vale.emoji || recompensa.emoji,
    puntos: Number.isFinite(Number(vale.puntos)) ? Number(vale.puntos) : recompensa.costo,
    codigo: typeof vale.codigo === 'string' ? vale.codigo : '',
    fecha: vale.fecha || ''
  };
}

function formatearFechaVale(fecha) {
  if (!fecha) return 'Fecha no disponible';
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return String(fecha);
  return parsed.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function mostrarErrorCanje(mensaje) {
  const errorEl = document.getElementById('reward-operation-error');
  if (errorEl) errorEl.textContent = mensaje;
}

function mostrarToastCopiado(mensaje, error = false) {
  const toast = document.getElementById('coupon-copy-toast');
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.toggle('is-error', error);
  if (toast._timer) window.clearTimeout(toast._timer);
  toast._timer = window.setTimeout(() => {
    toast.textContent = '';
  }, 1500);
}

function abrirModalQR(vale, botonOrigen) {
  const overlay = document.getElementById('qr-modal');
  const title = document.getElementById('qr-modal-title');
  const name = document.getElementById('qr-modal-name');
  const codeText = document.getElementById('qr-modal-code-text');
  const container = document.getElementById('qr-modal-code');
  if (!overlay || !vale.codigo) return;

  title.textContent = `${vale.emoji} Vale Pickadeli`;
  name.textContent = vale.nombre;
  codeText.textContent = vale.codigo;
  try {
    generarQR(container, vale.codigo, 320);
  } catch (error) {
    console.warn('No se pudo generar el QR ampliado:', error);
    mostrarErrorCanje('No se pudo generar el código QR. Recarga la página e inténtalo de nuevo.');
    return;
  }

  overlay.dataset.filename = vale.codigo;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  overlay._returnFocus = botonOrigen || document.activeElement;
  document.getElementById('btn-qr-modal-close').focus();
}

function cerrarModalQR() {
  const overlay = document.getElementById('qr-modal');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  const returnFocus = overlay._returnFocus;
  if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
}

async function copiarCodigoVale(codigo) {
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      throw new Error('El portapapeles no está disponible en este navegador.');
    }
    await navigator.clipboard.writeText(codigo);
    mostrarToastCopiado('¡Copiado!');
  } catch (error) {
    console.warn('No se pudo copiar el código del vale:', error);
    mostrarToastCopiado('No se pudo copiar. Selecciona el código manualmente.', true);
  }
}

function descargarQRConMensaje(container, codigo) {
  try {
    descargarQR(container, `PickaVale-${codigo}`);
  } catch (error) {
    console.warn('No se pudo descargar el QR del vale:', error);
    mostrarErrorCanje('No se pudo descargar el QR. Inténtalo de nuevo.');
  }
}

function initQRModal() {
  const overlay = document.getElementById('qr-modal');
  const closeButton = document.getElementById('btn-qr-modal-close');
  const downloadButton = document.getElementById('btn-download-modal-qr');
  if (!overlay) return;
  if (closeButton) closeButton.addEventListener('click', cerrarModalQR);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) cerrarModalQR();
  });
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      descargarQRConMensaje(document.getElementById('qr-modal-code'), overlay.dataset.filename || 'vale');
    });
  }
}

/*
 * The QR modal delegates its download action to its initializer.
 */
function initUserProfile() {
  const btnProfile = document.getElementById('btn-profile');
  const modalProfile = document.getElementById('profile-modal');
  const btnCloseX = document.getElementById('btn-profile-close-x');
  const btnCloseBottom = document.getElementById('btn-profile-close-bottom');
  const rewardsList = document.getElementById('rewards-list');
  if (!btnProfile || !modalProfile) return;

  btnProfile.addEventListener('click', abrirPerfil);
  btnProfile.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      abrirPerfil();
    }
  });
  if (btnCloseX) btnCloseX.addEventListener('click', cerrarPerfil);
  if (btnCloseBottom) btnCloseBottom.addEventListener('click', cerrarPerfil);

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalProfile.classList.contains('open')) {
      const qrModal = document.getElementById('qr-modal');
      if (qrModal && qrModal.classList.contains('open')) {
        cerrarModalQR();
      } else {
        cerrarPerfil();
      }
    }
  });
  modalProfile.addEventListener('click', event => {
    if (event.target === modalProfile) cerrarPerfil();
  });

  if (rewardsList) {
    rewardsList.addEventListener('click', event => {
      const button = event.target.closest('[data-reward-id]');
      if (button && !button.disabled) canjearRecompensa(button.dataset.rewardId);
    });
  }
  const copyButton = document.getElementById('btn-copy-new-coupon');
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      const code = document.getElementById('new-coupon-code').textContent;
      copiarCodigoVale(code);
    });
  }
  const downloadSuccessButton = document.getElementById('btn-download-new-coupon');
  if (downloadSuccessButton) {
    downloadSuccessButton.addEventListener('click', () => {
      const code = document.getElementById('new-coupon-code').textContent;
      descargarQRConMensaje(document.getElementById('new-coupon-qr'), code);
    });
  }

  initQRModal();
}

/**
 * Abre el modal de perfil y refresca los datos desde localStorage
 */
function abrirPerfil() {
  const modalProfile = document.getElementById('profile-modal');
  const successCard = document.getElementById('coupon-success-card');
  const errorEl = document.getElementById('reward-operation-error');

  if (!modalProfile) return;

  modalProfile.classList.add('open');
  modalProfile.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (successCard) successCard.style.display = 'none';
  if (errorEl) errorEl.textContent = '';

  const puntosActuales = window.obtenerPuntos();
  animarPuntosPerfil(0, puntosActuales, 800);
  actualizarNivelUsuario(puntosActuales);
  renderizarRecompensas(puntosActuales);
  renderizarValesCanjeados();
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

function renderizarRecompensas(puntos) {
  const list = document.getElementById('rewards-list');
  if (!list) return;
  list.innerHTML = '';
  RECOMPENSAS.forEach((recompensa, index) => {
    const disponible = puntos >= recompensa.costo;
    const faltan = recompensa.costo - puntos;
    const card = document.createElement('article');
    card.className = `reward-main-card${disponible ? '' : ' reward-unavailable'}`;
    card.innerHTML = `
      ${index === 0 ? '<div class="reward-badge-ribbon">⭐ Canje activo</div>' : ''}
      <div class="reward-main-header">
        <div class="reward-icon" aria-hidden="true">${recompensa.emoji}</div>
        <div class="reward-main-info">
          <h4 class="reward-name">${recompensa.nombre}</h4>
          <p class="reward-desc">${recompensa.descripcion}</p>
          <div class="reward-cost">Costo: <strong>${recompensa.costo} puntos</strong></div>
        </div>
      </div>
      <div class="reward-actions">
        <p class="reward-status-msg ${disponible ? 'status-ok' : 'status-error'}"${index === 0 ? ' id="reward-status-msg"' : ''}>
          ${disponible ? '¡Tienes puntos suficientes para canjear!' : `Te faltan ${faltan} puntos para canjear esta recompensa.`}
        </p>
        <button class="btn btn-primary btn-redeem" type="button" data-reward-id="${recompensa.id}" ${index === 0 ? 'id="btn-redeem-coupon"' : ''} ${disponible ? '' : 'disabled'}>
          <span>Canjear</span>
        </button>
      </div>
    `;
    list.appendChild(card);
  });
}

function canjearRecompensa(idRecompensa) {
  const recompensa = obtenerRecompensa(idRecompensa);
  if (!recompensa) {
    mostrarErrorCanje('No se encontró la recompensa seleccionada.');
    return;
  }
  if (typeof window.QRCode !== 'function') {
    mostrarErrorCanje('No se pudo cargar el generador de QR. Revisa tu conexión e inténtalo de nuevo.');
    return;
  }

  const puntosActuales = window.obtenerPuntos();
  if (!Number.isFinite(puntosActuales) || puntosActuales < recompensa.costo) {
    renderizarRecompensas(Number.isFinite(puntosActuales) ? puntosActuales : 0);
    return;
  }

  const codigo = generarCodigoVale();
  const fecha = new Date().toISOString();
  const nuevoVale = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    tipo: recompensa.id,
    nombre: recompensa.nombre,
    emoji: recompensa.emoji,
    codigo,
    fecha,
    puntos: recompensa.costo
  };
  const valesPrevios = window.obtenerVales();
  const nuevosPuntos = puntosActuales - recompensa.costo;
  try {
    localStorage.setItem('pickadeli_vales', JSON.stringify([nuevoVale, ...valesPrevios]));
    localStorage.setItem('pickadeli_puntos', String(nuevosPuntos));
  } catch (error) {
    try {
      localStorage.setItem('pickadeli_vales', JSON.stringify(valesPrevios));
    } catch (rollbackError) {
      console.warn('No se pudo restaurar el historial tras fallar el canje:', rollbackError);
    }
    console.warn('No se pudo guardar el canje:', error);
    mostrarErrorCanje('No se pudo completar el canje. Revisa el almacenamiento del navegador e inténtalo de nuevo.');
    return;
  }

  mostrarErrorCanje('');
  const successCard = document.getElementById('coupon-success-card');
  const codeEl = document.getElementById('new-coupon-code');
  const nameEl = document.getElementById('new-coupon-name');
  const qrContainer = document.getElementById('new-coupon-qr');
  if (successCard && codeEl && nameEl && qrContainer) {
    codeEl.textContent = codigo;
    nameEl.textContent = `${recompensa.emoji} ${recompensa.nombre}`;
    try {
      generarQR(qrContainer, codigo, 160);
      successCard.style.display = 'block';
      successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      lanzarConfettiCanje(successCard);
    } catch (error) {
      console.warn('El vale se canjeó, pero no se pudo mostrar el QR:', error);
      mostrarErrorCanje('El vale se guardó, pero el QR no se pudo generar. Recarga el perfil para volver a intentarlo.');
      successCard.style.display = 'block';
    }
  }

  animarPuntosPerfil(puntosActuales, nuevosPuntos, 500);
  actualizarPuntosUI();
  renderizarRecompensas(nuevosPuntos);
  renderizarValesCanjeados();
  renderizarHistorialActividad();
}

function lanzarConfettiCanje(container) {
  container.classList.remove('coupon-celebrate');
  void container.offsetWidth;
  container.classList.add('coupon-celebrate');
  window.setTimeout(() => container.classList.remove('coupon-celebrate'), 1800);
}

/**
 * Renderiza la lista de vales canjeados; genera QR solo al abrir el perfil.
 */
function renderizarValesCanjeados() {
  const wrapper = document.getElementById('claimed-coupons-wrapper');
  const listEl = document.getElementById('coupons-list');
  if (!wrapper || !listEl) return;

  const vales = window.obtenerVales()
    .map(normalizarVale)
    .sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime() || 0;
      const fechaB = new Date(b.fecha).getTime() || 0;
      return fechaB - fechaA;
    });
  wrapper.style.display = 'block';
  listEl.innerHTML = '';
  if (vales.length === 0) {
    listEl.innerHTML = '<p class="coupon-history-empty">Aún no has canjeado ningún vale. ¡Sigue jugando para ganar puntos!</p>';
    return;
  }

  vales.forEach(vale => {
    const item = document.createElement('article');
    item.className = 'coupon-item coupon-history-card';
    const info = document.createElement('div');
    info.className = 'coupon-history-info';
    const title = document.createElement('h5');
    title.className = 'coupon-item-desc';
    title.textContent = `${vale.emoji} ${vale.nombre}`;
    const date = document.createElement('span');
    date.className = 'coupon-item-date';
    date.textContent = formatearFechaVale(vale.fecha);
    const code = document.createElement('code');
    code.className = 'coupon-item-code';
    code.textContent = vale.codigo || 'Código no disponible';
    info.append(title, date, code);

    const qrContainer = document.createElement('div');
    qrContainer.className = 'coupon-history-qr qr-display-box';
    qrContainer.setAttribute('role', 'img');
    const qrButton = document.createElement('button');
    qrButton.className = 'btn btn-view-qr';
    qrButton.type = 'button';
    qrButton.textContent = 'Ver QR';
    qrButton.disabled = !vale.codigo;
    if (vale.codigo) {
      try {
        generarQR(qrContainer, vale.codigo, 80);
        qrButton.setAttribute('aria-label', `Ver código QR de ${vale.nombre}`);
        qrButton.addEventListener('click', () => abrirModalQR(vale, qrButton));
      } catch (error) {
        console.warn(`No se pudo generar el QR del vale ${vale.codigo}:`, error);
        qrContainer.textContent = 'QR no disponible';
        qrButton.disabled = true;
      }
    } else {
      qrContainer.textContent = 'Sin código';
    }
    item.append(info, qrContainer, qrButton);
    listEl.appendChild(item);
  });
}

/**
 * Renderiza el historial de actividad reciente del usuario.
 */
function renderizarHistorialActividad() {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;
  activityList.innerHTML = '';
  const intentos = window.obtenerIntentos();
  const vales = window.obtenerVales().map(normalizarVale);

  if (intentos === 0 && vales.length === 0) {
    activityList.innerHTML = '<p class="activity-empty-msg">Aún no tienes actividad. ¡Juega el quiz para ganar tus primeros puntos!</p>';
    return;
  }

  vales.forEach(vale => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    const description = document.createElement('span');
    description.className = 'activity-desc';
    const emoji = document.createElement('span');
    emoji.textContent = vale.emoji;
    const details = document.createElement('span');
    details.textContent = `Canjeaste ${vale.nombre} (${vale.codigo || 'sin código'})`;
    description.append(emoji, details);
    const cost = document.createElement('span');
    cost.className = 'activity-pts-loss';
    cost.textContent = `-${vale.puntos} pts`;
    item.append(description, cost);
    activityList.appendChild(item);
  });

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
  initArmaTuPicka();

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

  /**
   * Minijuego para armar recetas en el orden indicado.
   */
  function initArmaTuPicka() {
    const modal = document.getElementById('picka-modal');
    const openButton = document.getElementById('btn-open-picka-game');
    const closeButton = document.getElementById('btn-picka-close-x');
    const closeResultsButton = document.getElementById('btn-picka-close-results');
    const startButton = document.getElementById('btn-picka-start');
    const againButton = document.getElementById('btn-picka-again');
    const recipeList = document.getElementById('picka-recipe-list');
    const selectionMessage = document.getElementById('picka-selection-message');
    const selectionScreen = document.getElementById('picka-screen-selection');
    const memoryScreen = document.getElementById('picka-screen-memory');
    const gameScreen = document.getElementById('picka-screen-game');
    const resultsScreen = document.getElementById('picka-screen-results');
    const memoryList = document.getElementById('picka-memory-list');
    const memoryCountdown = document.getElementById('picka-memory-countdown');
    const skipMemoryButton = document.getElementById('btn-picka-skip-memory');
    const doneButton = document.getElementById('btn-picka-done');
    const ingredientsContainer = document.getElementById('picka-ingredients');
    const plate = document.getElementById('picka-plate');
    const plateEmpty = document.getElementById('picka-plate-empty');
    const progressLabel = document.getElementById('picka-progress-label');
    const progressTrack = document.querySelector('.picka-progress-track');
    const progressBar = document.getElementById('picka-progress-bar');
    const resultEmoji = document.getElementById('picka-result-emoji');
    const resultTitle = document.getElementById('picka-result-title');
    const resultBonus = document.getElementById('picka-result-bonus');
    const resultSummary = document.getElementById('picka-result-summary');
    const resultScore = document.getElementById('picka-result-score');
    const playerOrder = document.getElementById('picka-player-order');
    const correctOrder = document.getElementById('picka-correct-order');
    const saveError = document.getElementById('picka-save-error');
    const confetti = document.getElementById('picka-confetti');

    if (!modal || !openButton || !recipeList || !startButton) return;

    let recetaSeleccionada = null;
    let sortableIngredientes = null;
    let sortablePlato = null;
    let confettiTimer = null;
    let memoryInterval = null;
    let memoryTransitionTimeout = null;
    let memoryStarted = false;
    let previousFocus = null;

    renderizarRecetas();

    const mostrarPantalla = (pantallaActiva) => {
      [selectionScreen, memoryScreen, gameScreen, resultsScreen].forEach((pantalla) => {
        if (pantalla) pantalla.classList.toggle('active', pantalla === pantallaActiva);
      });
    };

    const abrirModal = () => {
      previousFocus = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      cancelarMemorizacion();
      recetaSeleccionada = null;
      startButton.disabled = true;
      selectionMessage.textContent = window.Sortable ? '' : 'No se pudo cargar el juego. Revisa tu conexión y vuelve a intentarlo.';
      recipeList.querySelectorAll('.picka-recipe-card').forEach((card) => {
        card.classList.remove('selected');
        card.setAttribute('aria-pressed', 'false');
      });
      mostrarPantalla(selectionScreen);
      closeButton.focus();
    };

    const cerrarModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      cancelarMemorizacion();
      destruirSortables();
      confetti.innerHTML = '';
      if (confettiTimer) window.clearTimeout(confettiTimer);
      actualizarPuntosUI();
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    };

    openButton.addEventListener('click', abrirModal);
    closeButton.addEventListener('click', cerrarModal);
    closeResultsButton.addEventListener('click', cerrarModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) cerrarModal();
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('open')) cerrarModal();
    });

    startButton.addEventListener('click', comenzarJuego);
    skipMemoryButton.addEventListener('click', ocultarOrdenYComenzar);
    doneButton.addEventListener('click', terminarReceta);
    againButton.addEventListener('click', () => {
      cancelarMemorizacion();
      destruirSortables();
      confetti.innerHTML = '';
      memoryList.classList.remove('is-hidden');
      recipeList.querySelectorAll('.picka-recipe-card').forEach((card) => {
        card.classList.remove('selected');
        card.setAttribute('aria-pressed', 'false');
      });
      recetaSeleccionada = null;
      startButton.disabled = true;
      selectionMessage.textContent = '';
      mostrarPantalla(selectionScreen);
    });

    function renderizarRecetas() {
      recipeList.innerHTML = '';
      RECETAS.forEach((receta) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'picka-recipe-card';
        card.setAttribute('aria-pressed', 'false');
        const ingredientChips = receta.ordenMemorizar
          .map((ingrediente, index) => `<span class="picka-chip">${index + 1}. ${ingrediente.emoji} ${ingrediente.nombre}</span>`)
          .join('');
        card.innerHTML = `
          <span class="picka-recipe-emoji" aria-hidden="true">${receta.emoji}</span>
          <span class="picka-recipe-name">${receta.nombre}</span>
          <span class="picka-recipe-description">${receta.descripcion}</span>
          <span class="picka-recipe-difficulty" aria-label="Dificultad ${receta.dificultad}">${receta.dificultad}</span>
          <span class="picka-chip-list">${ingredientChips}</span>
        `;
        card.addEventListener('click', () => {
          recetaSeleccionada = receta;
          recipeList.querySelectorAll('.picka-recipe-card').forEach((recipeCard) => {
            const isSelected = recipeCard === card;
            recipeCard.classList.toggle('selected', isSelected);
            recipeCard.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
          });
          startButton.disabled = !window.Sortable;
          selectionMessage.textContent = window.Sortable ? '' : 'No se pudo cargar el juego. Revisa tu conexión y vuelve a intentarlo.';
        });
        recipeList.appendChild(card);
      });
    }

    function comenzarJuego() {
      if (!recetaSeleccionada || !window.Sortable) {
        selectionMessage.textContent = 'El juego no está disponible. Comprueba tu conexión e inténtalo de nuevo.';
        return;
      }

      prepararMemorizacion();
    }

    function prepararMemorizacion() {
      cancelarMemorizacion();
      memoryStarted = false;
      memoryList.classList.remove('is-hidden');
      memoryCountdown.textContent = '5';
      memoryList.innerHTML = '';
      recetaSeleccionada.ordenMemorizar.forEach((ingrediente, index) => {
        const item = document.createElement('div');
        item.className = 'picka-memory-item';
        item.innerHTML = `
          <span class="picka-memory-number">${index + 1}</span>
          <span class="picka-memory-emoji" aria-hidden="true">${ingrediente.emoji}</span>
          <span class="picka-memory-name">${ingrediente.nombre}</span>
        `;
        memoryList.appendChild(item);
      });
      mostrarPantalla(memoryScreen);

      let segundos = 5;
      memoryInterval = window.setInterval(() => {
        segundos--;
        memoryCountdown.textContent = String(segundos);
        memoryCountdown.classList.remove('picka-countdown-tick');
        void memoryCountdown.offsetWidth;
        memoryCountdown.classList.add('picka-countdown-tick');
        if (segundos <= 0) ocultarOrdenYComenzar();
      }, 1000);
    }

    function ocultarOrdenYComenzar() {
      if (memoryStarted) return;
      memoryStarted = true;
      if (memoryInterval) window.clearInterval(memoryInterval);
      memoryInterval = null;
      memoryList.classList.add('is-hidden');
      memoryTransitionTimeout = window.setTimeout(() => {
        memoryTransitionTimeout = null;
        iniciarPartida();
      }, 350);
    }

    function cancelarMemorizacion() {
      if (memoryInterval) window.clearInterval(memoryInterval);
      if (memoryTransitionTimeout) window.clearTimeout(memoryTransitionTimeout);
      memoryInterval = null;
      memoryTransitionTimeout = null;
      memoryStarted = false;
    }

    function iniciarPartida() {
      destruirSortables();
      plate.innerHTML = '';
      plate.appendChild(plateEmpty);
      plateEmpty.hidden = false;
      renderizarIngredientes();
      mostrarPantalla(gameScreen);
      inicializarSortables();
    }

    function renderizarIngredientes() {
      ingredientsContainer.innerHTML = '';
      mezclarArreglo(recetaSeleccionada.ordenMemorizar.map((ingrediente, index) => ({ ingrediente, index })))
        .forEach(({ ingrediente, index }) => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'picka-ingredient-card';
          card.dataset.ingredientIndex = String(index);
          card.setAttribute('role', 'listitem');
          card.innerHTML = `
            <span class="picka-ingredient-emoji" aria-hidden="true">${ingrediente.emoji}</span>
            <span class="picka-ingredient-name">${ingrediente.nombre}</span>
          `;
          ingredientsContainer.appendChild(card);
        });
    }

    function inicializarSortables() {
      sortableIngredientes = window.Sortable.create(ingredientsContainer, {
        animation: 180,
        sort: false,
        group: { name: 'picka-ingredients', pull: true, put: true },
        draggable: '.picka-ingredient-card',
        touchStartThreshold: 5,
        chosenClass: 'picka-chosen',
        fallbackOnBody: true,
        forceFallback: true,
        onAdd: (event) => {
          event.item.className = 'picka-ingredient-card';
          actualizarTablero();
        },
        onRemove: actualizarTablero,
        onSort: actualizarTablero
      });
      sortableIngredientes.option('touchStartThreshold', 5);
      sortablePlato = window.Sortable.create(plate, {
        animation: 180,
        group: { name: 'picka-ingredients', pull: true, put: true },
        draggable: '.picka-plate-layer',
        touchStartThreshold: 5,
        fallbackOnBody: true,
        forceFallback: true,
        onAdd: (event) => {
          event.item.className = 'picka-plate-layer';
          event.item.setAttribute('role', 'listitem');
          plate.classList.remove('picka-correct-flash');
          void plate.offsetWidth;
          plate.classList.add('picka-correct-flash');
          actualizarTablero();
        },
        onRemove: actualizarTablero,
        onSort: actualizarTablero
      });
      sortablePlato.option('touchStartThreshold', 5);
      actualizarTablero();
    }

    function actualizarTablero() {
      ingredientsContainer.querySelectorAll('[data-ingredient-index]').forEach((item) => {
        item.className = 'picka-ingredient-card';
      });
      plate.querySelectorAll('[data-ingredient-index]').forEach((item) => {
        item.className = 'picka-plate-layer';
        item.setAttribute('role', 'listitem');
      });
      const ingredientesEnPlato = plate.querySelectorAll('[data-ingredient-index]').length;
      const total = recetaSeleccionada.ordenMemorizar.length;
      const porcentaje = (ingredientesEnPlato / total) * 100;
      progressLabel.textContent = `${ingredientesEnPlato}/${total} ingredientes`;
      progressBar.style.width = `${porcentaje}%`;
      progressTrack.setAttribute('aria-valuenow', String(Math.round(porcentaje)));
      progressTrack.setAttribute('aria-valuemax', String(total));
      plateEmpty.hidden = ingredientesEnPlato > 0;
      doneButton.disabled = ingredientesEnPlato !== total;
    }

    function terminarReceta() {
      const jugados = Array.from(plate.querySelectorAll('[data-ingredient-index]'));
      const total = recetaSeleccionada.ordenMemorizar.length;
      if (jugados.length !== total) return;

      const comparacion = jugados.map((item, index) => {
        const ingrediente = recetaSeleccionada.ordenMemorizar[Number(item.dataset.ingredientIndex)];
        return { ingrediente, correcto: Number(item.dataset.ingredientIndex) === index };
      });
      const aciertos = comparacion.filter((item) => item.correcto).length;
      const puntosBase = aciertos * 10;
      const proporcionCorrecta = aciertos / total;
      const bonus = aciertos === total ? 20 : proporcionCorrecta >= 0.7 ? 10 : 0;
      const puntosGanados = puntosBase + bonus;

      resultEmoji.textContent = recetaSeleccionada.emoji;
      resultTitle.textContent = `🎉 ¡${recetaSeleccionada.nombre} armada!`;
      resultSummary.textContent = `Acertaste ${aciertos} de ${total} ingredientes en su posición correcta.`;
      resultBonus.textContent = aciertos === total
        ? '+20 puntos bonus ¡PERFECTO! 🏆'
        : bonus > 0
          ? '+10 puntos bonus ¡Muy bien! 🌟'
          : 'Sigue practicando 💪';
      resultScore.textContent = '0';
      renderizarComparacion(comparacion);
      saveError.textContent = '';
      mostrarPantalla(resultsScreen);
      if (aciertos === total) lanzarConfetti();

      try {
        window.guardarPuntos(puntosGanados);
        actualizarPuntosUI();
        animarPuntosGanados(puntosGanados);
      } catch (error) {
        console.warn('No se pudieron guardar los puntos de Arma tu Picka:', error);
        saveError.textContent = 'No se pudieron guardar tus puntos. Comprueba el almacenamiento del navegador e inténtalo de nuevo.';
        animarPuntosGanados(puntosGanados);
      }
    }

    function renderizarComparacion(comparacion) {
      playerOrder.innerHTML = '';
      correctOrder.innerHTML = '';
      comparacion.forEach(({ ingrediente, correcto }) => {
        const row = document.createElement('li');
        row.className = correcto ? 'picka-comparison-correct' : 'picka-comparison-incorrect';
        row.innerHTML = `
          <span class="picka-comparison-status" aria-label="${correcto ? 'Posición correcta' : 'Posición incorrecta'}">${correcto ? '✓' : '✗'}</span>
          <span>${ingrediente.emoji} ${ingrediente.nombre}</span>
        `;
        playerOrder.appendChild(row);
      });

      recetaSeleccionada.ordenMemorizar.forEach((ingrediente) => {
        const row = document.createElement('li');
        row.textContent = `${ingrediente.emoji} ${ingrediente.nombre}`;
        correctOrder.appendChild(row);
      });
    }

    function animarPuntosGanados(target) {
      const inicio = window.performance.now();
      const duracion = 900;
      const actualizarContador = (ahora) => {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        resultScore.textContent = String(Math.floor(target * progreso));
        if (progreso < 1) {
          window.requestAnimationFrame(actualizarContador);
        } else {
          resultScore.textContent = String(target);
        }
      };
      window.requestAnimationFrame(actualizarContador);
    }

    function lanzarConfetti() {
      const emojis = ['🎉', '🎊', '✨', '🥳'];
      confetti.innerHTML = '';
      for (let index = 0; index < 18; index++) {
        const piece = document.createElement('span');
        piece.className = 'picka-confetti-piece';
        piece.textContent = emojis[index % emojis.length];
        piece.style.setProperty('--confetti-x', `${Math.random() * 260 - 130}px`);
        piece.style.setProperty('--confetti-delay', `${Math.random() * 0.8}s`);
        confetti.appendChild(piece);
      }
      if (confettiTimer) window.clearTimeout(confettiTimer);
      confettiTimer = window.setTimeout(() => {
        confetti.innerHTML = '';
      }, 2600);
    }

    function destruirSortables() {
      if (sortableIngredientes) sortableIngredientes.destroy();
      if (sortablePlato) sortablePlato.destroy();
      sortableIngredientes = null;
      sortablePlato = null;
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
