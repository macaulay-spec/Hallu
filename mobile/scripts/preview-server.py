#!/usr/bin/env python3
"""Preview server for the static web export.

Resolves Expo's flat `*.html` files for extensionless routes and falls back
to index.html (SPA-style) so deep links work in review environments.
"""

import functools
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("PORT", "8130"))
DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST, **kwargs)

    def log_message(self, *args):  # keep review logs quiet
        pass

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            for index in ("index.html", "index.htm"):
                if os.path.isfile(os.path.join(path, index)):
                    self.path = self.path.rstrip("/") + "/" + index
                    break
        elif not os.path.isfile(path) and not os.path.splitext(path)[1]:
            # Extensionless route: try sibling .html, else SPA fallback.
            if os.path.isfile(path + ".html"):
                self.path += ".html"
            else:
                self.path = "/index.html"
        return super().send_head()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), PreviewHandler)
    print(f"Hallyu preview: http://0.0.0.0:{PORT}/ (serving {DIST})")
    server.serve_forever()
