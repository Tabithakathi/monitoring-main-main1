import React, { useState } from 'react';
import { 
  Eye, CheckCircle2, XCircle, AlertTriangle, Layers, 
  Sparkles, Accessibility, Laptop, Tablet, Smartphone, Info, Layout 
} from 'lucide-react';

export default function AccessibilityAudit({ uiUxData, mobileFriendliness }) {
  const [activeDevice, setActiveDevice] = useState('mobile'); // 'desktop', 'tablet', 'mobile'

  if (!uiUxData) {
    return (
      <div className="glass-card p-10 text-center text-slate-500 max-w-2xl mx-auto my-6 animate-fade-in-up">
        <Accessibility className="h-10 w-10 text-slate-600 mx-auto mb-4 animate-bounce" />
        <h4 className="font-extrabold text-slate-400">No Accessibility Telemetry Audited</h4>
        <p className="text-xs text-slate-500 mt-2">Run a scan above to see real-time UI/UX accessibility audits and compliance alerts.</p>
      </div>
    );
  }

  const {
    uiHealthScore = 100,
    lowContrastViolations = [],
    missingLabelsViolations = [],
    emptyButtonsViolations = [],
    fixedWidthViolations = [],
    zoomBlockingViolations = [],
    nonDescriptiveLinkViolations = [],
    disabledOutlineViolations = [],
    missingImageAltViolations = [],
    responsiveness = { hasResponsiveStyles: true, mediaQueriesCount: 0, status: 'ok', message: '' }
  } = uiUxData;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getGradientId = (score) => {
    if (score >= 90) return 'url(#accEmeraldGrad)';
    if (score >= 70) return 'url(#accAmberGrad)';
    return 'url(#accRoseGrad)';
  };

  const totalViolations = 
    lowContrastViolations.length + 
    missingLabelsViolations.length + 
    emptyButtonsViolations.length +
    fixedWidthViolations.length +
    zoomBlockingViolations.length +
    nonDescriptiveLinkViolations.length +
    disabledOutlineViolations.length +
    missingImageAltViolations.length +
    (!mobileFriendliness?.viewportConfigured ? 1 : 0);

  // Device dimension descriptors
  const deviceConfig = {
    desktop: { width: 'w-full max-w-3xl', height: 'h-64', icon: Laptop, label: 'Desktop View' },
    tablet: { width: 'w-[480px]', height: 'h-72', icon: Tablet, label: 'Tablet View (Portrait)' },
    mobile: { width: 'w-[320px]', height: 'h-80', icon: Smartphone, label: 'Mobile View (375px)' }
  };

  const DeviceIcon = deviceConfig[activeDevice].icon;

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      
      {/* Overview Accessibility Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Accessibility score Circular progress gauge */}
        <div className="col-span-12 md:col-span-4 glass-card p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider w-full text-left mb-4 flex items-center gap-2">
            <Accessibility className="h-4 w-4 text-indigo-400" />
            Accessibility Rating
          </h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="accEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="accAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="accRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
              <circle cx="72" cy="72" r="62" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8"></circle>
              <circle
                cx="72"
                cy="72"
                r="62"
                fill="transparent"
                stroke={getGradientId(uiHealthScore)}
                strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * uiHealthScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-black tracking-tight ${getScoreColor(uiHealthScore)}`}>{uiHealthScore}%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">WCAG Compliance</span>
            </div>
          </div>
        </div>

        {/* Accessibility Probes and checklist */}
        <div className="col-span-12 md:col-span-8 glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-indigo-400" />
              WCAG Accessibility Pillars
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40 col-span-1 md:col-span-2">
                <span className="text-slate-400 font-semibold">Total Checked Violations:</span>
                <span className={`font-extrabold text-[11px] px-2 py-0.5 rounded-full ${totalViolations === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 animate-pulse'}`}>
                  {totalViolations} {totalViolations === 1 ? 'Anomaly' : 'Anomalies'} Detected
                </span>
              </div>
              
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Low Contrast Ratio Elements:</span>
                <span className={`font-bold ${lowContrastViolations.length > 0 ? 'text-amber-400' : 'text-slate-350'}`}>
                  {lowContrastViolations.length} violations
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Empty Button Elements:</span>
                <span className={`font-bold ${emptyButtonsViolations.length > 0 ? 'text-rose-455' : 'text-slate-350'}`}>
                  {emptyButtonsViolations.length} violations
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Unbound Form Input Labels:</span>
                <span className={`font-bold ${missingLabelsViolations.length > 0 ? 'text-rose-455' : 'text-slate-350'}`}>
                  {missingLabelsViolations.length} violations
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Zoom-blocking Viewports:</span>
                <span className={`font-bold ${zoomBlockingViolations.length > 0 ? 'text-rose-455' : 'text-slate-350'}`}>
                  {zoomBlockingViolations.length} violations
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Non-Descriptive Link Labels:</span>
                <span className={`font-bold ${nonDescriptiveLinkViolations.length > 0 ? 'text-amber-400' : 'text-slate-350'}`}>
                  {nonDescriptiveLinkViolations.length} violations
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Disabled Focus Outlines:</span>
                <span className={`font-bold ${disabledOutlineViolations.length > 0 ? 'text-rose-455' : 'text-slate-350'}`}>
                  {disabledOutlineViolations.length} violations
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40 col-span-1 md:col-span-2">
                <span className="text-slate-400">Missing Image Alt Texts:</span>
                <span className={`font-bold ${missingImageAltViolations.length > 0 ? 'text-rose-455' : 'text-slate-350'}`}>
                  {missingImageAltViolations.length} violations
                </span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-4 border-t border-slate-800/40 pt-3">
            * Scans evaluate element background-color contrasts, active ARIA descriptions, and form tag attributes.
          </p>
        </div>

      </div>

      {/* Media Queries & Responsive Layout Shift Probes Card */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-slate-200 font-extrabold text-sm border-b border-slate-800 pb-3 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Layout className="text-indigo-400 h-4.5 w-4.5" />
            Responsiveness & Layout Constraint Audit
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${responsiveness?.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            {responsiveness?.status || 'INFO'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-slate-400">Responsive Style Classes:</span>
              <span className={`font-bold ${responsiveness?.hasResponsiveStyles ? 'text-emerald-400' : 'text-rose-400'}`}>
                {responsiveness?.hasResponsiveStyles ? 'Active (Flexbox/Grid)' : 'None Detected'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-slate-400">Media Breakpoints Count:</span>
              <span className="text-slate-200 font-bold font-mono">{responsiveness?.mediaQueriesCount || 0} rules</span>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              {responsiveness?.message || 'Media query breakpoints verify layout scaling capabilities across tablets and smartphones.'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Fixed Width Layout Constraints</span>
            {fixedWidthViolations.length === 0 ? (
              <div className="p-3 bg-emerald-950/10 border border-emerald-900/25 text-emerald-400 rounded-xl flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                No layout-breaking absolute width definitions detected (e.g. static width in px).
              </div>
            ) : (
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {fixedWidthViolations.map((v, i) => (
                  <div key={i} className="p-2 bg-rose-950/10 border border-rose-900/15 text-rose-350 rounded-lg space-y-0.5">
                    <code className="text-[9px] font-mono text-rose-300 break-all">{v.element}</code>
                    <p className="text-[9.5px] text-slate-400">{v.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Layout Regression / Layout Comparator Panel */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 gap-3">
          <div>
            <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2">
              <Layout className="text-indigo-400 h-4.5 w-4.5" />
              Visual Layout Regression Comparator
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Simulate layout element flows and responsiveness bugs across standard viewports.</p>
          </div>
          {/* Viewport toggle selectors */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            {Object.keys(deviceConfig).map((device) => {
              const Icon = deviceConfig[device].icon;
              return (
                <button
                  key={device}
                  onClick={() => setActiveDevice(device)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all uppercase ${
                    activeDevice === device 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {device}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-950/20 rounded-2xl border border-slate-850 p-6 min-h-[380px] overflow-hidden">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
            {deviceConfig[activeDevice].label} Simulation
          </span>

          {/* Simulated Device Frame Container */}
          <div className={`transition-all duration-300 ease-in-out border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden shadow-2xl flex flex-col ${deviceConfig[activeDevice].width} ${deviceConfig[activeDevice].height}`}>
            {/* Browser top-bar */}
            <div className="bg-slate-950 px-3.5 py-2 flex items-center justify-between border-b border-slate-850">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded px-3 py-0.5 text-[8.5px] font-mono text-slate-500 w-[60%] text-center truncate">
                {uiUxData ? 'Live Audited Session' : 'Scanning...'}
              </div>
              <div className="w-6"></div>
            </div>

            {/* Simulated website viewport */}
            <div className={`p-4 flex-1 overflow-y-auto space-y-3 relative ${!mobileFriendliness?.viewportConfigured && activeDevice === 'mobile' ? 'scale-90 origin-top' : ''}`}>
              
              {/* No Mobile Viewport Penalty Warning overlay */}
              {!mobileFriendliness?.viewportConfigured && activeDevice === 'mobile' && (
                <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                  <AlertTriangle className="h-8 w-8 text-rose-400 mb-2 animate-bounce" />
                  <span className="text-rose-300 font-black uppercase text-[10px] tracking-wide">Mobile Viewport Missing</span>
                  <p className="text-[9px] text-rose-400 mt-1 max-w-[200px] leading-relaxed">
                    Severe layout penalty! Without a viewport tag, standard mobile screens render zoomed out, breaking layout structures completely.
                  </p>
                </div>
              )}

              {/* Header simulation */}
              <div className="p-2.5 bg-dark-800 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="text-[10px] font-bold text-white tracking-tight flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-indigo-500"></span> BrandLogo
                </span>
                <div className="flex items-center gap-1.5">
                  {activeDevice === 'desktop' ? (
                    <>
                      <span className="h-1.5 w-8 bg-slate-700 rounded-full"></span>
                      <span className="h-1.5 w-8 bg-slate-700 rounded-full"></span>
                      <span className="h-1.5 w-8 bg-slate-700 rounded-full"></span>
                    </>
                  ) : (
                    <span className="h-3 w-4 border-y-2 border-slate-650 inline-block"></span>
                  )}
                </div>
              </div>

              {/* Body Content flow simulation */}
              <div className={`grid gap-3 ${
                activeDevice === 'desktop' 
                  ? 'grid-cols-3' 
                  : activeDevice === 'tablet' 
                  ? 'grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {/* Simulated Content Column 1 */}
                <div className="p-3 bg-dark-850/40 border border-slate-800 rounded-lg space-y-2">
                  <div className="h-2 w-16 bg-indigo-500/30 rounded-full"></div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-750 rounded-full"></div>
                    <div className="h-1.5 w-[80%] bg-slate-750 rounded-full"></div>
                  </div>
                  
                  {/* Empty Button warning mockup placement */}
                  {emptyButtonsViolations.length > 0 ? (
                    <div className="pt-1.5">
                      <button className="h-6 w-6 bg-slate-800 border border-rose-500/40 rounded flex items-center justify-center relative group" title="Empty Button Error">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-455 animate-pulse" />
                        <span className="absolute -top-6 left-0 bg-rose-950 text-rose-300 border border-rose-800 text-[8px] font-bold px-1.5 rounded whitespace-nowrap hidden group-hover:block">
                          Empty Interactive Node
                        </span>
                      </button>
                    </div>
                  ) : (
                    <button className="px-2.5 py-1 bg-indigo-650 rounded text-[8px] font-bold text-white">Action CTA</button>
                  )}
                </div>

                {/* Simulated Content Column 2 */}
                <div className="p-3 bg-dark-850/40 border border-slate-800 rounded-lg space-y-2">
                  <div className="h-2 w-12 bg-indigo-500/30 rounded-full"></div>
                  
                  {/* Contrast ratio failure indicator mock text */}
                  {lowContrastViolations.length > 0 ? (
                    <div className="py-1">
                      <span className="text-[9.5px] text-[#ccc] bg-[#eee] px-1 rounded border border-[#ddd] font-semibold select-none block">
                        Low Contrast Label
                      </span>
                      <span className="text-[7.5px] text-amber-400 font-extrabold uppercase mt-1 block tracking-wider">
                        ⚠️ Contrast Violation
                      </span>
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-350 leading-relaxed font-semibold">
                      Valid contrasting copy content that passes WCAG AA contrast rules.
                    </p>
                  )}
                </div>

                {/* Simulated Content Column 3 (desktop/tablet spacing block) */}
                <div className={`p-3 bg-dark-850/40 border border-slate-800 rounded-lg space-y-2 ${activeDevice === 'tablet' ? 'col-span-2' : ''}`}>
                  <div className="h-2 w-20 bg-indigo-500/30 rounded-full"></div>
                  
                  {/* Missing Input label warning element */}
                  {missingLabelsViolations.length > 0 ? (
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        placeholder="Missing Label Input..." 
                        disabled
                        className="w-full bg-slate-900 border border-rose-500/40 rounded px-2 py-0.5 text-[8.5px] outline-none"
                      />
                      <span className="text-[7.5px] text-rose-455 font-extrabold uppercase block tracking-wider">
                        ⚠️ Missing Form Label/Aria
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 font-bold block">Input Field Label</label>
                      <input 
                        type="text" 
                        placeholder="Search query..." 
                        disabled
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[8.5px] outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Absolute Static Pixel Width Overflow / Broken Flow Box simulation */}
              {fixedWidthViolations.length > 0 && activeDevice === 'mobile' && (
                <div className="relative pt-1">
                  <div className="w-[500px] p-2.5 bg-rose-950/20 border-2 border-dashed border-rose-500/40 rounded-lg flex items-center justify-between text-xs overflow-hidden">
                    <div>
                      <span className="text-[8px] font-extrabold text-rose-400 uppercase tracking-widest block">Absolute Width Constraint Overlap</span>
                      <code className="text-[8.5px] font-mono text-slate-450 block truncate max-w-[200px]">width: 1200px</code>
                    </div>
                    <span className="bg-rose-500 text-white font-bold text-[7px] px-1 rounded uppercase mr-48 animate-pulse shrink-0">
                      Viewport Bleed
                    </span>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-rose-900/35 pointer-events-none"></div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* WCAG Compliance Audits detail boards */}
      <div className="glass-card p-6 space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-slate-200 font-extrabold text-lg flex items-center gap-2">
              <Eye className="text-emerald-400 h-5 w-5" />
              UI/UX Visual Accessibility Audits
            </h3>
            <p className="text-xs text-slate-500 mt-1">Verifying WCAG contrast ratios, input element bindings, and interactive button nodes.</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Contrast warnings */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-3">Contrast Ratio Violations</span>
            {lowContrastViolations.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2 bg-dark-900/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                No low contrast anomalies detected. Contrast ratios satisfy WCAG AAA standards (&gt;4.5:1).
              </div>
            ) : (
              <div className="space-y-3">
                {lowContrastViolations.map((v, i) => (
                  <div key={i} className="p-4 bg-dark-850/40 border-l-4 border-l-amber-500 border border-slate-800/60 rounded-xl flex gap-3.5 text-xs hover:border-slate-700 transition-all shadow-md">
                    <AlertTriangle className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-200 font-semibold">{v.message}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Suggestion: Increase text color luminance or adjust background opacity to improve reading clarity on mobile devices.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input ARIA Labels warnings */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-3">Input Label Binding Warnings</span>
            {missingLabelsViolations.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2 bg-dark-900/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                All form input elements are successfully bound to corresponding label fields.
              </div>
            ) : (
              <div className="space-y-3">
                {missingLabelsViolations.map((v, i) => (
                  <div key={i} className="p-4 bg-dark-850/40 border-l-4 border-l-rose-500 border border-slate-800/60 rounded-xl flex gap-3.5 text-xs hover:border-slate-700 transition-all shadow-md">
                    <XCircle className="text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-200 font-semibold">{v.message}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Suggestion: Add a corresponding label tag with a matching htmlFor attribute, or use the aria-label="Description" attribute directly on the element.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty buttons warnings */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-3">Empty Buttons Warning Log</span>
            {emptyButtonsViolations.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2 bg-dark-900/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                No empty interactive button tags found. Screen readers can scan descriptive textual anchors correctly.
              </div>
            ) : (
              <div className="space-y-3">
                {emptyButtonsViolations.map((v, i) => (
                  <div key={i} className="p-4 bg-dark-850/40 border-l-4 border-l-rose-500 border border-slate-800/60 rounded-xl flex gap-3.5 text-xs hover:border-slate-700 transition-all shadow-md">
                    <XCircle className="text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-200 font-semibold">{v.message}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Suggestion: Screen readers cannot parse empty tags. Add inner descriptive text anchors, or bind aria-label="Button Function" to provide direct auditable headers.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zoom-blocking Viewport Warnings */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-3">Zoom-Blocking Viewports</span>
            {zoomBlockingViolations.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2 bg-dark-900/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                No zoom scaling limitations detected. Users can scale the browser layout cleanly.
              </div>
            ) : (
              <div className="space-y-3">
                {zoomBlockingViolations.map((v, i) => (
                  <div key={i} className="p-4 bg-dark-850/40 border-l-4 border-l-rose-500 border border-slate-800/60 rounded-xl flex gap-3.5 text-xs hover:border-slate-700 transition-all shadow-md">
                    <XCircle className="text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-200 font-semibold">{v.message}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Suggestion: Remove user-scalable=no, user-scalable=0, or maximum-scale=1 attributes from your viewport configuration meta tag.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Non-Descriptive Anchor Text Warnings */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-3">Non-Descriptive Anchor Labels</span>
            {nonDescriptiveLinkViolations.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2 bg-dark-900/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                No generic link text discovered. All hyperlink anchors are descriptive.
              </div>
            ) : (
              <div className="space-y-3">
                {nonDescriptiveLinkViolations.map((v, i) => (
                  <div key={i} className="p-4 bg-dark-850/40 border-l-4 border-l-amber-500 border border-slate-800/60 rounded-xl flex gap-3.5 text-xs hover:border-slate-700 transition-all shadow-md">
                    <AlertTriangle className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-200 font-semibold">{v.message}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Suggestion: Change generic words like "click here" or "read more" to descriptive labels explaining the destination (e.g. "Read our privacy policy").
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disabled Outline / Focus Warnings */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-3">Disabled Outlines / Focus Visibility</span>
            {disabledOutlineViolations.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2 bg-dark-900/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                No outline-suppression styles discovered. Outline ring properties are active.
              </div>
            ) : (
              <div className="space-y-3">
                {disabledOutlineViolations.map((v, i) => (
                  <div key={i} className="p-4 bg-dark-850/40 border-l-4 border-l-rose-500 border border-slate-800/60 rounded-xl flex gap-3.5 text-xs hover:border-slate-700 transition-all shadow-md">
                    <XCircle className="text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-200 font-semibold">{v.message}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Suggestion: Avoid using outline: none or outline: 0 without defining custom focus outline styles to support screen readers and keyboard users.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Image Alternative Texts */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-3">Image Alternative Description Audits</span>
            {missingImageAltViolations.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2 bg-dark-900/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                All image elements are labeled with descriptive alt tag text structures.
              </div>
            ) : (
              <div className="space-y-3">
                {missingImageAltViolations.map((v, i) => (
                  <div key={i} className="p-4 bg-dark-850/40 border-l-4 border-l-rose-500 border border-slate-800/60 rounded-xl flex gap-3.5 text-xs hover:border-slate-700 transition-all shadow-md">
                    <XCircle className="text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/60 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-200 font-semibold">{v.message}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Suggestion: Add a descriptive alt="Description of image" attribute to provide context for visually impaired operators.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
