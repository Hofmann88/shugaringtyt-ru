(function () {
  "use strict";

  /* ===== ГОД В ФУТЕРЕ ===== */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== СКРОЛЛ ШАПКИ ===== */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ===== МОБИЛЬНОЕ МЕНЮ ===== */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  function closeMenu() {
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
    document.body.style.overflow = "";
  }
  burger.addEventListener("click", function () {
    var isOpen = mobileNav.classList.toggle("open");
    burger.classList.toggle("open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ===== ПЛАВНЫЙ СКРОЛЛ + АКТИВНЫЙ ПУНКТ МЕНЮ ===== */
  var navLinks = document.querySelectorAll('[data-nav]');
  var sections = Array.prototype.slice
    .call(navLinks)
    .map(function (a) {
      var id = a.getAttribute("href");
      return id && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function setActiveNav(id) {
    navLinks.forEach(function (a) {
      var match = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active", match);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveNav(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ===== АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ ===== */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ===== СЧЁТЧИКИ ЦИФР В HERO ===== */
  var counters = document.querySelectorAll("[data-count]");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  /* ===== ТАБЫ ПРАЙС-ЛИСТА ===== */
  var tabs = document.querySelectorAll(".price-tab");
  var panels = document.querySelectorAll(".price-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      panels.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-panel") === target);
      });
    });
  });

  /* ===== ВЫБОР УСЛУГИ ИЗ ПРАЙСА -> ФОРМА ===== */
  var serviceSelect = document.getElementById("f-service");
  document.querySelectorAll(".pick-service").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-service");
      if (serviceSelect) {
        var exists = Array.prototype.some.call(serviceSelect.options, function (o) {
          return o.value === value;
        });
        if (exists) serviceSelect.value = value;
      }
      var target = document.getElementById("booking");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      var nameInput = document.getElementById("f-name");
      setTimeout(function () { if (nameInput) nameInput.focus({ preventScroll: true }); }, 500);
    });
  });

  /* ===== FAQ АККОРДЕОН ===== */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var answer = item.querySelector(".faq-a");
      var isOpen = btn.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".faq-q").forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherBtn.closest(".faq-item").querySelector(".faq-a").style.maxHeight = null;
        }
      });

      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
    });
  });

  /* ===== ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ В GOOGLE ТАБЛИЦУ ===== */
  var form = document.getElementById("bookingForm");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = form.querySelector(".btn-submit");

  var phoneInput = document.getElementById("f-phone");
  phoneInput.addEventListener("input", function () {
    var digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (!digits) { phoneInput.value = ""; return; }
    if (digits[0] === "8") digits = "7" + digits.slice(1);
    if (digits[0] !== "7") digits = "7" + digits;
    var d = digits.slice(1);
    var out = "+7";
    if (d.length > 0) out += " (" + d.slice(0, 3);
    if (d.length >= 3) out += ")";
    if (d.length > 3) out += " " + d.slice(3, 6);
    if (d.length > 6) out += "-" + d.slice(6, 8);
    if (d.length > 8) out += "-" + d.slice(8, 10);
    phoneInput.value = out;
  });

  function setFieldError(name, message) {
    var row = form.querySelector('[name="' + name + '"]').closest(".form-row");
    var errEl = form.querySelector('[data-error="' + name + '"]');
    if (message) {
      row.classList.add("has-error");
      errEl.textContent = message;
    } else {
      row.classList.remove("has-error");
      errEl.textContent = "";
    }
  }

  function validateForm(data) {
    var valid = true;

    if (!data.name || data.name.trim().length < 2) {
      setFieldError("name", "Введите имя");
      valid = false;
    } else setFieldError("name", "");

    var phoneDigits = (data.phone || "").replace(/\D/g, "");
    if (phoneDigits.length !== 11) {
      setFieldError("phone", "Проверьте номер телефона");
      valid = false;
    } else setFieldError("phone", "");

    if (!data.service) {
      setFieldError("service", "Выберите услугу");
      valid = false;
    } else setFieldError("service", "");

    return valid;
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "form-status" + (type ? " " + type : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      service: form.service.value,
      date: form.date.value,
      comment: form.comment.value.trim(),
      consent: form.consent.checked,
      source: "shugaringtyt.ru",
      page: window.location.href,
      submittedAt: new Date().toISOString()
    };

    if (!validateForm(data)) {
      setStatus("Проверьте, пожалуйста, поля формы", "error");
      return;
    }
    if (!data.consent) {
      setStatus("Нужно согласие на обработку персональных данных", "error");
      return;
    }

    var scriptUrl = window.SITE_CONFIG && window.SITE_CONFIG.GOOGLE_SCRIPT_URL;
    if (!scriptUrl || scriptUrl.indexOf("ВАШ_ID_ДЕПЛОЯ") !== -1) {
      setStatus("Форма не подключена к таблице. Свяжитесь с нами напрямую по телефону или WhatsApp.", "error");
      return;
    }

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    setStatus("Отправляем заявку…", "");

    fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    })
      .then(function () {
        setStatus("Спасибо! Заявка отправлена, я скоро свяжусь с вами.", "success");
        form.reset();
      })
      .catch(function () {
        setStatus("Не удалось отправить заявку. Попробуйте написать в WhatsApp.", "error");
      })
      .finally(function () {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      });
  });
})();
