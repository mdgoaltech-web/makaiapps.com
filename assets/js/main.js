/* MAK AI Apps — site behaviour. No dependencies. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Header state ---------- */
  var header = $('[data-header]');
  function onScrollHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = $('[data-menu-toggle]');
  var menu = $('[data-mobile-menu]');
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    doc.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      void menu.offsetWidth; // commit the un-hidden state so the transition runs
      menu.classList.add('is-open');
      var first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      setTimeout(function () { if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 300);
    }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024 && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealCallbacks = new Map();
  function onReveal(el, fn) { revealCallbacks.set(el, fn); }

  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');
        io.unobserve(el);
        var cb = revealCallbacks.get(el);
        if (cb) cb();
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = $$('.primary-nav a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-current'); l.removeAttribute('aria-current'); });
          link.classList.add('is-current');
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = doc.getElementById(id); if (s) navIO.observe(s); });
  }

  /* ---------- Card spotlight ---------- */
  if (finePointer) {
    $$('[data-spotlight]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Hero parallax ---------- */
  var visual = $('[data-parallax]');
  if (visual && finePointer && !reduceMotion) {
    var layers = $$('[data-depth]', visual);
    var hero = visual.closest('section');
    var raf = 0;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var x = (e.clientX / window.innerWidth - 0.5) * 2;
        var y = (e.clientY / window.innerHeight - 0.5) * 2;
        layers.forEach(function (l) {
          var d = parseFloat(l.getAttribute('data-depth')) || 1;
          l.style.translate = (x * 10 * d).toFixed(1) + 'px ' + (y * 8 * d).toFixed(1) + 'px';
        });
      });
    });
    hero.addEventListener('pointerleave', function () {
      layers.forEach(function (l) { l.style.translate = '0px 0px'; });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Launch checklist ---------- */
  var checklist = $('[data-checklist]');
  if (checklist) {
    var items = $$('.cl-list li', checklist);
    var bar = $('.cl-progress', checklist);
    var status = $('.cl-status', checklist);
    var runChecklist = function () {
      items.forEach(function (li, i) {
        setTimeout(function () {
          li.classList.add('is-done');
          var p = Math.round(((i + 1) / items.length) * 100);
          bar.style.setProperty('--p', p + '%');
          if (i === items.length - 1) { checklist.classList.add('is-complete'); if (status) status.textContent = 'Ready to ship'; }
        }, reduceMotion ? 0 : 450 + i * 320);
      });
    };
    if (status) status.textContent = 'Checking…';
    var holder = checklist.closest('.reveal');
    if (holder && !reduceMotion && 'IntersectionObserver' in window) onReveal(holder, runChecklist);
    else runChecklist();
  }

  /* ---------- Stat count-up ---------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    var run = function () {
      var start = null;
      var dur = Math.min(1600, 500 + target * 12);
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      el.textContent = '0' + suffix;
      requestAnimationFrame(step);
    };
    var holder = el.closest('.reveal');
    if (holder && !reduceMotion && 'IntersectionObserver' in window) onReveal(holder, run);
  });

  /* ---------- Growth tabs + loop ---------- */
  var tabs = $$('[role="tab"][data-tab]');
  var loopNodes = $$('[data-loop]');
  function selectTab(key, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = doc.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
      if (on && focus) t.focus();
    });
    loopNodes.forEach(function (n) { n.classList.toggle('is-active', n.getAttribute('data-loop') === key); });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next.getAttribute('data-tab'), true); }
    });
  });
  loopNodes.forEach(function (n) {
    n.addEventListener('click', function () { selectTab(n.getAttribute('data-loop')); });
  });

  /* ---------- Process progress ---------- */
  var process = $('[data-process]');
  if (process) {
    var steps = $$('.step', process);
    var ticking = false;
    var updateProcess = function () {
      ticking = false;
      var r = process.getBoundingClientRect();
      var mid = window.innerHeight * 0.55;
      var p = (mid - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      process.style.setProperty('--progress', p.toFixed(3));
      steps.forEach(function (s) {
        var sr = s.getBoundingClientRect();
        s.classList.toggle('is-active', sr.top + 28 < mid);
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateProcess); }
    }, { passive: true });
    window.addEventListener('resize', updateProcess);
    updateProcess();
  }

  /* ---------- Contact form ---------- */
  var form = $('[data-contact-form]');
  if (form) {
    var statusEl = $('[data-form-status]', form);
    var submitBtn = $('[data-submit]', form);
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please tell us your name.'; },
      email: function (v) { return emailRe.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
      project_type: function (v) { return v ? '' : 'Please choose what you need.'; },
      message: function (v) { return v.trim().length >= 20 ? '' : 'A few more details please — at least 20 characters.'; },
      consent: function (v, el) { return el.checked ? '' : 'Please agree so we can reply to you.'; }
    };

    function fieldEl(name) { return form.elements[name]; }
    function showError(name, msg) {
      var el = fieldEl(name);
      if (!el) return;
      var wrap = el.closest('.field');
      var err = wrap && $('.field-error', wrap);
      if (wrap) wrap.classList.toggle('has-error', !!msg);
      if (err) {
        err.textContent = msg;
        if (!err.id) err.id = 'err-' + name;
      }
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) {
        if (msg) el.setAttribute('aria-describedby', err.id);
        else el.removeAttribute('aria-describedby');
      }
    }
    function validate(name) {
      var el = fieldEl(name);
      if (!el || !rules[name]) return '';
      var msg = rules[name](el.value || '', el);
      showError(name, msg);
      return msg;
    }

    Object.keys(rules).forEach(function (name) {
      var el = fieldEl(name);
      if (!el) return;
      var evt = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'blur';
      el.addEventListener(evt, function () { validate(name); });
      el.addEventListener('input', function () {
        if (el.closest('.field').classList.contains('has-error')) validate(name);
      });
    });

    function setStatus(msg, kind) {
      statusEl.textContent = msg;
      statusEl.classList.toggle('is-success', kind === 'success');
      statusEl.classList.toggle('is-error', kind === 'error');
    }
    function setLoading(on) {
      submitBtn.disabled = on;
      submitBtn.classList.toggle('is-loading', on);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', null);

      // Bots fill the hidden field; quietly pretend success.
      if (form.elements.website && form.elements.website.value) {
        form.reset();
        setStatus('Thanks — your message has been sent.', 'success');
        return;
      }

      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (validate(name) && !firstInvalid) firstInvalid = fieldEl(name);
      });
      if (firstInvalid) {
        firstInvalid.focus();
        setStatus('Please check the highlighted fields.', 'error');
        return;
      }

      var data = new FormData(form);
      data.delete('website');
      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      var mailto = form.getAttribute('data-mailto') || 'afex@makaiapps.com';

      if (endpoint) {
        setLoading(true);
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            form.reset();
            setStatus('Thank you — your enquiry is in. We\'ll reply to ' + data.get('email') + ' personally.', 'success');
          })
          .catch(function () {
            setStatus('Something went wrong sending your message. Please email us directly at ' + mailto + '.', 'error');
          })
          .then(function () { setLoading(false); });
        return;
      }

      // No backend configured: hand off to the visitor's email app with everything pre-filled.
      var lines = [
        'Name: ' + data.get('name'),
        'Email: ' + data.get('email'),
        'Company: ' + (data.get('company') || '—'),
        'Need: ' + data.get('project_type'),
        'Budget: ' + (data.get('budget') || '—'),
        '',
        data.get('message')
      ];
      var subject = 'Project enquiry — ' + data.get('project_type');
      var href = 'mailto:' + mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;
      setStatus('Your email app should open with your message ready to send. If nothing happened, email us at ' + mailto + '.', 'success');
    });
  }
})();
