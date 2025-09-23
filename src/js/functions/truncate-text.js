/**
 * Точная обрезка текста до указанного количества строк с троеточием
 * @param {HTMLElement} element - Элемент с текстом
 * @param {number} lines - Количество строк для отображения
 */
export function truncateTextToLines(element, lines = 12) {
  if (!element) return;

  // Проверяем, нужно ли применять обрезку только на мобильных
  const isMobile = window.innerWidth <= 600;

  if (!isMobile) {
    // На десктопе убираем ограничения
    element.classList.remove("about__text--truncated");
    element.style.maxHeight = "";
    element.style.overflow = "";
    return;
  }

  // На мобильных применяем CSS ограничения
  element.classList.add("about__text--truncated");
  element.style.maxHeight = `calc(1.58em * ${lines})`;
  element.style.overflow = "hidden";
}

/**
 * Переключает состояние текста между свернутым и развернутым
 * @param {HTMLElement} textElement - Элемент с текстом
 * @param {HTMLElement} button - Кнопка переключения
 */
export function toggleTextExpansion(textElement, button) {
  if (!textElement || !button) return;

  const isExpanded = textElement.classList.contains("about__text--expanded");

  if (isExpanded) {
    // Сворачиваем текст
    textElement.classList.remove("about__text--expanded");
    button.classList.remove("about__read-more--expanded");
    truncateTextToLines(textElement, 12);
  } else {
    // Разворачиваем текст - устанавливаем max-height равным реальной высоте
    textElement.classList.add("about__text--expanded");
    button.classList.add("about__read-more--expanded");

    // Устанавливаем max-height равным scrollHeight для плавного разворачивания
    textElement.style.maxHeight = textElement.scrollHeight + "px";
  }
}

/**
 * Инициализация обрезки текста для всех элементов с классом about__text
 */
export function initTextTruncation() {
  const textElements = document.querySelectorAll(".about__text");
  const readMoreButtons = document.querySelectorAll(".about__read-more");

  console.log(
    "Инициализация обрезки текста:",
    textElements.length,
    "элементов найдено"
  );
  console.log("Кнопки найдено:", readMoreButtons.length);

  textElements.forEach((element, index) => {
    console.log("Обрабатываю элемент:", element);
    truncateTextToLines(element, 12);

    // Добавляем обработчик для кнопки "Читать далее"
    const button = readMoreButtons[index];
    if (button) {
      console.log("Добавляю обработчик для кнопки:", button);
      button.addEventListener("click", () => {
        console.log("Клик по кнопке, переключаю состояние");
        toggleTextExpansion(element, button);
      });
    } else {
      console.log("Кнопка не найдена для элемента", index);
    }
  });

  // Обработчик изменения размера окна
  window.addEventListener("resize", () => {
    textElements.forEach((element) => {
      // При изменении размера окна сбрасываем развернутое состояние
      element.classList.remove("about__text--expanded");
      truncateTextToLines(element, 12);
    });

    // Сбрасываем состояние кнопок
    readMoreButtons.forEach((button) => {
      button.classList.remove("about__read-more--expanded");
    });
  });
}
