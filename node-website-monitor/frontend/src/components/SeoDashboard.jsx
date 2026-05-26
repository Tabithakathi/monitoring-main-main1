import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, XCircle, AlertTriangle, Layers, 
  Search, Link, Image, Globe, Sparkles 
} from 'lucide-react';

export default function SeoDashboard({ seoData }) {
  const [altSearch, setAltSearch] = useState('');

  if (!seoData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
        No SEO audit metrics available. Run a scan to see real-time Technical SEO audits.
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
    imageAnalysis = { totalImages: 0, withAlt: 0, missingAlt: 0, emptyAlt: 0, missingAltSrcs: [], status: 'ok', message: '' },
    seoScore = 100
  } = seoData;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/20';
    if (score >= 75) return 'text-amber-400 border-amber-500/20';
    return 'text-rose-400 border-rose-500/20';
  };

  const filteredAltSrcs = (imageAnalysis?.missingAltSrcs || []).filter(src => 
    src.toLowerCase().includes(altSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Overview SEO Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* SEO Circular Score */}
        <div className="col-span-12 md:col-span-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider w-full text-left mb-4 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            SEO Performance Rating
          </h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="62" fill="transparent" stroke="#1f2937" strokeWidth="8"></circle>
              <circle
                cx="72"
                cy="72"
                r="62"
                fill="transparent"
                stroke={seoScore >= 90 ? '#10b981' : seoScore >= 75 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * seoScore) / 100}
                className="transition-all duration-1000 ease-in-out"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(seoScore)}`}>{seoScore}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">SEO Score</span>
            </div>
          </div>
        </div>

        {/* Search Engine Indexability Probes */}
        <div className="col-span-12 md:col-span-8 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Globe className="h-3.5 w-3.5 text-indigo-400" />
              Indexability & Crawler Probes
            </span>
            
            <div className="space-y-3.5 mt-2">
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Search Engine Indexable</span>
                {indexability?.isIndexable ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Yes (Noindex Absent)
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Blocked (Meta Noindex)
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Mobile Viewport Configured</span>
                {mobileFriendliness?.viewportConfigured ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Fully Responsive
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Suboptimal (Missing)
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-400">Canonical Tag Configured</span>
                {canonical?.text ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 truncate max-w-[200px]" title={canonical.text}>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Configured
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Missing
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-4">
            * All variables crawled directly from live response body.
          </p>
        </div>

      </div>

      {/* HTML Header Tags & Crawl Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Meta elements */}
        <div className="col-span-12 md:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="text-indigo-400 h-4.5 w-4.5" />
            HTML Header Metadata
          </h3>
          
          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-1.5">Meta Title Tag</span>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-300 font-medium font-mono break-all leading-normal">
                {title?.text || '—'}
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">{title?.message}</span>
            </div>

            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-1.5">Meta Description</span>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-300 font-medium leading-relaxed">
                {metaDescription?.text || '—'}
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">{metaDescription?.message}</span>
            </div>
          </div>
        </div>

        {/* Crawlability Files Validation */}
        <div className="col-span-12 md:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="text-indigo-400 h-4.5 w-4.5" />
            Crawlability & File Validations
          </h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-1.5">robots.txt Validation</span>
              <div className={`p-3.5 rounded-xl border text-slate-300 font-medium ${robotsTxt?.exists ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-rose-950/20 border-rose-900/30 text-rose-300'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{robotsTxt?.exists ? 'Found & Active' : 'Missing File'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${robotsTxt?.exists ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {robotsTxt?.status?.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{robotsTxt?.message}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-1.5">sitemap.xml Validation</span>
              <div className={`p-3.5 rounded-xl border text-slate-300 font-medium ${sitemap?.exists ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-rose-950/20 border-rose-900/30 text-rose-300'}`}>
                <div className="flex justify-between items-center mb-1">
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
        <div className="col-span-12 md:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-slate-200 font-extrabold text-sm border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Layers className="text-indigo-400 h-4.5 w-4.5" />
              H1 Page Headings Hierarchy
            </h3>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {headings?.h1?.length === 0 ? (
                <div className="p-3.5 bg-rose-950/10 border border-rose-900/20 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="text-rose-400 h-4 w-4 shrink-0" />
                  <span className="text-rose-400 text-xs font-bold leading-normal">No H1 heading tag detected on this page! Suboptimal structural indexability.</span>
                </div>
              ) : (
                headings.h1.map((h, i) => (
                  <div key={i} className="text-xs p-2.5 bg-indigo-950/20 border border-indigo-900/30 text-indigo-300 rounded-lg font-semibold flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                    {h}
                  </div>
                ))
              )}
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
                  <div key={idx} className="px-3.5 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-xs flex items-center gap-2.5 transition-all hover:border-indigo-500/30">
                    <span className="text-indigo-400 font-bold">{k.keyword}</span>
                    <span className="text-slate-500 font-mono text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">{k.count} times</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Image Alt tags analysis */}
        <div className="col-span-12 md:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-slate-200 font-extrabold text-sm border-b border-slate-800 pb-3 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Image className="text-indigo-400 h-4.5 w-4.5" />
              Image Alt Tag Compliance
            </span>
            {imageAnalysis?.totalImages > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                Compliance: {imageAnalysis.withAlt} / {imageAnalysis.totalImages}
              </span>
            )}
          </h3>
          
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-3.5 text-center">
              <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Total Images</span>
                <span className="text-lg font-black text-slate-300">{imageAnalysis?.totalImages || 0}</span>
              </div>
              <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Valid ALT</span>
                <span className="text-lg font-black text-emerald-400">{imageAnalysis?.withAlt || 0}</span>
              </div>
              <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Missing ALT</span>
                <span className="text-lg font-black text-rose-400">
                  {(imageAnalysis?.missingAlt || 0) + (imageAnalysis?.emptyAlt || 0)}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">{imageAnalysis?.message}</p>

            {imageAnalysis?.missingAltSrcs?.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-rose-400 font-bold uppercase tracking-wider block text-[9px]">Missing ALT descriptive tags list</span>
                  <div className="relative flex items-center w-36">
                    <Search className="absolute left-2 text-slate-500 h-3 w-3" />
                    <input 
                      type="text" 
                      placeholder="Filter by src..." 
                      className="w-full bg-slate-950/60 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] pl-6 font-medium text-slate-300 placeholder-slate-600 outline-none"
                      value={altSearch}
                      onChange={e => setAltSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {filteredAltSrcs.length === 0 ? (
                    <div className="text-[9px] text-slate-600 italic">No matching image sources.</div>
                  ) : (
                    filteredAltSrcs.map((src, i) => (
                      <div key={i} className="p-2 bg-rose-950/5 border border-rose-900/10 rounded-lg font-mono text-[9px] text-rose-300 truncate hover:text-rose-200 transition-colors" title={src}>
                        {src}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Crawled Links index */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-slate-200 font-extrabold text-sm border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Link className="text-indigo-400 h-4.5 w-4.5" />
            Crawled Links Integrity Audit
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
            Internal: {links?.internalCount || 0} • External: {links?.externalCount || 0}
          </span>
        </h3>
        
        <div className="space-y-3">
          {links?.brokenCount === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs italic flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              All internal and external links are structurally verified and operational (zero broken links).
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-rose-400 font-bold uppercase tracking-wider block text-[9px] mb-2">Detected Broken Link Anomalies</span>
              <div className="space-y-2">
                {links.brokenLinks.map((bl, idx) => (
                  <div key={idx} className="p-3 bg-rose-950/10 border border-rose-900/20 rounded-xl flex justify-between items-center text-xs">
                    <div className="truncate max-w-[80%] pr-4">
                      <span className="font-extrabold text-rose-400 uppercase tracking-widest text-[9px] block mb-0.5">{bl.type} URL Broken</span>
                      <span className="font-mono text-slate-300 break-all truncate block" title={bl.url}>{bl.url}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold tracking-wide uppercase text-[9px] shrink-0 border border-rose-500/20">
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
