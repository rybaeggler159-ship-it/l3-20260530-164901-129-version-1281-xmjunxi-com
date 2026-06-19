(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        selectAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    window.location.href = './search.html';
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            });
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var cards = selectAll('[data-movie-card]', list);
        var empty = document.querySelector('[data-empty-filter]');
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var match = !query || text.indexOf(query) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        });
    }

    function createResultCard(movie) {
        var tags = [movie.region, movie.type].filter(Boolean).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card standard" data-movie-card>',
            '<a href="' + escapeHtml(movie.url) + '" class="card-link">',
            '<div class="poster-wrap">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '</div>',
            '<div class="card-body">',
            '<div class="card-tags">' + tags + '</div>',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-meta"><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function setupSearchPage() {
        var results = document.querySelector('[data-search-results]');
        if (!results || !window.SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-page-input]');
        var title = document.querySelector('[data-search-title]');
        var empty = document.querySelector('[data-search-empty]');
        if (input) {
            input.value = query;
        }
        if (!query) {
            results.innerHTML = '';
            if (empty) {
                empty.classList.add('is-visible');
            }
            return;
        }
        var words = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = window.SEARCH_DATA.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.genre,
                movie.year,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        });
        if (title) {
            title.textContent = '“' + query + '”的搜索结果';
        }
        results.innerHTML = matches.slice(0, 200).map(createResultCard).join('');
        if (empty) {
            empty.textContent = matches.length ? '' : '未找到符合条件的影片';
            empty.classList.toggle('is-visible', matches.length === 0);
        }
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupPlayer() {
        var shell = document.querySelector('.movie-player');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.play-overlay');
        var sourceTag = video ? video.querySelector('source') : null;
        if (!video || !sourceTag) {
            return;
        }
        var source = sourceTag.getAttribute('src');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = source;
            } else {
                video.src = source;
            }
            attached = true;
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        shell.addEventListener('click', function (event) {
            if (event.target === shell) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNavigation();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupPlayer();
    });
})();
