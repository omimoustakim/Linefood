/* ============================================================
   Linefood – script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── COOKIE BANNER RGPD ── */
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');
  if (cookieBanner && cookieAccept) {
    if (!localStorage.getItem('linefood_cookies_ok')) {
      setTimeout(function () { cookieBanner.classList.add('visible'); }, 1000);
    }
    cookieAccept.addEventListener('click', function () {
      localStorage.setItem('linefood_cookies_ok', '1');
      cookieBanner.classList.remove('visible');
    });
  }

  /* ── 2. BURGER MENU ── */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── 3. NAV SCROLL ── */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    navbar.style.background = window.scrollY > 60
      ? 'rgba(7, 15, 24, 0.98)'
      : 'rgba(7, 17, 28, 0.88)';
  });

  /* ── 4. DATE MIN ── */
  var dateInput = document.getElementById('fdate');
  if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  }

  /* ── 5. SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#') return;
      var t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ── 6. FILTER ── */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var menuCards = document.querySelectorAll('.menu-card');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      menuCards.forEach(function (c) {
        c.classList.toggle('hidden', f !== 'all' && c.dataset.cat !== f);
      });
      if (typeof expanded !== 'undefined') {
        expanded = false;
        setTimeout(applyShowMore, 10);
      }
    });
  });

  /* ── 7. CART ── */
  var cart = [];
  try { var saved = localStorage.getItem('linefood_cart'); if (saved) cart = JSON.parse(saved); } catch (_) {}

  function saveCart() { localStorage.setItem('linefood_cart', JSON.stringify(cart)); }

  function parsePrice(str) { return parseFloat(str.replace('€', '').replace(',', '.').trim()); }

  function formatPrice(val) { return val.toFixed(2).replace('.', ',') + ' €'; }

  var panierBar = document.getElementById('panierBar');
  var panierCount = document.getElementById('panierCount');
  var panierPreview = document.getElementById('panierPreview');
  var panierVider = document.getElementById('panierVider');
  var panierCommander = document.getElementById('panierCommander');
  var formRecap = document.getElementById('recapList');
  var addWraps = document.querySelectorAll('.btn-add-wrap');
  var toast = document.getElementById('toast');

  function showToast(msg, color) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = color || '#a84c2a';
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3000);
  }

  function updateCart() {
    var totalItems = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    var totalPrice = cart.reduce(function (s, i) { return s + parsePrice(i.price) * i.qty; }, 0);

    // Panier bar
    if (totalItems === 0) {
      panierBar.classList.remove('visible');
      panierCount.textContent = '0 article';
      panierPreview.textContent = '';
    } else {
      panierBar.classList.add('visible');
      panierCount.textContent = totalItems + ' article' + (totalItems > 1 ? 's' : '');
      var names = cart.map(function (i) { return i.name + (i.qty > 1 ? ' ×' + i.qty : ''); });
      panierPreview.textContent = names.join(', ') + ' — ' + formatPrice(totalPrice);
    }

    // Dynamic card buttons
    addWraps.forEach(function (wrap) {
      var card = wrap.closest('.menu-card');
      var name = card.dataset.name;
      var item = cart.find(function (i) { return i.name === name; });

      if (!item || item.qty === 0) {
        wrap.innerHTML = '<button class="btn-add" aria-label="Ajouter au panier">+</button>';
        var btn = wrap.querySelector('.btn-add');
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          addToCart(name, card.dataset.price);
        });
      } else {
        wrap.innerHTML =
          '<button class="btn-qty minus" data-name="' + name + '" aria-label="Retirer">−</button>' +
          '<span class="card-qty-number">' + item.qty + '</span>' +
          '<button class="btn-qty" data-name="' + name + '" aria-label="Ajouter">+</button>';
        var minus = wrap.querySelector('.minus');
        var plus = wrap.querySelector('.btn-qty:not(.minus)');
        minus.addEventListener('click', function (e) {
          e.stopPropagation();
          var found = cart.find(function (i) { return i.name === name; });
          if (found) {
            found.qty--;
            if (found.qty <= 0) cart = cart.filter(function (i) { return i.name !== name; });
            updateCart();
            saveCart();
          }
        });
        plus.addEventListener('click', function (e) {
          e.stopPropagation();
          addToCart(name, card.dataset.price);
        });
      }
    });

    // Recap
    if (totalItems === 0) {
      formRecap.innerHTML = '<p class="recap-empty">Ajoutez des plats depuis le menu ✨</p>';
      saveCart();
      return;
    }

    var recapHtml = '';
    cart.forEach(function (item, i) {
      var lineTotal = parsePrice(item.price) * item.qty;
      recapHtml +=
        '<div class="recap-line">' +
          '<div class="recap-name-block">' +
            '<span class="recap-name">' + item.name + '</span>' +
            '<span class="recap-price-small">' + item.price + ' × ' + item.qty + ' = ' + formatPrice(lineTotal) + '</span>' +
          '</div>' +
          '<div class="recap-qty-ctrl">' +
            '<button class="recap-btn" data-index="' + i + '" data-action="dec">−</button>' +
            '<span class="recap-qty">' + item.qty + '</span>' +
            '<button class="recap-btn" data-index="' + i + '" data-action="inc">+</button>' +
          '</div>' +
        '</div>';
    });
    recapHtml +=
      '<div class="recap-line recap-total-line">' +
        '<span>Total</span>' +
        '<span>' + formatPrice(totalPrice) + '</span>' +
      '</div>';
    formRecap.innerHTML = recapHtml;

    formRecap.querySelectorAll('.recap-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.dataset.index);
        if (this.dataset.action === 'inc') {
          cart[idx].qty++;
        } else {
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        updateCart();
        saveCart();
      });
    });

    saveCart();
  }

  function addToCart(name, price) {
    var existing = cart.find(function (i) { return i.name === name; });
    if (existing) { existing.qty++; }
    else { cart.push({ name: name, price: price, qty: 1 }); }
    updateCart();
    saveCart();
    showToast(name + ' ajouté ✓', '#c9a84c');
  }

  panierVider.addEventListener('click', function () {
    cart = [];
    updateCart();
    saveCart();
    showToast('Panier vidé', '#a84c2a');
  });

  panierCommander.addEventListener('click', function () {
    var formSection = document.getElementById('commander');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
  });

  /* ── 8. FORM → WHATSAPP ── */
  var resaBtn = document.getElementById('resaBtn');

  if (resaBtn) {
    resaBtn.addEventListener('click', function () {
      var name = document.getElementById('fname').value.trim();
      var phone = document.getElementById('fphone').value.trim();
      var address = document.getElementById('faddress').value.trim();
      var ville = document.getElementById('fville').value.trim();
      var date = document.getElementById('fdate').value;
      var heure = document.getElementById('fheure').value;
      var personnes = document.getElementById('fpersonnes').value;
      var email = document.getElementById('femail').value.trim();
      var note = document.getElementById('fnote').value.trim();

      if (!name || !phone || !address || !ville) {
        showToast('⚠️ Merci de remplir : Nom, Téléphone, Adresse et Ville.', '#7a1f1f');
        return;
      }

      var consent = document.getElementById('fconsent');
      if (consent && !consent.checked) {
        showToast('⚠️ Merci d\'accepter la politique de confidentialité.', '#7a1f1f');
        return;
      }

      var cartStr = '';
      var totalPrice = 0;
      if (cart.length > 0) {
        cartStr = cart.map(function (i) {
          var sub = parsePrice(i.price) * i.qty;
          totalPrice += sub;
          return '  • ' + i.name + ' — ' + i.price + ' ×' + i.qty;
        }).join('\n');
        cartStr += '\n\n  ──────────────\n  Total : ' + formatPrice(totalPrice);
      } else {
        cartStr = '  (aucun plat sélectionné)';
      }

      var message =
        '🛵 Nouvelle commande Linefood\n' +
        'Nom : ' + name + '\n' +
        'Tél : ' + phone + '\n' +
        'Adresse : ' + address + '\n' +
        'Ville : ' + ville + '\n' +
        (date ? 'Date : ' + date + '\n' : '') +
        (heure ? 'Heure : ' + heure + '\n' : '') +
        (personnes ? 'Personnes : ' + personnes + '\n' : '') +
        (email ? 'Email : ' + email + '\n' : '') +
        (note ? 'Note : ' + note + '\n' : '') +
        '\n📋 Commande :\n' + cartStr;

      window.open('https://api.whatsapp.com/send?phone=33746513094&text=' + encodeURIComponent(message), '_blank');
      showToast('✅ Redirection vers WhatsApp...', '#25D366');

      document.getElementById('fname').value = '';
      document.getElementById('fphone').value = '';
      document.getElementById('faddress').value = '';
      document.getElementById('fville').value = '';
      document.getElementById('fdate').value = '';
      document.getElementById('fheure').value = '';
      document.getElementById('fpersonnes').value = '';
      document.getElementById('femail').value = '';
      document.getElementById('fnote').value = '';
      var consentEl = document.getElementById('fconsent');
      if (consentEl) consentEl.checked = false;
      cart = [];
      updateCart();
    });
  }

  /* ── 9. LIGHTBOX ── */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var currentImgIndex = 0;
  var galleryImages = [];

  function openLightbox(index) {
    currentImgIndex = index;
    var img = galleryImages[index];
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCounter.textContent = (index + 1) + ' / ' + galleryImages.length;
    lightbox.classList.add('open');
  }

  function prevImage() {
    currentImgIndex = (currentImgIndex - 1 + galleryImages.length) % galleryImages.length;
    openLightbox(currentImgIndex);
  }

  function nextImage() {
    currentImgIndex = (currentImgIndex + 1) % galleryImages.length;
    openLightbox(currentImgIndex);
  }

  galleryImages = Array.from(document.querySelectorAll('.menu-img'));
  galleryImages.forEach(function (img, i) {
    img.addEventListener('click', function () { openLightbox(i); });
  });

  lightboxClose.addEventListener('click', function () { lightbox.classList.remove('open'); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
  lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); prevImage(); });
  lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); nextImage(); });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lightbox.classList.remove('open');
    else if (e.key === 'ArrowLeft') prevImage();
    else if (e.key === 'ArrowRight') nextImage();
  });

  /* ── 10. SCROLL ANIMATIONS ── */
  var fadeEls = document.querySelectorAll('.menu-card, .stat-card');
  fadeEls.forEach(function (el) { el.classList.add('fade-in'); });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── 11. SHOW MORE ── */
  var showMoreBtn = document.getElementById('showMoreBtn');
  var allCards = document.querySelectorAll('.menu-card');
  var initialCount = 8;
  var expanded = false;

  function applyShowMore() {
    var visibleCards = document.querySelectorAll('.menu-card:not(.hidden)');
    var totalVisible = visibleCards.length;

    if (totalVisible <= initialCount) {
      visibleCards.forEach(function (c) { c.classList.remove('hide-extra'); });
      if (showMoreBtn) showMoreBtn.style.display = 'none';
      return;
    }

    if (showMoreBtn) showMoreBtn.style.display = 'inline-block';

    visibleCards.forEach(function (card, i) {
      if (!expanded && i >= initialCount) {
        card.classList.add('hide-extra');
      } else {
        card.classList.remove('hide-extra');
      }
    });

    if (showMoreBtn) {
      showMoreBtn.textContent = expanded ? 'Voir moins' : 'Voir plus';
    }
  }

  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', function () {
      expanded = !expanded;
      applyShowMore();
    });
  }

  /* ── INIT ── */
  updateCart();
  applyShowMore();

});
