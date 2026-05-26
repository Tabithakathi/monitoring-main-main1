import React from 'react';
import { 
  Eye, CheckCircle2, XCircle, AlertTriangle, Layers, 
  Sparkles, Accessibility, Laptop, Smartphone 
} from 'lucide-react';

export default function AccessibilityAudit({ uiUxData, mobileFriendliness }) {
  if (!uiUxData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
        No accessibility telemetry audited. Run a scan to see real-time UI/UX accessibility audits.
      </div>
    );
  }

  const {
    uiHealthScore = 100,
    lowContrastViolations = [],
    missingLabelsViolations = [],
    emptyButtonsViolations = []
  } = uiUxData;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/20';
    if (score >= 70) return 'text-amber-400 border-amber-500/20';
    return 'text-rose-400 border-rose-500/20';
  };

  const totalViolations = 
    lowContrastViolations.length + 
    missingLabelsViolations.length + 
    emptyButtonsViolations.length +
    (!mobileFriendliness?.viewportConfigured ? 1 : 0);

  return (
    <div className="space-y-6">
      
      {/* Overview Accessibility Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Accessibility score Circular progress gauge */}
        <div className="col-span-12 md:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider w-full text-left mb-4 flex items-center gap-1.5">
            <Accessibility className="h-3.5 w-3.5 text-emerald-400" />
            Accessibility Rating
          </h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="62" fill="transparent" stroke="#1f2937" strokeWidth="8"></circle>
              <circle
                cx="72"
                cy="72"
                r="62"
                fill="transparent"
                stroke={uiHealthScore >= 90 ? '#10b981' : uiHealthScore >= 70 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * uiHealthScore) / 100}
                className="transition-all duration-1000 ease-in-out"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(uiHealthScore)}`}>{uiHealthScore}%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">WCAG Compliance</span>
            </div>
          </div>
        </div>

        {/* Accessibility Probes and checklist */}
        <div className="col-span-12 md:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Eye className="h-3.5 w-3.5 text-indigo-400" />
              WCAG Accessibility Pillars
            </span>
            
            <div className="space-y-3.5 mt-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Total Checked Violations:</span>
                <span className={`font-bold ${totalViolations === 0 ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                  {totalViolations} Anomalies Detected
                </span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Low Contrast Ratio Elements:</span>
                <span className="font-semibold text-slate-300">
                  {lowContrastViolations.length} items checked
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Empty Button Elements:</span>
                <span className="font-semibold text-slate-300">
                  {emptyButtonsViolations.length} items checked
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Unbound Form Input Labels:</span>
                <span className="font-semibold text-slate-300">
                  {missingLabelsViolations.length} items checked
                </span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-4">
            * Scans evaluate element background-color, ARIA descriptions, and tag matching attributes.
          </p>
        </div>

      </div>

      {/* WCAG Compliance Audits detail boards */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-slate-200 font-extrabold text-lg flex items-center gap-2">
              <Eye className="text-emerald-400 h-5 w-5" />
              UI/UX Visual Accessibility Audits
            </h3>
            <p className="text-xs text-slate-500 mt-1">Verifying WCAG contract ratios, input element bindings, and interactive button nodes.</p>
          </div>
        </div>

        <div className="space-y-5">
          
          {/* Contrast warnings */}
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-2.5">Contrast Ratio Violations</span>
            {lowContrastViolations.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                No low contrast anomalies detected. Contrast ratios satisfy WCAG AAA standards (&gt;4.5:1).
              </div>
            ) : (
              <div className="space-y-2">
                {lowContrastViolations.map((v, i) => (
                  <div key={i} className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl flex gap-3.5 text-xs hover:border-amber-500/20 transition-all">
                    <AlertTriangle className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-400 font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-300 font-medium">{v.message}</p>
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
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-2.5">Input Label Binding Warnings</span>
            {missingLabelsViolations.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                All form input elements are successfully bound to corresponding label fields.
              </div>
            ) : (
              <div className="space-y-2">
                {missingLabelsViolations.map((v, i) => (
                  <div key={i} className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl flex gap-3.5 text-xs hover:border-rose-500/20 transition-all">
                    <XCircle className="text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-400 font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-300 font-medium">{v.message}</p>
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
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-2.5">Empty Buttons Warning Log</span>
            {emptyButtonsViolations.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                No empty interactive button tags found. Screen readers can scan descriptive textual anchors correctly.
              </div>
            ) : (
              <div className="space-y-2">
                {emptyButtonsViolations.map((v, i) => (
                  <div key={i} className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl flex gap-3.5 text-xs hover:border-rose-500/20 transition-all">
                    <XCircle className="text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <code className="text-slate-400 font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 inline-block mb-1">{v.element}</code>
                      <p className="text-slate-300 font-medium">{v.message}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Suggestion: Screen readers cannot parse empty tags. Add inner descriptive text anchors, or bind aria-label="Button Function" to provide direct auditable headers.
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
