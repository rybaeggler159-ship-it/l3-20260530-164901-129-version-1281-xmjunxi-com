(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $$(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    $$('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var url = form.getAttribute('data-search-url') || 'search.html';
        var query = input ? input.value.trim() : '';
        window.location.href = url + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });
  }

  function setupHero() {
    var slides = $$('[data-hero-slide]');
    var dots = $$('[data-hero-dot]');
    var minis = $$('[data-hero-mini]');
    if (!slides.length) return;
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      minis.forEach(function (mini, i) {
        mini.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 6500);
  }

  function setupSearchPage() {
    var input = $('[data-search-page-input]');
    var form = $('[data-search-page-form]');
    var results = $('[data-search-results]');
    var status = $('[data-search-status]');
    if (!input || !form || !results || !status || !window.MOVIES) return;

    function card(movie) {
      return [
        '<article class="movie-card card-grid">',
        '  <a class="poster-link" href="movies/' + movie.slug + '">',
        '    <img src="' + movie.poster + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '    <span class="duration-badge">' + movie.duration + '</span>',
        '    <span class="play-float">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-category">' + movie.genre + '</div>',
        '    <h3><a href="movies/' + movie.slug + '">' + movie.title + '</a></h3>',
        '    <p>' + movie.summary + '</p>',
        '    <div class="card-foot">',
        '      <span>' + movie.year + '</span>',
        '      <span>' + movie.region + '</span>',
        '      <span>评分 ' + movie.score + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }

    function render(query) {
      var q = normalize(query);
      var items = window.MOVIES.filter(function (movie) {
        if (!q) return movie.score >= 9.4;
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.categoryName,
          movie.tags.join(' '),
          movie.summary
        ].join(' ')).indexOf(q) !== -1;
      }).slice(0, 96);

      status.textContent = q ? '找到 ' + items.length + ' 条相关影片。' : '默认展示高评分精选影片，可输入片名、类型、地区或标签。';
      results.innerHTML = items.map(card).join('\n');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    render(input.value);
  }

  setupMenu();
  setupHeaderSearch();
  setupHero();
  setupSearchPage();
})();
