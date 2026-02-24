# Pegasus Peer Support UI Modernization

Static multi-page site with locale-aware routes:

- `/tr-TR/` and `/en-US/`
- subpages: `program.html`, `resources.html`, `contact.html`

## Run locally

```bash
cd /workspace/project
python3 -m http.server 4173
```

Open:

- http://localhost:4173/

## Notes

- Theme preference is stored in `localStorage.theme` (`light|dark|system`).
- Language preference is stored in `localStorage.lang` (`tr-TR|en-US`).
- Root route redirects to stored locale.
