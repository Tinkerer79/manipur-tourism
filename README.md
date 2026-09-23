# Sana Leibak — Manipur Travel Guide

> A small, guide to places, food, festivals, and trip planning in Manipur, India.

## Hackathon details

| | |
|---|---|
| Hackathon | Reimagine Manipur |
| Challenge | First one |
| Project domain | Travel, tourism, and local discovery |
| Live demo | https://manipur.projectenclave.dev |
| Repository | `https://github.com/Tinkerer79/manipur-tourism` |
| Team | `Tinkerer` |
| Contributors | Ansh Agarwal & Chinglen Sinam |

## About

Sana Leibak helps visitors discover Manipur and shape a trip around their interests. It brings destination information, local food and festivals, practical travel notes, and a lightweight itinerary builder into one responsive web experience.

## Features

- Browse 20 destinations, search and filter by district, interest, cost, and season, and save favourites in the browser.
- Explore destinations on an OpenStreetMap view and open detail cards with descriptions and local tips.
- Build a 1–10 day itinerary from travel dates, interests, pace, budget, and saved places. Copy, share, print, or export it to a calendar.
- Discover Manipur food, festivals, stays, transport, and travel essentials.
- See current Imphal weather from Open-Meteo and ask the AI travel helper questions about the guide.
- View image credits and licences in [`assets/ATTRIBUTIONS.txt`](assets/ATTRIBUTIONS.txt).

## Tech stack

- **Frontend:** HTML, CSS, and vanilla JavaScript; no frontend framework or build step.
- **Local server and chat proxy:** Python 3 standard library (`http.server`, `urllib`).
- **Deployment:** Vercel static hosting with a Python serverless function at `api/chat.py`.
- **External services:** Gemini and OpenRouter for chat, Open-Meteo for weather, and OpenStreetMap for map data. The page loads Leaflet CSS from its CDN.
- **Browser storage:** `localStorage` for saved destinations.

## Run locally

Python 3 is needed for the local server; there are no Python packages to install.

```bash
git clone <repository-url>
cd <repository-folder>
python3 server.py
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). The guide itself is static, while the local server also exposes `/api/chat`.

To enable chat through the local Python proxy, provide a Gemini key in the server process environment:

```bash
GEMINI_API_KEY="<your-gemini-api-key>" python3 server.py
```

`GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`. The Vercel chat function can use `GEMINI_API_KEY` and optionally `OPENROUTER_API_KEY` as a fallback. Configure these as server-side environment variables in the deployment dashboard.

> **Keep API keys private.** Browser-delivered files such as `js/config.js` are public to every visitor. Do not put real provider keys in frontend code or commit them to the repository; use server-side environment variables for shared or public deployments.

## Deploy

1. Import the repository into Vercel.
2. Add `GEMINI_API_KEY` in the project's Environment Variables. Add `OPENROUTER_API_KEY` if you want a provider fallback. `GEMINI_MODEL` is optional.
3. Deploy the project. `vercel.json` configures the chat function; the rest of the site is served as static files.
4. Add your custom domain in Vercel and replace the demo URL above with `https://<your-domain>`.

## Project structure

```text
.
├── index.html            # App shell and page views
├── css/styles.css        # Responsive styles
├── js/app.js             # Navigation, search, saved places, planner, and chat
├── js/data.js            # Destination, food, and festival content
├── js/config.js          # Frontend chat configuration
├── server.py             # Local static server and chat proxy
├── chat_service.py       # Shared provider logic for the chat endpoint
├── api/chat.py           # Vercel Python function
├── assets/img/           # Destination photos
└── assets/ATTRIBUTIONS.txt # Photo authors and licences
```

## Credits

Map data © OpenStreetMap contributors; weather from [Open-Meteo](https://open-meteo.com/). Destination image authors and licence details are listed in [`assets/ATTRIBUTIONS.txt`](assets/ATTRIBUTIONS.txt).
