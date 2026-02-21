PORT ?= 4173

.PHONY: serve smoke-test

serve:
	python3 -m http.server $(PORT)

smoke-test:
	curl -I http://localhost:$(PORT)/
	curl -I http://localhost:$(PORT)/styles.css
	curl -I http://localhost:$(PORT)/script.js
