"""
UI/UX Monitoring Service.
Covers: Layout shift hazard detection, broken/misaligned element detection,
responsive design audits, and visual regression (DOM structure comparison + OpenCV/Pillow image diffing).
"""
import time
import requests
import warnings
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from django.utils import timezone
from PIL import Image
import io
import base64

try:
    import numpy as np
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    np = None
    cv2 = None


warnings.filterwarnings("ignore", message="Unverified HTTPS request")

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

def _get(url, timeout=10):
    try:
        resp = requests.get(url, timeout=timeout, headers=_HEADERS, verify=False)
        return resp
    except Exception:
        return None

def analyze_ui_ux(url, html_content=None, previous_report=None, current_screenshot=None, previous_screenshot=None):
    """
    Perform a complete UI/UX and visual audit.
    
    Args:
        url: Checked website URL
        html_content: Optional already fetched HTML string
        previous_report: Optional dict of the previous AnalysisReport for regression check
        current_screenshot: Optional bytes or base64 string of the current screenshot
        previous_screenshot: Optional bytes or base64 string of the previous screenshot
        
    Returns:
        dict with UI/UX monitoring results
    """
    if not html_content:
        resp = _get(url)
        if resp:
            html_content = resp.text
        else:
            return {"error": "Could not fetch website contents for UI/UX analysis."}

    soup = BeautifulSoup(html_content, "html.parser")
    
    # 1. Responsive Design Check
    responsive_data = check_responsiveness(soup)
    
    # 2. Layout Shift Hazards
    layout_shift_data = check_layout_shifts(soup, html_content)
    
    # 3. Broken and Misaligned Design Elements
    broken_elements_data = check_broken_elements(soup, url)
    
    # 4. Visual Regression Detection
    visual_regression_data = check_visual_regression(
        soup, 
        previous_report, 
        current_screenshot, 
        previous_screenshot
    )
    
    # Compute UI Health Score (0-100)
    score = 100
    alerts = []
    
    # Responsiveness penalties
    if not responsive_data["has_viewport"]:
        score -= 30
        alerts.append({
            "level": "critical",
            "message": "Critical: Missing mobile viewport meta tag. Site will not display correctly on mobile devices."
        })
    elif responsive_data["score"] < 80:
        score -= 15
        alerts.append({
            "level": "warning",
            "message": "Warning: Limited responsive design traits detected (few relative units or media queries)."
        })
        
    # Layout shift penalties
    cls_hazard = layout_shift_data["cls_hazard_index"]
    if cls_hazard > 0.4:
        score -= 25
        alerts.append({
            "level": "critical",
            "message": f"Critical layout shift hazards detected! (Score {cls_hazard:.2f}). Several images/iframes lack dimensions."
        })
    elif cls_hazard > 0.15:
        score -= 10
        alerts.append({
            "level": "warning",
            "message": f"Warning: Moderate layout shift hazards detected ({cls_hazard:.2f}). Specify dimensions on images."
        })
        
    # Broken elements penalties
    broken_count = broken_elements_data["broken_ui_count"]
    if broken_count > 5:
        score -= 20
        alerts.append({
            "level": "critical",
            "message": f"Critical: Found {broken_count} broken or misaligned layout elements on the page."
        })
    elif broken_count > 0:
        score -= 10
        alerts.append({
            "level": "warning",
            "message": f"Warning: Found {broken_count} potential design alignment or broken asset issues."
        })
        
    # Visual regression alerts
    if visual_regression_data.get("visual_diff_detected"):
        alerts.append({
            "level": "info",
            "message": f"Visual regression: {visual_regression_data.get('diff_percentage')}% layout pixel changes detected compared to previous version."
        })
    elif visual_regression_data.get("dom_changes_detected"):
        alerts.append({
            "level": "info",
            "message": "DOM structure change: Website files or layout structure updated compared to last scan."
        })
        
    score = max(0, score)
    
    return {
        "ui_health_score": score,
        "responsiveness": responsive_data,
        "layout_shift": layout_shift_data,
        "broken_elements": broken_elements_data,
        "visual_regression": visual_regression_data,
        "alerts": alerts
    }

def check_responsiveness(soup):
    """Check responsive viewport settings, CSS properties, and structure."""
    viewport = soup.find("meta", attrs={"name": "viewport"})
    has_viewport = viewport is not None
    viewport_content = viewport.get("content", "") if viewport else ""
    
    # Responsiveness scores based on markers
    score = 0
    markers = []
    
    if has_viewport:
        score += 40
        markers.append("Has viewport meta tag")
        if "width=device-width" in viewport_content:
            score += 10
            markers.append("Viewport width set to device-width")
        if "initial-scale" in viewport_content:
            score += 10
            markers.append("Viewport scales correctly on load")
            
    # Check for relative units / layout types in inline style attributes
    inline_styles = [el.get("style", "").lower() for el in soup.find_all(style=True)]
    flex_grid_count = sum(1 for s in inline_styles if "display: flex" in s or "display: grid" in s or "display:-webkit-box" in s)
    pct_unit_count = sum(1 for s in inline_styles if "%" in s or "vw" in s or "vh" in s or "rem" in s or "em" in s)
    absolute_px_widths = sum(1 for s in inline_styles if "width:" in s and "px" in s)
    
    # Search CSS stylesheets (if inline <style> exists)
    style_tags = [st.get_text().lower() for st in soup.find_all("style")]
    has_media_queries = any("@media" in style for style in style_tags)
    
    if flex_grid_count > 0:
        score += 10
        markers.append("Uses flexbox or CSS grid inline layout structures")
    if pct_unit_count > 0:
        score += 15
        markers.append("Uses fluid units (%, rem, em, vw, vh) in style layout declarations")
    if has_media_queries:
        score += 15
        markers.append("Embedded media queries found in document stylesheet")
        
    if absolute_px_widths > 5:
        score = max(20, score - 15)  # Penalty for absolute width constraints
        markers.append("Penalty: Overuse of hardcoded absolute widths (px) in inline elements")
        
    score = min(100, score)
    
    # Assess responsive capability status
    if score >= 90:
        status = "Excellent"
        color = "green"
    elif score >= 70:
        status = "Good"
        color = "green"
    elif score >= 40:
        status = "Warning"
        color = "orange"
    else:
        status = "Poor"
        color = "red"
        
    return {
        "has_viewport": has_viewport,
        "viewport_content": viewport_content,
        "has_media_queries": has_media_queries,
        "inline_responsive_styles": flex_grid_count + pct_unit_count,
        "absolute_width_elements": absolute_px_widths,
        "markers": markers,
        "score": score,
        "status": status,
        "color": color
    }

def check_layout_shifts(soup, html_content):
    """
    Search for layout-shifting hazards (missing img width/height, body scripts, etc.)
    and compute a hazard index (0.0 = none, 1.0 = high).
    """
    hazards = []
    penalty_sum = 0.0
    
    # 1. Images without width/height attributes
    total_imgs = 0
    missing_dim_imgs = 0
    for img in soup.find_all("img"):
        total_imgs += 1
        width = img.get("width")
        height = img.get("height")
        style = img.get("style", "").lower()
        has_css_dim = "width" in style and "height" in style
        
        if not (width and height) and not has_css_dim:
            missing_dim_imgs += 1
            src = img.get("src", "")[:50]
            hazards.append({
                "type": "Image Shift Hazard",
                "message": f"Image '{src}' has no width/height or equivalent CSS styling.",
                "severity": "medium"
            })
            penalty_sum += 0.05
            
    # 2. Iframes without width/height attributes
    total_iframes = 0
    missing_dim_iframes = 0
    for iframe in soup.find_all("iframe"):
        total_iframes += 1
        width = iframe.get("width")
        height = iframe.get("height")
        style = iframe.get("style", "").lower()
        has_css_dim = "width" in style and "height" in style
        
        if not (width and height) and not has_css_dim:
            missing_dim_iframes += 1
            src = iframe.get("src", "")[:50]
            hazards.append({
                "type": "Iframe Shift Hazard",
                "message": f"Iframe '{src}' is missing dimensions. This will shift standard content flow.",
                "severity": "high"
            })
            penalty_sum += 0.08

    # 3. Blocking JavaScript in body (not inside head)
    body = soup.find("body")
    body_blocking_scripts = 0
    if body:
        for script in body.find_all("script"):
            src = script.get("src")
            is_async = script.get("async") is not None
            is_defer = script.get("defer") is not None
            if src and not (is_async or is_defer):
                body_blocking_scripts += 1
                hazards.append({
                    "type": "Late Script Injection Hazard",
                    "message": f"Synchronous body script '{src[:50]}' forces sudden content shifts on execution.",
                    "severity": "medium"
                })
                penalty_sum += 0.04

    # 4. Font loaders without swap option
    style_tags = soup.find_all("style")
    font_swap_missing = 0
    for style in style_tags:
        style_text = style.get_text().lower()
        if "@font-face" in style_text and "font-display" not in style_text:
            font_swap_missing += 1
            hazards.append({
                "type": "Font Flash Hazard",
                "message": "A @font-face rule does not declare 'font-display: swap'. May cause FOIT/FOUT shift.",
                "severity": "low"
            })
            penalty_sum += 0.02
            
    # Normalize Cumulative Layout Shift Hazard Index (CLS Score placeholder metric)
    cls_hazard = round(min(1.0, penalty_sum), 2)
    
    return {
        "cls_hazard_index": cls_hazard,
        "total_images": total_imgs,
        "missing_dimensions_images": missing_dim_imgs,
        "total_iframes": total_iframes,
        "missing_dimensions_iframes": missing_dim_iframes,
        "body_blocking_scripts": body_blocking_scripts,
        "font_display_swap_missing": font_swap_missing,
        "hazards": hazards[:15]  # Limit returns
    }

def check_broken_elements(soup, url):
    """Identify elements that are likely broken or layout misalignments."""
    broken_elements = []
    
    # 1. Broken images (missing src or data:URI)
    broken_img_count = 0
    for img in soup.find_all("img"):
        src = img.get("src", "").strip()
        if not src:
            broken_img_count += 1
            broken_elements.append({
                "type": "Empty Image Source",
                "message": "Image element tag has an empty or missing 'src' attribute.",
                "element": str(img)[:80]
            })
            
    # 2. Unclosed structural elements or invalid tag nests
    # BeautifulSoup corrects malformed HTML; we can compare raw tags count with corrected tree
    # But a simple structural indicator is if we find invalid inline elements wrapping block tags
    invalid_nests = 0
    for span in soup.find_all(["span", "a"]):
        # Inline element wrapping block element
        has_block = span.find(["div", "p", "section", "h1", "h2", "h3", "h4", "table"])
        if has_block:
            invalid_nests += 1
            broken_elements.append({
                "type": "Block inside Inline element",
                "message": f"Block element '{has_block.name}' nested inside inline element '{span.name}'. Breaks layout rules.",
                "element": str(span)[:80]
            })
            
    # 3. Absolute positioned alignments (checking for overlapping coordinates overlay elements)
    inline_styles = soup.find_all(style=True)
    absolute_positions = []
    for el in inline_styles:
        style = el.get("style", "").lower()
        if "position: absolute" in style or "position: absolute" in style:
            # Try to grab left/right values
            absolute_positions.append(str(el)[:80])
            
    overlapping_count = 0
    # Overlapping style warnings
    if len(absolute_positions) > 8:
        overlapping_count += 1
        broken_elements.append({
            "type": "Overlapping Elements Hazard",
            "message": "Numerous position:absolute declarations found. High risk of design overlap on small screen sizes.",
            "element": f"{len(absolute_positions)} absolute elements detected."
        })
        
    return {
        "broken_ui_count": len(broken_elements),
        "broken_images": broken_img_count,
        "invalid_html_nestings": invalid_nests,
        "overlapping_layout_count": overlapping_count,
        "broken_elements_list": broken_elements
    }

def check_visual_regression(soup, previous_report=None, current_screenshot=None, previous_screenshot=None):
    """
    Compare current scan layout/assets with previous scans.
    Uses OpenCV/Pillow to perform pixel comparisons if images are available.
    """
    # Fallback/default structure comparison
    current_dom_signature = {
        "tag_count": len(soup.find_all()),
        "div_count": len(soup.find_all("div")),
        "script_count": len(soup.find_all("script")),
        "stylesheet_count": len(soup.find_all("link", rel="stylesheet")),
        "image_count": len(soup.find_all("img")),
        "fonts_count": len(soup.find_all("link", rel="stylesheet", href=lambda x: x and "fonts" in x))
    }
    
    regression_data = {
        "dom_changes_detected": False,
        "visual_diff_detected": False,
        "diff_percentage": 0.0,
        "changes": []
    }
    
    if previous_report:
        # Pull past check signature from JSON fields
        prev_check = {}
        try:
            # Try checking the 'check_data' of the previous report
            if isinstance(previous_report, dict):
                prev_check = previous_report.get("ui_ux", {}).get("visual_regression", {}).get("current_dom", {})
            elif hasattr(previous_report, "get_check_data"):
                # Django object fallback
                prev_check = previous_report.get_check_data().get("ui_ux", {}).get("visual_regression", {}).get("current_dom", {})
        except Exception:
            pass
            
        if prev_check:
            diffs = []
            for key, val in current_dom_signature.items():
                prev_val = prev_check.get(key, val)
                if val != prev_val:
                    diffs.append(f"{key.replace('_',' ')} changed from {prev_val} to {val}")
            
            if diffs:
                regression_data["dom_changes_detected"] = True
                regression_data["changes"] = diffs

    regression_data["current_dom"] = current_dom_signature
    
    # Perform OpenCV/PIL visual regression if screenshots are supplied
    if current_screenshot and previous_screenshot:
        if not OPENCV_AVAILABLE:
            regression_data["visual_error"] = "Visual regression image comparison libraries (numpy/opencv) are unavailable."
            return regression_data
        try:
            curr_img = _load_image(current_screenshot)
            prev_img = _load_image(previous_screenshot)
            
            if curr_img is not None and prev_img is not None:
                # Resize to matching dimensions for comparison
                h1, w1 = curr_img.shape[:2]
                h2, w2 = prev_img.shape[:2]
                target_w, target_h = min(w1, w2), min(h1, h2)
                
                curr_resized = cv2.resize(curr_img, (target_w, target_h))
                prev_resized = cv2.resize(prev_img, (target_w, target_h))
                
                # Convert to grayscale
                curr_gray = cv2.cvtColor(curr_resized, cv2.COLOR_BGR2GRAY)
                prev_gray = cv2.cvtColor(prev_resized, cv2.COLOR_BGR2GRAY)
                
                # Compute absolute difference
                diff = cv2.absdiff(curr_gray, prev_gray)
                _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
                
                # Calculate pixel difference percentage
                non_zero_count = np.count_nonzero(thresh)
                total_pixels = thresh.size
                diff_pct = round((non_zero_count / total_pixels) * 100, 2)
                
                regression_data["diff_percentage"] = diff_pct
                if diff_pct > 1.0: # threshold for layout shift detection
                    regression_data["visual_diff_detected"] = True
                    # Create visual bounding box regions of change
                    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    bounding_boxes = []
                    for c in contours[:10]: # Cap visual indicators
                        x, y, w, h = cv2.boundingRect(c)
                        if w > 10 and h > 10: # filter noise
                            bounding_boxes.append({"x": x, "y": y, "width": w, "height": h})
                    regression_data["visual_change_regions"] = bounding_boxes
                    
        except Exception as e:
            regression_data["visual_error"] = f"Visual alignment comparison error: {str(e)}"
            
    return regression_data

def _load_image(source):
    """Load image from base64 string, bytes, or file path into OpenCV format."""
    if not OPENCV_AVAILABLE:
        return None
    try:
        if isinstance(source, str):
            # Check if base64
            if "," in source:
                source = source.split(",")[1]
            image_data = base64.b64decode(source)
            pil_img = Image.open(io.BytesIO(image_data))
        elif isinstance(source, bytes):
            pil_img = Image.open(io.BytesIO(source))
        else:
            return None
            
        # Convert RGB to BGR for OpenCV
        open_cv_image = np.array(pil_img)
        if len(open_cv_image.shape) == 3:
            if open_cv_image.shape[2] == 4:
                open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGBA2BGR)
            else:
                open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)
        return open_cv_image
    except Exception:
        return None
