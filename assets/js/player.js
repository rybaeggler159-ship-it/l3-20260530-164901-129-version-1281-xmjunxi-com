(function () {
    var hlsPromise = null;

    function loadHls(callback) {
        if (window.Hls) {
            callback(true);
            return;
        }

        if (!hlsPromise) {
            hlsPromise = new Promise(function (resolve) {
                var script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
                script.async = true;
                script.onload = function () {
                    resolve(Boolean(window.Hls));
                };
                script.onerror = function () {
                    resolve(false);
                };
                document.head.appendChild(script);
            });
        }

        hlsPromise.then(callback);
    }

    function safePlay(video) {
        var task = video.play();

        if (task && typeof task.catch === "function") {
            task.catch(function () {});
        }
    }

    window.initVideoPlayer = function (url) {
        var frame = document.querySelector("[data-player]");
        var video = document.querySelector("[data-video]");
        var button = document.querySelector("[data-play-button]");
        var attached = false;
        var attaching = false;
        var hls = null;

        if (!frame || !video || !button || !url) {
            return;
        }

        function hideButton() {
            button.classList.add("is-hidden");
        }

        function attach(callback) {
            if (attached) {
                callback();
                return;
            }

            if (attaching) {
                window.setTimeout(function () {
                    attach(callback);
                }, 120);
                return;
            }

            attaching = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                attached = true;
                attaching = false;
                callback();
                return;
            }

            loadHls(function (ready) {
                if (ready && window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        attached = true;
                        attaching = false;
                        callback();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                            video.src = url;
                            attached = true;
                            attaching = false;
                            callback();
                        }
                    });
                } else {
                    video.src = url;
                    attached = true;
                    attaching = false;
                    callback();
                }
            });
        }

        function start() {
            hideButton();
            attach(function () {
                safePlay(video);
            });
        }

        button.addEventListener("click", function (event) {
            event.stopPropagation();
            start();
        });

        frame.addEventListener("click", function (event) {
            if (event.target === video && attached) {
                return;
            }

            if (event.target.closest("button") === button || event.target === frame || event.target === video) {
                start();
            }
        });

        video.addEventListener("play", hideButton);

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
