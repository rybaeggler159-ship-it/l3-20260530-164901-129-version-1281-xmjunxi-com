(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var grid = document.querySelector("[data-filter-grid]");

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .ranking-row"));
    var searchInput = document.getElementById("siteSearch");
    var regionFilter = document.getElementById("regionFilter");
    var typeFilter = document.getElementById("typeFilter");
    var yearFilter = document.getElementById("yearFilter");
    var status = document.querySelector("[data-filter-status]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function includesText(source, query) {
      return !query || source.indexOf(query) !== -1;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = regionFilter ? regionFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = includesText(text, query);

        if (region && card.getAttribute("data-region") !== region) {
          matched = false;
        }

        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }

        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = "当前显示 " + visible + " / " + cards.length + " 部内容";
      }
    }

    [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll("img[data-fallback-cover]");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initImageFallbacks();
  });
})();
