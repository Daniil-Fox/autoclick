/**
 * Класс для управления видео с кастомными кнопками play и автовоспроизведением
 */
class VideoPlayer {
  constructor() {
    this.videoPlayers = new Map();
    this.intersectionObserver = null;
    // Setup IntersectionObserver first
    this.setupIntersectionObserver();
    // Then initialize videos
    this.init();
  }

  /**
   * Инициализация всех видео плееров на странице
   */
  init() {
    // Находим все контейнеры video-wrapper с data-video-player
    const videoContainers = document.querySelectorAll(
      ".video-wrapper[data-video-player]"
    );
    videoContainers.forEach((container) => {
      const videoId = container.dataset.videoPlayer;
      const video = container.querySelector("video");
      const playButton = container.querySelector("[data-video-play]");
      const cover = container.querySelector("[data-video-cover]");
      const isAutoplay = container.hasAttribute("data-video-autoplay");

      if (video) {
        this.videoPlayers.set(videoId, {
          container,
          video,
          playButton,
          cover,
          isPlaying: false,
          isAutoplay,
          isInViewport: false,
        });
        this.setupVideoPlayer(videoId);

        // Add to intersection observer only if it's an autoplay video
        if (isAutoplay && this.intersectionObserver) {
          this.intersectionObserver.observe(container);
        }
      }
    });
  }

  /**
   * Настройка Intersection Observer для автовоспроизведения
   */
  setupIntersectionObserver() {
    const options = {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.1, // 10% видео должно быть видимо
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoId = entry.target.dataset.videoPlayer;
        const player = this.videoPlayers.get(videoId);

        if (!player || !player.isAutoplay) return;

        if (entry.isIntersecting) {
          player.isInViewport = true;
          this.autoplayVideo(videoId);
        } else {
          player.isInViewport = false;
          this.pauseVideo(videoId);
        }
      });
    }, options);
  }

  /**
   * Настройка отдельного видео плеера
   * @param {string} videoId - ID видео плеера
   */
  setupVideoPlayer(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player) return;

    const { video, playButton, cover, container, isAutoplay } = player;

    // Настройки для автовоспроизведения
    if (isAutoplay) {
      video.muted = true; // Автовоспроизведение работает только с muted видео
      video.loop = true; // Зацикливаем автовидео
      video.controls = false; // Убираем контролы для автовидео
      video.playsInline = true; // Для мобильных устройств
    } else {
      // Для видео с кнопкой play
      video.muted = false; // Включаем звук
      video.controls = false; // Изначально контролы скрыты
      video.preload = "metadata"; // Предзагрузка метаданных
    }

    // Обработчик клика по кнопке play (только для не-автовидео)
    if (playButton && !isAutoplay) {
      playButton.addEventListener("click", () => {
        this.playVideo(videoId);
      });
    }

    // Обработчики событий видео
    video.addEventListener("play", () => {
      this.onVideoPlay(videoId);
    });

    video.addEventListener("pause", () => {
      // Handle pause from native controls
      if (!isAutoplay) {
        video.controls = false;
        if (playButton) {
          playButton.style.display = "block";
          playButton.style.opacity = 1;
          playButton.style.pointerEvents = "all";
        }
      }
      this.onVideoPause(videoId);
    });

    // Add event listener for when user clicks native controls pause button
    video.addEventListener("timeupdate", () => {
      if (!player.isAutoplay && !video.paused && !video.controls) {
        video.controls = true;
      }
    });

    video.addEventListener("ended", () => {
      this.onVideoEnd(videoId);
    });

    // Обработчик ошибок видео
    video.addEventListener("error", (e) => {
      console.error("Ошибка воспроизведения видео:", e);
      this.onVideoError(videoId);
    });

    // Обработчик загрузки метаданных
    video.addEventListener("loadedmetadata", () => {
      console.log(`Видео "${videoId}" готово к воспроизведению`);
    });
  }

  /**
   * Автовоспроизведение видео при появлении в области видимости
   * @param {string} videoId - ID видео плеера
   */
  autoplayVideo(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player || !player.isAutoplay || player.isPlaying) return;

    const { video, container, cover } = player;

    try {
      // Скрываем обложку для автовидео
      if (cover) {
        cover.style.display = "none";
      }

      // Показываем видео
      container.classList.add("_active");

      // Воспроизводим видео
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            player.isPlaying = true;
            console.log(`Автовидео "${videoId}" воспроизводится`);
          })
          .catch((error) => {
            console.error("Ошибка автовоспроизведения:", error);
          });
      }
    } catch (error) {
      console.error("Ошибка при автовоспроизведении:", error);
    }
  }

  /**
   * Воспроизведение видео по кнопке
   * @param {string} videoId - ID видео плеера
   */
  playVideo(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player) return;

    const { video, container, cover, playButton } = player;

    try {
      // Скрываем обложку
      if (cover) {
        cover.style.display = "none";
      }

      // Скрываем кастомную кнопку play
      if (playButton) {
        playButton.style.display = "none";
      }

      // Показываем видео
      container.classList.add("_active");

      // Включаем контролы и звук при ручном воспроизведении
      video.controls = true;
      video.muted = false;

      // Воспроизводим видео
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            player.isPlaying = true;
            console.log(`Видео "${videoId}" воспроизводится`);
          })
          .catch((error) => {
            console.error("Ошибка воспроизведения:", error);
            this.onVideoError(videoId);
          });
      }
    } catch (error) {
      console.error("Ошибка при попытке воспроизведения:", error);
      this.onVideoError(videoId);
    }
  }

  /**
   * Пауза видео
   * @param {string} videoId - ID видео плеера
   */
  pauseVideo(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player) return;

    const { video } = player;
    video.pause();
    player.isPlaying = false;
  }

  /**
   * Остановка видео
   * @param {string} videoId - ID видео плеера
   */
  stopVideo(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player) return;

    const { video, container, cover, isAutoplay } = player;

    video.pause();
    video.currentTime = 0;
    player.isPlaying = false;

    // Скрываем видео и показываем обложку
    container.classList.remove("_active");
    if (cover) {
      cover.style.display = "block";
    }

    // Для не-автовидео скрываем контролы при остановке
    if (!isAutoplay) {
      video.controls = false;
    }
  }

  /**
   * Обработчик начала воспроизведения
   * @param {string} videoId - ID видео плеера
   */
  onVideoPlay(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player) return;

    player.isPlaying = true;
    const videoType = player.isAutoplay ? "автовидео" : "видео";
    console.log(`${videoType} "${videoId}" начало воспроизведение`);
  }

  /**
   * Обработчик паузы
   * @param {string} videoId - ID видео плеера
   */
  onVideoPause(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player) return;

    const { video, playButton, isAutoplay } = player;
    player.isPlaying = false;

    // Для видео с кнопкой (не автовоспроизведение)
    if (!isAutoplay) {
      // Скрываем стандартные контролы
      video.controls = false;
      // Показываем кастомную кнопку play
      if (playButton) {
        playButton.style.display = "block";
      }
    }

    const videoType = player.isAutoplay ? "автовидео" : "видео";
    console.log(`${videoType} "${videoId}" поставлено на паузу`);
  }

  /**
   * Обработчик окончания видео
   * @param {string} videoId - ID видео плеера
   */
  onVideoEnd(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player) return;

    player.isPlaying = false;
    console.log(`Видео "${videoId}" завершено`);

    // For non-autoplay videos, hide controls on end
    if (!player.isAutoplay) {
      player.video.controls = false;
      // Можно добавить логику для показа обложки
    }
  }

  /**
   * Обработчик ошибки видео
   * @param {string} videoId - ID видео плеера
   */
  onVideoError(videoId) {
    const player = this.videoPlayers.get(videoId);
    if (!player) return;

    player.isPlaying = false;
    console.error(`Ошибка в видео "${videoId}"`);

    // Показываем обложку при ошибке
    const { container, cover, video, isAutoplay } = player;
    container.classList.remove("_active");
    if (cover) {
      cover.style.display = "block";
    }

    // Скрываем контролы при ошибке
    if (!isAutoplay) {
      video.controls = false;
    }
  }

  /**
   * Получение состояния видео
   * @param {string} videoId - ID видео плеера
   * @returns {boolean}
   */
  isPlaying(videoId) {
    const player = this.videoPlayers.get(videoId);
    return player ? player.isPlaying : false;
  }

  /**
   * Получение всех видео плееров
   * @returns {Map}
   */
  getAllPlayers() {
    return this.videoPlayers;
  }

  /**
   * Уничтожение наблюдателя (для очистки ресурсов)
   */
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

// Создаем экземпляр класса
const videoPlayer = new VideoPlayer();

// Экспортируем для использования в других модулях
export { videoPlayer, VideoPlayer };
