"""Vercel serverless endpoint for the travel helper."""
import json
from http.server import BaseHTTPRequestHandler

from chat_service import MAX_REQUEST_BYTES, handle_chat_request


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"error": "Invalid request size."})
            return
        if size <= 0:
            self._send_json(400, {"error": "A message is required."})
            return
        if size > MAX_REQUEST_BYTES:
            self._send_json(413, {"error": "The request is too large."})
            return

        body = self.rfile.read(size)
        status, payload = handle_chat_request(body)
        self._send_json(status, payload)

    def _send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
