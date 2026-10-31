"""Source tiers and fetching pages from approved sites. Network and DNS calls are replaced."""

import io

import pytest

from app.services import retrieval, source_registry
from tests.test_api import create_project


# --- tiers ---------------------------------------------------------------------------------


@pytest.mark.parametrize("url", [
    "https://asi.nic.in/monuments",
    "https://indianculture.gov.in/rarebooks/gazetteer",
    "https://www.incredibleindia.gov.in/en/maharashtra",
    "https://gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer",
    "https://www.abhilekh-patal.in/jspui/handle/123",
    "https://whc.unesco.org/en/list/1739",
    "http://archaeology.tn.gov.in/",
])
def test_government_and_unesco_sites_are_primary(url):
    assert source_registry.tier_for(url) == "primary"


@pytest.mark.parametrize("url", [
    "https://en.wikipedia.org/wiki/Sindhudurg_Fort",
    "https://www.oxfordreference.com/display/10.1093/oi/authority.123",
    "https://archive.org/details/gazetteer",
    "https://www.jstor.org/stable/123",
    "https://www.britannica.com/place/India",
    "https://www.sahapedia.org/sindhudurg",
])
def test_open_reference_sites_are_secondary(url):
    assert source_registry.tier_for(url) == "secondary"


@pytest.mark.parametrize("url", [
    "https://example.com/history",
    "https://gov.in.example.com/fake",
    "https://notgov.in/page",
    "https://wikipedia.org.evil.com/x",
    "ftp://asi.nic.in/file",
    "not a url",
])
def test_everything_else_is_not_an_approved_source(url):
    assert source_registry.tier_for(url) is None


# --- fetching approved pages ---------------------------------------------------------------

HTML_PAGE = b"""<html><head><title>Sindhudurg Fort | Archaeological Survey of India</title>
<style>.x{color:red}</style><script>var tracking = 1;</script></head>
<body><nav>Home | About | Contact</nav>
<h1>Sindhudurg Fort</h1>
<p>The fort was built by Chhatrapati Shivaji Maharaj between 1664 and 1667 on the Kurte island.</p>
<p>It is a centrally protected monument.</p>
<footer>Copyright ASI</footer></body></html>"""


def make_pdf(text: str) -> bytes:
    """A one-page PDF containing `text`, built with pypdf."""
    from pypdf import PdfWriter
    from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject

    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    font = DictionaryObject({
        NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type1"),
        NameObject("/BaseFont"): NameObject("/Helvetica"),
    })
    page[NameObject("/Resources")] = DictionaryObject({
        NameObject("/Font"): DictionaryObject({NameObject("/F1"): writer._add_object(font)})
    })
    stream = DecodedStreamObject()
    stream.set_data(f"BT /F1 12 Tf 72 720 Td ({text}) Tj ET".encode("latin-1"))
    page[NameObject("/Contents")] = writer._add_object(stream)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


@pytest.fixture
def web(monkeypatch):
    """Replace one-hop HTTP requests and DNS. `pages` maps url -> (status, headers, body)."""
    pages = {}
    calls = []

    async def _request(url):
        calls.append(url)
        return pages[url]

    monkeypatch.setattr(retrieval, "_request", _request)
    monkeypatch.setattr(retrieval, "_resolves_to_public_address", lambda host: True)
    return pages, calls


@pytest.fixture
def project(client, user_a):
    headers, _ = user_a
    return headers, create_project(client, headers)


def fetch_url(client, headers, project_id, url):
    return client.post(f"/api/research/sources/url?project_id={project_id}", headers=headers, json={"url": url})


def test_fetches_a_government_page_as_clean_text(client, project, web):
    headers, p = project
    pages, _ = web
    url = "https://asi.nic.in/sindhudurg"
    pages[url] = (200, {"content-type": "text/html; charset=utf-8"}, HTML_PAGE)

    response = fetch_url(client, headers, p["id"], url)

    assert response.status_code == 200, response.text
    doc = response.json()
    assert doc["source_tier"] == "primary"
    assert doc["provider"] == "web"
    assert doc["publisher"] == "asi.nic.in"
    assert doc["title"] == "Sindhudurg Fort | Archaeological Survey of India"
    text = client.get(f"/api/research/sources/{doc['id']}?project_id={p['id']}", headers=headers).json()["text"]
    assert "built by Chhatrapati Shivaji Maharaj between 1664 and 1667" in text
    assert "tracking" not in text and "color:red" not in text
    assert "Home | About" not in text and "Copyright ASI" not in text


def test_fetches_text_from_a_pdf(client, project, web):
    headers, p = project
    pages, _ = web
    url = "https://gazetteers.maharashtra.gov.in/ratnagiri.pdf"
    pages[url] = (200, {"content-type": "application/pdf"}, make_pdf("Ratnagiri District Gazetteer sea forts of the Konkan"))

    response = fetch_url(client, headers, p["id"], url)

    assert response.status_code == 200, response.text
    text = client.get(f"/api/research/sources/{response.json()['id']}?project_id={p['id']}", headers=headers).json()["text"]
    assert "Ratnagiri District Gazetteer sea forts of the Konkan" in text


def test_wikipedia_documents_are_secondary(client, project, monkeypatch):
    headers, p = project

    async def _get(url, params):
        return 200, {"query": {"pages": [{
            "pageid": 1, "title": "Sindhudurg Fort", "extract": "Sindhudurg is a sea fort.",
            "fullurl": "https://en.wikipedia.org/wiki/Sindhudurg_Fort", "revisions": [{"revid": 1}],
        }]}}

    monkeypatch.setattr(retrieval, "_get", _get)
    response = client.post(
        f"/api/research/sources?project_id={p['id']}", headers=headers, json={"title": "Sindhudurg Fort"}
    )
    assert response.json()["source_tier"] == "secondary"


def test_sites_off_the_approved_list_are_refused_without_a_request(client, project, web):
    headers, p = project
    _, calls = web

    response = fetch_url(client, headers, p["id"], "https://example.com/history")

    assert response.status_code == 422
    assert "approved source" in response.json()["detail"]
    assert calls == []


def test_redirects_off_the_approved_list_are_refused(client, project, web):
    headers, p = project
    pages, calls = web
    pages["https://asi.nic.in/old"] = (301, {"location": "https://evil.example.com/page"}, b"")

    response = fetch_url(client, headers, p["id"], "https://asi.nic.in/old")

    assert response.status_code == 422
    assert calls == ["https://asi.nic.in/old"]


def test_redirects_within_approved_sites_are_followed(client, project, web):
    headers, p = project
    pages, _ = web
    pages["http://asi.nic.in/fort"] = (301, {"location": "https://asi.nic.in/fort"}, b"")
    pages["https://asi.nic.in/fort"] = (200, {"content-type": "text/html"}, HTML_PAGE)

    response = fetch_url(client, headers, p["id"], "http://asi.nic.in/fort")

    assert response.status_code == 200, response.text
    assert response.json()["url"] == "https://asi.nic.in/fort"


def test_hosts_resolving_to_private_addresses_are_refused(client, project, web, monkeypatch):
    headers, p = project
    _, calls = web
    monkeypatch.setattr(retrieval, "_resolves_to_public_address", lambda host: False)

    response = fetch_url(client, headers, p["id"], "https://intranet.nic.in/admin")

    assert response.status_code == 422
    assert calls == []


def test_pages_without_readable_text_are_refused(client, project, web):
    headers, p = project
    pages, _ = web
    url = "https://www.oxfordreference.com/display/10.1093/x"
    pages[url] = (200, {"content-type": "text/html"}, b"<html><body><form>Sign in</form></body></html>")

    response = fetch_url(client, headers, p["id"], url)

    assert response.status_code == 422
    assert "readable text" in response.json()["detail"]


def test_unsupported_file_types_are_refused(client, project, web):
    headers, p = project
    pages, _ = web
    url = "https://asi.nic.in/photo.jpg"
    pages[url] = (200, {"content-type": "image/jpeg"}, b"\xff\xd8\xff")

    response = fetch_url(client, headers, p["id"], url)

    assert response.status_code == 422


def test_source_tier_filter_on_list(client, project, web):
    headers, p = project
    pages, _ = web
    pages["https://asi.nic.in/a"] = (200, {"content-type": "text/html"}, HTML_PAGE)
    fetch_url(client, headers, p["id"], "https://asi.nic.in/a")

    primary = client.get(f"/api/research/sources?project_id={p['id']}&tier=primary", headers=headers).json()
    secondary = client.get(f"/api/research/sources?project_id={p['id']}&tier=secondary", headers=headers).json()
    assert len(primary) == 1 and secondary == []


def test_main_content_is_preferred_over_site_chrome():
    from app.services.text_extract import html_to_text

    page = """<html><head><title>History | SINDHUDURG</title></head><body>
    <div class="menu">Home About District History Facebook X</div>
    <main><h1>History</h1><p>Sindhudurg district was formed in 1981 from the southern part of Ratnagiri district.</p></main>
    <div class="links">Sitemap Feedback Help</div></body></html>"""

    title, text = html_to_text(page)

    assert "formed in 1981" in text
    assert "Facebook" not in text and "Sitemap" not in text


def test_pages_without_a_main_element_keep_all_body_text():
    from app.services.text_extract import html_to_text

    _, text = html_to_text("<html><body><div><p>A plain page with no main element at all, only text.</p></div></body></html>")
    assert "A plain page with no main element" in text
