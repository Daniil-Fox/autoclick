export default class FAQ {
  constructor() {
    this.faqItems = document.querySelectorAll(".faq-item");
    this.faqCols = document.querySelectorAll(".faq__col");
    this.init();
  }

  init() {
    this.bindEvents();
    this.equalizeHeights();

    // Пересчитываем высоты при изменении размера окна
    window.addEventListener("resize", () => {
      this.equalizeHeights();
    });
  }

  bindEvents() {
    this.faqItems.forEach((item) => {
      const header = item.querySelector(".faq-item__header");
      const content = item.querySelector(".faq-item__content");
      const btn = item.querySelector(".faq-item__btn");

      if (header && content && btn) {
        header.addEventListener("click", () =>
          this.toggleItem(item, content, btn)
        );
      }
    });
  }

  equalizeHeights() {
    // Проверяем, что мы на десктопе (ширина больше 576px)
    if (window.innerWidth <= 576) {
      // На мобильных устройствах убираем фиксированную высоту
      this.faqItems.forEach((item) => {
        item.style.minHeight = "auto";
      });
      return;
    }

    // Получаем колонки
    const firstCol = this.faqCols[0];
    const secondCol = this.faqCols[1];

    if (!firstCol || !secondCol) return;

    // Получаем элементы из каждой колонки
    const firstColItems = firstCol.querySelectorAll(".faq-item");
    const secondColItems = secondCol.querySelectorAll(".faq-item");

    // Группируем элементы по парам: элемент из col1 + элемент из col2
    const pairsCount = Math.min(firstColItems.length, secondColItems.length);

    for (let i = 0; i < pairsCount; i++) {
      const firstColItem = firstColItems[i];
      const secondColItem = secondColItems[i];

      if (firstColItem && secondColItem) {
        // Выравниваем высоту только для нераскрытых блоков
        if (
          !firstColItem.classList.contains("open") &&
          !secondColItem.classList.contains("open")
        ) {
          // Сбрасываем min-height для корректного расчета
          firstColItem.style.minHeight = "auto";
          secondColItem.style.minHeight = "auto";

          // Получаем полную высоту блоков (включая паддинги)
          const firstItemHeight = firstColItem.offsetHeight;
          const secondItemHeight = secondColItem.offsetHeight;

          // Устанавливаем min-height равной максимальной высоте блока из пары
          const maxItemHeight = Math.max(firstItemHeight, secondItemHeight);
          firstColItem.style.minHeight = `${maxItemHeight}px`;
          secondColItem.style.minHeight = `${maxItemHeight}px`;
        }
      }
    }
  }

  toggleItem(clickedItem, content, btn) {
    const isOpen = clickedItem.classList.contains("open");
    this.closeAllItems();
    if (!isOpen) {
      clickedItem.classList.add("open");
      btn.style.transform = "rotate(180deg)";
      const scrollHeight = content.scrollHeight;
      content.style.maxHeight = `${scrollHeight}px`;
      // Убираем изменение min-height - высота парного элемента не должна меняться
    }
  }

  closeAllItems() {
    this.faqItems.forEach((item) => {
      const content = item.querySelector(".faq-item__content");
      const btn = item.querySelector(".faq-item__btn");

      if (content && btn) {
        item.classList.remove("open");
        btn.style.transform = "rotate(0deg)";
        content.style.maxHeight = "0";
      }
    });

    // После закрытия всех элементов пересчитываем высоты
    setTimeout(() => {
      this.equalizeHeights();
    }, 300); // Ждем окончания анимации закрытия
  }
}
