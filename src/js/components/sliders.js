import { Swiper } from "swiper";
import { Mousewheel, Navigation } from "swiper/modules";
Swiper.use([Navigation, Mousewheel]);

new Swiper(".testi__slider", {
  slidesPerView: "auto",
  spaceBetween: 20,
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

const autoSlider = $('.popular__slider').owlCarousel({
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
  }
})

// Intersection Observer для автоплея clients слайдера
const clientsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Слайдер в зоне видимости - запускаем автоплей
      if (autoSlider) autoSlider.trigger('play.owl.autoplay');
    } else {
      // Слайдер вне зоны видимости - останавливаем автоплей
      if (autoSlider) autoSlider.trigger('stop.owl.autoplay');
    }
  });
}, {
  threshold: 0.1
});

// Наблюдаем за clients слайдером
const clientsElement = document.querySelector('.popular__slider');
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
