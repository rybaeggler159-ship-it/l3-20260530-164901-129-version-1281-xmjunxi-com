(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');
  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-movie-search]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function applyFilter() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    cards.forEach(function (card) {
      var haystack = [card.dataset.title, card.dataset.genre, card.dataset.year].join(' ').toLowerCase();
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okYear = !year || card.dataset.year === year;
      card.classList.toggle('hidden-card', !(okKeyword && okYear));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }
})();
