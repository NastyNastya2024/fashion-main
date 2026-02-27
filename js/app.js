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

  function addBubbleWithInteractiveButtons(role, content, quickReplies, onAction) {
    var area = document.getElementById('messagesInner');
    if (!area) return;
    var list = quickReplies || [];
    var discount = list.filter(function (qr) { return qr.action === 'discounts'; })[0];
    var rest = list.filter(function (qr) { return qr.action !== 'discounts'; });

    var wrap = document.createElement('div');
    wrap.className = 'msg ' + role;
    var html = '<div class="msg-bubble"><p class="msg-content">' + esc(content) + '</p>';
    html += '<div class="quick-replies"><div class="quick-replies-buttons">';
    rest.forEach(function (qr) {
      html += '<button type="button" class="quick-reply-btn" data-action="' + esc(qr.action) + '" data-label="' + esc(qr.label) + '">' + esc(qr.label) + '</button>';
    });
    html += '</div>';
    if (discount) {
      html += '<div class="quick-reply-discount-wrap"><button type="button" class="quick-reply-discount-btn" data-action="' + esc(discount.action) + '" data-label="' + esc(discount.label) + '">' + esc(discount.label) + '</button></div>';
    }
    html += '</div></div>';
    wrap.innerHTML = html;
    area.appendChild(wrap);

    function handleClick(btn) {
      var action = btn.getAttribute('data-action');
      var label = btn.getAttribute('data-label') || btn.textContent || '';
      if (onAction) onAction(action, label); else handleQuickReply(action);
    }
    wrap.querySelectorAll('.quick-reply-btn, .quick-reply-discount-btn').forEach(function (btn) {
      btn.onclick = function () { handleClick(btn); };
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
      clearMessagesAndRestoreInput();
    }
  }

  function clearMessagesAndRestoreInput() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    var area = document.getElementById('messagesInner');
    if (area) area.innerHTML = '';
    showLoading(false);
    restoreInputBar();
  }

  function scrollToEnd() {
    var end = document.getElementById('messagesEnd');
    if (end) end.scrollIntoView({ behavior: 'smooth' });
  }

  function showLoading(show) {
    var el = document.getElementById('loadingBubble');
    if (el) el.style.display = show ? 'flex' : 'none';
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
    var form = document.getElementById('inputFormChat');
    var input = document.getElementById('textInputChat');
    var sendBtn = document.getElementById('btnSendChat');
    function sendNewMessage() {
      var text = (input && input.value) ? input.value.trim() : '';
      if (!text) return;
      input.value = '';
      startConversation(text);
    }
    if (form) form.onsubmit = function (e) { e.preventDefault(); sendNewMessage(); };
    if (sendBtn) sendBtn.onclick = sendNewMessage;
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
    if (document.body) document.body.classList.add('dialog-active');
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
    if (document.body) document.body.classList.remove('dialog-active');
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
  }

  var PRICE_QUICK_REPLIES = [
    { label: 'До 10 000 ₽', action: 'budget' },
    { label: '10 000 – 30 000 ₽', action: 'mid' },
    { label: '30 000 – 50 000 ₽', action: 'premium_mid' },
    { label: 'Премиум 50 000+ ₽', action: 'premium' },
    { label: 'Искать скидки', action: 'discounts' },
  ];

  var OCCASION_QUICK_REPLIES = [
    { label: 'Повседневная одежда', action: 'casual' },
    { label: 'Вечеринка / выход', action: 'party' },
    { label: 'Торжество / свадьба', action: 'formal' },
  ];

  function showOccasionStep() {
    addBubbleWithInteractiveButtons('assistant', 'Повод или тип образа?', OCCASION_QUICK_REPLIES, function (action, label) {
      addBubble('user', label);
      showLoading(true);
      setTimeout(function () {
        showLoading(false);
        addBubble('assistant', 'Найдено несколько товаров. Посмотри, есть ли то что искал.', { products: DEMO_PRODUCTS });
        addBubbleWithInteractiveButtons('assistant', 'Нашёл ли ты то, что хотел?', [
          { label: 'Да, нашёл', action: 'yes' },
          { label: 'Нет, не то', action: 'no' },
        ]);
        restoreInputBar();
      }, 1200);
    });
  }

  function startConversation(firstMessage) {
    var text = (firstMessage || '').trim();
    if (!text) return;
    timeouts.forEach(clearTimeout);
    timeouts = [];
    switchToChat();
    addBubble('user', text);

    addBubbleWithInteractiveButtons('assistant', 'Понял! Уточни ценовой сегмент:', PRICE_QUICK_REPLIES, function (action, label) {
      addBubble('user', label);
      showOccasionStep();
    });
  }

  function initEmptyStateForm() {
    var form = document.getElementById('inputForm');
    var input = document.getElementById('textInput');
    if (!form || !input) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (!text) return;
      input.value = '';
      startConversation(text);
    });
  }

  // Маркетплейсы и популярные бренды одежды
  var MARKETPLACES_LIST = [
    { name: 'Wildberries', url: 'https://www.wildberries.ru', icon: 'https://www.wildberries.ru/favicon.ico' },
    { name: 'Ozon', url: 'https://www.ozon.ru', icon: 'https://www.ozon.ru/favicon.ico' },
    { name: 'Lamoda', url: 'https://www.lamoda.ru', icon: 'https://www.lamoda.ru/favicon.ico' },
    { name: 'AliExpress', url: 'https://aliexpress.ru', icon: 'https://aliexpress.ru/favicon.ico' },
    { name: 'Яндекс Маркет', url: 'https://market.yandex.ru', icon: 'https://market.yandex.ru/favicon.ico' },
    { name: 'СберМегаМаркет', url: 'https://sbermegamarket.ru', icon: 'https://sbermegamarket.ru/favicon.ico' },
    { name: 'ЦУМ', url: 'https://www.tsum.ru', icon: 'https://www.tsum.ru/favicon.ico' },
    { name: 'The Cultt', url: 'https://thecultt.com', icon: 'https://thecultt.com/favicon.ico' },
    { name: '12 Storeez', url: 'https://12storeez.com', icon: 'https://12storeez.com/favicon.ico' },
    { name: 'Ushatava', url: 'https://ushatava.ru', icon: 'https://ushatava.ru/favicon.ico' },
    { name: 'My812', url: 'https://my812.ru', icon: 'https://my812.ru/favicon.ico' },
    { name: 'BelleYOU', url: 'https://belleyou.ru', icon: 'https://belleyou.ru/favicon.ico' },
    { name: 'Studio 29', url: 'https://studio29.ru', icon: 'https://studio29.ru/favicon.ico' },
    { name: 'Fashion Rebels', url: 'https://fashionrebels.ru', icon: 'https://fashionrebels.ru/favicon.ico' },
    { name: 'Charuel', url: 'https://charuel.ru', icon: 'https://charuel.ru/favicon.ico' },
    { name: 'GATE31', url: 'https://gate31.ru', icon: 'https://gate31.ru/favicon.ico' },
    { name: 'IDOL', url: 'https://idol.ru', icon: 'https://idol.ru/favicon.ico' },
    { name: 'Maneken Brand', url: 'https://manekenbrand.ru', icon: 'https://manekenbrand.ru/favicon.ico' },
    { name: 'HENDERSON', url: 'https://henderson.ru', icon: 'https://henderson.ru/favicon.ico' },
    { name: 'SELA', url: 'https://sela.ru', icon: 'https://sela.ru/favicon.ico' },
    { name: 'Befree', url: 'https://befree.ru', icon: 'https://befree.ru/favicon.ico' },
    { name: 'Lichi', url: 'https://lichi.com', icon: 'https://lichi.com/favicon.ico' },
    { name: 'BOSCO Sport', url: 'https://bosco.ru', icon: 'https://bosco.ru/favicon.ico' },
    { name: 'LIME', url: 'https://lime-shop.ru', icon: 'https://lime-shop.ru/favicon.ico' },
    { name: 'Zarina', url: 'https://zarina.ru', icon: 'https://zarina.ru/favicon.ico' },
    { name: 'Gloria Jeans', url: 'https://gloria-jeans.ru', icon: 'https://gloria-jeans.ru/favicon.ico' },
    { name: 'IRNBY', url: 'https://irnby.ru', icon: 'https://irnby.ru/favicon.ico' },
  ];

  function initMarketplacesTicker() {
    var inner = document.getElementById('marketplacesTickerInner');
    if (!inner) return;
    function itemHtml(m) {
      return (
        '<span class="marketplaces-ticker-item">' + esc(m.name) + '</span>'
      );
    }
    var oneRow = MARKETPLACES_LIST.map(itemHtml).join('');
    inner.innerHTML = oneRow + oneRow;
  }

  function initMarketplacesModal() {
    var btn = document.getElementById('navMarketplaces');
    var modal = document.getElementById('marketplacesModal');
    var overlay = document.getElementById('marketplacesOverlay');
    var closeBtn = document.getElementById('marketplacesClose');
    var grid = document.getElementById('marketplacesGrid');
    if (!btn || !modal || !grid) return;

    grid.innerHTML = MARKETPLACES_LIST.map(function (m) {
      var initial = (m.name.charAt(0) || '?').toUpperCase();
      return (
        '<a href="' + esc(m.url) + '" target="_blank" rel="noopener noreferrer" class="marketplaces-item" title="' + esc(m.name) + '">' +
        '<span class="marketplaces-item-icon-wrap">' +
        '<img class="marketplaces-item-icon" src="' + esc(m.icon) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="marketplaces-item-icon fallback" style="display:none">' + initial + '</span>' +
        '</span>' +
        '<span>' + esc(m.name) + '</span>' +
        '</a>'
      );
    }).join('');

    function openModal() {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
    }
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  // Прелоадер: ждем загрузки всех изображений
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;

    var imagesToLoad = [
      '/images/figurine-left.png',
      '/images/figurine-right.png',
      '/images/background.png'
    ];

    var loadedCount = 0;
    var totalImages = imagesToLoad.length;

    function imageLoaded() {
      loadedCount++;
      if (loadedCount === totalImages) {
        // Небольшая задержка для плавности
        setTimeout(function () {
          preloader.classList.add('preloader-hidden');
          setTimeout(function () {
            preloader.style.display = 'none';
          }, 500);
        }, 300);
      }
    }

    // Загружаем все изображения
    imagesToLoad.forEach(function (src) {
      var img = new Image();
      img.onload = imageLoaded;
      img.onerror = imageLoaded; // Продолжаем даже если изображение не загрузилось
      img.src = src;
    });

    // Таймаут на случай, если изображения не загрузятся
    setTimeout(function () {
      if (loadedCount < totalImages) {
        preloader.classList.add('preloader-hidden');
        setTimeout(function () {
          preloader.style.display = 'none';
        }, 500);
      }
    }, 10000); // Максимум 10 секунд
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPreloader();
      run();
      initEmptyStateForm();
      initMarketplacesTicker();
      initMarketplacesModal();
    });
  } else {
    initPreloader();
    run();
    initEmptyStateForm();
    initMarketplacesTicker();
    initMarketplacesModal();
  }
})();
