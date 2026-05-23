"""
Advanced Technical SEO Service.
Covers: heading structure (H1-H6), image ALT tags, broken links,
sitemap.xml validation, robots.txt validation, and SEO scoring.
"""
import requests
import warnings
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin

warnings.filterwarnings("ignore", message="Unverified HTTPS request")

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def _get(url, timeout=10):
    return requests.get(url, timeout=timeout, headers=_HEADERS, verify=False)


def normalize_url(url):
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def analyze_heading_structure(soup):
    """Validate H1–H6 heading hierarchy."""
    headings = {}
    for level in range(1, 7):
        tags = soup.find_all(f"h{level}")
        headings[f"h{level}"] = {
            "count": len(tags),
            "texts": [t.get_text(strip=True)[:80] for t in tags[:5]],
        }

    issues = []
    h1_count = headings["h1"]["count"]

    if h1_count == 0:
        issues.append({"level": "critical", "message": "No H1 tag found — every page needs exactly one H1."})
    elif h1_count > 1:
        issues.append({"level": "warning", "message": f"Multiple H1 tags ({h1_count}) — use only one H1 per page."})

    if headings["h2"]["count"] == 0 and headings["h3"]["count"] > 0:
        issues.append({"level": "warning", "message": "H3 used without H2 — heading hierarchy is broken."})

    if headings["h3"]["count"] == 0 and headings["h4"]["count"] > 0:
        issues.append({"level": "warning", "message": "H4 used without H3 — heading hierarchy is broken."})

    total_headings = sum(headings[f"h{i}"]["count"] for i in range(1, 7))

    if h1_count == 1 and total_headings >= 2:
        status = "good"
    elif h1_count == 1:
        status = "warning"
    else:
        status = "poor" if h1_count == 0 else "warning"

    return {
        "headings": headings,
        "total_headings": total_headings,
        "issues": issues,
        "status": status,
    }


def analyze_alt_tags(soup):
    """Check all images for ALT text."""
    images = soup.find_all("img")
    total = len(images)
    missing_alt = []
    empty_alt = []
    has_alt = []

    for img in images:
        src = img.get("src", "")[:80]
        alt = img.get("alt")
        if alt is None:
            missing_alt.append(src)
        elif alt.strip() == "":
            empty_alt.append(src)
        else:
            has_alt.append({"src": src, "alt": alt[:60]})

    missing_count = len(missing_alt) + len(empty_alt)

    if total == 0:
        status = "good"
    elif missing_count == 0:
        status = "good"
    elif missing_count / total < 0.3:
        status = "warning"
    else:
        status = "poor"

    return {
        "total_images": total,
        "with_alt": len(has_alt),
        "missing_alt": len(missing_alt),
        "empty_alt": len(empty_alt),
        "missing_alt_srcs": missing_alt[:10],
        "status": status,
        "message": (
            f"All {total} images have alt text." if missing_count == 0
            else f"{missing_count} of {total} images are missing alt text."
        ),
    }


def check_broken_links(soup, base_url, max_links=15):
    """Check internal links for broken URLs (404/5xx)."""
    parsed_base = urlparse(base_url)
    base_domain = f"{parsed_base.scheme}://{parsed_base.netloc}"

    all_links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        text = a.get_text(strip=True)[:50]

        # Skip anchors, mailto, tel, javascript
        if href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue

        # Resolve relative URLs
        if href.startswith("//"):
            href = parsed_base.scheme + ":" + href
        elif href.startswith("/"):
            href = base_domain + href
        elif not href.startswith("http"):
            href = base_domain + "/" + href

        all_links.append({"url": href, "text": text})

    # Deduplicate
    seen = set()
    unique_links = []
    for link in all_links:
        if link["url"] not in seen:
            seen.add(link["url"])
            unique_links.append(link)

    checked = []
    broken = []

    for link in unique_links[:max_links]:
        try:
            resp = requests.head(
                link["url"], timeout=6, headers=_HEADERS,
                verify=False, allow_redirects=True
            )
            status = resp.status_code
            is_broken = status >= 400
            entry = {
                "url": link["url"][:100],
                "text": link["text"],
                "status_code": status,
                "is_broken": is_broken,
            }
            checked.append(entry)
            if is_broken:
                broken.append(entry)
        except Exception:
            entry = {
                "url": link["url"][:100],
                "text": link["text"],
                "status_code": None,
                "is_broken": True,
                "error": "Could not reach URL",
            }
            checked.append(entry)
            broken.append(entry)

    return {
        "total_links": len(all_links),
        "checked": len(checked),
        "broken_count": len(broken),
        "broken_links": broken[:10],
        "status": "good" if len(broken) == 0 else "warning" if len(broken) <= 2 else "poor",
    }


def check_sitemap(base_url):
    """Validate sitemap.xml existence and basic structure."""
    parsed = urlparse(base_url)
    sitemap_url = f"{parsed.scheme}://{parsed.netloc}/sitemap.xml"

    try:
        resp = _get(sitemap_url, timeout=8)
        if resp.status_code == 200:
            content = resp.text
            is_xml = "<?xml" in content or "<urlset" in content or "<sitemapindex" in content
            url_count = content.count("<url>")
            return {
                "found": True,
                "url": sitemap_url,
                "status_code": resp.status_code,
                "is_valid_xml": is_xml,
                "url_count": url_count,
                "status": "good" if is_xml else "warning",
                "message": f"Sitemap found with {url_count} URLs." if is_xml else "Sitemap found but may not be valid XML.",
            }
        else:
            return {
                "found": False,
                "url": sitemap_url,
                "status_code": resp.status_code,
                "status": "warning",
                "message": f"Sitemap not found (HTTP {resp.status_code}).",
            }
    except Exception as e:
        return {
            "found": False,
            "url": sitemap_url,
            "status": "warning",
            "message": f"Could not check sitemap: {str(e)[:60]}",
        }


def check_robots_txt(base_url):
    """Validate robots.txt existence and content."""
    parsed = urlparse(base_url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"

    try:
        resp = _get(robots_url, timeout=8)
        if resp.status_code == 200:
            content = resp.text
            has_user_agent = "User-agent:" in content or "user-agent:" in content.lower()
            has_disallow = "Disallow:" in content
            has_sitemap_ref = "Sitemap:" in content

            issues = []
            if not has_user_agent:
                issues.append("No User-agent directive found.")
            if not has_disallow:
                issues.append("No Disallow directive found.")

            return {
                "found": True,
                "url": robots_url,
                "status_code": resp.status_code,
                "has_user_agent": has_user_agent,
                "has_disallow": has_disallow,
                "has_sitemap_ref": has_sitemap_ref,
                "content_preview": content[:300],
                "issues": issues,
                "status": "good" if has_user_agent else "warning",
                "message": "robots.txt found and valid." if has_user_agent else "robots.txt found but missing User-agent directive.",
            }
        else:
            return {
                "found": False,
                "url": robots_url,
                "status_code": resp.status_code,
                "status": "warning",
                "message": f"robots.txt not found (HTTP {resp.status_code}).",
            }
    except Exception as e:
        return {
            "found": False,
            "url": robots_url,
            "status": "warning",
            "message": f"Could not check robots.txt: {str(e)[:60]}",
        }


def check_structured_data(soup):
    """Check for JSON-LD structured data or Microdata presence and validate JSON-LD."""
    json_ld_tags = soup.find_all("script", type="application/ld+json")
    microdata_tags = soup.find_all(attrs={"itemscope": True})
    
    json_ld_list = []
    invalid_json_ld_count = 0
    
    import json
    for tag in json_ld_tags:
        content = tag.get_text(strip=True)
        try:
            parsed = json.loads(content)
            # JSON-LD can be a single dict or a list of dicts
            if isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, dict):
                        json_ld_list.append({
                            "type": item.get("@type") or item.get("type") or "Unknown",
                            "valid": True
                        })
            elif isinstance(parsed, dict):
                json_ld_list.append({
                    "type": parsed.get("@type") or parsed.get("type") or "Unknown",
                    "valid": True
                })
            else:
                invalid_json_ld_count += 1
                json_ld_list.append({
                    "type": "Malformed JSON-LD",
                    "valid": False
                })
        except Exception:
            invalid_json_ld_count += 1
            json_ld_list.append({
                "type": "Malformed JSON-LD",
                "valid": False
            })
            
    found = len(json_ld_tags) > 0 or len(microdata_tags) > 0
    
    status = "good"
    if not found:
        status = "warning"
    elif invalid_json_ld_count > 0:
        status = "poor"
        
    return {
        "found": found,
        "json_ld_count": len(json_ld_tags),
        "microdata_count": len(microdata_tags),
        "json_ld_types": [item["type"] for item in json_ld_list],
        "invalid_json_ld_count": invalid_json_ld_count,
        "status": status,
        "message": (
            f"Structured data found ({len(json_ld_tags)} JSON-LD blocks, {len(microdata_tags)} Microdata items)." if found
            else "No structured data (JSON-LD or Microdata) detected."
        )
    }


def calculate_seo_score(title_status, meta_status, h1_status, alt_status,
                        broken_count, sitemap_found, robots_found, has_viewport, structured_data_status):
    """Calculate a 0-100 SEO score."""
    score = 100

    # Title (20 pts)
    if title_status == "missing":
        score -= 20
    elif title_status == "warning":
        score -= 8

    # Meta description (15 pts)
    if meta_status == "missing":
        score -= 15
    elif meta_status == "warning":
        score -= 6

    # H1 (15 pts)
    if h1_status in ("missing", "poor"):
        score -= 15
    elif h1_status == "warning":
        score -= 6

    # Alt tags (15 pts)
    if alt_status == "poor":
        score -= 15
    elif alt_status == "warning":
        score -= 7

    # Broken links (15 pts)
    if broken_count > 5:
        score -= 15
    elif broken_count > 0:
        score -= 7

    # Sitemap (10 pts)
    if not sitemap_found:
        score -= 10

    # Robots.txt (5 pts)
    if not robots_found:
        score -= 5

    # Viewport (5 pts)
    if not has_viewport:
        score -= 5

    # Structured Data (5 pts)
    if structured_data_status == "warning":
        score -= 2
    elif structured_data_status == "poor":
        score -= 5

    return max(0, min(100, score))


def analyze_advanced_seo(url):
    """Full advanced SEO analysis."""
    url = normalize_url(url)

    try:
        parsed = urlparse(url)
        if not parsed.netloc:
            return {"error": "Invalid URL — no domain found."}

        response = _get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        # Basic SEO signals
        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        title_len = len(title_text)
        if not title_text:
            title_status, title_msg = "missing", "No title tag found."
        elif title_len < 30:
            title_status, title_msg = "warning", f"Title too short ({title_len} chars)."
        elif title_len > 60:
            title_status, title_msg = "warning", f"Title too long ({title_len} chars)."
        else:
            title_status, title_msg = "good", f"Title length optimal ({title_len} chars)."

        meta_tag = soup.find("meta", attrs={"name": "description"})
        meta_text = meta_tag.get("content", "").strip() if meta_tag else ""
        meta_len = len(meta_text)
        if not meta_text:
            meta_status, meta_msg = "missing", "No meta description found."
        elif meta_len < 70:
            meta_status, meta_msg = "warning", f"Meta description too short ({meta_len} chars)."
        elif meta_len > 160:
            meta_status, meta_msg = "warning", f"Meta description too long ({meta_len} chars)."
        else:
            meta_status, meta_msg = "good", f"Meta description optimal ({meta_len} chars)."

        viewport_tag = soup.find("meta", attrs={"name": "viewport"})
        has_viewport = viewport_tag is not None

        canonical_tag = soup.find("link", rel="canonical")
        canonical = canonical_tag.get("href", "") if canonical_tag else ""

        robots_meta = soup.find("meta", attrs={"name": "robots"})
        robots_content = robots_meta.get("content", "") if robots_meta else "not set"

        # Advanced checks
        heading_data = analyze_heading_structure(soup)
        alt_data = analyze_alt_tags(soup)
        broken_data = check_broken_links(soup, url, max_links=15)
        sitemap_data = check_sitemap(url)
        robots_data = check_robots_txt(url)
        structured_data = check_structured_data(soup)

        # Open Graph
        og_title = soup.find("meta", property="og:title")
        og_desc = soup.find("meta", property="og:description")
        og_image = soup.find("meta", property="og:image")

        # Twitter Card
        tw_card = soup.find("meta", attrs={"name": "twitter:card"})
        tw_title = soup.find("meta", attrs={"name": "twitter:title"})

        # Score
        seo_score = calculate_seo_score(
            title_status, meta_status,
            heading_data["status"], alt_data["status"],
            broken_data["broken_count"],
            sitemap_data["found"], robots_data["found"],
            has_viewport,
            structured_data["status"],
        )

        # Alerts
        alerts = []
        if title_status == "missing":
            alerts.append({"level": "critical", "category": "seo", "message": "Missing page title — critical SEO issue."})
        elif title_status == "warning":
            alerts.append({"level": "warning", "category": "seo", "message": title_msg})

        if meta_status == "missing":
            alerts.append({"level": "warning", "category": "seo", "message": "Missing meta description."})

        if heading_data["headings"]["h1"]["count"] == 0:
            alerts.append({"level": "critical", "category": "seo", "message": "No H1 tag found."})

        if alt_data["missing_alt"] + alt_data["empty_alt"] > 0:
            alerts.append({"level": "warning", "category": "seo",
                           "message": f"{alt_data['missing_alt'] + alt_data['empty_alt']} images missing alt text."})

        if broken_data["broken_count"] > 0:
            alerts.append({"level": "warning", "category": "seo",
                           "message": f"{broken_data['broken_count']} broken links detected."})

        if not sitemap_data["found"]:
            alerts.append({"level": "info", "category": "seo", "message": "No sitemap.xml found."})

        if not robots_data["found"]:
            alerts.append({"level": "info", "category": "seo", "message": "No robots.txt found."})

        if not structured_data["found"]:
            alerts.append({"level": "warning", "category": "seo", "message": "No structured data (JSON-LD or Schema.org) detected."})
        elif structured_data["invalid_json_ld_count"] > 0:
            alerts.append({"level": "critical", "category": "seo", "message": f"Malformed Schema.org JSON-LD structured data ({structured_data['invalid_json_ld_count']} invalid block(s))."})

        return {
            "url": url,
            "seo_score": seo_score,
            "score_label": _score_label(seo_score),
            "title": {"text": title_text, "length": title_len, "status": title_status, "message": title_msg},
            "meta_description": {"text": meta_text, "length": meta_len, "status": meta_status, "message": meta_msg},
            "viewport": {"present": has_viewport, "status": "good" if has_viewport else "warning"},
            "canonical": canonical or "not set",
            "robots_meta": robots_content,
            "heading_structure": heading_data,
            "alt_tags": alt_data,
            "broken_links": broken_data,
            "sitemap": sitemap_data,
            "robots_txt": robots_data,
            "structured_data": structured_data,
            "open_graph": {
                "title": og_title.get("content", "") if og_title else "",
                "description": og_desc.get("content", "") if og_desc else "",
                "image": og_image.get("content", "") if og_image else "",
                "status": "good" if og_title else "warning",
            },
            "twitter_card": {
                "card": tw_card.get("content", "") if tw_card else "",
                "title": tw_title.get("content", "") if tw_title else "",
                "status": "good" if tw_card else "info",
            },
            "alerts": alerts,
        }

    except requests.exceptions.SSLError:
        return {"error": "SSL certificate error.", "url": url}
    except requests.exceptions.ConnectionError:
        return {"error": "Connection failed.", "url": url}
    except requests.exceptions.Timeout:
        return {"error": "Request timed out.", "url": url}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}", "url": url}


def _score_label(score):
    if score >= 90:
        return "Excellent"
    elif score >= 75:
        return "Good"
    elif score >= 50:
        return "Needs Improvement"
    else:
        return "Poor"
