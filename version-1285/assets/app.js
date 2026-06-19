(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slider = document.querySelector('.hero-slider');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var forms = document.querySelectorAll('.site-search-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');

      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var filterBox = document.querySelector('.filter-box');

  if (filterBox) {
    var searchInput = filterBox.querySelector('[data-filter="search"]');
    var yearSelect = filterBox.querySelector('[data-filter="year"]');
    var regionSelect = filterBox.querySelector('[data-filter="region"]');
    var typeSelect = filterBox.querySelector('[data-filter="type"]');
    var resetButton = filterBox.querySelector('[data-filter="reset"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function valueOf(element) {
      return element ? element.value.trim() : '';
    }

    function match(card, query, year, region, type) {
      var text = (card.getAttribute('data-text') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var queryMatch = !query || text.indexOf(query.toLowerCase()) !== -1;
      var yearMatch = !year || cardYear === year;
      var regionMatch = !region || cardRegion === region;
      var typeMatch = !type || cardType === type;

      return queryMatch && yearMatch && regionMatch && typeMatch;
    }

    function applyFilters() {
      var query = valueOf(searchInput);
      var year = valueOf(yearSelect);
      var region = valueOf(regionSelect);
      var type = valueOf(typeSelect);
      var visible = 0;

      cards.forEach(function (card) {
        var isMatch = match(card, query, year, region, type);
        card.classList.toggle('hidden-card', !isMatch);
        if (isMatch) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }
})();
