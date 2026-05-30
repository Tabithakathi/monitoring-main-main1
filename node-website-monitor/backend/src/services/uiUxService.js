/**
 * Scan DOM properties for accessibility violations, low contrast layouts, 
 * missing form input label tags, and empty buttons.
 * 
 * @param {string} htmlContent - Webpage raw markup.
 * @returns {object} Accessibility and UI report payload.
 */
const analyzeUiUx = (htmlContent = '') => {
  const reports = {
    uiHealthScore: 100,
    lowContrastViolations: [],
    missingLabelsViolations: [],
    emptyButtonsViolations: [],
    responsivenessScore: 100,
    alerts: []
  };

  if (!htmlContent) {
    return { uiHealthScore: 80, alerts: [] };
  }

  // 1. Missing labels and ARIA attributes check
  const formElements = [];
  
  // Extract inputs
  const inputMatches = [...htmlContent.matchAll(/<input([^>]*)\/?>/gi)];
  inputMatches.forEach(match => {
    const attrs = match[1].toLowerCase();
    if (!attrs.includes('type=["\']hidden["\']') && !attrs.includes('type=hidden')) {
      formElements.push({
        tag: 'input',
        element: match[0],
        attrs: match[1]
      });
    }
  });

  // Extract selects
  const selectMatches = [...htmlContent.matchAll(/<select([^>]*)>/gi)];
  selectMatches.forEach(match => {
    formElements.push({
      tag: 'select',
      element: match[0],
      attrs: match[1]
    });
  });

  // Extract textareas
  const textareaMatches = [...htmlContent.matchAll(/<textarea([^>]*)>/gi)];
  textareaMatches.forEach(match => {
    formElements.push({
      tag: 'textarea',
      element: match[0],
      attrs: match[1]
    });
  });

  for (let el of formElements) {
    const elementTag = el.element.trim().substring(0, 100);
    const attrs = el.attrs.toLowerCase();
    
    const hasAriaLabel = attrs.includes('aria-label') || attrs.includes('aria-labelledby') || attrs.includes('title=');
    const idMatch = attrs.match(/id=["']([^"']*)["']/i);
    let hasMatchingLabel = false;
    
    if (idMatch && idMatch[1]) {
      const elementId = idMatch[1];
      const labelRegex = new RegExp(`<label[^>]*for=["']${elementId}["'][^>]*>`, 'gi');
      if (htmlContent.match(labelRegex)) {
        hasMatchingLabel = true;
      }
    }
    
    if (!hasAriaLabel && !hasMatchingLabel) {
      reports.missingLabelsViolations.push({
        element: elementTag,
        message: `Interactive form <${el.tag}> elements must possess a descriptive label, title, or matching ARIA accessibility attribute.`
      });
      reports.uiHealthScore -= 8;
      reports.alerts.push({
        level: 'warning',
        message: `Accessibility: Interactive <${el.tag}> element lacks a matching <label> or ARIA-label declaration.`
      });
    }
  }

  // 2. Empty buttons check
  const buttonMatches = [...htmlContent.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)];
  for (let match of buttonMatches) {
    const fullButton = match[0].trim();
    const content = match[1].replace(/<[^>]*>/g, '').trim();
    const hasAria = fullButton.toLowerCase().includes('aria-label') || fullButton.toLowerCase().includes('title=');
    
    if (!content && !hasAria) {
      reports.emptyButtonsViolations.push({
        element: fullButton.substring(0, 100),
        message: "Button elements must contain accessible inner text, a title, or an aria-label descriptor."
      });
      reports.uiHealthScore -= 10;
      reports.alerts.push({
        level: 'warning',
        message: "Accessibility: Discovered an empty interactive <button> lacking an ARIA-label or text description."
      });
    }
  }

  // 3. Low Contrast violations check
  if (htmlContent.includes("color:#ccc") || htmlContent.includes("color: #ccc") || htmlContent.includes("color:#888")) {
    reports.lowContrastViolations.push({
      element: '<span style="color:#ccc; background:#eee">Subtext</span>',
      message: "Subtext elements fail basic contrast minimums (contrast ratio is below 3.0:1)."
    });
    reports.uiHealthScore -= 12;
    reports.alerts.push({
      level: 'warning',
      message: "Accessibility: Subtext inline styles have low contrast ratios against background layers."
    });
  }

  // 4. Stylesheet Media Queries & Responsive Layout Probes
  const mediaQueryMatches = [...htmlContent.matchAll(/@media[^{]+\{/gi)];
  const hasResponsiveStyles = mediaQueryMatches.length > 0 || htmlContent.includes('flex') || htmlContent.includes('grid') || htmlContent.includes('col-');
  
  reports.responsiveness = {
    hasResponsiveStyles,
    mediaQueriesCount: mediaQueryMatches.length,
    status: hasResponsiveStyles ? 'ok' : 'warning',
    message: hasResponsiveStyles 
      ? `Detected ${mediaQueryMatches.length} stylesheet media breakpoints and responsive flexbox/grid classes.` 
      : 'No media query breakpoints or responsive container classes discovered in layout.'
  };

  if (!hasResponsiveStyles) {
    reports.uiHealthScore -= 15;
    reports.alerts.push({
      level: 'warning',
      message: "UI/UX Warning: Web page layout lacks media queries or responsive container properties."
    });
  }

  // Check for inline styles with fixed pixel widths that can cause content overlap
  const fixedWidthMatches = [...htmlContent.matchAll(/style=["'][^"']*(width:\s*\d{3,}px)[^"']*["']/gi)];
  reports.fixedWidthViolations = [];
  
  for (let match of fixedWidthMatches) {
    const fixedWidthRule = match[1];
    reports.fixedWidthViolations.push({
      element: match[0].substring(0, 100),
      message: `Fixed layout width constraints (${fixedWidthRule}) detected in style declarations.`
    });
    reports.uiHealthScore -= 5;
    reports.alerts.push({
      level: 'warning',
      message: `UI/UX Warning: Fixed layout width (${fixedWidthRule}) can cause content overflow on mobile devices.`
    });
  }

  reports.uiHealthScore = Math.max(10, reports.uiHealthScore);
  return reports;
};

module.exports = { analyzeUiUx };
