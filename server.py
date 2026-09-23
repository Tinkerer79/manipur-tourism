"""Serve the travel guide and keep the Gemini key off the client (optional).

The chat works without this server too — the page falls back to calling the
Gemini API directly with the key in js/config.js. Run this if you'd rather
keep the key server-side:

    GEMINI_API_KEY=your_key python3 server.py

Then open: http://127.0.0.1:4173
"""
import json
import os
import ssl
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

SYSTEM_PROMPT = (
    "You are the travel helper on Sana Leibak, a small hand-built guide to Manipur, India. "
    "Talk like a friendly local friend: short, specific, plain words, no marketing talk. "
    "Keep answers under 90 words unless asked for more. "
    "For permits, prices, safety, opening hours and weather, advise checking current "
    "local or official sources."
)


def tls_contexts():
    """macOS Pythons often lack a CA bundle — try certifi, the default, then
    the system bundle at /etc/ssl/cert.pem."""
    contexts = []
    try:
        import certifi
        contexts.append(ssl.create_default_context(cafile=certifi.where()))
    except Exception:
        pass
    contexts.append(ssl.create_default_context())
    if os.path.exists("/etc/ssl/cert.pem"):
        contexts.append(ssl.create_default_context(cafile="/etc/ssl/cert.pem"))
    return contexts


def fetch_json(endpoint, payload, headers, timeout=30):
    data = json.dumps(payload).encode("utf-8")
    last_error = None
    for ctx in tls_contexts():
        try:
            req = Request(endpoint, data=data, method="POST", headers=headers)
            with urlopen(req, timeout=timeout, context=ctx) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError:
            raise  # server answered; a different TLS bundle won't change that
        except URLError as e:
            last_error = e  # likely a certificate problem; try the next bundle
    raise last_error


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, code, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != "/api/chat":
            self.send_error(404)
            return
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            self.send_json(503, {"error": "Chat service is not configured."})
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            request_data = json.loads(self.rfile.read(min(size, 20000)).decode("utf-8"))
            messages = request_data.get("messages", [])[-8:]
            if not isinstance(messages, list) or not messages:
                self.send_json(400, {"error": "A message is required."})
                return
            payload = {
                "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": messages,
                "generationConfig": {
                    "temperature": 0.6,
                    "maxOutputTokens": 800,
                    "thinkingConfig": {"thinkingBudget": 0},
                },
            }
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
            result = fetch_json(
                endpoint,
                payload,
                {"Content-Type": "application/json", "x-goog-api-key": key},
            )
            parts = result.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            answer = "".join(part.get("text", "") for part in parts).strip()
            if not answer:
                raise ValueError("No answer returned")
            self.send_json(200, {"answer": answer})
        except HTTPError as e:
            detail = ""
            try:
                detail = json.loads(e.read().decode("utf-8")).get("error", {}).get("message", "")
            except Exception:
                pass
            self.send_json(502, {"error": "The AI service could not respond.", "detail": detail})
        except (URLError, TimeoutError, ValueError, json.JSONDecodeError) as e:
            self.send_json(502, {"error": "The AI service could not respond.", "detail": str(e)})
        except Exception as e:
            self.send_json(500, {"error": "Unexpected server error.", "detail": str(e)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "4173"))
    print(f"Serving on http://127.0.0.1:{port} (chat model: {MODEL})")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
