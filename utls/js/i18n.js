// ============================================================
// VALDES ARMAS — Motor bilingüe ES/EN
// Uso:
//   <span data-i18n="home_hero_title">Texto en español</span>
//   <input data-i18n-placeholder="search_placeholder" placeholder="...">
//   <img data-i18n-alt="logo_alt" alt="...">
// El diccionario vive en cada página dentro de <script>window.I18N = {...}</script>
// definido ANTES de este archivo, o se puede compartir cargando i18n-dict.js.
// ============================================================
(function () {
  const STORAGE_KEY = 'va_lang';

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || 'es';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
    updateToggleLabel(lang);
  }

  function applyLang(lang) {
    const dict = (window.I18N && window.I18N[lang]) || {};
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-alt');
      if (dict[key] !== undefined) el.alt = dict[key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) el.title = dict[key];
    });
    document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-content');
      if (dict[key] !== undefined) el.setAttribute('content', dict[key]);
    });

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function updateToggleLabel(lang) {
    document.querySelectorAll('.lang-toggle').forEach(function (btn) {
      btn.querySelectorAll('[data-lang]').forEach(function (span) {
        span.classList.toggle('active', span.getAttribute('data-lang') === lang);
      });
    });
  }

  function initToggle() {
    document.querySelectorAll('.lang-toggle [data-lang]').forEach(function (span) {
      span.addEventListener('click', function () {
        setLang(span.getAttribute('data-lang'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initToggle();
    const lang = getLang();
    applyLang(lang);
    updateToggleLabel(lang);
  });

  window.VA_I18N = { getLang: getLang, setLang: setLang, applyLang: applyLang };
})();
