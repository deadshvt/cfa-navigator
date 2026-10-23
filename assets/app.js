'use strict';

(() => {
  const pages = [
    ['home', 'index.html', 'Главная'], ['basics', 'basics.html', 'Основы'],
    ['how', 'how-it-works.html', 'Как это работает'], ['examples', 'examples.html', 'Примеры'],
    ['risks', 'risks.html', 'Риски'], ['quiz', 'quiz.html', 'Проверить себя ↗']
  ];
  // Re-scan blocks when the quiz renders new content. No input values are attached.
  function refreshBlockStats() {
    try { if (typeof window.top100Counter?.sendBlocks === 'function') window.top100Counter.sendBlocks(); } catch { /* Analytics must not interrupt site interactions. */ }
  }
  const page = document.body.dataset.page;
  const brand = '<a class="brand" href="index.html" data-cfa-block="brand" aria-label="ЦФА Навигатор - главная"><img src="assets/favicon.svg" width="35" height="35" alt=""><div class="brand-name">ЦФА<span>навигатор</span><small>ПОНЯТНЫЙ ГИД ПО ЦИФРОВЫМ АКТИВАМ</small></div></a>';
  document.querySelector('#site-header').innerHTML = `<div class="wrap header-inner" data-cfa-block="header">${brand}<button class="menu-toggle" type="button" data-cfa-block="mobile-menu" aria-expanded="false" aria-controls="main-nav">Меню ☰</button><nav class="site-nav" id="main-nav" data-cfa-block="navigation" aria-label="Основная навигация">${pages.map(([key, href, name]) => `<a href="${href}" data-cfa-block="${key}"${key === page ? ' aria-current="page"' : ''}${key === 'quiz' ? ' class="nav-test"' : ''}>${name}</a>`).join('')}</nav></div>`;
  const config = window.CFA_CONFIG || {};
  const metrikaId = /^\d+$/.test(String(config.yandexMetrikaId || '')) ? String(config.yandexMetrikaId) : '';
  const gaId = /^G-[A-Z0-9]+$/.test(String(config.googleAnalyticsId || '')) ? String(config.googleAnalyticsId) : '';
  const hasCounters = Boolean(metrikaId || gaId);
  const analyticsServices = [metrikaId ? 'Яндекс Метрика' : '', gaId ? 'Google Analytics' : ''].filter(Boolean).join(' и ');
  const analyticsDescription = hasCounters
    ? 'С вашего разрешения используются ' + analyticsServices + ' для статистики посещений и действий: переходов, использования инструментов и результатов теста. Введённые в калькулятор значения счётчикам не передаются. Изменить выбор для этих дополнительных сервисов можно кнопкой «Настройки аналитики».'
    : '';
  document.querySelector('#site-footer').innerHTML = `
    <div class="wrap footer-main" data-cfa-block="footer">
      <div>${brand}<p>Справочные материалы о цифровых финансовых активах: основы, механизм работы, примеры и риски.</p></div>
      <div><h3>Разделы</h3><nav class="footer-links" aria-label="Разделы в подвале">${pages.slice(1).map(([key, href, name]) => `<a href="${href}" data-cfa-block="${key}">${name.replace(' ↗', '')}</a>`).join('')}<a href="basics.html#sources" data-cfa-block="sources">Источники ↗</a></nav></div>
      <div><h3>О проекте</h3>
        <p>Учебный сайт о ЦФА, созданный для изучения веб-аналитики.</p>
        <p>Примеры выпусков вымышлены. Материалы носят информационный характер и не являются индивидуальной инвестиционной рекомендацией.</p>
        <details class="privacy-details" id="privacy" data-cfa-block="privacy"><summary>Данные и аналитика</summary>
          <p>Отметки чек-листа и выбор настроек аналитики сохраняются в этом браузере, если локальное хранение доступно. Тест и калькулятор работают в браузере; результат теста не сохраняется после перезагрузки страницы.</p>
          <p>На всех страницах установлены LiveInternet, «Статистика от Sber Ads» (Топ-100) и Top.Mail.Ru. Счётчики загружаются при открытии страницы и собирают статистику посещений и технические данные: адрес страницы, источник перехода, сведения о браузере и устройстве. Sber Ads также учитывает показы и клики по размеченным блокам. Сервисы могут использовать cookies. Для блоков используются названия и номера элементов интерфейса. Введённые в калькулятор значения в разметку не включаются.</p>
          ${hasCounters ? `<p>${analyticsDescription}</p>` : ''}
          ${hasCounters ? '<p>При разрешённой аналитике сервисы могут использовать cookies и получать технические данные посещения. Отзыв разрешения останавливает дальнейшую загрузку этих дополнительных счётчиков и не отключает LiveInternet, Sber Ads и Top.Mail.Ru; ранее сохранённые cookies можно удалить в настройках браузера.</p><p>Условия сервисов: ' + [metrikaId ? '<a href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener noreferrer">Яндекс</a>' : '', gaId ? '<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google</a>' : ''].filter(Boolean).join(', ') + '.</p>' : ''}
        </details>
        <button class="text-button" type="button" id="analytics-settings" data-cfa-block="analytics-settings"${hasCounters ? '' : ' hidden'}>Настройки дополнительных счётчиков</button>
      </div>
    </div>
    <div class="wrap footer-bottom"><span>© 2026 Kirill Zaytsev · ЦФА Навигатор</span></div>`;


  // Storage may be disabled or unavailable when opening local files.
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Keep interactions working without storage. */ } }
  };
  let consent = storage.get('cfa.analyticsConsent');
  let analyticsStarted = false;

  // Only predefined events and non-personal categories are sent to counters.
  // This DOM event also makes event wiring inspectable without a third-party service.
  function track(name, params = {}) {
    document.dispatchEvent(new CustomEvent('cfa:event', { detail: { name, page, ...params } }));
    if (consent !== 'granted' || !analyticsStarted) return;
    if (metrikaId && typeof window.ym === 'function') window.ym(Number(metrikaId), 'reachGoal', name, { page, ...params });
    if (gaId && typeof window.gtag === 'function') window.gtag('event', name, { page_name: page, ...params });
  }
  function startAnalytics() {
    if (analyticsStarted || consent !== 'granted' || !hasCounters) return;
    analyticsStarted = true;
    if (metrikaId) {
      window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
      window.ym.l = Date.now();
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://mc.yandex.ru/metrika/tag.js';
      document.head.append(script);
      window.ym(Number(metrikaId), 'init', { clickmap: false, trackLinks: false, accurateTrackBounce: true, webvisor: false });
    }
    if (gaId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', gaId, { send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.append(script);
    }
  }
  function showConsent() {
    if (!hasCounters || document.querySelector('.cookie-banner')) return;
    const banner = document.createElement('aside');
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-label', 'Настройки аналитики');
    banner.innerHTML = `<p><strong>Статистика посещений</strong>Разрешить ${analyticsServices} собирать статистику посещений и действий на сайте? Подробнее - в разделе «Данные и аналитика» внизу страницы.</p><div class="cookie-actions"><button type="button" class="button secondary" data-consent="denied">Без аналитики</button><button type="button" class="button" data-consent="granted">Разрешить</button></div>`;
    banner.addEventListener('click', event => {
      const button = event.target.closest('[data-consent]');
      if (!button) return;
      const previous = consent;
      consent = button.dataset.consent;
      storage.set('cfa.analyticsConsent', consent);
      banner.remove();
      if (previous === 'granted' && consent === 'denied' && analyticsStarted) {
        // Reload to unload already-running counter scripts after revocation.
        if (gaId) window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
        if (metrikaId) window.ym(Number(metrikaId), 'destruct');
        location.reload();
      } else {
        startAnalytics();
        document.querySelector('#analytics-settings').focus({ preventScroll: true });
      }
    });
    document.body.append(banner);
  }
  startAnalytics();
  if (hasCounters && !consent) showConsent();
  document.querySelector('#analytics-settings').addEventListener('click', showConsent);

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  function closeMenu() { menuToggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); } });
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.dataset.event) track(link.dataset.event);
    if (link.closest('#main-nav')) track('navigation_click', { destination: link.getAttribute('href') });
    if (link.closest('.route-card, .wide-links')) track('section_open', { destination: link.getAttribute('href') });
    if (link.getAttribute('href')?.startsWith('https://www.cbr.ru/')) track('source_click', { destination: link.getAttribute('href') });
  });
  document.querySelectorAll('.faq-list details').forEach((item, index) => item.addEventListener('toggle', () => { if (item.open) track('faq_open', { question: index + 1 }); }));
  const depths = new Set();
  function measureScroll() {
    const available = document.documentElement.scrollHeight - innerHeight;
    if (available <= 0) return;
    const percent = Math.round(scrollY / available * 100);
    [50, 90].forEach(depth => { if (percent >= depth && !depths.has(depth)) { depths.add(depth); track('scroll_depth', { depth }); } });
  }
  window.addEventListener('scroll', measureScroll, { passive: true });

  if (page === 'examples') {
    const cards = [...document.querySelectorAll('.example-card')];
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', String(active)); });
      const category = button.dataset.filter;
      cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
      document.querySelector('#filter-count').textContent = `Показано: ${cards.filter(card => !card.hidden).length} из ${cards.length}`;
      track('filter_change', { category });
    }));
    document.querySelectorAll('[data-example]').forEach(item => item.addEventListener('toggle', () => { if (item.open) track('example_open', { example: item.dataset.example }); }));
    const form = document.querySelector('#calculator-form');
    const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const amount = Number(form.elements.amount.value);
      const rate = Number(form.elements.rate.value);
      const days = Number(form.elements.days.value);
      if (![amount, rate, days].every(Number.isFinite)) return;
      const profit = amount * rate / 100 * days / 365;
      document.querySelector('#calc-profit').textContent = money.format(profit);
      document.querySelector('#calc-total').textContent = money.format(amount + profit);
      track('calculator_use'); // Deliberately omit user-entered financial values.
    });
  }

  if (page === 'risks') {
    const boxes = [...document.querySelectorAll('[data-check]')];
    let saved = [];
    try { const parsed = JSON.parse(storage.get('cfa.checklist') || '[]'); if (Array.isArray(parsed)) saved = parsed; } catch { /* Ignore malformed local state. */ }
    boxes.forEach(box => { box.checked = saved.includes(box.dataset.check); });
    function updateChecks() {
      const selected = boxes.filter(box => box.checked).map(box => box.dataset.check);
      storage.set('cfa.checklist', JSON.stringify(selected));
      document.querySelector('#check-progress').textContent = `Разобрано: ${selected.length} из 5`;
      document.querySelector('#check-bar').style.width = `${selected.length / 5 * 100}%`;
      return selected.length;
    }
    updateChecks();
    boxes.forEach(box => box.addEventListener('change', () => { const count = updateChecks(); track('checklist_change', { completed: count }); if (count === 5) track('checklist_complete'); }));
    document.querySelector('#check-reset').addEventListener('click', () => { boxes.forEach(box => { box.checked = false; }); updateChecks(); });
  }

  if (page === 'quiz') {
    const questions = [
      { title: 'Что в первую очередь описывает ЦФА?', options: ['Любая монета в интернете', 'Цифровое право по условиям выпуска', 'Способ оплаты повседневных покупок'], correct: 1, explanation: 'В центре понятия ЦФА - закреплённые права. Они могут включать, например, денежное требование.', link: 'basics.html', topic: 'Основы' },
      { title: 'Где искать права и условия конкретного ЦФА?', options: ['Только в рекламном заголовке', 'В названии цифровой платформы', 'В решении о выпуске'], correct: 2, explanation: 'Решение о выпуске определяет содержание прав и условия. Рекламного описания для понимания актива недостаточно.', link: 'basics.html', topic: 'Основы' },
      { title: 'За что отвечает оператор информационной системы?', options: ['За работу системы и учёт в ней', 'За гарантированный доход по любому выпуску', 'За отсутствие любых рисков у инвестора'], correct: 0, explanation: 'Роль оператора связана с информационной системой. Её нельзя приравнивать к гарантии исполнения обязательств эмитентом.', link: 'how-it-works.html', topic: 'Механизм' },
      { title: 'Можно ли считать цифровой формат гарантией быстрой перепродажи?', options: ['Да, покупатель найдётся автоматически', 'Да, если в названии есть слово «актив»', 'Нет, нужно изучать условия и возможность продажи'], correct: 2, explanation: 'Цифровой учёт не гарантирует ликвидность. Даже при разрешённой передаче покупатель может не найтись.', link: 'risks.html', topic: 'Риски' },
      { title: 'Что получится по учебной формуле: 10 000 ₽, 12% годовых, 180 дней?', options: ['Дополнительная выплата 1 200 ₽', 'Дополнительная выплата около 591,78 ₽', 'Дополнительная выплата 12 000 ₽'], correct: 1, explanation: '10 000 × 0,12 × 180 / 365 ≈ 591,78 ₽. Годовая ставка и выплата за неполный год - разные величины. Расходы не учтены.', link: 'examples.html', topic: 'Практика' },
      { title: 'Что означает наличие оператора в реестре Банка России?', options: ['Можно проверить его статус, но выпуск надо изучать отдельно', 'Каждый его выпуск гарантированно выгоден', 'Можно не читать условия выпуска'], correct: 0, explanation: 'Статус участника и условия конкретного актива - разные предметы проверки. Реестр не заменяет изучение выпуска.', link: 'risks.html', topic: 'Риски' }
    ];
    let index = 0;
    let score = 0;
    let checked = false;
    let answers = [];
    const start = document.querySelector('#quiz-start');
    const active = document.querySelector('#quiz-active');
    const result = document.querySelector('#quiz-result');
    const form = document.querySelector('#quiz-form');
    const submit = document.querySelector('#quiz-submit');
    const feedback = document.querySelector('#quiz-feedback');
    function renderQuestion() {
      form.querySelector('fieldset').setAttribute('data-cfa-block', 'question-' + (index + 1));
      submit.setAttribute('data-cfa-block', 'check-answer');
      checked = false;
      feedback.hidden = true;
      submit.textContent = 'Ответить';
      const question = questions[index];
      document.querySelector('#question-counter').textContent = `ВОПРОС ${index + 1} / ${questions.length}`;
      document.querySelector('#quiz-score').textContent = `Верно: ${score}`;
      document.querySelector('#quiz-bar').style.width = `${index / questions.length * 100}%`;
      document.querySelector('#question-title').textContent = question.title;
      document.querySelector('#quiz-options').innerHTML = question.options.map((option, i) => `<label class="quiz-option" data-cfa-block="answer-${i + 1}"><input type="radio" name="answer" value="${i}" required><span>${option}</span></label>`).join('');
      document.querySelector('#question-title').focus({ preventScroll: true });
      refreshBlockStats();
    }
    function begin() {
      index = 0; score = 0; answers = [];
      start.hidden = true; result.hidden = true; active.hidden = false;
      track('quiz_start'); renderQuestion();
    }
    document.querySelector('#start-quiz').addEventListener('click', begin);
    document.querySelector('#restart-quiz').addEventListener('click', begin);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (checked) {
        index++;
        if (index < questions.length) { renderQuestion(); return; }
        active.hidden = true; result.hidden = false;
        document.querySelector('#result-title').textContent = `${score} из ${questions.length} - ${score === questions.length ? 'отличная работа!' : score >= 4 ? 'хороший результат!' : 'начало положено!'}`;
        document.querySelector('#result-description').textContent = score === questions.length ? 'Основные понятия уже знакомы. Продолжайте изучение по первоисточникам и помните об условиях каждого выпуска.' : 'Посмотрите пояснения ниже. Ссылки помогут вернуться к темам, которые стоит повторить.';
        document.querySelector('#result-review').innerHTML = questions.map((q, i) => `<details data-cfa-block="review-${i + 1}"><summary>${answers[i] === q.correct ? '✓' : '○'} ${i + 1}. ${q.title}</summary><p>Ваш ответ: ${q.options[answers[i]]}</p><p><strong>Правильный ответ:</strong> ${q.options[q.correct]}</p><p>${q.explanation} <a href="${q.link}">Повторить: ${q.topic} →</a></p></details>`).join('');
        refreshBlockStats();
        track('quiz_complete', { score, total: questions.length });
        result.focus({ preventScroll: true });
        result.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        return;
      }
      const selected = form.querySelector('input[name="answer"]:checked');
      if (!selected) { form.reportValidity(); return; }
      const answer = Number(selected.value);
      const question = questions[index];
      const correct = answer === question.correct;
      answers.push(answer);
      if (correct) score++;
      document.querySelector('#quiz-score').textContent = `Верно: ${score}`;
      document.querySelector('#quiz-bar').style.width = `${(index + 1) / questions.length * 100}%`;
      form.querySelectorAll('input[name="answer"]').forEach(input => { input.disabled = true; const label = input.closest('label'); if (Number(input.value) === question.correct) label.classList.add('correct'); else if (input.checked) label.classList.add('incorrect'); });
      feedback.innerHTML = `<strong>${correct ? 'Верно!' : 'Не совсем. Разберёмся.'}</strong><p>${question.explanation}</p>`;
      feedback.hidden = false;
      submit.textContent = index === questions.length - 1 ? 'Посмотреть результат →' : 'Следующий вопрос →';
      checked = true;
      submit.setAttribute('data-cfa-block', index === questions.length - 1 ? 'show-result' : 'next-question');
      refreshBlockStats();
      track('quiz_answer', { question: index + 1, correct });
    });
  }
  refreshBlockStats();
})();
