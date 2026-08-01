document.addEventListener('DOMContentLoaded', function () {
  var search = document.getElementById('mkt-search');
  var catBtns = document.querySelectorAll('.mkt-cat-btn');
  var cards = document.querySelectorAll('.mkt-card');
  var countEl = document.getElementById('mkt-count');
  var emptyEl = document.getElementById('mkt-empty');
  var activeCat = 'todas';

  function applyFilters() {
    var term = (search.value || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var cat = card.getAttribute('data-cat');
      var text = card.getAttribute('data-search');
      var matchesCat = activeCat === 'todas' || cat === activeCat;
      var matchesTerm = term === '' || text.indexOf(term) !== -1;
      var show = matchesCat && matchesTerm;
      card.style.display = show ? 'flex' : 'none';
      if (show) visible++;
    });
    countEl.textContent = visible + (visible === 1 ? ' producto encontrado' : ' productos encontrados');
    emptyEl.style.display = visible === 0 ? 'block' : 'none';
  }

  search.addEventListener('input', applyFilters);

  catBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      catBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat');
      applyFilters();
    });
  });

  applyFilters();
});
