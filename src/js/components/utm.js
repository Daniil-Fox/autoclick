(function () {
  function parseQuery() {
    const q = {};
    location.search.replace(/^\?/, '').split('&').forEach(p => {
      if (!p) return;
      const [k, v=''] = p.split('=');
      q[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
    });
    return q;
  }
  function fillForm(form, data) {
    Object.keys(data).forEach(name => {
      let input = form.querySelector('input[name="'+name+'"]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        form.appendChild(input);
      }
      if (data[name]) input.value = data[name];
    });
  }

  const qs = parseQuery();

  // Базовые маппинги из UTM
  const base = {
    'Источник трафика': qs.utm_source || '',
    'Тип трафика': qs.utm_medium || '',
    'Рекламная кампания': qs.utm_campaign || '',
    'Ключевая фраза': qs.utm_term || '',
    'Дополнительный параметр': qs.rsysvo || qs.gbid || qs.yclid || qs.fbclid || ''
  };

  // Яндекс.Метрика clientID (id замените на ваш, он уже есть в header)
  function getYmClientId(cb) {
    if (typeof ym !== 'function') return cb('');
    // 104261485 — ваш ID счётчика из header.php
    ym(104261485, 'getClientID', function(clientId) {
      cb(clientId || '');
    });
  }

  // Геолокация по IP (клиентский способ; при желании перенесите на сервер)
  function getIpLocation(cb) {
    fetch('https://ipapi.co/json/') // можно ipwho.is/ip-api.com
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j) return cb('');
        const parts = [j.country_name, j.region, j.city].filter(Boolean);
        cb(parts.join(', '));
      })
      .catch(() => cb(''));
  }

  // Заполняем при первом фокусе/отправке, чтобы все значения успели подтянуться
  function bindForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const apply = () => {
        const data = Object.assign({}, base);
        // подставим актуальные значения
        getYmClientId(cid => {
          data['ym_client_id'] = cid;
          getIpLocation(loc => {
            data['ip_location'] = loc;
            fillForm(form, data);
          });
        });
      };
      form.addEventListener('focusin', apply, { once: true });
      form.addEventListener('submit', apply);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindForms);
  } else {
    bindForms();
  }
})();
