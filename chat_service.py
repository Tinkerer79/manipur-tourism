"""Shared chat handler for local development and Vercel Functions."""
import json
import logging
import os
import ssl
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


MAX_REQUEST_BYTES = 20_000
DEFAULT_MODEL = "gemini-3.6-flash"
OPENROUTER_MODEL = "google/gemini-2.0-flash-001"
LOGGER = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are the travel helper on Sana Leibak, a small hand-built guide to Manipur, India. "
    "Talk like a friendly local friend: short, specific, plain words, no marketing talk. "
    "Keep answers under 90 words unless asked for more. "
    "The guide covers 20 places: Loktak Lake, Keibul Lamjao National Park, Karang Island, "
    "Kangla Fort, Ima Keithel, Manipur State Museum, Shree Govindajee Temple, Shirui Hills, "
    "Ukhrul, Dzükou Valley, Tharon Cave, Tamenglong, Sadu Chiru Waterfall, Khonghampat "
    "Orchidarium, Andro Heritage Village, INA Memorial Moirang, Kakching Garden, Khongjom "
    "War Memorial, Bir Tikendrajit Park, Mapal Kangjeibung. Foods: eromba, chamthong, "
    "nga thongba, chak-hao kheer, singju, kabok. For permits, prices, safety, opening hours "
    "and weather, advise checking current local or official sources."
)


def tls_contexts():
    """Try certifi when installed, then Python's and the system CA bundles."""
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


def fetch_json(endpoint, payload, headers, timeout=18):
    data = json.dumps(payload).encode("utf-8")
    last_error = None
    for context in tls_contexts():
        try:
            request = Request(endpoint, data=data, method="POST", headers=headers)
            with urlopen(request, timeout=timeout, context=context) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError:
            raise
        except URLError as error:
            last_error = error
            reason = getattr(error, "reason", None)
            if not isinstance(reason, ssl.SSLCertVerificationError):
                raise
    raise last_error


def _gemini_answer(messages, key):
    model = os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )
    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": messages,
        "generationConfig": {
            "temperature": 0.6,
            "maxOutputTokens": 800,
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }
    result = fetch_json(
        endpoint,
        payload,
        {"Content-Type": "application/json", "x-goog-api-key": key},
    )
    parts = result.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    answer = "".join(part.get("text", "") for part in parts).strip()
    if not answer:
        raise ValueError("Gemini returned an empty answer")
    return answer


def _openrouter_answer(messages, key):
    endpoint = "https://openrouter.ai/api/v1/chat/completions"
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            *[
                {
                    "role": "assistant" if message["role"] == "model" else "user",
                    "content": message["parts"][0]["text"],
                }
                for message in messages
            ],
        ],
        "max_tokens": 500,
    }
    result = fetch_json(
        endpoint,
        payload,
        {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
        },
    )
    answer = result.get("choices", [{}])[0].get("message", {}).get("content")
    if not answer:
        raise ValueError("OpenRouter returned an empty answer")
    return answer.strip()


def handle_chat_request(body):
    """Return an HTTP status and JSON payload for a chat request body."""
    try:
        request_data = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return 400, {"error": "Send a valid JSON request."}

    messages = request_data.get("messages") if isinstance(request_data, dict) else None
    if not isinstance(messages, list) or not messages:
        return 400, {"error": "A message is required."}
    if any(
        not isinstance(message, dict)
        or message.get("role") not in ("user", "model")
        or not isinstance(message.get("parts"), list)
        or not message["parts"]
        or not isinstance(message["parts"][0], dict)
        or not isinstance(message["parts"][0].get("text"), str)
        for message in messages
    ):
        return 400, {"error": "The message format is invalid."}

    messages = messages[-8:]
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    openrouter_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    providers = []
    if gemini_key:
        providers.append(("Gemini", lambda: _gemini_answer(messages, gemini_key)))
    if openrouter_key:
        providers.append(("OpenRouter", lambda: _openrouter_answer(messages, openrouter_key)))
    if not providers:
        return 503, {"error": "Chat is not configured on the server."}

    for name, provider in providers:
        try:
            return 200, {"answer": provider()}
        except Exception as error:
            # Do not expose provider responses or credentials to the browser.
            LOGGER.warning("%s provider request failed (%s)", name, type(error).__name__)
            continue
    return 502, {"error": "The AI providers could not respond."}
