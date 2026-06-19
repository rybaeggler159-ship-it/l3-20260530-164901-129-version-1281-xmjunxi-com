import { H as Hls } from "./hls-dru42stk.js";

function setStatus(video, message) {
  var shell = video.closest(".player-shell");
  var status = shell ? shell.querySelector("[data-player-status]") : null;

  if (status) {
    status.textContent = message;
  }
}

function initHls(video) {
  var source = video.getAttribute("data-hls");

  if (!source) {
    setStatus(video, "未找到播放源");
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(video, "播放源已就绪");
    });
    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus(video, "网络异常，正在重试");
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus(video, "媒体异常，正在恢复");
        hls.recoverMediaError();
        return;
      }

      setStatus(video, "播放源暂不可用");
      hls.destroy();
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    setStatus(video, "播放源已就绪");
  } else {
    setStatus(video, "当前浏览器不支持 HLS 播放");
  }
}

function initOverlay(video) {
  var shell = video.closest(".player-shell");
  var overlay = shell ? shell.querySelector("[data-play-overlay]") : null;

  if (!overlay) {
    return;
  }

  overlay.addEventListener("click", function () {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(function () {
        setStatus(video, "请点击播放器控件开始播放");
      });
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
    setStatus(video, "正在播放");
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      overlay.classList.remove("is-hidden");
      setStatus(video, "已暂停");
    }
  });

  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
    setStatus(video, "播放结束");
  });
}

function initPlayers() {
  var videos = document.querySelectorAll("video[data-hls]");

  videos.forEach(function (video) {
    initHls(video);
    initOverlay(video);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlayers);
} else {
  initPlayers();
}
