(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    start();
  }

  function setupFilterPage() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!input || cards.length === 0) {
      return;
    }

    function applyFilter() {
      var query = normalize(input.value);
      var year = select ? normalize(select.value) : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var yearOk = !year || normalize(card.getAttribute("data-year")) === year;
        var textOk = !query || haystack.indexOf(query) !== -1;
        var show = yearOk && textOk;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", applyFilter);
    if (select) {
      select.addEventListener("change", applyFilter);
    }
    applyFilter();
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }
    setupFilterPage();
  }

  function loadStream(video, streamUrl, done) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      done();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      return;
    }
    video.src = streamUrl;
    done();
  }

  window.MovieSite = {
    setupPlayer: function (videoId, streamUrl) {
      ready(function () {
        var video = document.getElementById(videoId);
        if (!video) {
          return;
        }
        var shell = video.closest(".player-shell");
        var overlay = shell ? shell.querySelector(".player-overlay") : null;
        var loaded = false;

        function play() {
          function begin() {
            if (overlay) {
              overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
              promise.catch(function () {});
            }
          }
          if (!loaded) {
            loaded = true;
            loadStream(video, streamUrl, begin);
          } else {
            begin();
          }
        }

        if (overlay) {
          overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
          if (!loaded) {
            play();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
      });
    }
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearchPage();
    setupFilterPage();
  });
})();
