const languageSwitcher = document.getElementById('languageSwitcher');
const themeToggle = document.getElementById('themeToggle');

const translations = {
  tr: {
    languageLabel: 'Dil',
    heroEyebrow: 'Pegasus İnsan Odaklı Destek',
    heroTitle: 'Birlikte daha güçlü bir çalışma kültürü.',
    heroDescription:
      'Pegasus Peer Support, çalışanların güvenli, empatik ve erişilebilir bir destek ağına ulaşmasını sağlar. Kurumsal sağlık, psikolojik dayanıklılık ve ekip bağlılığını tek bir deneyimde birleştirir.',
    exploreButton: 'Programı Keşfet',
    contactButton: 'İletişime Geç',
    statsTitle: 'Hızlı Bakış',
    stat1Value: '7/24',
    stat1Label: 'Erişilebilir destek',
    stat2Value: '%100',
    stat2Label: 'Gizlilik yaklaşımı',
    stat3Value: '5+',
    stat3Label: 'Çok dilli iletişim seçeneği',
    feature1Title: 'Güvenli Görüşme Alanı',
    feature1Desc:
      'Çalışanlarınız için profesyonel standartlara uygun, güvenli ve gizlilik odaklı iletişim süreci.',
    feature2Title: 'Uzman Eşleşmesi',
    feature2Desc: 'İhtiyaca göre doğru uzmanla hızlı eşleşme sağlayan akıllı yönlendirme akışı.',
    feature3Title: 'Sürdürülebilir İyilik Hali',
    feature3Desc: 'Bireysel ve ekip düzeyinde iyi oluşu destekleyen ölçülebilir gelişim yaklaşımı.',
    contactTitle: 'Kurumsal destek çözümlerimizi konuşalım',
    contactDesc: 'İhtiyacınıza uygun peer support kurgusunu birlikte tasarlayalım.',
    footerText: '© 2026 Pegasus Peer Support. Tüm hakları saklıdır.'
  },
  en: {
    languageLabel: 'Language',
    heroEyebrow: 'People-Centered Support by Pegasus',
    heroTitle: 'Build a stronger workplace culture together.',
    heroDescription:
      'Pegasus Peer Support gives employees access to a safe, empathetic, and accessible support network. It combines corporate wellbeing, psychological resilience, and team engagement in one modern experience.',
    exploreButton: 'Explore Program',
    contactButton: 'Contact Us',
    statsTitle: 'At a Glance',
    stat1Value: '24/7',
    stat1Label: 'Accessible support',
    stat2Value: '100%',
    stat2Label: 'Confidentiality-first approach',
    stat3Value: '5+',
    stat3Label: 'Multilingual communication options',
    feature1Title: 'Secure Conversation Space',
    feature1Desc:
      'A professional, privacy-first communication flow for your employees and stakeholders.',
    feature2Title: 'Expert Matching',
    feature2Desc: 'Smart routing that quickly matches each case with the right specialist.',
    feature3Title: 'Sustainable Wellbeing',
    feature3Desc: 'A measurable approach that improves wellbeing across individuals and teams.',
    contactTitle: 'Let’s discuss your corporate support strategy',
    contactDesc: 'We can design the right peer support framework for your organization.',
    footerText: '© 2026 Pegasus Peer Support. All rights reserved.'
  }
};

const applyLanguage = (lang) => {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    node.textContent = translations[lang][key] || node.textContent;
  });
  localStorage.setItem('preferred-language', lang);
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  localStorage.setItem('preferred-theme', theme);
};

languageSwitcher.addEventListener('change', (event) => {
  applyLanguage(event.target.value);
});

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(currentTheme === 'light' ? 'dark' : 'light');
});

const preferredLanguage = localStorage.getItem('preferred-language') || 'tr';
const preferredTheme = localStorage.getItem('preferred-theme') || 'light';

languageSwitcher.value = preferredLanguage;
applyLanguage(preferredLanguage);
applyTheme(preferredTheme);
