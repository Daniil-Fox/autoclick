// Предпросмотр документов в модалке "modal-doc"
// Кнопка/ссылка-триггер должна иметь класс .js-doc-preview и атрибуты:
//  - data-doc  — URL, который подставляется в src iframe (без изменений)
//  - data-file — URL для кнопки в модалке (открывается в новой вкладке)
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const triggers = document.querySelectorAll(".js-doc-preview");
    if (!triggers.length) return;

    const modal = document.getElementById("modal-doc");
    if (!modal) return;
    const iframe = modal.querySelector("iframe");
    const downloadLink = modal.querySelector(".modal-doc__download");
    const overlay = modal.querySelector(".modal__overlay");
    const closeBtn = modal.querySelector(".modal__close");

    function openModal() {
      modal.classList.add("modal--active");
      document.body.classList.add("modal-open");
    }

    function closeModal() {
      modal.classList.remove("modal--active");
      document.body.classList.remove("modal-open");
      if (iframe) iframe.src = "about:blank";
    }

    // Закрытие по клику на overlay
    if (overlay) overlay.addEventListener("click", closeModal);

    // Закрытие по кнопке закрытия
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Закрытие по клику на container (вне контента)
    const container = modal.querySelector(".modal__container");
    if (container) {
      container.addEventListener("click", (e) => {
        // Закрываем только если клик был именно по container, а не по его дочерним элементам
        if (e.target === container) {
          closeModal();
        }
      });
    }

    // Предотвращаем закрытие при клике на контент модалки
    const content = modal.querySelector(".modal__content");
    if (content) {
      content.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Закрытие по клавише Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("modal--active")) {
        closeModal();
      }
    });

    triggers.forEach((btn) => {
      btn.removeAttribute("download");
      btn.setAttribute("href", "#");

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const docUrl = btn.getAttribute("data-doc") || "";
        const fileUrl = btn.getAttribute("data-file") || "";

        if (iframe) iframe.src = docUrl;

        if (downloadLink) {
          if (fileUrl) {
            downloadLink.href = fileUrl;
            downloadLink.removeAttribute("download");
            downloadLink.setAttribute("target", "_blank");
            downloadLink.setAttribute("rel", "noopener");
            downloadLink.style.display = "";
          } else {
            downloadLink.removeAttribute("href");
            downloadLink.style.display = "none";
          }
        }

        openModal();
      });
    });
  });
})();
