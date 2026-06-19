document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');

    if (toggle && links) {
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        var activate = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5600);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                activate(dotIndex);
                start();
            });
        });

        activate(0);
        start();
    }

    var listing = document.querySelector('[data-listing]');
    if (listing) {
        var cards = Array.prototype.slice.call(listing.querySelectorAll('[data-card]'));
        var localSearch = document.querySelector('[data-local-search]');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var empty = document.querySelector('[data-empty]');
        var activeType = 'all';

        var apply = function () {
            var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
            var shown = 0;

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var type = card.getAttribute('data-type') || '';
                var matchText = !keyword || text.indexOf(keyword) !== -1;
                var matchType = activeType === 'all' || type === activeType;
                var visible = matchText && matchType;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        };

        if (localSearch) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                localSearch.value = query;
            }
            localSearch.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });

        apply();
    }

    document.querySelectorAll('.js-player').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-cover');
        var stream = player.getAttribute('data-stream');
        var attached = false;

        var attach = function () {
            if (!video || !stream || attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        };

        var play = function () {
            attach();
            player.classList.add('is-playing');
            video.setAttribute('controls', 'controls');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        };

        if (button && video) {
            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
    });
});
