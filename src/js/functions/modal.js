/**
 * Класс для управления модальными окнами
 */
class Modal {
  constructor() {
    this.modals = new Map();
    this.activeModal = null;
    this.init();
  }

  /**
   * Инициализация модальных окон
   */
  init() {
    // Находим все модальные окна
    const modalElements = document.querySelectorAll(".modal");

    modalElements.forEach((modal) => {
      const modalId = modal.id;
      this.modals.set(modalId, modal);

      // Добавляем обработчики для кнопки закрытия
      const closeBtn = modal.querySelector(".modal__close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.close(modalId));
      }

      // Закрытие по клику на overlay
      const overlay = modal.querySelector(".modal__overlay");
      if (overlay) {
        overlay.addEventListener("click", () => this.close(modalId));
      }
    });

    // Обработчики для кнопок, открывающих модальные окна
    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-target]");
      if (target) {
        const modalId = target.dataset.target;
        this.open(modalId);
      }
    });

    // Закрытие по Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activeModal) {
        this.close(this.activeModal);
      }
    });
  }

  /**
   * Открытие модального окна
   * @param {string} modalId - ID модального окна
   */
  open(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal) {
      console.warn(`Модальное окно с ID "${modalId}" не найдено`);
      return;
    }

    // Закрываем предыдущее модальное окно, если есть
    if (this.activeModal) {
      this.close(this.activeModal);
    }

    // Открываем новое модальное окно
    modal.classList.add("modal--active");
    document.body.classList.add("modal-open");
    this.activeModal = modalId;

    // Фокус на первое поле ввода
    const firstInput = modal.querySelector("input, textarea, select");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    // Блокируем скролл body
    this.disableBodyScroll();

    console.log(`Модальное окно "${modalId}" открыто`);
  }

  /**
   * Закрытие модального окна
   * @param {string} modalId - ID модального окна
   */
  close(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal) return;

    modal.classList.remove("modal--active");

    if (this.activeModal === modalId) {
      this.activeModal = null;
      document.body.classList.remove("modal-open");
      this.enableBodyScroll();
    }

    console.log(`Модальное окно "${modalId}" закрыто`);
  }

  /**
   * Закрытие всех модальных окон
   */
  closeAll() {
    this.modals.forEach((modal, modalId) => {
      this.close(modalId);
    });
  }

  /**
   * Блокировка скролла body
   */
  disableBodyScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
  }

  /**
   * Разблокировка скролла body
   */
  enableBodyScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
  }

  /**
   * Проверка, открыто ли модальное окно
   * @param {string} modalId - ID модального окна
   * @returns {boolean}
   */
  isOpen(modalId) {
    const modal = this.modals.get(modalId);
    return modal ? modal.classList.contains("modal--active") : false;
  }

  /**
   * Получение активного модального окна
   * @returns {string|null}
   */
  getActiveModal() {
    return this.activeModal;
  }
}

// Создаем экземпляр класса
const modalManager = new Modal();

// Экспортируем для использования в других модулях
export { modalManager, Modal };
