# Pegasus Peer Support (Modernized Landing)

Bu proje statik bir landing page'dir (`index.html`, `styles.css`, `script.js`).

## Lokal Çalıştırma

### Yöntem 1: Python ile hızlı sunucu

```bash
cd /workspace/project
python3 -m http.server 4173
```

Ardından tarayıcıdan açın:

- http://localhost:4173

> Sunucuyu kapatmak için terminalde `Ctrl + C`.

### Yöntem 2: VS Code Live Server

`index.html` dosyasını Live Server ile açabilirsiniz.

---

## Lokal Doğrulama Checklist'i

Site açıldıktan sonra aşağıdakileri kontrol edin:

1. **Responsive**
   - Tarayıcı geliştirici araçlarında mobil görünüm açın (örn. iPhone 12 / 390px).
   - Hero ve kartların tek kolona düştüğünü doğrulayın.

2. **Dark / Light mode**
   - Sağ üstteki tema ikonuna tıklayın.
   - Arka plan, yüzey ve yazı renkleri değişmeli.
   - Sayfayı yenileyince seçili tema korunmalı (`localStorage`).

3. **Multilanguage (TR/EN)**
   - Sağ üstteki dil seçiciden `TR` / `EN` değiştirin.
   - Hero başlığı, açıklamalar ve kart metinleri güncellenmeli.
   - Sayfayı yenileyince dil seçimi korunmalı (`localStorage`).

4. **Temel erişilebilirlik**
   - `Tab` ile kontroller arası gezinmeyi deneyin.
   - Dil seçici ve tema butonu klavye ile seçilebilir olmalı.

---

## Hızlı Smoke Test (Opsiyonel)

Sunucu açıkken şu komutlar 200 dönmelidir:

```bash
curl -I http://localhost:4173/
curl -I http://localhost:4173/styles.css
curl -I http://localhost:4173/script.js
```

