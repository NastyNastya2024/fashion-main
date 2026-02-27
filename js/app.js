/**
 * StyleGenie — демо для GitHub Pages (анимация + интерактив «Нет, не то» → ателье)
 */
(function () {
  'use strict';

  var PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f3f4f6" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EНет фото%3C/text%3E%3C/svg%3E';

  // Модные образы для карточек: подписи соответствуют содержимому фото
  var FASHION_IMAGES = {
    dressMidi: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=533&fit=crop',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=533&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=533&fit=crop',
    ],
    evening: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=533&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=533&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=533&fit=crop',
    ],
    whiteTeeLooks: [
      'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=533&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=533&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=533&fit=crop',
    ],
    ponchoSummer: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=533&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=533&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=533&fit=crop',
    ],
  };

  var DEMO_PRODUCTS = [
    { id: '1', name: 'Платье миди приглушённого оттенка', price: 18900, image: FASHION_IMAGES.dressMidi[0], images: FASHION_IMAGES.dressMidi, url: '#', marketplace: 'Lamoda', similarity: 92 },
    { id: '2', name: 'Вечерний образ в нейтральных тонах', price: 24500, image: FASHION_IMAGES.evening[0], images: FASHION_IMAGES.evening, url: '#', marketplace: 'Lamoda', similarity: 88 },
    { id: '3', name: 'Белая футболка базовая и casual-образы', price: 15900, image: FASHION_IMAGES.whiteTeeLooks[0], images: FASHION_IMAGES.whiteTeeLooks, url: '#', marketplace: 'Wildberries', similarity: 85 },
    { id: '4', name: 'Пончо вязаное бежевое и летние образы', price: 11200, image: FASHION_IMAGES.ponchoSummer[0], images: FASHION_IMAGES.ponchoSummer, url: '#', marketplace: 'Wildberries', similarity: 82 },
  ];

  var MOCK_MASTERS = [
    { id: 'm1', name: 'Ателье «Подиум»', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=533&fit=crop', priceFrom: 15000, priceTo: 45000 },
    { id: 'm2', name: 'Мастерская Ольги К.', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop', priceFrom: 8000, priceTo: 25000 },
    { id: 'm3', name: 'Ателье «Ткани и форма»', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=533&fit=crop', priceFrom: 25000, priceTo: 80000 },
  ];

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function cardHtml(p) {
    var imgs = (p.images && p.images.length) ? p.images : [p.image];
    var img = imgs[0];
    var sim = p.similarity != null ? '<span class="card-badge">' + p.similarity + '%</span>' : '';
    var html = '<div class="card">' +
      '<div class="card-image-wrap">' +
      '<img src="' + esc(img) + '" alt="" onerror="this.src=\'' + PLACEHOLDER_IMG.replace(/'/g, "\\'") + '\'">' + sim +
      '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" class="card-link">↗</a>' +
      '</div>';
    if (imgs.length > 1) {
      html += '<div class="card-thumbs">';
      imgs.slice(0, 5).forEach(function (src) {
        html += '<div class="card-thumb"><img src="' + esc(src) + '" alt="" onerror="this.src=\'' + PLACEHOLDER_IMG.replace(/'/g, "\\'") + '\'"></div>';
      });
      html += '</div>';
    }
    html += '<div class="card-body">' +
      '<h4 class="card-title">' + esc(p.name) + '</h4>' +
      '<p class="card-price">' + p.price.toLocaleString('ru-RU') + ' ₽</p>' +
      '</div></div>';
    return html;
  }

  function masterCardHtml(m) {
    var priceText = m.priceTo ? 'от ' + m.priceFrom.toLocaleString('ru-RU') + ' – ' + m.priceTo.toLocaleString('ru-RU') + ' ₽' : 'от ' + m.priceFrom.toLocaleString('ru-RU') + ' ₽';
    return (
      '<div class="card">' +
      '<div class="card-image-wrap"><img src="' + esc(m.image) + '" alt="" onerror="this.src=\'' + PLACEHOLDER_IMG.replace(/'/g, "\\'") + '\'"></div>' +
      '<div class="card-body">' +
      '<h4 class="card-title">' + esc(m.name) + '</h4>' +
      '<p class="card-price" style="font-size:0.875rem;font-weight:400;color:var(--gray-600)">' + priceText + '</p>' +
      '</div></div>'
    );
  }

  function productsGroupedByMarketplace(products) {
    var byMarket = {};
    products.forEach(function (p) {
      var n = p.marketplace || 'Другие';
      if (!byMarket[n]) byMarket[n] = [];
      byMarket[n].push(p);
    });
    return byMarket;
  }

  function addBubble(role, content, opts) {
    opts = opts || {};
    var area = document.getElementById('messagesInner');
    if (!area) return;
    var wrap = document.createElement('div');
    wrap.className = 'msg ' + role;
    var html = '<div class="msg-bubble"><p class="msg-content">' + esc(content) + '</p>';

    if (opts.products && opts.products.length) {
      var byMarket = productsGroupedByMarketplace(opts.products);
      Object.keys(byMarket).forEach(function (marketName) {
        html += '<div class="cards-group"><h4 class="cards-group-title">' + esc(marketName) + '</h4><div class="cards-grid">';
        byMarket[marketName].forEach(function (p) { html += cardHtml(p); });
        html += '</div></div>';
      });
    }

    if (opts.masters && opts.masters.length) {
      html += '<div class="cards-group" style="margin-top:16px"><h4 class="cards-group-title">Ателье и мастера</h4><div class="cards-grid">';
      opts.masters.forEach(function (m) { html += masterCardHtml(m); });
      html += '</div></div>';
    }

    if (opts.quickReplies && opts.quickReplies.length) {
      var discount = opts.quickReplies.filter(function (qr) { return qr.action === 'discounts'; })[0];
      var rest = opts.quickReplies.filter(function (qr) { return qr.action !== 'discounts'; });
      html += '<div class="quick-replies"><div class="quick-replies-buttons">';
      rest.forEach(function (qr) {
        html += '<span class="quick-reply-btn" style="cursor:default">' + esc(qr.label) + '</span>';
      });
      html += '</div>';
      if (discount) {
        html += '<div class="quick-reply-discount-wrap"><span class="quick-reply-discount-btn" style="cursor:default;display:inline-block">' + esc(discount.label) + '</span></div>';
      }
      html += '</div>';
    }
    html += '</div>';
    wrap.innerHTML = html;
    area.appendChild(wrap);
    scrollToEnd();
  }

  function addBubbleWithInteractiveButtons(role, content, quickReplies) {
    var area = document.getElementById('messagesInner');
    if (!area) return;
    var wrap = document.createElement('div');
    wrap.className = 'msg ' + role;
    var html = '<div class="msg-bubble"><p class="msg-content">' + esc(content) + '</p>';
    html += '<div class="quick-replies"><div class="quick-replies-buttons">';
    (quickReplies || []).forEach(function (qr) {
      html += '<button type="button" class="quick-reply-btn" data-action="' + esc(qr.action) + '">' + esc(qr.label) + '</button>';
    });
    html += '</div></div></div>';
    wrap.innerHTML = html;
    area.appendChild(wrap);

    wrap.querySelectorAll('.quick-reply-btn').forEach(function (btn) {
      btn.onclick = function () {
        var action = btn.getAttribute('data-action');
        handleQuickReply(action);
      };
    });
    scrollToEnd();
  }

  function handleQuickReply(action) {
    if (action === 'yes') {
      addBubble('assistant', 'Отлично! Если захочешь подобрать ещё образ — просто опиши, что ищешь.');
      restoreInputBar();
      return;
    }
    if (action === 'no') {
      addBubbleWithInteractiveButtons('assistant', 'Тогда можем помочь так:', [
        { label: 'Найти мастера по пошиву', action: 'find_master' },
        { label: 'Сгенерировать картинку образа', action: 'generate_image' },
        { label: 'Новый поиск', action: 'new_search' },
      ]);
      return;
    }
    if (action === 'find_master') {
      addBubble('assistant', 'Подбор ателье под твой образ и бюджет. Примерная цена изделия:', { masters: MOCK_MASTERS });
      restoreInputBar();
      return;
    }
    if (action === 'generate_image') {
      addBubble('assistant', 'Генерация образа по описанию в разработке. Скоро можно будет получить картинку платья или образа по твоим пожеланиям.');
      restoreInputBar();
      return;
    }
    if (action === 'new_search') {
      run();
    }
  }

  function scrollToEnd() {
    var end = document.getElementById('messagesEnd');
    if (end) end.scrollIntoView({ behavior: 'smooth' });
  }

  function showLoading(show) {
    var el = document.getElementById('loadingBubble');
    if (el) el.style.display = show ? 'flex' : 'none';
    if (document.body) document.body.classList.toggle('generating', !!show);
    if (show) scrollToEnd();
  }

  var INPUT_BAR_HTML =
    '<div class="preview-wrap preview-wrap-inline" id="previewWrapChat" style="display: none;"><img id="previewImgChat" src="" alt=""><button type="button" class="preview-remove" id="previewRemoveChat">×</button></div>' +
    '<form class="input-form" id="inputFormChat">' +
    '<input type="file" id="fileInputChat" accept="image/*" class="hidden">' +
    '<input type="text" id="textInputChat" placeholder="Напиши сообщение..." autocomplete="off">' +
    '<button type="button" class="btn-icon btn-icon-image" id="btnImageChat" aria-label="Прикрепить картинку"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>' +
    '<button type="button" class="btn-send" id="btnSendChat" aria-label="Отправить"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>' +
    '</form>';

  function restoreInputBar() {
    var fixed = document.querySelector('.input-bar-fixed');
    if (!fixed) return;
    fixed.innerHTML = INPUT_BAR_HTML;
    var sendBtn = document.getElementById('btnSendChat');
    if (sendBtn) sendBtn.onclick = function () { run(); };
  }

  function switchToChat() {
    var main = document.getElementById('main');
    var empty = document.getElementById('emptyState');
    var chat = document.getElementById('chatWrap');
    var fig = document.getElementById('figurinesWrap');
    if (main) main.classList.add('has-content');
    if (empty) empty.style.display = 'none';
    if (chat) chat.style.display = 'flex';
    if (fig) fig.classList.add('figurines-hidden');
  }

  function resetView() {
    var main = document.getElementById('main');
    var empty = document.getElementById('emptyState');
    var chat = document.getElementById('chatWrap');
    var fig = document.getElementById('figurinesWrap');
    var area = document.getElementById('messagesInner');
    if (main) main.classList.remove('has-content');
    if (empty) empty.style.display = 'block';
    if (chat) chat.style.display = 'none';
    if (fig) fig.classList.remove('figurines-hidden');
    if (area) area.innerHTML = '';
    showLoading(false);
    restoreInputBar();
  }

  var timeouts = [];

  function schedule(ms, fn) {
    timeouts.push(setTimeout(fn, ms));
  }

  function run() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    resetView();

    var delay = 0;
    delay += 2200;
    schedule(delay, function () {
      switchToChat();
      addBubble('user', 'Хочу вечернее платье');
    });
    delay += 800;
    schedule(delay, function () {
      addBubble('assistant', 'Понял! Уточни ценовой сегмент:', {
        quickReplies: [
          { label: 'До 10 000 ₽', action: 'budget' },
          { label: '10 000 – 30 000 ₽', action: 'mid' },
          { label: '30 000 – 50 000 ₽', action: 'premium_mid' },
          { label: 'Премиум 50 000+ ₽', action: 'premium' },
          { label: 'Искать скидки', action: 'discounts' },
        ],
      });
    });
    delay += 2800;
    schedule(delay, function () {
      addBubble('user', '10 000 – 30 000 ₽');
    });
    delay += 800;
    schedule(delay, function () {
      addBubble('assistant', 'Повод или тип образа?', {
        quickReplies: [
          { label: 'Повседневная одежда', action: 'casual' },
          { label: 'Вечеринка / выход', action: 'party' },
          { label: 'Торжество / свадьба', action: 'formal' },
        ],
      });
    });
    delay += 2600;
    schedule(delay, function () {
      addBubble('user', 'Вечеринка / выход');
    });
    delay += 800;
    schedule(delay, function () {
      showLoading(true);
    });
    delay += 1400;
    schedule(delay, function () {
      showLoading(false);
      addBubble('assistant', 'Найдено несколько товаров. Посмотри, есть ли то что искал.', { products: DEMO_PRODUCTS });
    });
    delay += 600;
    schedule(delay, function () {
      addBubbleWithInteractiveButtons('assistant', 'Нашёл ли ты то, что хотел?', [
        { label: 'Да, нашёл', action: 'yes' },
        { label: 'Нет, не то', action: 'no' },
      ]);
    });
    delay += 300;
    schedule(delay, restoreInputBar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
