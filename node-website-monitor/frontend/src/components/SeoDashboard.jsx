import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, XCircle, AlertTriangle, Layers, 
  Search, Link, Image, Globe, Sparkles, Download, FileJson, Info 
} from 'lucide-react';

export default function SeoDashboard({ seoData }) {
  const [altSearch, setAltSearch] = useState('');

  if (!seoData) {
    return (
      <div className="glass-card p-10 text-center text-slate-500 max-w-2xl mx-auto my-6 animate-fade-in-up">
        <Globe className="h-10 w-10 text-slate-600 mx-auto mb-4 animate-bounce" />
        <h4 className="font-extrabold text-slate-400">No SEO Audit Metrics Available</h4>
        <p className="text-xs text-slate-500 mt-2">Run a scan above to see real-time Technical SEO audits, tags, and link integrity indices.</p>
      </div>
    );
  }

  const {
    title = { text: '', status: 'warning', message: 'No title tag detected.' },
    metaDescription = { text: '', status: 'warning', message: 'No description tag detected.' },
    headings = { h1: [], h2: [], h3: [], status: 'ok' },
    canonical = { text: '', status: 'ok', message: '' },
    robotsTxt = { exists: false, status: 'warning', message: 'Robots.txt check skipped.' },
    sitemap = { exists: false, status: 'warning', message: 'Sitemap check skipped.' },
    openGraph = { ogTitle: '', ogImage: '', status: 'warning' },
    twitterCard = { twitterCard: '', status: 'warning' },
    indexability = { isIndexable: true, status: 'ok', message: 'Site is indexable.' },
    mobileFriendliness = { viewportConfigured: true, touchTargetIssues: 0, status: 'ok' },
    keywordAnalysis = { topKeywords: [], status: 'ok' },
    links = { internalCount: 0, externalCount: 0, brokenCount: 0, brokenLinks: [], status: 'ok' },
    imageAnalysis = { totalImages: 0, withAlt: 0, missingAlt: 0, emptyAlt: 0, lazyLoaded: 0, duplicateAltsCount: 0, duplicateAlts: [], missingAltSrcs: [], imageReportList: [], imageScore: 100, status: 'ok', message: '' },
    structuredData = { schemasCount: 0, invalidSchemasCount: 0, schemaTypes: [], status: 'info', message: '' },
    metaPlacement = { titleIndex: -1, descIndex: -1, robotsIndex: -1, viewportIndex: -1, renderBlockingCount: 0, metaViolations: [], status: 'ok', message: '' },
    seoScore = 100
  } = seoData;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getGradientId = (score) => {
    if (score >= 90) return 'url(#seoEmeraldGrad)';
    if (score >= 75) return 'url(#seoAmberGrad)';
    return 'url(#seoRoseGrad)';
  };

  const downloadImageAuditCSV = () => {
    const list = imageAnalysis?.imageReportList || [];
    if (list.length === 0) return;
    const headers = ['Image URL', 'Alt Text', 'Alt Status', 'Lazy Loaded', 'Size (KB)', 'Broken', 'Oversized', 'Compression Advice'];
    const rows = list.map(img => [
      img.src,
      img.alt || '',
      img.altStatus || '',
      img.isLazy ? 'Yes' : 'No',
      img.sizeKb || 0,
      img.isBroken ? 'Yes' : 'No',
      img.isOversized ? 'Yes' : 'No',
      img.compressionAdvice || ''
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `image_seo_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAltSrcs = (imageAnalysis?.missingAltSrcs || []).filter(item => {
    const srcStr = typeof item === 'string' ? item : (item?.src || '');
    return srcStr.toLowerCase().includes(altSearch.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      
      {/* Overview SEO Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* SEO Circular Score */}
        <div className="col-span-12 md:col-span-4 glass-card p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider w-full text-left mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            SEO Performance Rating
          </h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="seoEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="seoAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="seoRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
                stroke={getGradientId(seoScore)}
                strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * seoScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-black tracking-tight ${getScoreColor(seoScore)}`}>{seoScore}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">SEO Score</span>
            </div>
          </div>
        </div>

        {/* Search Engine Indexability Probes */}
        <div className="col-span-12 md:col-span-8 glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-indigo-400" />
              Indexability & Crawler Probes
            </span>
            
            <div className="space-y-3.5 mt-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Search Engine Indexable:</span>
                {indexability?.isIndexable ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Yes (Noindex Absent)
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" /> Blocked (Meta Noindex)
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Mobile Viewport Configured:</span>
                {mobileFriendliness?.viewportConfigured ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Fully Responsive
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" /> Suboptimal (Missing)
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Canonical Tag Configured:</span>
                {canonical?.text ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 truncate max-w-[240px]" title={canonical.text}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> Configured
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Missing
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-4 border-t border-slate-800/40 pt-3">
            * All variables crawled directly from live response body.
          </p>
        </div>

      </div>

      {/* HTML Header Tags & Crawl Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Meta elements */}
        <div className="col-span-12 md:col-span-6 glass-card p-6 space-y-4">
          <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <FileText className="text-indigo-400 h-4.5 w-4.5" />
            HTML Header Metadata
          </h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-2">Meta Title Tag</span>
              <div className="p-3 bg-dark-800/30 rounded-xl border border-slate-800/60 text-slate-300 font-medium font-mono break-all leading-normal">
                {title?.text || '—'}
              </div>
              <span className="text-[10px] text-slate-500 mt-2 block">{title?.message}</span>
            </div>

            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-2">Meta Description</span>
              <div className="p-3 bg-dark-800/30 rounded-xl border border-slate-800/60 text-slate-300 font-medium leading-relaxed">
                {metaDescription?.text || '—'}
              </div>
              <span className="text-[10px] text-slate-500 mt-2 block">{metaDescription?.message}</span>
            </div>

            {/* Meta Tags Placement Checklist */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Head Meta Tags Placement Checklist</span>
              <div className="space-y-2">
                {/* Viewport Check */}
                <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Viewport Scaling Tag:</span>
                  {(metaPlacement.viewportIndex !== -1 || mobileFriendliness?.viewportConfigured) ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Optimal
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> Missing
                    </span>
                  )}
                </div>

                {/* Robots Tag */}
                <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Robots Directive Tag:</span>
                  {metaPlacement.robotsIndex !== -1 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Present
                    </span>
                  ) : (
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> Absent (Default index)
                    </span>
                  )}
                </div>

                {/* Canonical Tag */}
                <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Canonical Tag Placement:</span>
                  {canonical?.text ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Optimal
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Missing
                    </span>
                  )}
                </div>

                {/* Title Placement Check */}
                <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Title Tag Position:</span>
                  {title?.text ? (
                    metaPlacement.metaViolations.some(v => v.tag === 'title') ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1" title="Declared after render-blocking stylesheet or script.">
                        <AlertTriangle className="h-3.5 w-3.5 animate-pulse" /> Delayed Placement
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Optimal
                      </span>
                    )
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> Missing Title
                    </span>
                  )}
                </div>

                {/* Description Placement Check */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Description Position:</span>
                  {metaDescription?.text ? (
                    metaPlacement.metaViolations.some(v => v.tag === 'description') ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1" title="Declared after render-blocking stylesheet or script.">
                        <AlertTriangle className="h-3.5 w-3.5 animate-pulse" /> Delayed Placement
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Optimal
                      </span>
                    )
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> Missing Desc
                    </span>
                  )}
                </div>
              </div>

              {/* Render-Blocking Delay Warnings Details */}
              {metaPlacement.metaViolations.length > 0 && (
                <div className="mt-3 p-3 bg-amber-950/15 border border-amber-900/20 rounded-xl text-[10px] text-amber-300 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Layout Hierarchy Warnings
                  </div>
                  <p className="text-[9.5px] text-slate-450 leading-relaxed">
                    Render-blocking script or stylesheet tags declared before meta properties delay parsing and slow crawler discovery.
                  </p>
                  <div className="space-y-1 font-mono text-[9px] bg-slate-950/40 p-2 rounded border border-slate-800/80 max-h-24 overflow-y-auto">
                    {metaPlacement.metaViolations.map((v, i) => (
                      <div key={i} className="leading-tight">
                        <span className="text-rose-400 font-bold">{v.tag.toUpperCase()}</span> delayed by:
                        <ul className="list-disc pl-3 text-slate-400 mt-0.5">
                          {v.blockingResources.map((res, ridx) => (
                            <li key={ridx} className="truncate" title={res}>{res}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Crawlability Files Validation */}
        <div className="col-span-12 md:col-span-6 glass-card p-6 space-y-4">
          <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Globe className="text-indigo-400 h-4.5 w-4.5" />
            Crawlability & File Validations
          </h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-2">robots.txt Validation</span>
              <div className={`p-3.5 rounded-xl border text-slate-300 font-medium ${robotsTxt?.exists ? 'bg-emerald-950/15 border-emerald-900/25 text-emerald-300' : 'bg-rose-950/15 border-rose-900/25 text-rose-300'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold">{robotsTxt?.exists ? 'Found & Active' : 'Missing File'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${robotsTxt?.exists ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {robotsTxt?.status?.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{robotsTxt?.message}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-2">sitemap.xml Validation</span>
              <div className={`p-3.5 rounded-xl border text-slate-300 font-medium ${sitemap?.exists ? 'bg-emerald-950/15 border-emerald-900/25 text-emerald-300' : 'bg-rose-950/15 border-rose-900/25 text-rose-300'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold">{sitemap?.exists ? 'Found & Parsed' : 'Missing Index'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sitemap?.exists ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {sitemap?.status?.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{sitemap?.message}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Heading Structure & Keyword Density mapping */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Hierarchy and keywords density map */}
        <div className="col-span-12 md:col-span-6 glass-card p-6 space-y-6">
          <div>
            <h3 className="text-slate-200 font-extrabold text-sm border-b border-slate-800 pb-3 mb-4 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Layers className="text-indigo-400 h-4.5 w-4.5" />
                H1-H6 Heading Layout Tree
              </span>
              {headings?.violations?.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-450 border border-amber-500/25 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {headings.violations.length} Nesting Jumps
                </span>
              )}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(() => {
                let headingsList = headings?.list || [];
                if (headingsList.length === 0) {
                  if (headings?.h1) headings.h1.forEach(text => headingsList.push({ tag: 'h1', text, level: 1 }));
                  if (headings?.h2) headings.h2.forEach(text => headingsList.push({ tag: 'h2', text, level: 2 }));
                  if (headings?.h3) headings.h3.forEach(text => headingsList.push({ tag: 'h3', text, level: 3 }));
                  if (headings?.h4) headings.h4.forEach(text => headingsList.push({ tag: 'h4', text, level: 4 }));
                  if (headings?.h5) headings.h5.forEach(text => headingsList.push({ tag: 'h5', text, level: 5 }));
                  if (headings?.h6) headings.h6.forEach(text => headingsList.push({ tag: 'h6', text, level: 6 }));
                }

                if (headingsList.length === 0) {
                  return (
                    <div className="p-3.5 bg-rose-950/10 border border-rose-900/20 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="text-rose-400 h-4 w-4 shrink-0" />
                      <span className="text-rose-400 text-xs font-bold leading-normal">
                        No heading tags (H1-H6) detected on this page! Suboptimal structural indexability.
                      </span>
                    </div>
                  );
                }

                return headingsList.map((h, i) => {
                  const paddingLeft = `${Math.max(8, (h.level - 1) * 12 + 8)}px`;
                  return (
                    <div 
                      key={i} 
                      className={`text-xs p-2 bg-dark-800/20 border border-slate-800/40 rounded-lg flex flex-col gap-1 transition-all hover:bg-dark-800/45 ${
                        h.jumpViolation ? 'border-amber-900/30 bg-amber-950/5' : ''
                      }`}
                      style={{ paddingLeft }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide font-mono ${
                          h.level === 1 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          h.level === 2 ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                          h.level === 3 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          h.level === 4 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          h.level === 5 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'
                        }`}>
                          {h.tag.toUpperCase()}
                        </span>
                        <span className="text-slate-300 font-semibold truncate max-w-[280px]" title={h.text}>
                          {h.text || <span className="text-slate-650 italic">Empty heading tag</span>}
                        </span>
                        {h.jumpViolation && (
                          <span className="flex items-center gap-0.5 text-[8px] bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded text-amber-400 font-bold ml-auto animate-pulse">
                            <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                            Jump (from {h.prevTag.toUpperCase()})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div>
            <h3 className="text-slate-200 font-extrabold text-sm border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-400 h-4.5 w-4.5" />
              Top 5 High-Frequency Keyword Density
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {keywordAnalysis?.topKeywords?.length === 0 ? (
                <div className="text-slate-500 text-xs italic py-2">No frequency keyword analysis performed.</div>
              ) : (
                keywordAnalysis.topKeywords.map((k, idx) => (
                  <div key={idx} className="px-3.5 py-2 bg-dark-800/40 border border-slate-800 rounded-xl text-xs flex items-center gap-2.5 transition-all hover:border-indigo-500/30">
                    <span className="text-indigo-400 font-bold">{k.keyword}</span>
                    <span className="text-slate-500 font-mono text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">{k.count} times</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Structured Schema Markup Card */}
        <div className="col-span-12 md:col-span-6 glass-card p-6 space-y-4">
          <h3 className="text-slate-200 font-extrabold text-sm border-b border-slate-800 pb-3 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <FileJson className="text-indigo-400 h-4.5 w-4.5" />
              Structured Schema Markup (JSON-LD)
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800/60 text-slate-400 rounded-md">
              Schemas: {structuredData?.schemasCount || 0}
            </span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3.5 text-center">
              <div className="p-3 bg-dark-800/30 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Valid Schemas</span>
                <span className="text-lg font-black text-emerald-400">
                  {Math.max(0, (structuredData?.schemasCount || 0) - (structuredData?.invalidSchemasCount || 0))}
                </span>
              </div>
              <div className="p-3 bg-dark-800/30 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Invalid Schemas</span>
                <span className={`text-lg font-black ${structuredData?.invalidSchemasCount > 0 ? 'text-rose-455' : 'text-slate-350'}`}>
                  {structuredData?.invalidSchemasCount || 0}
                </span>
              </div>
            </div>

            {structuredData?.schemaTypes && structuredData.schemaTypes.length > 0 ? (
              <div className="space-y-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Detected Schema Object Types</span>
                <div className="flex flex-wrap gap-1.5">
                  {structuredData.schemaTypes.map((type, idx) => (
                    <span key={idx} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold rounded-lg text-[10px]">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-950/20 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <Info className="text-slate-500 h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-normal">
                  No valid JSON-LD structured schemas were discovered in the body source code. Providing schemas (e.g. Article, Organization, Product) is highly recommended for search engines.
                </p>
              </div>
            )}

            {structuredData?.invalidSchemasCount > 0 && (
              <div className="p-3 bg-rose-950/15 border border-rose-900/20 rounded-xl flex items-start gap-2 text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <span className="font-bold block text-[10px] uppercase">JSON Parsing Failure</span>
                  <p className="text-[10px] text-rose-400/90 mt-0.5 leading-normal">
                    Some script templates labeled as application/ld+json contain syntax errors and couldn't be parsed!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Advanced Deep Image SEO Dashboard */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 gap-3">
          <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2">
            <Image className="text-indigo-400 h-4.5 w-4.5" />
            Deep Image SEO & Performance Audit
          </h3>
          <div className="flex items-center gap-3">
            {imageAnalysis?.imageReportList?.length > 0 && (
              <button 
                onClick={downloadImageAuditCSV}
                className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV Report
              </button>
            )}
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-800/80 text-slate-400 rounded-md">
              Score: <strong className={getScoreColor(imageAnalysis?.imageScore || 100)}>{imageAnalysis?.imageScore || 100}%</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-center text-xs">
          <div className="p-3 bg-dark-800/30 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Total Crawled</span>
            <span className="text-lg font-black text-slate-350">{imageAnalysis?.totalImages || 0}</span>
          </div>
          <div className="p-3 bg-dark-800/30 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Lazy Loaded</span>
            <span className="text-lg font-black text-indigo-400">{imageAnalysis?.lazyLoaded || 0}</span>
          </div>
          <div className="p-3 bg-dark-800/30 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Duplicate ALT Tags</span>
            <span className={`text-lg font-black ${imageAnalysis?.duplicateAltsCount > 0 ? 'text-amber-400' : 'text-slate-350'}`}>
              {imageAnalysis?.duplicateAltsCount || 0}
            </span>
          </div>
          <div className="p-3 bg-dark-800/30 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Broken / Errors</span>
            <span className={`text-lg font-black ${imageAnalysis?.imageReportList?.filter(img => img.isBroken).length > 0 ? 'text-rose-455' : 'text-slate-350'}`}>
              {imageAnalysis?.imageReportList?.filter(img => img.isBroken).length || 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Missing Alt Search & Action List */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-rose-400 font-bold uppercase tracking-wider block text-[9px]">Missing / Empty ALT List ({imageAnalysis?.missingAltSrcs?.length || 0})</span>
                <div className="relative flex items-center w-36">
                  <Search className="absolute left-2 text-slate-500 h-3 w-3" />
                  <input 
                    type="text" 
                    placeholder="Filter list..." 
                    className="w-full bg-slate-950/60 border border-slate-800 rounded px-2 py-0.5 text-[9px] pl-6 font-medium text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500"
                    value={altSearch}
                    onChange={e => setAltSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredAltSrcs.length === 0 ? (
                  <div className="text-[9px] text-slate-600 italic p-3 bg-dark-900/20 rounded-xl border border-slate-800/40">No missing or empty alt image tags.</div>
                ) : (
                  filteredAltSrcs.map((item, i) => {
                    const src = typeof item === 'string' ? item : (item?.src || '');
                    const suggestedAlt = typeof item === 'string' ? null : (item?.suggestedAlt || item?.suggested_alt);
                    
                    return (
                      <div key={i} className="p-2 bg-rose-950/10 border border-rose-900/15 rounded-lg space-y-1.5 transition-all hover:bg-rose-950/20">
                        <div className="font-mono text-[9px] text-rose-300 truncate" title={src}>
                          <span className="text-rose-500 font-bold">SRC:</span> {src}
                        </div>
                        {suggestedAlt && (
                          <div className="flex items-center gap-1 text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-semibold w-fit">
                            <Sparkles className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                            <span>Suggested Alt: <strong className="text-emerald-200">"{suggestedAlt}"</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Duplicate ALTs */}
            {imageAnalysis?.duplicateAlts && imageAnalysis.duplicateAlts.length > 0 && (
              <div className="space-y-2">
                <span className="text-amber-400 font-bold uppercase tracking-wider block text-[9px]">Duplicate ALT Content Warning</span>
                <div className="p-3 bg-amber-950/10 border border-amber-900/20 rounded-xl max-h-24 overflow-y-auto space-y-1">
                  {imageAnalysis.duplicateAlts.map((alt, idx) => (
                    <div key={idx} className="text-[10px] text-amber-300 leading-normal flex items-start gap-1">
                      <span className="text-amber-500 font-extrabold">•</span>
                      <span>Multiple images share: <strong className="text-amber-200">"{alt}"</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tested Images Gallery & Optimization Advice */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Live Image Performance Registry & Previews</span>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {imageAnalysis?.imageReportList && imageAnalysis.imageReportList.length > 0 ? (
                imageAnalysis.imageReportList.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 bg-dark-800/30 border rounded-xl flex items-center gap-3.5 transition-all text-xs ${
                      img.isBroken 
                        ? 'border-rose-900/30 hover:bg-rose-950/5' 
                        : img.isOversized 
                        ? 'border-amber-900/30 hover:bg-amber-950/5' 
                        : 'border-slate-800/60 hover:bg-dark-800/50'
                    }`}
                  >
                    {/* Thumbnail Preview with Fallback */}
                    <div className="relative h-12 w-12 rounded-lg bg-slate-900 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                      {img.isBroken ? (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      ) : (
                        <img 
                          src={img.src} 
                          alt={img.alt || 'Audit thumbnail'}
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-slate-650 font-bold text-[9px]">ERROR</span>'; }}
                          className="h-full w-full object-cover" 
                        />
                      )}
                      {img.isLazy && (
                        <span className="absolute bottom-0 right-0 bg-indigo-650 text-white font-bold text-[7px] px-1 rounded-tl-md">
                          LAZY
                        </span>
                      )}
                    </div>

                    {/* Metadata & Optimization Warnings */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] text-slate-400 truncate max-w-[70%]" title={img.src}>
                          {img.src}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {img.sizeKb > 0 && (
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${img.isOversized ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-450'}`}>
                              {img.sizeKb} KB
                            </span>
                          )}
                          <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                            img.altStatus === 'ok' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : img.altStatus === 'empty' || img.altStatus === 'missing'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            Alt: {img.altStatus}
                          </span>
                        </div>
                      </div>

                      {/* Display warning details */}
                      {img.isBroken && (
                        <p className="text-[10px] text-rose-455 font-bold flex items-center gap-1">
                          <XCircle className="h-3 w-3 shrink-0" /> Resource is broken or returns HTTP error.
                        </p>
                      )}
                      
                      {img.isOversized && (
                        <p className="text-[10px] text-amber-450 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 shrink-0" /> Oversized (&gt;500KB). Compressing is highly recommended.
                        </p>
                      )}

                      {img.compressionAdvice && !img.isBroken && (
                        <p className="text-[9.5px] text-indigo-300 font-medium flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-indigo-400 shrink-0" />
                          {img.compressionAdvice}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-slate-500 italic p-3 text-center bg-dark-900/10 border border-dashed border-slate-800 rounded-xl">
                  No images analyzed. Run a manual scan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crawled Links index */}
      <div className="glass-card p-6">
        <h3 className="text-slate-200 font-extrabold text-sm border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Link className="text-indigo-400 h-4.5 w-4.5" />
            Crawled Links Integrity Audit
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-850/60 text-slate-400 rounded-md">
            Internal: {links?.internalCount || 0} • External: {links?.externalCount || 0}
          </span>
        </h3>
        
        <div className="space-y-3">
          {links?.brokenCount === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs italic flex flex-col items-center justify-center gap-2 bg-dark-900/20 border border-dashed border-slate-800 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              All internal and external links are structurally verified and operational (zero broken links).
            </div>
          ) : (
            <div className="space-y-2.5">
              <span className="text-rose-455 font-bold uppercase tracking-wider block text-[9px] mb-2">Detected Broken Link Anomalies</span>
              <div className="space-y-2">
                {links.brokenLinks.map((bl, idx) => (
                  <div key={idx} className="p-3 bg-rose-950/10 border border-rose-900/20 rounded-xl flex justify-between items-center text-xs">
                    <div className="truncate max-w-[80%] pr-4">
                      <span className="font-extrabold text-rose-400 uppercase tracking-widest text-[9px] block mb-0.5">{bl.type} URL Broken</span>
                      <span className="font-mono text-slate-350 break-all truncate block" title={bl.url}>{bl.url}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-455 font-bold tracking-wide uppercase text-[9px] shrink-0 border border-rose-500/20">
                      {bl.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
