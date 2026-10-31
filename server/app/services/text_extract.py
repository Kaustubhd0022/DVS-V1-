"""Turns fetched HTML pages and PDFs into plain text for storage and quote checking."""

import io
import re
from html.parser import HTMLParser
from typing import List, Optional, Tuple

MAX_PDF_PAGES = 400

# Page furniture, not content: skipped together with everything inside it.
_SKIPPED = {"script", "style", "noscript", "template", "svg", "nav", "header", "footer", "aside", "form", "iframe"}
_BLOCKS = {"p", "div", "br", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6", "section", "article",
           "blockquote", "pre", "table", "ul", "ol", "dd", "dt", "figcaption", "main"}
_VOID = {"br", "img", "hr", "meta", "link", "input", "source", "area", "base", "col", "embed", "wbr"}
# Elements that hold a page's main content. When present, menus and links around them are dropped.
_MAIN = {"main", "article"}
# Main content shorter than this is probably a teaser box, not the page body.
_MIN_MAIN_CHARS = 40


class _TextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: List[str] = []
        self.main_parts: List[str] = []
        self.title: Optional[str] = None
        self._skip_depth = 0
        self._main_depth = 0
        self._in_title = False

    def _emit(self, text: str) -> None:
        self.parts.append(text)
        if self._main_depth:
            self.main_parts.append(text)

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self._in_title = True
        if self._skip_depth or tag in _SKIPPED:
            if tag not in _VOID:
                self._skip_depth += 1
            return
        if tag in _MAIN or ("role", "main") in attrs:
            self._main_depth += 1
        elif self._main_depth and tag not in _VOID:
            self._main_depth += 1
        if tag in _BLOCKS:
            self._emit("\n")

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if self._skip_depth:
            if tag not in _VOID:
                self._skip_depth -= 1
            return
        if tag in _BLOCKS:
            self._emit("\n")
        if self._main_depth and tag not in _VOID:
            self._main_depth -= 1

    def handle_data(self, data):
        if self._in_title:
            self.title = ((self.title or "") + data).strip()
            return
        if not self._skip_depth:
            self._emit(data)


def _tidy(text: str) -> str:
    lines = (re.sub(r"[ \t\r\f\v]+", " ", line).strip() for line in text.split("\n"))
    return "\n".join(line for line in lines if line)


def html_to_text(html: str) -> Tuple[Optional[str], str]:
    """(page title, readable text) from an HTML page."""
    parser = _TextParser()
    parser.feed(html)
    parser.close()
    main = _tidy("".join(parser.main_parts))
    if len(main) >= _MIN_MAIN_CHARS:
        return parser.title, main
    return parser.title, _tidy("".join(parser.parts))


def pdf_to_text(data: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    pages = [page.extract_text() or "" for page in reader.pages[:MAX_PDF_PAGES]]
    return _tidy("\n".join(pages))
