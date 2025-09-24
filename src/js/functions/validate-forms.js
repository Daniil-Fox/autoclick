import JustValidate from "just-validate";
import Inputmask from "../../../node_modules/inputmask/dist/inputmask.es6.js";
import { modalManager } from "./modal.js";

let lastSubmit = {
  form: null,
  data: null,
  path: null,
};

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

  function openSuccessModal() {
    try {
      const active = modalManager.getActiveModal?.();
      if (active && active !== "modal-success" && active !== "modal-error") {
        modalManager.close(active);
      }
      modalManager.open("modal-success");
    } catch (e) {
      console.warn("Не удалось открыть модалку успешной отправки:", e);
    }
  }

  function openErrorModal() {
    try {
      const active = modalManager.getActiveModal?.();
      if (active && active !== "modal-success" && active !== "modal-error") {
        modalManager.close(active);
      }
      modalManager.open("modal-error");
    } catch (e) {
      console.warn("Не удалось открыть модалку ошибки:", e);
    }
  }

  validation.onSuccess((ev) => {
    // предотвращаем нативный submit
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();

    // защита от повторной отправки
    if (form.dataset.submitting === "true") return;
    form.dataset.submitting = "true";

    const submitBtn = form.querySelector(".form__btn");
    form.classList.add("is-loading");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
    }

    const formData = new FormData(form);

    const xhr = new XMLHttpRequest();
    xhr.timeout = 15000;

    const path =
      location.origin + "/wp-content/themes/autoclick/assets/mail.php";
    lastSubmit = { form, data: formData, path };

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // снимаем флаг отправки
        form.dataset.submitting = "false";

        form.classList.remove("is-loading");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-loading");
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            if (afterSend) afterSend();
          } catch (_) {}
          openSuccessModal();
          form
            .querySelectorAll(".filled")
            .forEach((el) => el.classList.remove("filled"));
          form.reset();
        } else {
          openErrorModal();
          console.warn("Ошибка отправки:", xhr.status, xhr.responseText);
        }
      }
    };

    xhr.onerror = function () {
      form.dataset.submitting = "false";
      form.classList.remove("is-loading");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
      }
      openErrorModal();
    };

    xhr.ontimeout = function () {
      form.dataset.submitting = "false";
      form.classList.remove("is-loading");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
      }
      openErrorModal();
    };

    xhr.open("POST", path, true);
    xhr.send(formData);
  });

  // возвращаем инстанс, чтобы снаружи можно было корректно destroy()
  return validation;
};

function retryLastSubmit() {
  if (!lastSubmit.form || !lastSubmit.data || !lastSubmit.path) return;
  const form = lastSubmit.form;
  const submitBtn = form.querySelector(".form__btn");

  // Включаем лоадер
  form.classList.add("is-loading");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
  }

  const xhr = new XMLHttpRequest();
  xhr.timeout = 15000;

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      form.classList.remove("is-loading");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          modalManager.close("modal-error");
          modalManager.open("modal-success");
        } catch (_) {}
        form
          .querySelectorAll(".filled")
          .forEach((el) => el.classList.remove("filled"));
        form.reset();
      } else {
        console.warn(
          "Ошибка повторной отправки:",
          xhr.status,
          xhr.responseText
        );
      }
    }
  };

  xhr.open("POST", lastSubmit.path, true);
  xhr.send(lastSubmit.data);
}

document.addEventListener("DOMContentLoaded", () => {
  // Закрытие модалок по кнопкам "Ок"/"Закрыть" и повторная отправка
  document.addEventListener("click", (e) => {
    const okBtn = e.target.closest(".modal__ok");
    if (okBtn) {
      const parentModal = okBtn.closest(".modal");
      const modalId = parentModal?.id;
      if (modalId) {
        try {
          modalManager.close(modalId);
        } catch (_) {}
      } else {
        const active = modalManager.getActiveModal?.();
        if (active) modalManager.close(active);
      }
    }

    const retryBtn = e.target.closest(".modal__retry");
    if (retryBtn) {
      retryLastSubmit();
    }
  });

  // Авто-поиск всех форм по универсальной разметке (CTA, CTA-bottom, modal и новые PHP partials)
  const forms = Array.from(document.querySelectorAll("form.form")).filter(
    (f) => {
      return (
        f.querySelector(".select-contact") ||
        f.querySelector(".input-tel") ||
        f.querySelector(".input-email")
      );
    }
  );

  let validateIdCounter = 0;

  forms.forEach((form) => {
    // защита от повторной инициализации одной и той же формы
    if (form.dataset.validationInit === "true") return;
    form.dataset.validationInit = "true";

    // назначаем уникальный id для селекторов правил
    if (!form.dataset.validateId) {
      validateIdCounter += 1;
      form.dataset.validateId = String(validateIdCounter);
    }
    const baseSelector = `form.form[data-validate-id="${form.dataset.validateId}"]`;

    const telField = form.querySelector(".input-tel")?.closest(".form__field");
    const telInput = form.querySelector(".input-tel");
    const emailInput = form.querySelector(".input-email");
    const nameInput = form.querySelector(".input-name");
    const cityInput = form.querySelector(".input-city");
    // поле марки авто (возможные варианты классов)
    const modelInput =
      form.querySelector(".input-model") ||
      form.querySelector(".input-brand") ||
      form.querySelector(".input-car") ||
      form.querySelector(".input-mark") ||
      null;
    const messInput = form.querySelector(".input-mess");
    const isCtaBottom = form.classList.contains("cta-bottom__form");
    const contactLabel = telField
      ? telField.querySelector(".form__label")
      : null;
    const select = form.querySelector("select.select-contact, .select-contact");
    const submitBtn = form.querySelector(".form__btn");

    let validator = null;
    let inputMask = null;

    if (telInput) telInput.style.display = "block";
    if (emailInput) emailInput.style.display = "none";
    if (contactLabel) {
      contactLabel.textContent = "Телефон/Email";
    }

    function initMask() {
      if (!inputMask && telInput) {
        inputMask = new Inputmask({
          mask: "+7 (999) 999-99-99",
          showMaskOnHover: false,
          showMaskOnFocus: true,
          onBeforeMask: function (value) {
            if (!value || typeof value !== "string") return value;
            if (value.startsWith("7") || value.startsWith("8")) return "";
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

      const telField = telInput.closest(".form__field");
      const emailField = emailInput.closest(".form__field");
      const selectField = telField?.previousElementSibling;

      if (telField) telField.classList.remove("filled");
      if (emailField && emailField !== telField)
        emailField.classList.remove("filled");
      if (telField) {
        const label = telField.querySelector("label");
        if (label) label.classList.remove("filled");
      }
      if (emailField && emailField !== telField) {
        const label = emailField.querySelector("label");
        if (label) label.classList.remove("filled");
      }

      if (!select?.value) {
        if (telField) {
          telField.style.display = "none";
        }
        if (selectField) selectField.classList.add("form__field--long");
        emailInput.style.display = "none";
        emailInput.disabled = true;
        if (contactLabel) contactLabel.textContent = "Телефон/Email";
        return;
      }

      if (telField) telField.style.display = "block";
      emailInput.style.display = "none";
      emailInput.disabled = true;

      if (select?.value) {
        if (type === "email") {
          telInput.style.display = "none";
          emailInput.style.display = "block";
          emailInput.disabled = false;
          emailInput.value = "";
          emailInput.setAttribute("type", "email");
          if (contactLabel) contactLabel.textContent = "Email";
        } else {
          telInput.style.display = "block";
          emailInput.style.display = "none";
          telInput.disabled = false;
          telInput.value = "";
          telInput.setAttribute("type", "text");
          if (contactLabel) contactLabel.textContent = "Телефон";
          initMask();
        }
      }
    }

    function getRules() {
      const rules = [];
      if (nameInput) {
        rules.push({
          ruleSelector: `${baseSelector} .input-name`,
          rules: [
            { rule: "minLength", value: 2, errorMessage: "Минимум 2 символа" },
            {
              rule: "required",
              value: true,
              errorMessage: "Заполните название компании!",
            },
          ],
        });
      }
      if (cityInput) {
        rules.push({
          ruleSelector: `${baseSelector} .input-city`,
          rules: [
            { rule: "minLength", value: 2, errorMessage: "Минимум 2 символа" },
            { rule: "required", value: true, errorMessage: "Заполните город!" },
          ],
        });
      }
      // Для формы cta-bottom делаем обязательным комментарий .input-mess
      if (isCtaBottom && messInput) {
        rules.push({
          ruleSelector: `${baseSelector} .input-mess`,
          rules: [
            {
              rule: "required",
              value: true,
              errorMessage: "Добавьте комментарий",
            },
            { rule: "minLength", value: 3, errorMessage: "Минимум 3 символа" },
          ],
        });
      }
      // Марка авто — обязательна, если поле присутствует
      if (modelInput) {
        const modelClass = [
          ".input-model",
          ".input-brand",
          ".input-car",
          ".input-mark",
        ].find((cls) => form.querySelector(cls));
        if (modelClass) {
          rules.push({
            ruleSelector: `${baseSelector} ${modelClass}`,
            rules: [
              {
                rule: "minLength",
                value: 2,
                errorMessage: "Минимум 2 символа",
              },
              {
                rule: "required",
                value: true,
                errorMessage: "Укажите марку авто!",
              },
            ],
          });
        }
      }
      if (select) {
        rules.push({
          ruleSelector: `${baseSelector} .select-contact`,
          rules: [
            {
              rule: "required",
              value: true,
              errorMessage: "Выберите способ связи!",
            },
          ],
        });
      }
      const selected = select?.value;
      const isEmail = selected === "Email" || /mail/i.test(selected);
      if (isEmail) {
        if (emailInput) {
          rules.push({
            ruleSelector: `${baseSelector} .input-email`,
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
          });
        }
      } else {
        if (telInput) {
          rules.push({
            ruleSelector: `${baseSelector} .input-tel`,
            rules: [
              {
                rule: "required",
                value: true,
                errorMessage: "Заполните телефон!",
              },
              {
                rule: "function",
                validator: (name, value) => {
                  if (!value || typeof value !== "string") return true;
                  const cleanValue = value.replace(/\D/g, "");
                  return cleanValue.length === 11;
                },
                errorMessage: "Введите корректный номер телефона",
              },
            ],
          });
        }
      }
      return rules;
    }

    function checkValidity() {
      if (form && submitBtn) {
        const nameValid = nameInput ? nameInput.value?.length >= 2 : true;
        const cityValid = cityInput ? cityInput.value?.length >= 2 : true;
        const modelValid = modelInput ? modelInput.value?.length >= 2 : true;
        const messValid =
          isCtaBottom && messInput ? messInput.value?.trim().length >= 3 : true;
        const contactTypeValid = select ? !!select.value : true;
        let contactValid = false;
        if (!telInput?.disabled && telInput?.value) {
          contactValid = telInput.value.replace(/\D/g, "").length === 11;
        }
        if (emailInput && !emailInput.disabled && emailInput.value) {
          contactValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        }
        submitBtn.disabled = !(
          nameValid &&
          cityValid &&
          modelValid &&
          messValid &&
          contactTypeValid &&
          contactValid
        );
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
      const rules = getRules();
      validator = validateForms(baseSelector, rules);
      form.removeEventListener("input", checkValidity);
      form.addEventListener("input", checkValidity);
      setTimeout(checkValidity, 100);
    }

    initValidation();
    select?.addEventListener("change", initValidation);
  });
});
