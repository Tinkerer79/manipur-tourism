# Setup

## Live chat (the travel helper)

The chat answers come from the Gemini API (free tier). The key lives in
`js/config.js`, so the site works even when opened as plain files — no server
needed. Just open `index.html` in a browser.

If the Gemini call ever fails, the page automatically tries OpenRouter as a
backup, then shows a friendly error.

Note: because this is a static site, anyone who opens devtools can see the
keys in `js/config.js`. Fine for a personal page — don't reuse an
important/billing key there.

### Optional: keep the key off the client

`server.py` can serve the site and proxy chat calls so the key stays in an
environment variable instead of the browser:

```bash
GEMINI_API_KEY='your_key_here' python3 server.py
```

Open `http://127.0.0.1:4173`. The page tries its own `/api/chat` first and
only falls back to the direct browser call if the server isn't running.

Model: `gemini-3.6-flash` by default (older `gemini-2.5-flash` is no longer
available to new API keys). Change with `GEMINI_MODEL` if needed.

## Map

The map uses an OpenStreetMap embed. The weather chip on the homepage comes
from Open-Meteo (free, no key).

## Photos

`fetch_photos.py` re-downloads the Wikimedia Commons photos into
`assets/img/` (they're already included, so you only need this if images go
missing).
