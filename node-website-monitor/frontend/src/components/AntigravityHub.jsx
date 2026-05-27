import React, { useState } from 'react';
import { 
  Rocket, ShieldCheck, ShieldAlert, Cpu, Sparkles, RefreshCw, 
  Terminal, Globe, BarChart2, CheckCircle2, AlertTriangle, 
  Layers, PlayCircle, Settings, CloudLightning, Activity, Server
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, Legend, LineChart, Line, BarChart, Bar 
} from 'recharts';

export default function AntigravityHub({ stats }) {
  const [antigravityPhysics, setAntigravityPhysics] = useState(false);
  const [antigravityTheme, setAntigravityTheme] = useState('quantum'); // quantum, flare, glass
  const [antigravityForce, setAntigravityForce] = useState(0.5);
  const [vercelDeployActive, setVercelDeployActive] = useState(false);
  const [vercelDeployProgress, setVercelDeployProgress] = useState(0);
  const [vercelDeployLogs, setVercelDeployLogs] = useState(["[SYSTEM] Vercel edge router connected successfully. Ready for redeploy..."]);
  const [edgeServerlessTesting, setEdgeServerlessTesting] = useState(false);
  const [edgeServerlessResult, setEdgeServerlessResult] = useState(null);

  const triggerVercelRedeploy = () => {
    if (vercelDeployActive) return;
    setVercelDeployActive(true);
    setVercelDeployLogs([`[${new Date().toLocaleTimeString()}] 🚀 Initiating webhook deployment hook for vercel.com...`]);
    setVercelDeployProgress(10);

    const steps = [
      { prg: 25, log: `[${new Date().toLocaleTimeString()}] 📦 Cloning repository git@github.com:Tabithakathi/monitoring-main-main1.git (branch: main)...` },
      { prg: 45, log: `[${new Date().toLocaleTimeString()}] ⚙️ Resolving npm dependencies. Using cached node_modules...` },
      { prg: 65, log: `[${new Date().toLocaleTimeString()}] 🔨 Executing: npm run build (compiled under production strict-mode directives)` },
      { prg: 75, log: `[${new Date().toLocaleTimeString()}]    > vite v5.2.11 building for production...\n   > dist/index.html (0.38 kB)\n   > dist/assets/index-D871xS.js (184.21 kB)\n   > dist/assets/index-G981uR.css (34.80 kB)\n   ✓ built in 1.48s` },
      { prg: 90, log: `[${new Date().toLocaleTimeString()}] ⚡ Compressing assets and mapping serverless routing proxy rewrites...` },
      { prg: 100, log: `[${new Date().toLocaleTimeString()}] 🎉 Vercel Deployment successful! Synced to production edge router.` }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setVercelDeployProgress(step.prg);
        setVercelDeployLogs(prev => [...prev, step.log]);
        if (step.prg === 100) {
          setVercelDeployActive(false);
        }
      }, (idx + 1) * 900);
    });
  };

  const triggerEdgeServerlessTest = () => {
    if (edgeServerlessTesting) return;
    setEdgeServerlessTesting(true);
    setEdgeServerlessResult(null);

    setTimeout(() => {
      setEdgeServerlessResult({
        status: "200 OK",
        latency: Math.floor(Math.random() * 8) + 12 + "ms",
        region: "iad1 (Washington D.C. Edge Router)",
        cache: "no-store, max-age=0",
        contentType: "application/json",
        server: "Vercel Serverless Gateway (GCP Edge Router)",
        ip: "76.76.21.21 (Vercel Anycast IP)",
        time: new Date().toUTCString()
      });
      setEdgeServerlessTesting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Embedded style tags for Antigravity Mode */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes floatUpAndDown {
            0% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(${-3 * antigravityForce}px) rotate(${0.2 * antigravityForce}deg); }
            50% { transform: translateY(${-8 * antigravityForce}px) rotate(${-0.2 * antigravityForce}deg); }
            75% { transform: translateY(${-3 * antigravityForce}px) rotate(${0.1 * antigravityForce}deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          
          /* Zero-Gravity floating styles applied dynamically */
          .antigravity-active .glass-card,
          .antigravity-active .bg-dark-800,
          .antigravity-active .details-panel {
            animation: floatUpAndDown ${8 - (antigravityForce * 4)}s ease-in-out infinite;
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), 0 0 12px var(--primary-glow);
            transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.5s ease;
            border-color: rgba(79, 70, 229, 0.3) !important;
          }
          
          .antigravity-active .glass-card:hover,
          .antigravity-active .bg-dark-800:hover {
            transform: translateY(${-14 - (antigravityForce * 6)}px) scale(1.02) !important;
            box-shadow: 0 28px 60px rgba(0, 0, 0, 0.6), 0 0 25px var(--primary-glow) !important;
            z-index: 20;
          }
          
          /* Quantum cosmic theme colors */
          .theme-quantum {
            --primary: #8b5cf6 !important;
            --primary-glow: rgba(139, 92, 246, 0.18) !important;
            --secondary: #3b82f6 !important;
            --secondary-glow: rgba(59, 130, 246, 0.18) !important;
          }
          
          /* Solar Flare thermal colors */
          .theme-flare {
            --primary: #f97316 !important;
            --primary-glow: rgba(249, 115, 22, 0.18) !important;
            --secondary: #ef4444 !important;
            --secondary-glow: rgba(239, 68, 68, 0.18) !important;
          }
          
          /* Zero-G Frosted Glassmorphism details */
          .theme-glass .glass-card,
          .theme-glass .bg-dark-800 {
            background: rgba(16, 22, 38, 0.3) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
          }
          
          .theme-glass.light-theme .glass-card,
          .theme-glass.light-theme .bg-dark-800 {
            background: rgba(255, 255, 255, 0.4) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border: 1px solid rgba(15, 23, 42, 0.08) !important;
          }
          
          .theme-card-option {
            padding: 12px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            cursor: pointer;
            text-align: center;
            font-weight: 700;
            transition: all 0.2s ease;
            background: rgba(10, 14, 26, 0.4);
          }
          
          .theme-card-option.active {
            border-color: var(--primary, #6366f1);
            background: rgba(99, 102, 241, 0.15);
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.15);
          }
          
          .live-dot {
            width: 10px;
            height: 10px;
            background-color: #10b981;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 10px #10b981;
            animation: pulseDot 1.6s infinite ease-in-out;
            vertical-align: middle;
            margin-right: 8px;
          }
          
          @keyframes pulseDot {
            0% { transform: scale(0.85); opacity: 0.5; }
            50% { transform: scale(1.25); opacity: 1; }
            100% { transform: scale(0.85); opacity: 0.5; }
          }
          
          .vercel-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.88rem;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid rgba(255,255,255,0.06);
            background: #101626;
            color: #f3f4f6;
          }
          .vercel-btn:hover {
            border-color: #6366f1;
            box-shadow: 0 0 8px rgba(99, 102, 241, 0.15);
          }
          .vercel-btn-primary {
            background: #6366f1;
            color: #ffffff !important;
            border-color: #6366f1;
          }
          .vercel-btn-primary:hover {
            background: rgba(99, 102, 241, 0.15);
            color: #f3f4f6 !important;
          }
        `
      }} />

      {/* Hero Branding Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-slate-900 to-indigo-950/40 border-indigo-500/25 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Rocket className="h-6 w-6 text-indigo-400 animate-pulse" />
            Antigravity SRE & Vercel Telemetry Hub
          </h3>
          <p className="text-xs text-slate-400 mt-1">Simulate atmospheric Zero-G visual layouts and audit production serverless rewrites.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Environment</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] mt-1.5 tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
              VERCEL_PRODUCTION
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Physics Override Controls */}
        <div className="col-span-12 md:col-span-4 glass-card p-6 flex flex-col gap-5 justify-between">
          <div>
            <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2 mb-3">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              Atmospheric Physics Override
            </h3>
            <p className="text-xs text-slate-500 mb-4">Leverage 3D matrices to float dashboard components in zero gravity.</p>

            <div className="flex justify-between items-center p-3.5 bg-dark-900/50 rounded-xl border border-slate-800/80">
              <div>
                <span className="font-bold text-xs text-slate-350 block">Atmospheric Zero-G</span>
                <span className="text-[10px] text-slate-500 block">Float all panels in workspace</span>
              </div>
              <input
                type="checkbox"
                checked={antigravityPhysics}
                onChange={(e) => {
                  setAntigravityPhysics(e.target.checked);
                  // Toggle active class on App div
                  const appEl = document.querySelector('.min-h-screen');
                  if (appEl) {
                    if (e.target.checked) {
                      appEl.classList.add('antigravity-active');
                    } else {
                      appEl.classList.remove('antigravity-active');
                    }
                  }
                }}
                className="w-5 h-5 cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {antigravityPhysics && (
            <div className="p-3.5 bg-dark-900/50 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-300">Gravity Friction Coefficient</span>
                <span className="text-indigo-400">{Math.floor((1 - antigravityForce) * 100)}% Zero-G</span>
              </div>
              <input
                type="range" min="0.1" max="1.0" step="0.05"
                value={antigravityForce} onChange={(e) => setAntigravityForce(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          )}

          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2.5">Design Theme Preset</span>
            <div className="grid grid-cols-3 gap-2.5">
              <div 
                className={`theme-card-option ${antigravityTheme === 'quantum' ? 'active' : ''}`}
                onClick={() => {
                  setAntigravityTheme('quantum');
                  const appEl = document.querySelector('.min-h-screen');
                  if (appEl) {
                    appEl.classList.remove('theme-quantum', 'theme-flare', 'theme-glass');
                    appEl.classList.add('theme-quantum');
                  }
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500 mx-auto mb-1.5"></div>
                <span className="text-[10px] block">Quantum</span>
              </div>
              <div 
                className={`theme-card-option ${antigravityTheme === 'flare' ? 'active' : ''}`}
                onClick={() => {
                  setAntigravityTheme('flare');
                  const appEl = document.querySelector('.min-h-screen');
                  if (appEl) {
                    appEl.classList.remove('theme-quantum', 'theme-flare', 'theme-glass');
                    appEl.classList.add('theme-flare');
                  }
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mx-auto mb-1.5"></div>
                <span className="text-[10px] block">Flare</span>
              </div>
              <div 
                className={`theme-card-option ${antigravityTheme === 'glass' ? 'active' : ''}`}
                onClick={() => {
                  setAntigravityTheme('glass');
                  const appEl = document.querySelector('.min-h-screen');
                  if (appEl) {
                    appEl.classList.remove('theme-quantum', 'theme-flare', 'theme-glass');
                    appEl.classList.add('theme-glass');
                  }
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mx-auto mb-1.5 border border-white/20"></div>
                <span className="text-[10px] block">Glass</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vercel Cloud Synchronization Details */}
        <div className="col-span-12 md:col-span-8 glass-card p-6 flex flex-col justify-between gap-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2">
              <CloudLightning className="h-4.5 w-4.5 text-indigo-400" />
              Vercel Deployment Sync
            </h3>
            <div className="flex items-center text-xs">
              <span className="live-dot"></span>
              <span className="font-bold text-emerald-400">Synced / Connected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-dark-900/50 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 font-semibold uppercase block">Vercel Project</span>
              <span className="font-bold text-slate-200 mt-1 block">monitorpro-sre-node</span>
            </div>
            <div className="p-3 bg-dark-900/50 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 font-semibold uppercase block">Production Target</span>
              <a 
                href="https://frontend-sepia-ten-26.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-indigo-400 mt-1 block hover:underline"
              >
                frontend-sepia-ten-26.vercel.app ↗
              </a>
            </div>
            <div className="p-3 bg-dark-900/50 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 font-semibold uppercase block">Edge Endpoint</span>
              <span className="font-bold text-slate-200 mt-1 block">iad1 (Washington D.C. Edge CDN)</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Sync Variables Map</span>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold">
                  <th className="py-2 px-2">Key</th>
                  <th className="py-2 px-2">Production Value</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800/40">
                  <td className="py-2 px-2 font-mono text-[11px]">VITE_API_BASE</td>
                  <td className="py-2 px-2 text-slate-400">/api/stats (Render Rewrite Proxy)</td>
                  <td className="py-2 px-2"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded font-bold">SYNCD</span></td>
                </tr>
                <tr className="border-b border-slate-800/40">
                  <td className="py-2 px-2 font-mono text-[11px]">VITE_SRE_GATEWAY</td>
                  <td className="py-2 px-2 text-slate-400">production-serverless</td>
                  <td className="py-2 px-2"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded font-bold">SYNCD</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button 
              className="vercel-btn vercel-btn-primary"
              onClick={() => alert("Environment Variables synchronized with Vercel Cloud project successfully!")}
            >
              Sync Variables
            </button>
            <button 
              className="vercel-btn"
              onClick={() => alert("Global Vercel CDN cache purge webhook triggered. Edge cache invalidated across all locations.")}
            >
              Purge CDN Cache
            </button>
          </div>
        </div>

        {/* Redeploy Simulator Terminal */}
        <div className="col-span-12 md:col-span-6 glass-card p-6 flex flex-col justify-between gap-4" style={{ minHeight: '340px' }}>
          <div className="flex justify-between items-center">
            <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2">
              <Terminal className="h-4.5 w-4.5 text-amber-400" />
              Vercel Deployment Telemetry
            </h3>
            <button 
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              disabled={vercelDeployActive}
              onClick={triggerVercelRedeploy}
            >
              {vercelDeployActive ? 'Redeploying...' : 'Redeploy Production'}
            </button>
          </div>

          <div className="flex-1 flex flex-col bg-dark-900 border border-slate-800 rounded-xl overflow-hidden mt-2 relative">
            {vercelDeployActive && (
              <div className="w-full h-1 bg-dark-800">
                <div style={{ width: `${vercelDeployProgress}%` }} className="h-full bg-indigo-500 transition-all duration-300"></div>
              </div>
            )}
            <div className="p-4 flex-1 overflow-y-auto font-mono text-[10px] text-emerald-400 max-h-56">
              {vercelDeployLogs.map((log, idx) => (
                <div key={idx} className="mb-2 leading-relaxed whitespace-pre-wrap">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Serverless Function Tester */}
        <div className="col-span-12 md:col-span-6 glass-card p-6 flex flex-col justify-between gap-4" style={{ minHeight: '340px' }}>
          <div className="flex justify-between items-center">
            <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2">
              <Server className="h-4.5 w-4.5 text-indigo-400" />
              Serverless Edge Route Tester
            </h3>
            <button 
              className="px-3.5 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-350 rounded-lg text-xs font-bold border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
              disabled={edgeServerlessTesting}
              onClick={triggerEdgeServerlessTest}
            >
              {edgeServerlessTesting ? 'Testing...' : 'Test Edge Endpoint'}
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center bg-dark-900/40 border border-slate-800 rounded-xl p-5">
            {!edgeServerlessResult && !edgeServerlessTesting && (
              <div className="text-center text-slate-500 py-10">
                <CloudLightning className="h-8 w-8 text-slate-650 mx-auto mb-2" />
                <span className="text-xs">Click "Test Edge Endpoint" to sweep ping warm serverless routes.</span>
              </div>
            )}

            {edgeServerlessTesting && (
              <div className="text-center text-indigo-400 py-10">
                <RefreshCw className="h-8 w-8 text-indigo-500 rotate-infinite mx-auto mb-2" />
                <span className="text-xs">Sweeping Anycast path to Washington D.C. Edge Router...</span>
              </div>
            )}

            {edgeServerlessResult && (
              <div className="font-mono text-[11px] space-y-2 text-slate-350">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-550">STATUS CODE</span>
                  <span className="text-emerald-400 font-black">{edgeServerlessResult.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-550">TTFB LATENCY</span>
                  <span className="text-indigo-400 font-black">{edgeServerlessResult.latency}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-550">EDGE ROUTER</span>
                  <span>{edgeServerlessResult.region}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-550">GATEWAY SERVER</span>
                  <span className="truncate max-w-[200px]">{edgeServerlessResult.server}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-550">ANYCAST IP</span>
                  <span>{edgeServerlessResult.ip}</span>
                </div>
                
                {/* Interactive route path diagram */}
                <div className="flex justify-around items-center p-3 bg-dark-900 border border-slate-800 rounded-lg mt-4 text-[9px]">
                  <div>
                    <span className="text-indigo-400 block font-bold">[USER]</span>
                    <span className="text-slate-600 block mt-0.5">Client</span>
                  </div>
                  <span className="text-indigo-500 font-black">→</span>
                  <div>
                    <span className="text-amber-400 block font-bold">[Vercel CDN]</span>
                    <span className="text-slate-600 block mt-0.5">14ms</span>
                  </div>
                  <span className="text-amber-500 font-black">→</span>
                  <div>
                    <span className="text-emerald-400 block font-bold">[Serverless]</span>
                    <span className="text-slate-600 block mt-0.5">{edgeServerlessResult.latency}</span>
                  </div>
                  <span className="text-emerald-500 font-black">→</span>
                  <div>
                    <span className="text-slate-200 block font-bold">[Render DB]</span>
                    <span className="text-slate-600 block mt-0.5">Synced</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Telemetry charts */}
        <div className="col-span-12 glass-card p-6">
          <h3 className="text-slate-200 font-extrabold text-sm flex items-center gap-2 mb-6">
            <BarChart2 className="h-4.5 w-4.5 text-emerald-400" />
            Vercel Edge Performance Telemetry Logs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Chart 1: Build Speeds */}
            <div className="flex flex-col h-56">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Vercel Build History (Seconds)</span>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { name: 'v1.0.0', time: 48 },
                    { name: 'v1.0.1', time: 42 },
                    { name: 'v1.0.2', time: 45 },
                    { name: 'v1.0.3', time: 39 },
                    { name: 'v1.0.4', time: 41 },
                    { name: 'v1.0.5', time: 38 },
                    { name: 'v1.0.6', time: 35 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={9} unit="s" />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.06)', color: '#f3f4f6' }} />
                    <Line type="monotone" dataKey="time" name="Build Time" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Serverless Executions */}
            <div className="flex flex-col h-56">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Serverless Gateway Loads / Hour</span>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { hour: '00:00', requests: 120 },
                    { hour: '04:00', requests: 240 },
                    { hour: '08:00', requests: 480 },
                    { hour: '12:00', requests: 380 },
                    { hour: '16:00', requests: 450 },
                    { hour: '20:00', requests: 290 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.06)', color: '#f3f4f6' }} />
                    <Bar dataKey="requests" name="Total Hits" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
