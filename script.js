(() => {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const themeToggle = document.getElementById('themeToggle');
  const languageSwitcher = document.getElementById('languageSwitcher');
  const supportedLocales = ['tr-TR', 'en-US'];

  /* ===== MOBILE NAV ===== */
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
      navMenu.dataset.open === 'true' ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeMenu(); navToggle.focus(); }
    });

    document.addEventListener('click', (e) => {
      if (navMenu.dataset.open !== 'true') return;
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
    });
  }

  /* ===== HEADER SCROLL SHADOW ===== */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== THEME TOGGLE ===== */
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const readTheme = () => localStorage.getItem('theme') || 'system';

  const resolveTheme = (theme) => {
    if (theme === 'system') return systemDark.matches ? 'dark' : 'light';
    return theme;
  };

  const themeIcons = { light: '\u2600\uFE0F', dark: '\uD83C\uDF19', system: '\uD83D\uDDA5\uFE0F' };

  const applyTheme = (theme) => {
    const resolved = resolveTheme(theme);
    document.documentElement.dataset.theme = resolved;
    if (themeToggle) {
      themeToggle.textContent = themeIcons[theme] || themeIcons.system;
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

  /* ===== ACTIVE NAV LINK ===== */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path || (href && path.startsWith(href) && href !== '/' && href.length > 6)) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ===== LANGUAGE SWITCHER ===== */
  if (languageSwitcher) {
    const currentLocale = supportedLocales.find((l) => path.startsWith(`/${l}`)) || 'tr-TR';
    languageSwitcher.value = currentLocale;

    languageSwitcher.addEventListener('change', (e) => {
      const target = e.target.value;
      localStorage.setItem('lang', target);
      const localizedPart = path.replace(`/${currentLocale}`, '') || '/';
      const targetPath = `/${target}${localizedPart === '/' ? '/' : localizedPart}`;

      fetch(targetPath, { method: 'HEAD' })
        .then((r) => { window.location.href = r.ok ? targetPath : `/${target}/`; })
        .catch(() => { window.location.href = `/${target}/`; });
    });
  }

  /* ===== ACCORDION (FAQ) ===== */
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      // Close all siblings
      item.parentElement.querySelectorAll('.accordion-item.open').forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove('open');
      });

      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ===== SCROLL FADE-IN ===== */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach((el) => observer.observe(el));
  }

  /* ===== FORM VALIDATION FEEDBACK ===== */
  document.querySelectorAll('form[data-validate]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        form.querySelectorAll(':invalid').forEach((field) => {
          field.classList.add('touched');
        });
      }
    });
  });
})();
