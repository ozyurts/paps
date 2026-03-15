(() => {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const themeToggle = document.getElementById('themeToggle');
  const languageSwitcher = document.getElementById('languageSwitcher');
  const supportedLocales = ['tr-TR', 'en-US'];

  const closeMenu = () => {
    if (!navMenu || !navToggle) return;
    navMenu.dataset.open = 'false';
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    if (!navMenu || !navToggle) return;
    navMenu.dataset.open = 'true';
    navToggle.setAttribute('aria-expanded', 'true');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.dataset.open === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        navToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (navMenu.dataset.open !== 'true') return;
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const readTheme = () => localStorage.getItem('theme') || 'system';

  const resolveTheme = (theme) => {
    if (theme === 'system') return systemDark.matches ? 'dark' : 'light';
    return theme;
  };

  const applyTheme = (theme) => {
    const resolved = resolveTheme(theme);
    document.documentElement.dataset.theme = resolved;
    if (themeToggle) {
      themeToggle.textContent = theme === 'system' ? '🖥️' : resolved === 'dark' ? '🌙' : '☀️';
      themeToggle.setAttribute('aria-label', `Theme: ${theme}`);
      themeToggle.dataset.themeMode = theme;
    }
  };

  let theme = readTheme();
  applyTheme(theme);
  systemDark.addEventListener('change', () => {
    if ((localStorage.getItem('theme') || 'system') === 'system') applyTheme('system');
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const order = ['light', 'dark', 'system'];
      const current = themeToggle.dataset.themeMode || theme;
      const next = order[(order.indexOf(current) + 1) % order.length];
      localStorage.setItem('theme', next);
      theme = next;
      applyTheme(next);
    });
  }

  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  if (languageSwitcher) {
    const currentLocale = supportedLocales.find((locale) => path.startsWith(`/${locale}`)) || 'tr-TR';
    languageSwitcher.value = currentLocale;

    languageSwitcher.addEventListener('change', (event) => {
      const targetLocale = event.target.value;
      localStorage.setItem('lang', targetLocale);

      const localizedPart = path.replace(`/${currentLocale}`, '') || '/';
      const targetPath = `/${targetLocale}${localizedPart === '/' ? '/' : localizedPart}`;

      fetch(targetPath, { method: 'HEAD' })
        .then((response) => {
          window.location.href = response.ok ? targetPath : `/${targetLocale}/`;
        })
        .catch(() => {
          window.location.href = `/${targetLocale}/`;
        });
    });
  }

  /* ===== FORM SUBMISSION ===== */
  const locale = document.body.dataset.locale || 'tr-TR';

  const successMessages = {
    'tr-TR': { title: 'Başarıyla gönderildi!', body: 'En kısa sürede sizinle iletişime geçeceğiz.' },
    'en-US': { title: 'Successfully submitted!', body: 'We will contact you as soon as possible.' },
  };
  const errorMessages = {
    'tr-TR': 'Bir hata oluştu. Lütfen tekrar deneyin.',
    'en-US': 'An error occurred. Please try again.',
  };
  const sendingText = { 'tr-TR': 'Gönderiliyor...', 'en-US': 'Sending...' };

  document.querySelectorAll('form[data-validate]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.querySelectorAll(':invalid').forEach((field) => field.classList.add('touched'));
        return;
      }

      const formType = form.dataset.formType;
      if (!formType) return;

      const data = {};
      const fd = new FormData(form);
      for (const [key, value] of fd.entries()) {
        data[key] = value;
      }

      form.querySelectorAll('select').forEach((sel) => {
        if (sel.selectedIndex >= 0 && sel.options[sel.selectedIndex].value) {
          data[sel.name + '_label'] = sel.options[sel.selectedIndex].text;
        }
      });

      form.querySelectorAll('input[type="radio"]:checked').forEach((radio) => {
        const lbl = radio.closest('label');
        if (lbl) data[radio.name + '_label'] = lbl.textContent.trim();
      });

      data.locale = locale;

      const btn = form.querySelector('[type="submit"]');
      const origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = sendingText[locale] || sendingText['en-US'];

      try {
        const res = await fetch(`/api/${formType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        if (result.ok) {
          const msg = successMessages[locale] || successMessages['en-US'];
          form.innerHTML =
            '<div class="text-center stack" style="padding:var(--space-6) 0;">' +
            '<div style="font-size:3rem;">&#9989;</div>' +
            '<h2>' + msg.title + '</h2>' +
            '<p style="color:var(--color-text-muted);">' + msg.body + '</p>' +
            '</div>';
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        btn.disabled = false;
        btn.textContent = origText;
        alert(errorMessages[locale] || errorMessages['en-US']);
      }
    });
  });
})();
