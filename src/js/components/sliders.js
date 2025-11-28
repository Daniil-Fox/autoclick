import { Swiper } from "swiper";
import {
  Autoplay,
  EffectFade,
  Mousewheel,
  Navigation,
  Thumbs,
} from "swiper/modules";
Swiper.use([Navigation, Mousewheel, Thumbs, EffectFade, Autoplay]);

const HERO_AUTOPLAY_DELAY = 8000;
const HERO_THUMB_PROGRESS_CLASS = "hero-thumb-progressing";
const HERO_THUMB_PAUSE_CLASS = "hero-thumb-progress-paused";

const heroThumbsRoot = document.querySelector(".hero__thumbs");
const heroSliderRoot = document.querySelector(".hero__slider");

let heroThumbs = null;
if (heroThumbsRoot) {
  heroThumbs = new Swiper(heroThumbsRoot, {
    slidesPerView: "auto",
    spaceBetween: 20,

    breakpoints: {
      320: {
        spaceBetween: 15,
      },
      577: {
        spaceBetween: 20,
      },
    },
  });
}

const heroThumbSlides = () => Array.from(heroThumbs?.slides ?? []);

const resetThumbProgress = () => {
  heroThumbSlides().forEach((slide) => {
    slide.classList.remove(HERO_THUMB_PROGRESS_CLASS);
    slide.classList.remove(HERO_THUMB_PAUSE_CLASS);
  });
};

const restartThumbProgress = (index) => {
  if (!heroThumbs) return;
  resetThumbProgress();
  const slides = heroThumbSlides();
  const target = slides[index];
  if (!target) return;
  target.offsetWidth; // force reflow to restart animation
  target.classList.add(HERO_THUMB_PROGRESS_CLASS);
};

const toggleThumbProgressPause = (paused) => {
  heroThumbSlides().forEach((slide) => {
    if (slide.classList.contains(HERO_THUMB_PROGRESS_CLASS)) {
      slide.classList.toggle(HERO_THUMB_PAUSE_CLASS, paused);
    }
  });
};

let heroSlider = null;
if (heroSliderRoot) {
  heroSlider = new Swiper(heroSliderRoot, {
    slidesPerView: 1,
    spaceBetween: 20,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    autoplay: {
      delay: HERO_AUTOPLAY_DELAY,
      disableOnInteraction: false,
    },
    thumbs: heroThumbs ? { swiper: heroThumbs } : undefined,
  });
}

const heroSliderSlides = () => Array.from(heroSlider?.slides ?? []);

const getHeroSlideVideo = (index) =>
  heroSliderSlides()[index]?.querySelector(".hero__video") ?? null;

const resetHeroSlideVideo = (index) => {
  const video = getHeroSlideVideo(index);
  if (!video) return;
  video.pause();
  try {
    video.currentTime = 0;
  } catch (err) {
    // ignored: some browsers throw if metadata not loaded yet
  }
};

const playHeroSlideVideo = (index) => {
  const video = getHeroSlideVideo(index);
  if (!video) return;
  try {
    video.currentTime = 0;
  } catch (err) {
    // ignored
  }
  const playPromise = video.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise.catch(() => {
      // autoplay can be blocked; ignored
    });
  }
};

const syncHeroVideosWithActiveSlide = () => {
  if (!heroSlider) return;
  const activeIndex = heroSlider.realIndex ?? 0;
  heroSliderSlides().forEach((_, index) => {
    if (index === activeIndex) {
      playHeroSlideVideo(index);
    } else {
      resetHeroSlideVideo(index);
    }
  });
};

let heroVideoLoopTimer = null;
const clearHeroVideoLoop = () => {
  if (!heroVideoLoopTimer) return;
  clearInterval(heroVideoLoopTimer);
  heroVideoLoopTimer = null;
};

const startHeroVideoLoop = () => {
  clearHeroVideoLoop();
  if (!heroSlider) return;
  heroVideoLoopTimer = setInterval(() => {
    const activeIndex = heroSlider.realIndex ?? 0;
    playHeroSlideVideo(activeIndex);
  }, HERO_AUTOPLAY_DELAY);
};

new Swiper(".testi__slider", {
  slidesPerView: "auto",
  spaceBetween: 20,
});

new Swiper(".more__slider", {
  slidesPerView: "auto",
  spaceBetween: 20,
  mousewheel: {
    enabled: true,
    releaseOnEdges: true,
  },
});
// new Swiper(".popular__slider > .swiper", {
//   slidesPerView: "auto",
//   spaceBetween: 40,
//   mousewheel: {
//     enabled: true,
//     releaseOnEdges: true,
//   },

//   breakpoints: {
//     320: {
//       spaceBetween: 30,
//     },
//     577: {
//       spaceBetween: 40,
//     },
//   },
// });

const autoSlider = $(".popular__slider").owlCarousel({
  loop: true,
  margin: 30,
  nav: false,
  dots: false,
  autoplay: false,
  autoplaySpeed: 1000,
  autoplayTimeout: 3500,
  autoplayHoverPause: false,
  smartSpeed: 1000,
  items: 4,
  margin: 20,
  autoWidth: true,
  center: false,
  startPosition: 0,
  responsive: {
    // 0: {
    //   items: 2,
    //   margin: 20,
    //   autoWidth: true,
    // },
    // 601: {
    //   items: 4,
    //   center: false,
    //   margin: 30,
    // }
  },
});

// Intersection Observer для автоплея clients слайдера
const clientsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Слайдер в зоне видимости - запускаем автоплей
        if (autoSlider) autoSlider.trigger("play.owl.autoplay");
      } else {
        // Слайдер вне зоны видимости - останавливаем автоплей
        if (autoSlider) autoSlider.trigger("stop.owl.autoplay");
      }
    });
  },
  {
    threshold: 0.1,
  }
);

// Наблюдаем за clients слайдером
const clientsElement = document.querySelector(".popular__slider");
if (clientsElement) clientsObserver.observe(clientsElement);

window.addEventListener("DOMContentLoaded", () => {
  const resizableSwiper = (
    breakpoint,
    swiperClass,
    swiperSettings,
    callback
  ) => {
    let swiper;

    breakpoint = window.matchMedia(breakpoint);

    const enableSwiper = function (className, settings) {
      swiper = new Swiper(className, settings);

      if (callback) {
        callback(swiper);
      }
    };

    const checker = function () {
      if (breakpoint.matches) {
        return enableSwiper(swiperClass, swiperSettings);
      } else {
        if (swiper !== undefined) swiper.destroy(true, true);
        return;
      }
    };

    breakpoint.addEventListener("change", checker);
    checker();
  };

  const someFunc = (instance) => {
    if (instance) {
      instance.on("slideChange", function (e) {
        console.log("*** mySwiper.activeIndex", instance.activeIndex);
      });
    }
  };

  resizableSwiper("(min-width: 601px)", ".benefits__slider", {
    slidesPerView: "auto",
    spaceBetween: 20,
    mousewheel: {
      enabled: true,
      releaseOnEdges: true,
    },
  });
});

if (heroThumbsRoot) {
  heroThumbsRoot.style.setProperty(
    "--hero-thumb-progress-duration",
    `${HERO_AUTOPLAY_DELAY}ms`
  );
}

if (heroSlider) {
  heroSlider.on("slideChangeTransitionStart", () => {
    if (typeof heroSlider.previousIndex === "number") {
      resetHeroSlideVideo(heroSlider.previousIndex);
    }
  });

  heroSlider.on("slideChangeTransitionEnd", () => {
    syncHeroVideosWithActiveSlide();
  });

  heroSlider.on("slideChangeTransitionStart", () => {
    restartThumbProgress(heroSlider.realIndex);
  });
  heroSlider.on("autoplayStart", () => {
    restartThumbProgress(heroSlider.realIndex);
    toggleThumbProgressPause(false);
    startHeroVideoLoop();
  });
  heroSlider.on("autoplayResume", () => {
    toggleThumbProgressPause(false);
    startHeroVideoLoop();
  });
  heroSlider.on("autoplayPause", () => {
    toggleThumbProgressPause(true);
    clearHeroVideoLoop();
  });
  heroSlider.on("autoplayStop", () => {
    toggleThumbProgressPause(true);
    clearHeroVideoLoop();
  });

  // инициализируем прогресс после первого рендера
  requestAnimationFrame(() => {
    restartThumbProgress(heroSlider.realIndex);
    syncHeroVideosWithActiveSlide();
    startHeroVideoLoop();
  });
}
