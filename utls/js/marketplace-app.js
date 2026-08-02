// ============================================================
// MARKETPLACE — Catálogo dinámico (lee productos desde Supabase)
// ============================================================
const CATEGORIAS = {
  es: { aceite: 'Aceite de oliva', plantas: 'Plantas de olivo', artesanal: 'Producto artesanal', experiencias: 'Experiencia', publicaciones: 'Publicación' },
  en: { aceite: 'Olive oil', plantas: 'Olive plants', artesanal: 'Artisanal product', experiencias: 'Experience', publicaciones: 'Publication' }
};
function catLabel(cat) {
  const lang = (window.VA_I18N && window.VA_I18N.getLang()) || 'es';
  return CATEGORIAS[lang][cat] || cat;
}

let TODOS_LOS_PRODUCTOS = [];
let activeCat = 'todas';

function urlImagen(path) {
  if (!path) return 'utls/imgs/enConstrucc.PNG';
  const { data } = supabaseClient.storage.from('productos').getPublicUrl(path);
  return data.publicUrl;
}

function renderProductos(lista) {
  const grid = document.getElementById('app-grid');
  const empty = document.getElementById('app-empty');
  grid.innerHTML = '';

  if (lista.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const lang = (window.VA_I18N && window.VA_I18N.getLang()) || 'es';
  const priceLabel = lang === 'en' ? 'Ask for price' : 'Consultar precio';

  lista.forEach(p => {
    const card = document.createElement('a');
    card.className = 'app-card';
    card.href = `producto.html?id=${p.id}`;
    card.innerHTML = `
      <img class="thumb" src="${urlImagen(p.imagenes && p.imagenes[0])}" alt="${p.nombre}" loading="lazy">
      <div class="body">
        <span class="tag">${catLabel(p.categoria)}</span>
        <h3>${p.nombre}</h3>
        <p class="desc">${p.descripcion || ''}</p>
        <div class="foot">
          <span class="price">${p.precio ? 'USD ' + p.precio : priceLabel}</span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function aplicarFiltros() {
  const term = (document.getElementById('app-search').value || '').trim().toLowerCase();
  const filtrados = TODOS_LOS_PRODUCTOS.filter(p => {
    const matchCat = activeCat === 'todas' || p.categoria === activeCat;
    const matchTerm = term === '' ||
      (p.nombre || '').toLowerCase().includes(term) ||
      (p.descripcion || '').toLowerCase().includes(term);
    return matchCat && matchTerm;
  });
  renderProductos(filtrados);
  const lang = (window.VA_I18N && window.VA_I18N.getLang()) || 'es';
  if (lang === 'en') {
    document.getElementById('app-count').textContent =
      filtrados.length + (filtrados.length === 1 ? ' product found' : ' products found');
  } else {
    document.getElementById('app-count').textContent =
      filtrados.length + (filtrados.length === 1 ? ' producto encontrado' : ' productos encontrados');
  }
}

async function cargarProductos() {
  const loading = document.getElementById('app-loading');
  const errorBox = document.getElementById('app-error');
  loading.style.display = 'block';
  errorBox.style.display = 'none';

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('disponible', true)
    .order('created_at', { ascending: false });

  loading.style.display = 'none';

  if (error) {
    console.error(error);
    errorBox.style.display = 'block';
    errorBox.textContent = 'Error de Supabase: ' + (error.message || JSON.stringify(error)) +
      (error.code ? ' (código: ' + error.code + ')' : '');
    return;
  }

  TODOS_LOS_PRODUCTOS = data || [];
  aplicarFiltros();
}

document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  document.getElementById('app-search').addEventListener('input', aplicarFiltros);
  document.querySelectorAll('.mkt-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mkt-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat');
      aplicarFiltros();
    });
  });
  document.addEventListener('langchange', aplicarFiltros);
});
