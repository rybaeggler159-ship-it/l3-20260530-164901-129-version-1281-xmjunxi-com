function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('movie-video');
  var cover = document.querySelector('[data-player-cover]');
  if (!video || !sourceUrl) return;

  function play() {
    if (cover) cover.classList.add('is-hidden');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.play().catch(function () {});
    } else {
      video.src = sourceUrl;
      video.play().catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }
}
