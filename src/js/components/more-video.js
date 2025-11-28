export default class MoreVideo {
  constructor() {
    this.items = document.querySelectorAll(".more__item");
    this.currentIframe = null;
    this.init();
  }

  init() {
    if (this.items.length === 0) return;
    this.bindEvents();
  }

  bindEvents() {
    this.items.forEach((item) => {
      item.addEventListener("click", () => this.handleClick(item));
    });
  }

  handleClick(clickedItem) {
    // Если уже есть активный iframe и он не тот, который кликнули - скрываем его
    if (this.currentIframe && this.currentIframe !== clickedItem) {
      this.hideVideo(this.currentIframe);
    }

    // Получаем data-src из clickedItem или из img внутри
    const img = clickedItem.querySelector("img");
    const dataSrc = clickedItem.getAttribute("data-src") || img?.getAttribute("data-src");

    if (!dataSrc) return;

    // Проверяем, есть ли уже iframe в этом элементе
    const existingIframe = clickedItem.querySelector("iframe");

    if (existingIframe) {
      // Если iframe уже есть, переключаемся на него
      this.showVideo(clickedItem);
      this.currentIframe = clickedItem;
    } else {
      // Если iframe нет, создаем его
      this.createVideo(clickedItem, dataSrc);
      this.currentIframe = clickedItem;
    }
  }

  createVideo(item, dataSrc) {
    // Конвертируем VK URL в формат iframe
    const iframeSrc = this.convertVkUrl(dataSrc);

    // Находим img для скрытия
    const img = item.querySelector(".img-wrapper");

    // Создаем iframe
    const iframe = document.createElement("iframe");
    iframe.src = iframeSrc;
    iframe.setAttribute("allow", "autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "");

    // Добавляем iframe в item
    item.appendChild(iframe);

    // Анимируем переход
    requestAnimationFrame(() => {
      if (img) img.style.opacity = "0";
      setTimeout(() => {
        if (img) img.style.display = "none";
        iframe.style.opacity = "1";
        iframe.style.pointerEvents = "auto";
      }, 150);
    });
  }

  showVideo(item) {
    const iframe = item.querySelector("iframe");
    const img = item.querySelector(".img-wrapper");

    if (!iframe) return;

    // Показываем iframe и скрываем img
    requestAnimationFrame(() => {
      if (img) {
        img.style.opacity = "0";
        setTimeout(() => {
          if (img) img.style.display = "none";
        }, 150);
      }
      iframe.style.opacity = "1";
      iframe.style.pointerEvents = "auto";
    });
  }

  hideVideo(item) {
    const iframe = item.querySelector("iframe");
    const img = item.querySelector(".img-wrapper");

    if (!iframe || !img) return;

    // Плавно скрываем iframe и показываем img
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";

    setTimeout(() => {
      // Останавливаем воспроизведение и удаляем iframe
      try {
        iframe.src = "";
      } catch (_) {}
      iframe.remove();

      // Возвращаем обложку
      img.style.display = "block";
      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });

      if (this.currentIframe === item) {
        this.currentIframe = null;
      }
    }, 150);
  }

  convertVkUrl(url) {
    // Извлекаем oid и id из URL вида https://vk.com/clip-232383915_456239022
    const match = url.match(/clip-(\d+)_(\d+)/);

    if (match) {
      const oid = match[1];
      const id = match[2];
      return `https://vk.com/video_ext.php?oid=-${oid}&id=${id}&hd=2&autoplay=1`;
    }

    return url;
  }
}

