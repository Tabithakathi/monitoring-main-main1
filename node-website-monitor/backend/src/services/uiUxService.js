const cheerio = require('cheerio');

/**
 * Scan DOM properties for accessibility violations, low contrast layouts, 
 * missing form input label tags, empty buttons, zoom-blocking viewports,
 * generic descriptive links, missing focus indicators, and empty image alt attributes.
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
    fixedWidthViolations: [],
    zoomBlockingViolations: [],
    nonDescriptiveLinkViolations: [],
    disabledOutlineViolations: [],
    missingImageAltViolations: [],
    responsiveness: { hasResponsiveStyles: true, mediaQueriesCount: 0, status: 'ok', message: '' },
    alerts: []
  };

  if (!htmlContent) {
    return { uiHealthScore: 80, alerts: [{ level: 'warning', message: 'No HTML content received for UI/UX audit.' }] };
  }

  try {
    const $ = cheerio.load(htmlContent);

    // 1. Zoom-blocking viewport configuration
    const viewport = $('meta[name="viewport"]');
    if (viewport.length > 0) {
      const content = viewport.attr('content') || '';
      const contentLower = content.toLowerCase();
      const hasZoomBlock = contentLower.includes('user-scalable=no') || 
                           contentLower.includes('user-scalable=0') || 
                           contentLower.includes('maximum-scale=1') || 
                           contentLower.includes('maximum-scale=1.0');
      if (hasZoomBlock) {
        reports.zoomBlockingViolations.push({
          element: `<meta name="viewport" content="${content}">`,
          message: 'Viewport configuration blocks text scaling or user zooming capabilities, violating WCAG Guideline 1.4.4.'
        });
        reports.uiHealthScore -= 15;
        reports.alerts.push({
          level: 'warning',
          message: 'Accessibility: Viewport settings block user-scalable zooming, breaking accessibility guidelines.'
        });
      }
    }

    // 2. Interactive Form Inputs missing labels
    $('input, textarea, select').each((_, el) => {
      const tag = el.name.toLowerCase();
      const type = $(el).attr('type') || '';
      if (tag === 'input' && type.toLowerCase() === 'hidden') return;

      const elementHtml = $.html(el).substring(0, 120);
      const id = $(el).attr('id') || '';
      const ariaLabel = $(el).attr('aria-label') || '';
      const ariaLabelledby = $(el).attr('aria-labelledby') || '';
      const title = $(el).attr('title') || '';

      const hasAriaLabel = ariaLabel.trim() || ariaLabelledby.trim() || title.trim();
      let hasMatchingLabel = false;

      if (id) {
        if ($(`label[for="${id}"]`).length > 0) {
          hasMatchingLabel = true;
        }
      }

      if (!hasAriaLabel && !hasMatchingLabel) {
        reports.missingLabelsViolations.push({
          element: elementHtml,
          message: `Interactive form <${tag}> element lacks a matching <label> or ARIA description.`
        });
        reports.uiHealthScore -= 8;
        reports.alerts.push({
          level: 'warning',
          message: `Accessibility: Interactive <${tag}> element lacks a matching <label> or ARIA-label declaration.`
        });
      }
    });

    // 3. Empty Buttons Check
    $('button').each((_, el) => {
      const buttonHtml = $.html(el).substring(0, 125);
      const textContent = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label') || '';
      const title = $(el).attr('title') || '';

      if (!textContent && !ariaLabel.trim() && !title.trim()) {
        reports.emptyButtonsViolations.push({
          element: buttonHtml,
          message: 'Button elements must contain accessible text, a title, or an aria-label description.'
        });
        reports.uiHealthScore -= 10;
        reports.alerts.push({
          level: 'warning',
          message: 'Accessibility: Empty interactive <button> element lacks ARIA description or inner text.'
        });
      }
    });

    // 4. Low Contrast inline style check
    $('[style]').each((_, el) => {
      const elementHtml = $.html(el).substring(0, 120);
      const style = $(el).attr('style') || '';
      const styleLower = style.toLowerCase();

      // Check for inline contrast indicators
      const hasLowContrastHex = styleLower.includes('color:#ccc') || 
                                styleLower.includes('color: #ccc') || 
                                styleLower.includes('color:#888') ||
                                styleLower.includes('color: #888') ||
                                styleLower.includes('color:#999') ||
                                styleLower.includes('color: #999') ||
                                styleLower.includes('color:#aaa') ||
                                styleLower.includes('color: #aaa');
      if (hasLowContrastHex) {
        reports.lowContrastViolations.push({
          element: elementHtml,
          message: 'Inline style specifies low-contrast text color against the default background layer.'
        });
        reports.uiHealthScore -= 12;
        reports.alerts.push({
          level: 'warning',
          message: 'Accessibility: Inline stylesheet colors exhibit poor contrast ratios against background layers.'
        });
      }

      // 5. Disabled Focus Outline Check
      const hasDisabledOutline = styleLower.includes('outline:none') || 
                                 styleLower.includes('outline: none') || 
                                 styleLower.includes('outline:0') || 
                                 styleLower.includes('outline: 0');
      if (hasDisabledOutline) {
        reports.disabledOutlineViolations.push({
          element: elementHtml,
          message: 'Inline styles disable default focus outlines (outline: none/0), making keyboard navigation impossible.'
        });
        reports.uiHealthScore -= 8;
        reports.alerts.push({
          level: 'warning',
          message: 'Accessibility: Outline disable styling violates WCAG keyboard focus visibility rules.'
        });
      }

      // 6. Fixed Width Constraints check
      const widthMatch = styleLower.match(/width:\s*(\d{3,})px/i);
      if (widthMatch) {
        const val = parseInt(widthMatch[1], 10);
        if (val > 360) {
          reports.fixedWidthViolations.push({
            element: elementHtml,
            message: `Absolute width constraints (${widthMatch[0]}) break fluid grid system scaling.`
          });
          reports.uiHealthScore -= 5;
          reports.alerts.push({
            level: 'warning',
            message: `UI/UX Warning: Fixed layout width (${widthMatch[0]}) causes content bleed on mobile screen states.`
          });
        }
      }
    });

    // 7. Non-descriptive links
    const genericTextRegex = /^(click\s*here|read\s*more|link|more|details|click|go|info|page)$/i;
    $('a').each((_, el) => {
      const linkHtml = $.html(el).substring(0, 120);
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label') || '';
      const title = $(el).attr('title') || '';

      const accessibleText = text || ariaLabel || title;

      if (genericTextRegex.test(accessibleText.trim())) {
        reports.nonDescriptiveLinkViolations.push({
          element: linkHtml,
          message: `Anchor text "${accessibleText}" is non-descriptive and hinders screen reader accessibility.`
        });
        reports.uiHealthScore -= 5;
        reports.alerts.push({
          level: 'warning',
          message: `Accessibility: Generic link anchor text "${accessibleText}" violates WCAG descriptive link rules.`
        });
      }
    });

    // 8. Missing Image Alt Text
    $('img').each((_, el) => {
      const imgHtml = $.html(el).substring(0, 130);
      const alt = $(el).attr('alt');
      const role = $(el).attr('role') || '';

      // If alt is undefined (attribute missing) and it's not explicitly labeled as decorative role="presentation"
      if (alt === undefined && role.toLowerCase() !== 'presentation') {
        reports.missingImageAltViolations.push({
          element: imgHtml,
          message: 'Image element lacks an alternative text description (alt attribute), rendering it invisible to screen readers.'
        });
        reports.uiHealthScore -= 5;
        reports.alerts.push({
          level: 'warning',
          message: 'Accessibility: Image tag missing alt attribute breaks standard screen reader accessibility.'
        });
      }
    });

    // 9. Media Queries and Responsive Styles Check
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

  } catch (e) {
    console.error(`UI/UX Accessibility Parser error: ${e.message}`);
  }

  reports.uiHealthScore = Math.max(10, reports.uiHealthScore);
  return reports;
};

module.exports = { analyzeUiUx };
