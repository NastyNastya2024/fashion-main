/**
 * StyleGenie — демо-анимация для GitHub Pages (без бэкенда)
 * Сценарий воспроизводится по таймеру, кнопка «Повторить» перезапускает.
 */
(function () {
  'use strict';

  var PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f3f4f6" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EНет фото%3C/text%3E%3C/svg%3E';
  var DRESS_IMAGES = [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=533&fit=crop',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=533&fit=crop',
  ];
  var DEMO_PRODUCTS = [
    { id: '1', name: 'Элегантное вечернее платье', price: 18900, image: DRESS_IMAGES[0], url: '#', marketplace: 'Lamoda', similarity: 92 },
    { id: '2', name: 'Стильное платье для вечера', price: 24500, image: DRESS_IMAGES[1], url: '#', marketplace: 'Lamoda', similarity: 88 },
    { id: '3', name: 'Классическое платье', price: 15900, image: DRESS_IMAGES[2], url: '#', marketplace: 'Wildberries', similarity: 85 },
  ];

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function cardHtml(p) {
    var img = (p.images && p.images[0]) || p.image;
    var sim = p.similarity != null ? '<span class="card-badge">' + p.similarity + '%</span>' : '';
    return (
      '<div class="card">' +
      '<div class="card-image-wrap">' +
      '<img src="' + esc(img) + '" alt="" onerror="this.src=\'' + PLACEHOLDER_IMG.replace(/'/g, "\\'") + '\'">' + sim +
      '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" class="card-link">↗</a>' +
      '</div><div class="card-body">' +
      '<h4 class="card-title">' + esc(p.name) + '</h4>' +
      '<p class="card-price">' + p.price.toLocaleString('ru-RU') + ' ₽</p>' +
      '</div></div>'
    );
  }

  function addBubble(role, content, opts) {
    opts = opts || {};
    var area = document.getElementById('messagesInner');
    if (!area) return;
    var wrap = document.createElement('div');
    wrap.className = 'msg ' + role;
    var html = '<div class="msg-bubble"><p class="msg-content">' + esc(content) + '</p>';
    if (opts.products && opts.products.length) {
      html += '<div class="cards-group"><h4 class="cards-group-title">Товары</h4><div class="cards-grid">';
      opts.products.forEach(function (p) { html += cardHtml(p); });
      html += '</div></div>';
    }
    if (opts.quickReplies && opts.quickReplies.length) {
      html += '<div class="quick-replies"><div class="quick-replies-buttons">';
      opts.quickReplies.forEach(function (qr) {
        html += '<span class="quick-reply-btn" style="cursor:default">' + esc(qr.label) + '</span>';
      });
      html += '</div></div>';
    }
    html += '</div>';
    wrap.innerHTML = html;
    area.appendChild(wrap);
    var end = document.getElementById('messagesEnd');
    if (end) end.scrollIntoView({ behavior: 'smooth' });
  }

  function showLoading(show) {
    var el = document.getElementById('loadingBubble');
    if (el) el.style.display = show ? 'flex' : 'none';
    if (show) {
      var end = document.getElementById('messagesEnd');
      if (end) end.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function showReplayButton() {
    var fixed = document.querySelector('.input-bar-fixed');
    if (!fixed) return;
    fixed.innerHTML = '<div class="input-form" style="justify-content:center"><button type="button" class="quick-reply-btn" id="replayBtn">Повторить демо</button></div>';
    document.getElementById('replayBtn').onclick = run;
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
    // Восстановить исходную полосу ввода для следующего цикла
    var fixed = document.querySelector('.input-bar-fixed');
    if (fixed) {
      fixed.innerHTML =
        '<div class="preview-wrap preview-wrap-inline" id="previewWrapChat" style="display: none;"><img id="previewImgChat" src="" alt=""><button type="button" class="preview-remove" id="previewRemoveChat">×</button></div>' +
        '<form class="input-form" id="inputFormChat">' +
        '<input type="file" id="fileInputChat" accept="image/*" class="hidden">' +
        '<input type="text" id="textInputChat" placeholder="Демо — анимация по таймеру" autocomplete="off" readonly style="cursor:default">' +
        '<button type="button" class="btn-icon btn-icon-image" id="btnImageChat" aria-label="Прикрепить картинку" disabled><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"/></button>' +
        '<button type="button" class="btn-send" id="btnSendChat" disabled><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"/></button>' +
        '</form>';
    }
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
      addBubble('assistant', 'Найдено 3 товара. Посмотри, есть ли то что искал.', { products: DEMO_PRODUCTS });
    });
    delay += 600;
    schedule(delay, function () {
      addBubble('assistant', 'Нашёл ли ты то, что хотел?', {
        quickReplies: [
          { label: 'Да, нашёл', action: 'yes' },
          { label: 'Нет, не то', action: 'no' },
        ],
      });
    });
    delay += 500;
    schedule(delay, showReplayButton);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
