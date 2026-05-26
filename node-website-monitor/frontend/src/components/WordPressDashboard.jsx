import React from 'react';
import { Database, ShieldAlert, Cpu, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function WordPressDashboard({ wordpressData }) {
  if (!wordpressData || wordpressData.message) {
    return (
      <div className="glass-card p-10 text-center text-slate-500 max-w-2xl mx-auto my-6 animate-fade-in-up">
        <Database className="h-10 w-10 text-slate-600 mx-auto mb-4 animate-bounce" />
        <h4 className="font-extrabold text-slate-400">No WordPress SRE Metrics Audited Yet</h4>
        <p className="text-xs text-slate-500 mt-2">Input a WordPress-powered website URL to begin automated extensions and core SRE scans.</p>
      </div>
    );
  }

  const {
    healthScore,
    coreVersion,
    hasUpdate,
    plugins = [],
    themes = [],
    adminAccessible,
    databaseConnected,
    wpDebugActive,
    debugLogsCount
  } = wordpressData;

  // Group plugins by vulnerabilities & update flags
  const vulnerabilitiesList = plugins.filter(p => p.hasVulnerability);
  const conflictingList = plugins.filter(p => p.status === 'conflict');

  // Custom SRE color styling based on health rating
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getGradientId = (score) => {
    if (score >= 90) return 'url(#wpEmeraldGrad)';
    if (score >= 70) return 'url(#wpAmberGrad)';
    return 'url(#wpRoseGrad)';
  };

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
      
      {/* WordPress health pillars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* WordPress Health score circular gauge */}
        <div className="col-span-12 md:col-span-4 glass-card p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider w-full text-left mb-4">WP Health Index</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="wpEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="wpAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="wpRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
                stroke={getGradientId(healthScore)}
                strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * healthScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-black tracking-tight ${getScoreColor(healthScore)}`}>{healthScore}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Health Score</span>
            </div>
          </div>
        </div>

        {/* WP Core version status card */}
        <div className="col-span-12 md:col-span-4 glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">WP Core Version</span>
            <Cpu className="text-indigo-400 h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-200">v{coreVersion}</h2>
            <div className="mt-3 flex items-center gap-2">
              {hasUpdate ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold animate-pulse">
                  <RefreshCw className="h-3 w-3" />
                  Update Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 className="h-3 w-3" />
                  Version Secure
                </span>
              )}
            </div>
          </div>
        </div>

        {/* WordPress Diagnostic Checks metrics */}
        <div className="col-span-12 md:col-span-4 glass-card p-6 flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4">Infrastructure Probes</span>
          
          <div className="space-y-3.5 mt-1 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Database Connection:</span>
              {databaseConnected ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5 animate-ping" /> Failure
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Admin Dashboard:</span>
              {adminAccessible ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Accessible
                </span>
              ) : (
                <span className="text-rose-455 font-bold flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Blocked
                </span>
              )}
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">WP Debug Trace logs:</span>
              {wpDebugActive ? (
                <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5" /> Active ({debugLogsCount} lines)
                </span>
              ) : (
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Disabled
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* WordPress Security Vulnerabilities */}
      {vulnerabilitiesList.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-slate-350 font-extrabold text-base mb-4 flex items-center gap-2">
            <ShieldAlert className="text-rose-500 h-5 w-5" />
            Critical Core WordPress Vulnerabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vulnerabilitiesList.map((p, idx) => (
              <div key={idx} className="p-4 bg-dark-800/40 border-l-4 border-l-rose-500 border border-slate-800/60 rounded-xl flex items-start gap-3.5 hover:border-slate-700 transition-all shadow-md">
                <span className="mt-1 inline-block h-3 w-3 rounded-full bg-rose-500 animate-ping"></span>
                <div>
                  <h4 className="text-slate-200 text-sm font-bold">{p.name} Plugin Risk</h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    <strong>Version installed:</strong> v{p.version} (vulnerable!). Exposes RCE / SQL Injection vectors.
                  </p>
                  <p className="text-rose-400 text-[10px] font-bold mt-2.5 font-mono">{p.vulnerabilityDetails}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WordPress active theme & plug-in status index */}
      <div className="glass-card p-6">
        <h3 className="text-slate-300 font-extrabold text-base mb-6 flex items-center gap-2">
          <Database className="text-indigo-400 h-5 w-5" />
          WordPress Extension Modules Status
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Module Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Active Version</th>
                <th className="py-3 px-3">Audited Status</th>
                <th className="py-3 px-3">Patch Updates</th>
              </tr>
            </thead>
            <tbody>
              {/* Plugins lists */}
              {plugins.map((p, idx) => (
                <tr key={idx} className="border-b border-slate-800/40 hover:bg-dark-900/20 transition-all">
                  <td className="py-3 px-3 font-semibold text-slate-250">{p.name}</td>
                  <td className="py-3 px-3 text-slate-450">Plugin</td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{p.version}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                      p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      p.status === 'conflict' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                      'bg-slate-850 text-slate-400'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {p.hasVulnerability ? (
                      <span className="text-rose-455 font-bold text-[10px] uppercase tracking-wider">Vulnerable Risk</span>
                    ) : p.hasUpdate ? (
                      <span className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Update Available
                      </span>
                    ) : (
                      <span className="text-slate-500">Up to date</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Themes list */}
              {themes.map((t, idx) => (
                <tr key={idx} className="border-b border-slate-800/40 hover:bg-dark-900/20 transition-all">
                  <td className="py-3 px-3 font-semibold text-slate-250">{t.name}</td>
                  <td className="py-3 px-3 text-slate-450">Theme</td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{t.version}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {t.hasUpdate ? (
                      <span className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Update Available
                      </span>
                    ) : (
                      <span className="text-slate-500">Up to date</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
