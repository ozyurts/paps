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
})();
