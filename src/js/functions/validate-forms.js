import JustValidate from "just-validate";
import Inputmask from "../../../node_modules/inputmask/dist/inputmask.es6.js";

export const validateForms = (selector, rules, checkboxes = [], afterSend) => {
  const form = document?.querySelector(selector);

  if (!form) {
    console.error("Нет такого селектора!");
    return false;
  }

  if (!rules) {
    console.error("Вы не передали правила валидации!");
    return false;
  }

  const validation = new JustValidate(selector);

  for (let item of rules) {
    validation.addField(item.ruleSelector, item.rules);
  }

  if (checkboxes.length) {
    for (let item of checkboxes) {
      validation.addRequiredGroup(`${item.selector}`, `${item.errorMessage}`);
    }
  }

  validation.onSuccess((ev) => {
    let formData = new FormData(ev.target);

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          if (afterSend) {
            afterSend();
          }
          console.log("Отправлено");
        }
      }
    };
    const path =
      location.origin + "/wp-content/themes/peremena/assets/mail.php";
    xhr.open("POST", path, true);
    xhr.send(formData);
    form
      .querySelectorAll(".filled")
      .forEach((el) => el.classList.remove("filled"));
    ev.target.reset();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // Массив селекторов форм
  const formSelectors = [".cta__form", ".modal__form"];

  formSelectors.forEach((formSelector) => {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // Находим элементы внутри конкретной формы
    const telField = form.querySelector(".input-tel")?.closest(".form__field");
    const telInput = form.querySelector(".input-tel");
    const emailInput = form.querySelector(".input-email");
    // Лейбл ищем только внутри блока с телефоном/email
    const contactLabel = telField
      ? telField.querySelector(".form__label")
      : null;
    const select = form.querySelector("select");
    const submitBtn = form.querySelector(".form__btn");

    let validator = null;
    let inputMask = null;

    // Изначально блокируем оба поля и устанавливаем правильный лейбл
    if (telInput) {
      console.log("dis");
      telInput.disabled = true;
      telInput.style.display = "block";
    }
    if (emailInput) {
      emailInput.disabled = true;
      emailInput.style.display = "none";
    }
    if (contactLabel) {
      contactLabel.textContent = "телефон/email";
    }

    function initMask() {
      if (!inputMask && telInput) {
        inputMask = new Inputmask({
          mask: "+7 (999) 999-99-99",
          showMaskOnHover: false,
          showMaskOnFocus: true,
          onBeforeMask: function (value) {
            if (!value || typeof value !== "string") return value;
            if (value.startsWith("7") || value.startsWith("8")) {
              return "";
            }
            return value;
          },
        });
        inputMask.mask(telInput);
      }
    }

    function clearMask() {
      if (inputMask) {
        inputMask.remove();
        inputMask = null;
      }
      if (telInput) {
        telInput.value = "";
      }
    }

    function setContactField(type) {
      clearMask();
      if (!telInput || !emailInput) return;

      // Удаляем класс filled у родительских .form__field
      const telField = telInput.closest(".form__field");
      const emailField = emailInput.closest(".form__field");
      // Находим блок с селектом (предыдущий .form__field)
      const selectField = telField?.previousElementSibling;

      if (telField) telField.classList.remove("filled");
      if (emailField && emailField !== telField)
        emailField.classList.remove("filled");
      // Удаляем класс filled у label внутри родительских .form__field
      if (telField) {
        const label = telField.querySelector("label");
        if (label) label.classList.remove("filled");
      }
      if (emailField && emailField !== telField) {
        const label = emailField.querySelector("label");
        if (label) label.classList.remove("filled");
      }

      // Если не выбран способ связи - скрываем form__field
      if (!select?.value) {
        if (telField) {
          telField.style.display = "none";
        }
        // Добавляем класс long блоку с селектом
        if (selectField) {
          selectField.classList.add("form__field--long");
        }
        telInput.disabled = true;
        emailInput.style.display = "none";
        emailInput.disabled = true;
        if (contactLabel) contactLabel.textContent = "телефон/email";
        return;
      }

      // Показываем form__field
      if (telField) {
        telField.style.display = "block";
      }
      // Убираем класс long у блока с селектом
      if (selectField) {
        selectField.classList.remove("form__field--long");
      }

      telInput.disabled = true;
      emailInput.style.display = "none";
      emailInput.disabled = true;

      if (select?.value) {
        if (type === "email") {
          telInput.style.display = "none";
          emailInput.style.display = "block";
          emailInput.disabled = false;
          emailInput.value = "";
          emailInput.setAttribute("type", "email");
          if (contactLabel) contactLabel.textContent = "email";
        } else {
          telInput.style.display = "block";
          emailInput.style.display = "none";
          telInput.disabled = false;
          telInput.value = "";
          telInput.setAttribute("type", "text");
          if (contactLabel) contactLabel.textContent = "телефон";
          initMask();
        }
      }
    }

    function getRules() {
      const selected = select?.value;
      if (!selected) return [];
      const isEmail = selected === "Email" || /mail/i.test(selected);
      if (isEmail) {
        return [
          {
            ruleSelector: `${formSelector} .input-email`,
            rules: [
              {
                rule: "required",
                value: true,
                errorMessage: "Заполните email!",
              },
              {
                rule: "email",
                value: true,
                errorMessage: "Введите корректный email!",
              },
            ],
          },
        ];
      } else {
        return [
          {
            ruleSelector: `${formSelector} .input-tel`,
            rules: [
              {
                rule: "required",
                value: true,
                errorMessage: "Заполните телефон!",
              },
              {
                rule: "function",
                validator: function (name, value) {
                  if (!value || typeof value !== "string") return true;
                  const cleanValue = value.replace(/\D/g, "");
                  return cleanValue.length === 11;
                },
                errorMessage: "Введите корректный номер телефона",
              },
            ],
          },
        ];
      }
    }

    const baseRules = [
      {
        ruleSelector: `${formSelector} .input-name`,
        rules: [
          { rule: "minLength", value: 2, errorMessage: "Минимум 2 символа" },
          { rule: "required", value: true, errorMessage: "Заполните имя!" },
        ],
      },
      {
        ruleSelector: `${formSelector} .select-contact`,
        rules: [
          {
            rule: "required",
            value: true,
            errorMessage: "Выберите способ связи!",
          },
        ],
      },
    ];

    function checkValidity() {
      if (form && submitBtn) {
        const nameValid = form.querySelector(".input-name")?.value?.length >= 2;
        const contactTypeValid = select?.value;
        let contactValid = false;
        if (!telInput.disabled && telInput.value) {
          contactValid = telInput.value.replace(/\D/g, "").length === 11;
        }
        if (!emailInput.disabled && emailInput.value) {
          contactValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        }
        submitBtn.disabled = !(nameValid && contactTypeValid && contactValid);
      }
    }

    function initValidation() {
      if (validator && typeof validator.destroy === "function") {
        validator.destroy();
        validator = null;
      }
      const selected = select?.value;
      const isEmail = selected === "Email" || /mail/i.test(selected);
      setContactField(isEmail ? "email" : "tel");
      const rules = [...baseRules, ...getRules()];
      validator = validateForms(formSelector, rules);
      form.removeEventListener("input", checkValidity);
      form.addEventListener("input", checkValidity);
      setTimeout(checkValidity, 100);
    }

    // Инициализация при загрузке
    initValidation();
    select?.addEventListener("change", initValidation);
  });

  // Открытие модального окна по клику на .modal-btn
  document.querySelectorAll(".modal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = document.querySelector(".modal");
      if (modal) {
        modal.classList.add("active");
      }
    });
  });

  // Закрытие модального окна при клике вне .modal__content
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      const content = modal.querySelector(".modal__content");
      const closeBtn = modal.querySelectorAll(".modal__close");
      if (e.target === modal || (content && !content.contains(e.target))) {
        modal.classList.remove("active");
      }
      closeBtn.forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          modal.classList.remove("active");
        });
      });
    });
  }
});
