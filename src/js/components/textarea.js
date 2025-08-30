export default class CustomTextarea {
  constructor(element) {
    if (!(element instanceof HTMLTextAreaElement)) return;
    this.textarea = element;
    this.wrapper = element.closest(".form__field-wrapper");
    if (!this.wrapper) return;
    this.init();
  }

  init() {
    // Создаем кастомный скроллбар
    this.createScrollbar();
    // Инициализируем обработчики событий
    this.initEvents();
    // Обновляем состояние скроллбара
    this.updateScrollbar();
  }

  createScrollbar() {
    // Создаем контейнер для скроллбара
    this.scrollbar = document.createElement("div");
    this.scrollbar.className = "textarea-scrollbar";

    // Создаем кнопку вверх
    this.upButton = document.createElement("button");
    this.upButton.className = "textarea-scroll-btn textarea-scroll-up";
    this.upButton.type = "button";
    this.upButton.innerHTML = `
      <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.84767 1.3828C3.19874 0.961515 3.37427 0.750872 3.57584 0.656461C3.8446 0.53058 4.15539 0.53058 4.42415 0.656461C4.62572 0.750871 4.80126 0.961513 5.15233 1.3828L6.94977 3.53973C7.52958 4.23549 7.81948 4.58338 7.85673 4.872C7.9064 5.25682 7.72897 5.63564 7.40154 5.84385C7.15597 6 6.70313 6 5.79744 6L2.20256 6C1.29687 6 0.844028 6 0.598457 5.84385C0.27103 5.63564 0.0936002 5.25682 0.143268 4.872C0.180518 4.58338 0.470422 4.23549 1.05023 3.53972L2.84767 1.3828Z"  />
      </svg>
    `;

    // Создаем трек для ползунка
    this.track = document.createElement("div");
    this.track.className = "textarea-scroll-track";

    // Создаем ползунок
    this.thumb = document.createElement("div");
    this.thumb.className = "textarea-scroll-thumb";
    this.track.appendChild(this.thumb);

    // Создаем кнопку вниз
    this.downButton = document.createElement("button");
    this.downButton.className = "textarea-scroll-btn textarea-scroll-down";
    this.downButton.type = "button";
    this.downButton.innerHTML = `
      <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.84767 4.6172C3.19874 5.03849 3.37427 5.24913 3.57584 5.34354C3.8446 5.46942 4.15539 5.46942 4.42415 5.34354C4.62572 5.24913 4.80126 5.03849 5.15233 4.6172L6.94977 2.46027C7.52958 1.76451 7.81948 1.41662 7.85673 1.128C7.9064 0.743177 7.72897 0.364358 7.40154 0.156153C7.15597 3.32783e-07 6.70313 2.65766e-07 5.79744 1.31732e-07L2.20256 -4.00277e-07C1.29687 -5.34311e-07 0.844028 -6.01328e-07 0.598457 0.156152C0.27103 0.364356 0.0936002 0.743176 0.143268 1.128C0.180518 1.41662 0.470422 1.76451 1.05023 2.46028L2.84767 4.6172Z"  />
      </svg>
    `;

    // Собираем скроллбар
    this.scrollbar.appendChild(this.upButton);
    this.scrollbar.appendChild(this.track);
    this.scrollbar.appendChild(this.downButton);

    // Добавляем скроллбар в существующую обертку
    this.wrapper.appendChild(this.scrollbar);
  }

  initEvents() {
    // Обработчик скролла textarea
    this.textarea.addEventListener("scroll", () => {
      this.updateScrollbar();
    });

    // Обработчик изменения размера textarea
    this.textarea.addEventListener("input", () => {
      this.updateScrollbar();
    });

    // Кнопка вверх
    this.upButton.addEventListener("click", () => {
      this.textarea.scrollTop -= 30;
    });

    // Кнопка вниз
    this.downButton.addEventListener("click", () => {
      this.textarea.scrollTop += 30;
    });

    // Клик по треку
    this.track.addEventListener("click", (e) => {
      if (e.target === this.track) {
        const trackRect = this.track.getBoundingClientRect();
        const clickPosition = e.clientY - trackRect.top;
        const trackHeight = this.track.clientHeight;
        const scrollPercent = clickPosition / trackHeight;
        this.textarea.scrollTop =
          scrollPercent *
          (this.textarea.scrollHeight - this.textarea.clientHeight);
      }
    });

    // Перетаскивание ползунка
    let isDragging = false;
    let startY;
    let startScrollTop;

    this.thumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = this.textarea.scrollTop;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const deltaY = e.clientY - startY;
      const trackHeight = this.track.clientHeight - this.thumb.clientHeight;
      const scrollPercent = deltaY / trackHeight;
      const scrollAmount =
        scrollPercent *
        (this.textarea.scrollHeight - this.textarea.clientHeight);

      this.textarea.scrollTop = startScrollTop + scrollAmount;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
  }

  updateScrollbar() {
    const scrollPercent =
      this.textarea.scrollTop /
      (this.textarea.scrollHeight - this.textarea.clientHeight);
    const trackHeight = this.track.clientHeight - this.thumb.clientHeight;
    const thumbPosition = scrollPercent * trackHeight;

    this.thumb.style.transform = `translateY(${thumbPosition}px)`;

    // Обновляем состояние кнопок
    const isTop = this.textarea.scrollTop === 0;
    const isBottom =
      this.textarea.scrollTop >=
      this.textarea.scrollHeight - this.textarea.clientHeight;

    this.upButton.disabled = isTop;
    this.downButton.disabled = isBottom;

    // Добавляем/убираем класс disabled
    this.upButton.classList.toggle("disabled", isTop);
    this.downButton.classList.toggle("disabled", isBottom);

    // Обновляем прозрачность скроллбара
    this.scrollbar.classList.toggle("disabled", isTop && isBottom);
  }
}
