import "./components/sliders.js";
import "./components/inputs.js";
import "./components/dropdown.js";
import "./components/sliders.js";
import { burger } from "./functions/burger.js";
import CustomTextarea from "./components/textarea.js";
import { initTextTruncation } from "./functions/truncate-text.js";
import { modalManager } from "./functions/modal.js";
import { videoPlayer } from "./functions/video-player.js";

import "./functions/validate-forms.js";
import FAQ from "./components/faq.js";

// Инициализация кастомных textarea
document.addEventListener("DOMContentLoaded", () => {
  const textareas = document.querySelectorAll(".form__input--area");
  textareas.forEach((textarea) => {
    new CustomTextarea(textarea);
  });

  new FAQ();

  // Инициализация обрезки текста
  initTextTruncation();
});

// Логика для скрытия/показа header при скролле
(function () {
  const header = document.querySelector(".header");
  if (!header) return;
  let lastScroll = window.scrollY;
  let ticking = false;
  let headerHeight = 0;
  let isFixed = false;
  let hideTimeout = null;

  function getHeaderFullHeight() {
    const style = window.getComputedStyle(header);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    return header.offsetHeight + marginTop + marginBottom;
  }

  function setBodyPadding(pad) {
    document.body.style.paddingTop = pad ? getHeaderFullHeight() + "px" : "";
  }

  function onScroll() {
    const currentScroll = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    // Проверяем, находимся ли мы в самом верху страницы
    if (currentScroll <= 0) {
      // В самом верху — возвращаем header в исходное состояние
      header.classList.remove("header--fixed", "header--hidden");
      // setBodyPadding(false);
      isFixed = false;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    } else if (currentScroll > lastScroll && currentScroll > 50) {
      // Скролл вниз — скрываем header
      header.classList.add("header--hidden");
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        header.classList.remove("header--fixed");
        // setBodyPadding(false);
        isFixed = false;
      }, 300); // 300ms = transition
    } else if (currentScroll < lastScroll && currentScroll > 0) {
      // Скролл вверх (но не в самом верху) — показываем header
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      header.classList.remove("header--hidden");
      if (!isFixed) {
        header.classList.add("header--fixed");
        // setBodyPadding(true);
        isFixed = true;
      }
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
})();
