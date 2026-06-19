(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          setSlide(index);
        });
      });
      setInterval(function () {
        setSlide(active + 1);
      }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    filterInputs.forEach(function (input) {
      var target = input.getAttribute('data-filter-input') || 'movie';
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card="' + target + '"]'));
      var empty = document.querySelector('[data-no-results="' + target + '"]');

      function applyFilter() {
        var query = normalize(input.value);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var matched = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }

      input.addEventListener('input', applyFilter);

      if (input.hasAttribute('data-use-query')) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }

      applyFilter();
    });
  });
})();
