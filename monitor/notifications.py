import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

def send_alert_emails(report, alerts):
    """
    Send email notifications based on alert conditions and severity.
    
    - `report` is an AnalysisReport instance.
    - `alerts` is an iterable of dicts with keys `level`, `message`, `category`.
    """
    recipients = getattr(settings, "ALERT_EMAIL_RECIPIENTS", []) or []
    if not recipients:
        logger.debug("No ALERT_EMAIL_RECIPIENTS configured; skipping emails.")
        return False

    # Filter alerts by severity
    critical_alerts = []
    warning_alerts = []
    info_alerts = []

    for a in alerts:
        lvl = (a.get("level") or "").lower()
        cat = (a.get("category") or "").lower()
        msg = a.get("message") or ""

        # Flag server errors or database errors as critical automatically
        if "503" in msg or "504" in msg or "database" in msg.lower() or "db error" in msg.lower():
            a["level"] = "critical"
            lvl = "critical"

        if lvl == "critical":
            critical_alerts.append(a)
        elif lvl == "warning":
            warning_alerts.append(a)
        else:
            info_alerts.append(a)

    # Determine alert triggers
    is_down = not getattr(report, "is_up", True)
    has_critical = len(critical_alerts) > 0
    has_warning = len(warning_alerts) > 0
    
    # Decide if we need to dispatch an email. 
    # Real-time emails are dispatched for:
    # 1. Website goes down (is_down = True)
    # 2. Critical alerts (503/504/DB/SSL failures)
    # 3. Warning performance drop or SEO issues
    should_send = is_down or has_critical or has_warning

    if not should_send:
        return False

    # Subject line based on severity trigger
    if is_down:
        subject = f"🚨 [CRITICAL ALERT] Website DOWN: {report.url}"
    elif has_critical:
        subject = f"🔴 [CRITICAL ALERT] Issues detected on {report.url}"
    elif has_warning:
        subject = f"🟡 [WARNING ALERT] Performance/SEO alerts for {report.url}"
    else:
        subject = f"🔵 [INFO] Health scan report for {report.url}"

    # Build beautiful email body
    lines = [
        "========================================",
        "          WEBSITE MONITOR ALERT          ",
        "========================================",
        f"Target Website : {report.url}",
        f"Scan Timestamp : {report.analyzed_at}",
        f"HTTP Status    : {getattr(report, 'status_code', None) or 'UNKNOWN'}",
        f"Uptime Status  : {'UP' if getattr(report, 'is_up', True) else '🚨 DOWN'}",
        f"Overall Score  : {getattr(report, 'overall_score', None) or 'N/A'}/100",
        "========================================",
        ""
    ]

    if is_down:
        lines.append("🚨 ALERT: The website is currently unreachable or returning server-side errors!")
        lines.append("")

    if critical_alerts:
        lines.append("🔥 CRITICAL ALERTS:")
        for a in critical_alerts:
            lines.append(f"  - [{a.get('category','generic').upper()}] {a.get('message')}")
        lines.append("")

    if warning_alerts:
        lines.append("⚠ WARNING ALERTS:")
        for a in warning_alerts:
            lines.append(f"  - [{a.get('category','generic').upper()}] {a.get('message')}")
        lines.append("")

    if info_alerts:
        lines.append("ℹ INFO NOTES:")
        for a in info_alerts:
            lines.append(f"  - [{a.get('category','generic').upper()}] {a.get('message')}")
        lines.append("")

    lines.append("========================================")
    lines.append("Configure email notification lists inside settings.py.")
    body = "\n".join(lines)

    from_email = getattr(settings, "EMAIL_FROM", None) or getattr(settings, "DEFAULT_FROM_EMAIL", None) or "monitor@example.com"
    try:
        send_mail(subject, body, from_email, recipients, fail_silently=False)
        logger.info("Dispatched alert email (Crit: %d, Warn: %d) to %s", 
                    len(critical_alerts), len(warning_alerts), recipients)
        return True
    except Exception as e:
        logger.error("Failed to send email alert: %s", str(e))
        return False
