/**
 * StyleGenie — статическая версия для GitHub Pages
 * Вся логика чата: шаги, быстрые ответы, карточки товаров и ателье
 */

(function () {
  'use strict';

  // ——— Данные ———
  var MARKETPLACES = [
    { id: 'lamoda', name: 'Lamoda', url: 'https://www.lamoda.ru', enabled: true },
    { id: 'tsum', name: 'ЦУМ', url: 'https://www.tsum.ru', enabled: true },
    { id: 'wildberries', name: 'Wildberries', url: 'https://www.wildberries.ru', enabled: true },
    { id: 'ozon', name: 'Ozon', url: 'https://www.ozon.ru', enabled: true },
  ];

  var DRESS_IMAGES = [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1585487000143-668a2d34c32f?w=400&h=533&fit=crop',
  ];

  var MOCK_MASTERS = [
    { id: 'm1', name: 'Ателье «Подиум»', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=533&fit=crop', priceFrom: 15000, priceTo: 45000 },
    { id: 'm2', name: 'Мастерская Ольги К.', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop', priceFrom: 8000, priceTo: 25000 },
    { id: 'm3', name: 'Ателье «Ткани и форма»', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=533&fit=crop', priceFrom: 25000, priceTo: 80000 },
  ];

  var PRICE_OPTIONS = [
    { value: 'budget', label: 'До 10 000 ₽' },
    { value: 'mid', label: '10 000 – 30 000 ₽' },
    { value: 'premium_mid', label: '30 000 – 50 000 ₽' },
    { value: 'premium', label: 'Премиум 50 000+ ₽' },
    { value: 'discounts', label: 'Искать скидки' },
  ];

  var OCCASION_OPTIONS = [
    { value: 'casual', label: 'Повседневная одежда' },
    { value: 'office', label: 'Офис / деловой стиль' },
    { value: 'party', label: 'Вечеринка / выход' },
    { value: 'formal', label: 'Торжество / свадьба' },
    { value: 'any', label: 'Не важно' },
  ];

  var PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f3f4f6" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EНет фото%3C/text%3E%3C/svg%3E';

  function generateMockProducts(marketplace, query) {
    var q = query || 'платье';
    return [
      { id: marketplace.id + '-1', name: 'Элегантное платье ' + q, price: 5000 + Math.floor(Math.random() * 50000), image: DRESS_IMAGES[0], images: [DRESS_IMAGES[0], DRESS_IMAGES[3], DRESS_IMAGES[4]], url: marketplace.url + '/product/1', marketplace: marketplace.name, similarity: 0.85 + Math.random() * 0.1, brand: 'Fashion Brand' },
      { id: marketplace.id + '-2', name: 'Стильное платье ' + q, price: 5000 + Math.floor(Math.random() * 50000), image: DRESS_IMAGES[1], images: [DRESS_IMAGES[1], DRESS_IMAGES[4]], url: marketplace.url + '/product/2', marketplace: marketplace.name, similarity: 0.75 + Math.random() * 0.1, brand: 'Style Brand' },
      { id: marketplace.id + '-3', name: 'Классическое платье ' + q, price: 5000 + Math.floor(Math.random() * 50000), image: DRESS_IMAGES[2], images: [DRESS_IMAGES[2], DRESS_IMAGES[5], DRESS_IMAGES[0]], url: marketplace.url + '/product/3', marketplace: marketplace.name, similarity: 0.65 + Math.random() * 0.1 },
    ];
  }

  function mockSearch(prompt) {
    var enabled = MARKETPLACES.filter(function (m) { return m.enabled; });
    var all = [];
    enabled.forEach(function (m) {
      all = all.concat(generateMockProducts(m, prompt));
    });
    all.sort(function (a, b) { return (b.similarity || 0) - (a.similarity || 0); });
    return all.slice(0, 6);
  }

  // ——— Состояние ———
  var state = {
    step: 'welcome',
    messages: [],
    userDescription: '',
    userImageUrl: null,
    userFilters: {},
    isLoading: false,
    selectedImage: null,
  };

  var messagesInner = document.getElementById('messagesInner');
  var loadingBubble = document.getElementById('loadingBubble');
  var emptyState = document.getElementById('emptyState');
  var chatWrap = document.getElementById('chatWrap');
  var main = document.getElementById('main');
  var textInput = document.getElementById('textInput');
  var textInputChat = document.getElementById('textInputChat');
  var fileInput = document.getElementById('fileInput');
  var fileInputChat = document.getElementById('fileInputChat');
  var previewWrap = document.getElementById('previewWrap');
  var previewWrapChat = document.getElementById('previewWrapChat');
  var previewImg = document.getElementById('previewImg');
  var previewImgChat = document.getElementById('previewImgChat');
  var btnSend = document.getElementById('btnSend');
  var btnSendChat = document.getElementById('btnSendChat');
  var figurinesWrap = document.getElementById('figurinesWrap');

  function hasContent() {
    return state.messages.length > 0 || state.isLoading;
  }

  function setPlaceholder() {
    var step = state.step;
    var place = step === 'welcome' ? 'Опиши образ или прикрепи картинку...' : step === 'clarify_price' ? 'Выбери цену выше или напиши свой вариант' : step === 'clarify_occasion' ? 'Выбери повод выше или напиши' : 'Напиши сообщение...';
    if (textInput) textInput.placeholder = place;
    if (textInputChat) textInputChat.placeholder = place;
  }

  function addAssistantMessage(content, opts) {
    opts = opts || {};
    state.messages.push({
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: content,
      products: opts.products,
      masters: opts.masters,
      quickReplies: opts.quickReplies,
    });
    renderMessages();
    scrollToEnd();
  }

  function runSearch(prompt, imageUrl) {
    state.userDescription = prompt || state.userDescription;
    if (imageUrl) state.userImageUrl = imageUrl;
    state.isLoading = true;
    state.step = 'searching';
    renderMessages();
    setPlaceholder();
    scrollToEnd();

    setTimeout(function () {
      var products = mockSearch(prompt || state.userDescription || 'платье');
      state.isLoading = false;
      state.step = 'results';
      addAssistantMessage('Найдено ' + products.length + ' товаров. Посмотри, есть ли то что искал.', { products: products });
      addAssistantMessage('Нашёл ли ты то, что хотел?', {
        quickReplies: [
          { label: 'Да, нашёл', action: 'yes' },
          { label: 'Нет, не то', action: 'no' },
        ],
      });
      state.step = 'follow_up';
      setPlaceholder();
      scrollToEnd();
    }, 1200);
  }

  function handleQuickReply(action) {
    if (action === 'yes') {
      addAssistantMessage('Отлично! Если захочешь подобрать ещё образ — просто опиши, что ищешь.', { quickReplies: [{ label: 'Новый поиск', action: 'new_search' }] });
      state.step = 'welcome';
      state.userDescription = '';
      state.userFilters = {};
      setPlaceholder();
      toggleView();
      return;
    }
    if (action === 'new_search') {
      addAssistantMessage('Опиши, какой образ хочешь найти — начнём заново.');
      state.step = 'welcome';
      state.userDescription = '';
      state.userImageUrl = null;
      state.userFilters = {};
      state.selectedImage = null;
      setPlaceholder();
      toggleView();
      return;
    }
    if (action === 'no') {
      state.step = 'not_found';
      addAssistantMessage('Тогда можем помочь так:', {
        quickReplies: [
          { label: 'Найти мастера по пошиву', action: 'find_master' },
          { label: 'Сгенерировать картинку образа', action: 'generate_image' },
          { label: 'Новый поиск', action: 'new_search' },
        ],
      });
      setPlaceholder();
      renderMessages();
      scrollToEnd();
      return;
    }
    if (action === 'find_master') {
      addAssistantMessage('Подбор ателье под твой образ и бюджет. Примерная цена изделия:', { masters: MOCK_MASTERS });
      state.step = 'welcome';
      state.userDescription = '';
      state.userImageUrl = null;
      state.userFilters = {};
      toggleView();
      setPlaceholder();
      return;
    }
    if (action === 'generate_image') {
      addAssistantMessage('Генерация образа по описанию в разработке. Скоро можно будет получить картинку платья или образа по твоим пожеланиям.');
      state.step = 'welcome';
      state.userDescription = '';
      state.userImageUrl = null;
      state.userFilters = {};
      toggleView();
      setPlaceholder();
      return;
    }
    if (PRICE_OPTIONS.some(function (o) { return o.value === action; })) {
      state.userFilters.priceSegment = action;
      state.step = 'clarify_occasion';
      addAssistantMessage('Повод или тип образа?', { quickReplies: OCCASION_OPTIONS.map(function (o) { return { label: o.label, action: o.value }; }) });
      setPlaceholder();
      renderMessages();
      scrollToEnd();
      return;
    }
    if (OCCASION_OPTIONS.some(function (o) { return o.value === action; })) {
      state.userFilters.occasion = action;
      runSearch(state.userDescription, state.userImageUrl);
      return;
    }
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderProductCard(product) {
    var imgs = (product.images && product.images.length) ? product.images : [product.image];
    var sim = product.similarity != null ? Math.round(product.similarity * 100) + '%' : '';
    var html = '<div class="card">';
    html += '<div class="card-image-wrap">';
    html += '<img src="' + escapeHtml(imgs[0]) + '" alt="" onerror="this.src=\'' + PLACEHOLDER_IMG.replace(/'/g, "\\'") + '\'">';
    if (sim) html += '<span class="card-badge">' + sim + '</span>';
    html += '<a href="' + escapeHtml(product.url) + '" target="_blank" rel="noopener noreferrer" class="card-link">↗</a>';
    html += '</div>';
    if (imgs.length > 1) {
      html += '<div class="card-thumbs">';
      imgs.slice(0, 5).forEach(function (src) {
        html += '<div class="card-thumb"><img src="' + escapeHtml(src) + '" alt=""></div>';
      });
      html += '</div>';
    }
    html += '<div class="card-body">';
    html += '<h4 class="card-title">' + escapeHtml(product.name) + '</h4>';
    if (product.brand) html += '<p class="card-brand">' + escapeHtml(product.brand) + '</p>';
    html += '<p class="card-price">' + product.price.toLocaleString('ru-RU') + ' ₽</p>';
    html += '</div></div>';
    return html;
  }

  function renderMasterCard(master) {
    var priceText = master.priceTo ? 'от ' + master.priceFrom.toLocaleString('ru-RU') + ' – ' + master.priceTo.toLocaleString('ru-RU') + ' ₽' : 'от ' + master.priceFrom.toLocaleString('ru-RU') + ' ₽';
    var html = '<div class="card">';
    html += '<div class="card-image-wrap"><img src="' + escapeHtml(master.image) + '" alt="" onerror="this.src=\'' + PLACEHOLDER_IMG.replace(/'/g, "\\'") + '\'"></div>';
    html += '<div class="card-body">';
    html += '<h4 class="card-title">' + escapeHtml(master.name) + '</h4>';
    html += '<p class="card-price" style="font-size:0.875rem;font-weight:400;color:var(--gray-600)">' + priceText + '</p>';
    html += '</div></div>';
    return html;
  }

  function renderMessages() {
    if (!messagesInner) return;
    messagesInner.innerHTML = '';
    state.messages.forEach(function (msg) {
      var wrap = document.createElement('div');
      wrap.className = 'msg ' + msg.role';
      var bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      var content = '<p class="msg-content">' + escapeHtml(msg.content) + '</p>';
      if (msg.imageUrl && msg.role === 'user') {
        content = '<div class="msg-image"><img src="' + escapeHtml(msg.imageUrl) + '" alt=""></div>' + content;
      }
      if (msg.products && msg.products.length) {
        var byMarket = {};
        msg.products.forEach(function (p) {
          var n = p.marketplace || 'Другие';
          if (!byMarket[n]) byMarket[n] = [];
          byMarket[n].push(p);
        });
        Object.keys(byMarket).forEach(function (name) {
          content += '<div class="cards-group"><h4 class="cards-group-title">' + escapeHtml(name) + '</h4>';
          content += '<div class="cards-grid">';
          byMarket[name].forEach(function (p) { content += renderProductCard(p); });
          content += '</div></div>';
        });
      }
      if (msg.masters && msg.masters.length) {
        content += '<div class="cards-group" style="margin-top:16px"><div class="cards-grid">';
        msg.masters.forEach(function (m) { content += renderMasterCard(m); });
        content += '</div></div>';
      }
      if (msg.quickReplies && msg.quickReplies.length) {
        var discount = msg.quickReplies.find(function (qr) { return qr.action === 'discounts'; });
        var rest = msg.quickReplies.filter(function (qr) { return qr.action !== 'discounts'; });
        content += '<div class="quick-replies">';
        content += '<div class="quick-replies-buttons">';
        rest.forEach(function (qr) {
          content += '<button type="button" class="quick-reply-btn" data-action="' + escapeHtml(qr.action) + '">' + escapeHtml(qr.label) + '</button>';
        });
        content += '</div>';
        if (discount) {
          content += '<div class="quick-reply-discount-wrap"><button type="button" class="quick-reply-discount-btn" data-action="discounts">' + escapeHtml(discount.label) + '</button></div>';
        }
        content += '</div>';
      }
      bubble.innerHTML = content;
      wrap.appendChild(bubble);
      messagesInner.appendChild(wrap);

      bubble.querySelectorAll('.quick-reply-btn, .quick-reply-discount-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          handleQuickReply(btn.getAttribute('data-action'));
        });
      });
    });
  }

  function scrollToEnd() {
    var end = document.getElementById('messagesEnd');
    if (end) end.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleView() {
    var has = hasContent();
    if (main) main.classList.toggle('has-content', has);
    if (emptyState) emptyState.style.display = has ? 'none' : 'block';
    if (chatWrap) chatWrap.style.display = has ? 'flex' : 'none';
    if (loadingBubble) loadingBubble.style.display = (state.isLoading ? 'flex' : 'none');
    if (figurinesWrap) figurinesWrap.classList.toggle('figurines-hidden', has);
    var hasInput = !!(state.selectedImage || (textInput && textInput.value.trim()));
    var hasInputChat = !!(state.selectedImage || (textInputChat && textInputChat.value.trim()));
    if (btnSend) btnSend.disabled = state.isLoading || !hasInput;
    if (btnSendChat) btnSendChat.disabled = state.isLoading || !hasInputChat;
  }

  function handleSubmit(e, isChat) {
    var ev = e || {};
    if (ev.preventDefault) ev.preventDefault();
    if (ev.stopPropagation) ev.stopPropagation();
    var inputEl = isChat ? textInputChat : textInput;
    var text = (inputEl && inputEl.value.trim()) || '';
    if (!text && !state.selectedImage) return;

    var userMsg = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text || 'Вот картинка',
      imageUrl: state.selectedImage || undefined,
    };
    state.messages.push(userMsg);

    if (state.step === 'welcome') {
      state.userDescription = text || 'по картинке';
      if (state.selectedImage) state.userImageUrl = state.selectedImage;
      if (inputEl) inputEl.value = '';
      state.selectedImage = null;
      state.step = 'clarify_price';
      addAssistantMessage('Понял! Уточни ценовой сегмент:', { quickReplies: PRICE_OPTIONS.map(function (o) { return { label: o.label, action: o.value }; }) });
      toggleView();
      setPlaceholder();
      scrollToEnd();
      updatePreviews();
      return;
    }
    if (state.step === 'clarify_price') {
      var priceOpt = PRICE_OPTIONS.find(function (o) { return o.label === text || o.value === text; });
      state.userFilters.priceSegment = (priceOpt && priceOpt.value) || 'mid';
      state.step = 'clarify_occasion';
      addAssistantMessage('Повод или тип образа?', { quickReplies: OCCASION_OPTIONS.map(function (o) { return { label: o.label, action: o.value }; }) });
      if (inputEl) inputEl.value = '';
      setPlaceholder();
      renderMessages();
      scrollToEnd();
      return;
    }
    if (state.step === 'clarify_occasion') {
      var occOpt = OCCASION_OPTIONS.find(function (o) { return o.label === text || o.value === text; });
      if (occOpt) state.userFilters.occasion = occOpt.value;
      runSearch(state.userDescription, state.userImageUrl);
      if (inputEl) inputEl.value = '';
      return;
    }
    if (inputEl) inputEl.value = '';
    state.selectedImage = null;
    updatePreviews();
    runSearch(text, state.selectedImage);
    return false;
  }

  function updatePreviews() {
    var has = !!state.selectedImage;
    if (previewWrap) previewWrap.style.display = has ? 'block' : 'none';
    if (previewWrapChat) previewWrapChat.style.display = has ? 'block' : 'none';
    if (has && previewImg) previewImg.src = state.selectedImage;
    if (has && previewImgChat) previewImgChat.src = state.selectedImage;
  }

  function onImageChange(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onloadend = function () {
      state.selectedImage = reader.result;
      updatePreviews();
    };
    reader.readAsDataURL(file);
  }

  function init() {
    try {
      setPlaceholder();
      toggleView();

      var form1 = document.getElementById('inputForm');
      var form2 = document.getElementById('inputFormChat');
      if (form1) {
        form1.addEventListener('submit', function (e) { handleSubmit(e, false); return false; });
      }
      if (form2) {
        form2.addEventListener('submit', function (e) { handleSubmit(e, true); return false; });
      }

      // Кнопка «Отправить» — клик срабатывает даже если submit формы не сработал (например на GitHub Pages)
      if (btnSend) {
        btnSend.addEventListener('click', function (e) {
          e.preventDefault();
          handleSubmit(e, false);
          return false;
        });
      }
      if (btnSendChat) {
        btnSendChat.addEventListener('click', function (e) {
          e.preventDefault();
          handleSubmit(e, true);
          return false;
        });
      }

      if (document.getElementById('btnImage') && fileInput) {
        document.getElementById('btnImage').addEventListener('click', function () { fileInput.click(); });
      }
      if (document.getElementById('btnImageChat') && fileInputChat) {
        document.getElementById('btnImageChat').addEventListener('click', function () { fileInputChat.click(); });
      }
      if (fileInput) fileInput.addEventListener('change', function () { onImageChange(this.files[0]); });
      if (fileInputChat) fileInputChat.addEventListener('change', function () { onImageChange(this.files[0]); });

      var pr = document.getElementById('previewRemove');
      if (pr) pr.addEventListener('click', function () { state.selectedImage = null; updatePreviews(); });
      var prc = document.getElementById('previewRemoveChat');
      if (prc) prc.addEventListener('click', function () { state.selectedImage = null; updatePreviews(); });

      setInterval(function () {
        if (loadingBubble) loadingBubble.style.display = state.isLoading ? 'flex' : 'none';
        var hasInput = (textInput && textInput.value.trim()) || state.selectedImage;
        var hasInputChat = (textInputChat && textInputChat.value.trim()) || state.selectedImage;
        if (btnSend) btnSend.disabled = state.isLoading || !hasInput;
        if (btnSendChat) btnSendChat.disabled = state.isLoading || !hasInputChat;
      }, 200);
    } catch (err) {
      console.error('StyleGenie init error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
