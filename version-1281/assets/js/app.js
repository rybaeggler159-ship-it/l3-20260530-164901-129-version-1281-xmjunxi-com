(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var thumbs = selectAll("[data-hero-thumb]");
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, pos) {
                slide.classList.toggle("is-active", pos === current);
            });

            dots.forEach(function (dot, pos) {
                dot.classList.toggle("is-active", pos === current);
            });

            thumbs.forEach(function (thumb, pos) {
                thumb.classList.toggle("is-active", pos === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }

        restart();
    }

    var homeSearch = document.querySelector("[data-home-search]");
    var homeSearchButton = document.querySelector("[data-home-search-button]");

    function goSearch() {
        if (!homeSearch) {
            return;
        }

        var value = homeSearch.value.trim();
        var url = "./search.html";

        if (value) {
            url += "?q=" + encodeURIComponent(value);
        }

        window.location.href = url;
    }

    if (homeSearchButton) {
        homeSearchButton.addEventListener("click", goSearch);
    }

    if (homeSearch) {
        homeSearch.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                goSearch();
            }
        });
    }

    var input = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var cards = selectAll("[data-card]");
    var emptyState = document.querySelector("[data-empty-state]");

    function getYearMatch(value, year) {
        if (!year) {
            return true;
        }

        if (year === "older") {
            return Number(value) < 2020;
        }

        return value === year;
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var category = categorySelect ? categorySelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || "").toLowerCase();
            var cardType = card.getAttribute("data-type") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var cardCategory = card.getAttribute("data-category") || "";
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }

            if (type && cardType !== type) {
                matched = false;
            }

            if (!getYearMatch(cardYear, year)) {
                matched = false;
            }

            if (category && cardCategory !== category) {
                matched = false;
            }

            card.style.display = matched ? "" : "none";

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    [input, typeSelect, yearSelect, categorySelect].forEach(function (element) {
        if (element) {
            element.addEventListener("input", applyFilters);
            element.addEventListener("change", applyFilters);
        }
    });

    if (input) {
        var params = new URLSearchParams(window.location.search);
        var preset = params.get("q");

        if (preset) {
            input.value = preset;
        }

        applyFilters();
    }
})();
