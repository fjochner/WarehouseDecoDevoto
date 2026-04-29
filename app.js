/* ================================================
   DECO WAREHOUSE — app.js
   Catálogo + Detalle + Carrito con checkout WhatsApp
   ================================================ */

/* ── CONFIGURACIÓN GLOBAL ── */
const CONFIG = {
  whatsappNumber: '5491161507530',
  instagramUrl:   'https://www.instagram.com/deco.warehouse',
  negocioNombre:  'Deco Warehouse',
};

/* ── CARRITO (estado global) ── */
const Cart = {
  items: [],  // [{ id, nombre, precio, imagen, cantidad }]

  add(producto) {
    const existing = this.items.find(i => i.id === producto.id);
    if (existing) {
      existing.cantidad++;
    } else {
      this.items.push({ ...producto, cantidad: 1 });
    }
    this.save();
    this.render();
    this.updateBadge();
    showToast(`"${producto.nombre}" agregado al carrito`);
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.render();
    this.updateBadge();
  },

  // ── FIX 2: Método para vaciar el carrito ──
  clear() {
    this.items = [];
    this.save();
    this.render();
    this.updateBadge();
  },

  changeQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      this.remove(id);
      return;
    }
    this.save();
    this.render();
    this.updateBadge();
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.cantidad, 0);
  },

  save() {
    try { localStorage.setItem('dw_cart', JSON.stringify(this.items)); } catch(e) {}
  },

  load() {
    try {
      const raw = localStorage.getItem('dw_cart');
      if (raw) this.items = JSON.parse(raw);
    } catch(e) { this.items = []; }
  },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const n = this.count();
    badge.textContent = n;
    badge.classList.toggle('visible', n > 0);
  },

  render() {
    const container = document.getElementById('cart-items');
    const footer    = document.getElementById('cart-footer');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h3>Tu carrito está vacío</h3>
          <p>Explorá el catálogo y agregá productos.</p>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'flex';

    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img"
          src="${item.imagen}"
          alt="${item.nombre}"
          onerror="this.src='https://placehold.co/72x72/EDEAE5/A8A29E?text='"
        >
        <div class="cart-item-info">
          <p class="cart-item-name">${item.nombre}</p>
          <p class="cart-item-price">${formatPrecio(item.precio * item.cantidad)}</p>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="Cart.changeQty('${item.id}', -1)">−</button>
            <span class="qty-num">${item.cantidad}</span>
            <button class="qty-btn" onclick="Cart.changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="Cart.remove('${item.id}')" aria-label="Eliminar">
          <svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>`).join('');

    // Actualizar total
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = formatPrecio(this.total());
  },

  buildWhatsappMessage() {
    let msg = `Hola! Quiero hacer el siguiente pedido en *${CONFIG.negocioNombre}*:\n\n`;
    this.items.forEach(item => {
      msg += `• ${item.nombre} x${item.cantidad} — ${formatPrecio(item.precio * item.cantidad)}\n`;
    });
    msg += `\n*Total: ${formatPrecio(this.total())}*`;
    msg += `\n\n¿Pueden confirmarme disponibilidad y forma de entrega? ¡Gracias!`;
    return msg;
  },

  checkout() {
    if (this.items.length === 0) return;
    const msg = encodeURIComponent(this.buildWhatsappMessage());
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`, '_blank', 'noopener');
  },
};

/* ── UTILIDADES ── */
function formatPrecio(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

function normalizar(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('dw-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dw-toast';
    toast.className = 'toast';
    toast.innerHTML = `<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('span').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ── CART DRAWER ── */
function initCartDrawer() {
  const overlay     = document.getElementById('cart-overlay');
  const drawer      = document.getElementById('cart-drawer');
  const openBtn     = document.getElementById('cart-open');
  const closeBtn    = document.getElementById('cart-close');
  const checkoutBtn = document.getElementById('cart-checkout');
  const clearBtn    = document.getElementById('cart-clear'); // ── FIX 2: botón vaciar

  if (!overlay || !drawer) return;

  function openCart() {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtn?.addEventListener('click', openCart);
  closeBtn?.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  checkoutBtn?.addEventListener('click', () => Cart.checkout());

  // ── FIX 2: listener para vaciar carrito ──
  clearBtn?.addEventListener('click', () => {
    if (confirm('¿Vaciar el carrito?')) Cart.clear();
  });
}

/* ════════════════════════════════════════════════
   MÓDULO: CATÁLOGO (index.html)
   ════════════════════════════════════════════════ */
async function initCatalog() {
  const grilla     = document.getElementById('grilla-productos');
  const buscador   = document.getElementById('buscador');
  const contador   = document.getElementById('contador-resultados');
  const filterWrap = document.getElementById('filter-chips');

  if (!grilla) return;

  let productos = [];
  let categoriaActiva = 'todos';
  let textoBusqueda   = '';

  try {
    const res = await fetch('productos.json');
    if (!res.ok) throw new Error('No se pudo cargar productos.json');
    productos = await res.json();
  } catch (err) {
    grilla.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h3>Error al cargar productos</h3>
        <p>Asegurate de que el archivo <code>productos.json</code> está en la misma carpeta.</p>
      </div>`;
    return;
  }

  // Genera chips
  const categorias = ['todos', ...new Set(productos.map(p => p.categoria))];
  filterWrap.innerHTML = categorias.map(cat => `
    <button class="chip${cat === 'todos' ? ' active' : ''}" data-cat="${cat}">
      ${cat === 'todos' ? 'Todos' : cat}
    </button>`).join('');

  function renderProductos() {
    const query = normalizar(textoBusqueda.trim());
    const filtrados = productos.filter(p => {
      const coincideCategoria = categoriaActiva === 'todos' || p.categoria === categoriaActiva;
      const coincideBusqueda  = !query || normalizar(p.nombre).includes(query) || normalizar(p.categoria).includes(query);
      return coincideCategoria && coincideBusqueda;
    });

    if (contador) {
      contador.textContent = filtrados.length === 1
        ? '1 producto encontrado'
        : `${filtrados.length} productos encontrados`;
    }

    if (filtrados.length === 0) {
      grilla.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h3>Sin resultados</h3>
          <p>No encontramos productos para "<strong>${textoBusqueda}</strong>". Probá con otro término.</p>
        </div>`;
      return;
    }

    grilla.innerHTML = filtrados.map((p, i) => `
      <article class="product-card" style="animation-delay:${i * 60}ms">
        <a href="producto.html?id=${p.id}" class="card-img-wrap">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" onerror="this.src='https://placehold.co/600x450/EDEAE5/A8A29E?text=Sin+imagen'">
          <span class="card-badge">${p.categoria}</span>
        </a>
        <div class="card-body">
          <h2 class="card-name">${p.nombre}</h2>
          <p class="card-price">${formatPrecio(p.precio)} <span>ARS</span></p>
        </div>
        <div class="card-actions">
          <a href="producto.html?id=${p.id}" class="btn-ver">Ver detalle →</a>
        </div>
      </article>`).join('');
  }

  filterWrap.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    categoriaActiva = chip.dataset.cat;
    renderProductos();
  });

  let debounceTimer;
  buscador.addEventListener('input', e => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      textoBusqueda = e.target.value;
      renderProductos();
    }, 220);
  });

  renderProductos();
}

/* ════════════════════════════════════════════════
   MÓDULO: DETALLE DE PRODUCTO (producto.html)
   ════════════════════════════════════════════════ */
async function initDetalle() {
  const root = document.getElementById('producto-detalle');
  if (!root) return;

  const id = getParam('id');
  root.innerHTML = `<div class="page-loading"><div class="spinner"></div><p>Cargando producto…</p></div>`;

  if (!id) { mostrarError(root, 'No se especificó ningún producto.'); return; }

  let productos;
  try {
    const res = await fetch('productos.json');
    if (!res.ok) throw new Error('No se pudo cargar productos.json');
    productos = await res.json();
  } catch {
    mostrarError(root, 'No se pudo cargar la base de datos de productos.');
    return;
  }

  const producto = productos.find(p => p.id === id);
  if (!producto) {
    mostrarError(root, `No existe ningún producto con el ID "<strong>${id}</strong>".`);
    return;
  }

  document.title = `${producto.nombre} — ${CONFIG.negocioNombre}`;
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', producto.nombre);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', producto.imagen);

  const msgWa = encodeURIComponent(`Hola, quiero consultar por el producto ${producto.nombre}`);
  const urlWa = `https://wa.me/${CONFIG.whatsappNumber}?text=${msgWa}`;

  root.innerHTML = `
    <a href="index.html" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M19 12H5m7-7-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Volver al catálogo
    </a>

    <div class="product-detail">
      <div class="detail-img-wrap">
        <img
          src="${producto.imagen}"
          alt="${producto.nombre}"
          onerror="this.src='https://placehold.co/600x600/EDEAE5/A8A29E?text=Sin+imagen'"
        >
      </div>

      <div class="detail-info">
        <span class="detail-badge">✦ ${producto.categoria}</span>
        <h1 class="detail-name">${producto.nombre}</h1>
        <p class="detail-price"><sup>$</sup>${new Intl.NumberFormat('es-AR').format(producto.precio)}</p>
        <hr class="detail-divider">
        <div>
          <p class="detail-desc-label">Descripción</p>
          <p class="detail-desc">${producto.descripcion}</p>
        </div>
        <hr class="detail-divider">

        <!-- Agregar al carrito -->
        <div class="card-qty detalle-qty">
          <button class="btn-qty" onclick="const s=document.getElementById('qty-val-detalle');s.textContent=Math.max(1,+s.textContent-1)">−</button>
          <span class="qty-val" id="qty-val-detalle">1</span>
          <button class="btn-qty" onclick="const s=document.getElementById('qty-val-detalle');s.textContent=+s.textContent+1">+</button>
        </div>
        <button class="btn-add-detail" id="btn-add-cart">
          <svg viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Agregar al carrito
        </button>

        <!-- Consulta directa WhatsApp -->
        <a href="${urlWa}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Consultar por WhatsApp
        </a>

        <p style="font-size:.78rem;color:var(--color-text-light);text-align:center;">
          Respondemos en minutos · Envíos a todo el país
        </p>
      </div>
    </div>`;

  // Botón agregar al carrito en detalle
  
  document.getElementById('btn-add-cart')?.addEventListener('click', () => {
  const qty = parseInt(document.getElementById('qty-val-detalle').textContent);
  for (let i = 0; i < qty; i++) {
    Cart.add({ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen });
  }
  document.getElementById('qty-val-detalle').textContent = '1'; // reset
});
  
}

function mostrarError(root, mensaje) {
  root.innerHTML = `
    <div class="page-error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="56" height="56">
        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3>Producto no encontrado</h3>
      <p>${mensaje}</p>
      <a href="index.html" class="btn-ver" style="margin-top:16px;display:inline-block;padding:10px 24px;">
        ← Volver al catálogo
      </a>
    </div>`;
}

/* ── BOTÓN FLOTANTE WHATSAPP ── */
function initWhatsappFloat() {
  const btn = document.getElementById('wa-float');
  if (!btn) return;
  const msg = encodeURIComponent(`Hola, me gustaría conocer más sobre sus productos.`);
  btn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
}

/* ── PUNTO DE ENTRADA ── */
document.addEventListener('DOMContentLoaded', () => {
  Cart.load();
  Cart.updateBadge();
  Cart.render();      // ── FIX 1: renderizar carrito al cargar la página
  initCartDrawer();
  initWhatsappFloat();
  initCatalog();
  initDetalle();
});
