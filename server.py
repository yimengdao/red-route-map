#!/usr/bin/env python3
"""HTTP server for the interactive red tourism route map."""
import http.server
import json
import os
import sys
import urllib.request
import urllib.error
import webbrowser

PORT = 8080
DIR = os.path.dirname(os.path.abspath(__file__))

ZHIPU_API_KEY = "YOUR_ZHIPU_API_KEY"
ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

class MapServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def log_message(self, format, *args):
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), format % args))

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/ai/ask":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                req_data = json.loads(body)
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON")
                return
            api_data = json.dumps({
                "model": "glm-4-flash",
                "messages": req_data.get("messages", []),
                "temperature": 0.7,
                "max_tokens": 500
            }).encode("utf-8")
            api_req = urllib.request.Request(
                ZHIPU_API_URL, data=api_data,
                headers={"Content-Type": "application/json", "Authorization": "Bearer " + ZHIPU_API_KEY}
            )
            try:
                with urllib.request.urlopen(api_req, timeout=30) as resp:
                    result = resp.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(result)
            except urllib.error.HTTPError as e:
                error_body = e.read().decode()
                self.send_response(e.code)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(error_body.encode())
            except Exception as e:
                self.send_error(500, str(e))
        else:
            super().do_POST()

print("=" * 56)
print("  红色文化旅游路线图 - 本地服务器")
print("  " + "=" * 52)
print()
print("  服务器: http://localhost:%d" % PORT)
print("  地图页: http://localhost:%d/index.html" % PORT)
print("  AI代理: http://localhost:%d/api/ai/ask" % PORT)
print()
print("  按 Ctrl+C 停止服务器")
print("=" * 56)

try:
    webbrowser.open("http://localhost:%d/index.html" % PORT)
except Exception:
    pass

server = http.server.HTTPServer(("127.0.0.1", PORT), MapServer)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\n服务器已停止。")
    server.server_close()


