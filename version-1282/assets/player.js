(function () {
  var pendingHlsScript = null;

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve();
    }
    if (pendingHlsScript) {
      return pendingHlsScript;
    }
    pendingHlsScript = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return pendingHlsScript;
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId || 'movie-player');
    var cover = document.getElementById(options.coverId || 'player-cover');
    var source = options.source;
    var isReady = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (isReady) {
        return Promise.resolve();
      }
      isReady = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      return loadHlsScript().then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          return new Promise(function (resolve) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                  hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                  hlsInstance.recoverMediaError();
                } else {
                  hlsInstance.destroy();
                }
              }
              resolve();
            });
          });
        }
        video.src = source;
        return Promise.resolve();
      }).catch(function () {
        video.src = source;
        return Promise.resolve();
      });
    }

    function startPlayback() {
      attachSource().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
