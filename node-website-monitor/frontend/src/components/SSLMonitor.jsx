import React from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  XCircle, Clock, Globe, Lock, Shield 
} from 'lucide-react';

export default function SSLMonitor({ sslData, securityData }) {
  if (!sslData && !securityData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
        No security telemetry audited. Run a scan to see real-time SSL and HTTP security header status.
      </div>
    );
  }

  const {
    valid = false,
    daysRemaining = 0,
    issuer = 'unknown',
    expiryDate = null,
    message = 'No certificate returned from host socket.'
  } = sslData || {};

  const {
    securityScore = 100,
    headers = { missing: [], csp: 'disabled', hsts: 'disabled', xfo: 'disabled' },
    alerts = []
  } = securityData || {};

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/20';
    if (score >= 70) return 'text-amber-400 border-amber-500/20';
    return 'text-rose-400 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      
      {/* SSL & Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Security circular rating gauge */}
        <div className="col-span-12 md:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider w-full text-left mb-4 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-sky-400" />
            Security Shield Rating
          </h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="62" fill="transparent" stroke="#1f2937" strokeWidth="8"></circle>
              <circle
                cx="72"
                cy="72"
                r="62"
                fill="transparent"
                stroke={securityScore >= 90 ? '#0ea5e9' : securityScore >= 70 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * securityScore) / 100}
                className="transition-all duration-1000 ease-in-out"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(securityScore)}`}>{securityScore}%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Shield Score</span>
            </div>
          </div>
        </div>

        {/* SSL Certificate Details card */}
        <div className="col-span-12 md:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                Active SSL Certificate
              </span>
              {valid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 className="h-3 w-3" /> Secure
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold animate-pulse">
                  <XCircle className="h-3 w-3" /> Insecure
                </span>
              )}
            </div>

            <div className="space-y-3.5 mt-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-500">Certificate Issuer:</span>
                <span className="font-semibold text-slate-300">{issuer}</span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-500">Expiration countdown:</span>
                <span className={`font-bold ${valid && daysRemaining > 30 ? 'text-emerald-400' : 'text-amber-400 font-black animate-pulse'}`}>
                  {valid ? `${daysRemaining} Days remaining` : '0 Days (Expired)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Expiry Date:</span>
                <span className="font-mono text-slate-300">
                  {expiryDate ? new Date(expiryDate).toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic border-t border-slate-800/40 pt-3 mt-4">
            {message}
          </p>
        </div>

      </div>

      {/* HTTP Secure Response Headers Status */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-slate-200 font-extrabold text-lg flex items-center gap-2">
              <ShieldCheck className="text-sky-400 h-5 w-5" />
              Security Protocol & Headers Shield
            </h3>
            <p className="text-xs text-slate-500 mt-1">Analyzing Nginx/Apache secure HTTP response headers and CSP directives.</p>
          </div>
        </div>

        {/* Secure Headers status checks list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex justify-between items-center hover:border-sky-500/20 transition-all">
            <span className="text-slate-400 font-semibold">HSTS Enforced:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${headers?.hsts === 'enabled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
              {headers?.hsts?.toUpperCase() || 'DISABLED'}
            </span>
          </div>
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex justify-between items-center hover:border-sky-500/20 transition-all">
            <span className="text-slate-400 font-semibold">CSP Directive Status:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${headers?.csp === 'enabled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
              {headers?.csp?.toUpperCase() || 'DISABLED'}
            </span>
          </div>
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex justify-between items-center hover:border-sky-500/20 transition-all">
            <span className="text-slate-400 font-semibold">X-Frame-Options:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${headers?.xfo === 'enabled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
              {headers?.xfo?.toUpperCase() || 'DISABLED'}
            </span>
          </div>
        </div>

        {/* Missing security headers alert lists */}
        <div className="space-y-3 pt-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Security Header Integrity Warnings</span>
          {headers?.missing?.length === 0 ? (
            <div className="p-5 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-xl flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              Website has enabled all modern secure response headers! Complete vulnerability shielding.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headers.missing.map((header, index) => (
                <div key={index} className="p-4 bg-slate-950/30 border border-slate-800/80 rounded-xl flex gap-3.5 items-start text-xs hover:border-rose-500/20 transition-all">
                  <ShieldAlert className="text-rose-400 h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-200 font-mono tracking-wide">{header}</span>
                    <p className="text-slate-500 text-[10px] leading-relaxed">
                      Missing header exposes users to clickjacking, MITM spoofing, or cross-site scripting risks. Enable in server configuration.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
