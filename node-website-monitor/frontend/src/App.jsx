import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ShieldCheck, ShieldAlert, Activity, Cpu, Search, RefreshCw, AlertTriangle, AlertCircle, BellRing, Sun, Moon } from 'lucide-react';
import UptimeDashboard from './components/UptimeDashboard';
import WordPressDashboard from './components/WordPressDashboard';
import SSLMonitor from './components/SSLMonitor';
import SeoDashboard from './components/SeoDashboard';
import AccessibilityAudit from './components/AccessibilityAudit';
import SettingsPanel from './components/SettingsPanel';

const API_BASE = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '5173')
  ? 'http://localhost:5000/api'
  : 'https://monitoring-main-main1.onrender.com/api';

// Helper to normalize URLs for WebSocket event comparisons
const normalizeUrlString = (u) => {
  if (!u) return '';
  return u.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
};

export default function App() {
  const [url, setUrl] = useState('https://wordpress.org');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('uptime');
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Effect to toggle light/dark theme class on document.body dynamically
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  // Resilient client-side 15-second SRE auto-polling loop
  useEffect(() => {
    if (!autoRefresh || !url) return;

    const interval = setInterval(() => {
      fetchStats(urlRef.current);
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Ref to hold the latest url so the socket closures can access it without reconnects
  const urlRef = useRef(url);
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  // Custom Toast notification states
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch telemetry details from Express backend
  const fetchStats = async (targetUrl = url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/stats?url=${encodeURIComponent(targetUrl)}`);
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics. Please confirm the Express server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger an immediate, concurrent SRE audit run
  const handleRunAudit = async () => {
    if (!url) {
      showToast('Please specify a valid website URL', 'error');
      return;
    }

    setAuditLoading(true);
    showToast('Initiating concurrent SRE uptime & WordPress audits...', 'info');

    try {
      const response = await axios.post(`${API_BASE}/audit`, { url });
      if (response.data.success) {
        showToast('Immediate site SRE audit completed successfully!', 'success');
        // Refresh metrics
        await fetchStats(url);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Immediate audit execution failed.', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Establish Socket.io connection to backend SRE Gateway
    const socket = io();

    socket.on('connect', () => {
      console.log('📡 Connected to SRE WebSocket Broadcast Portal');
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from SRE WebSocket Broadcast Portal');
      setIsSocketConnected(false);
    });

    // Handle live micro-telemetry ping ticks
    socket.on('liveTelemetry', (beat) => {
      const normalizedCurrent = normalizeUrlString(urlRef.current);
      const normalizedBeat = normalizeUrlString(beat.url);

      if (normalizedCurrent === normalizedBeat) {
        setStats((prev) => {
          if (!prev) return prev;

          // Prepend new beat to history and keep last 30 entries
          const updatedHistory = [beat, ...prev.historyLog].slice(0, 30);

          return {
            ...prev,
            latestStatus: {
              ...prev.latestStatus,
              isUp: beat.isUp,
              statusCode: beat.statusCode,
              loadTimeMs: beat.loadTimeMs,
              ttfbMs: beat.ttfbMs,
              dnsResolutionTimeMs: beat.dnsResolutionTimeMs,
              checkedAt: beat.checkedAt
            },
            historyLog: updatedHistory
          };
        });
      }
    });

    // Handle full deep-audit completes (cron or manual run on another terminal)
    socket.on('auditCompleted', (freshStats) => {
      const normalizedCurrent = normalizeUrlString(urlRef.current);
      const normalizedAudit = normalizeUrlString(freshStats.url);

      if (normalizedCurrent === normalizedAudit) {
        setStats(freshStats);
        showToast('Real-time SRE audit synchronized!', 'success');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Map/align backend schema variables to the custom props structure requested by user
  if (stats) {
    if (!stats.sslData) stats.sslData = stats.latestStatus?.ssl;
    if (!stats.securityData) stats.securityData = stats.latestStatus?.security;
    if (!stats.seoData) stats.seoData = stats.latestStatus?.seo;
    if (!stats.uiUxData) stats.uiUxData = stats.latestStatus?.uiUx;
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-12 relative overflow-hidden">

      {/* Premium Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[55%] rounded-full bg-indigo-600/8 blur-[130px] pointer-events-none pulse-glow-indigo"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[50%] rounded-full bg-purple-600/8 blur-[130px] pointer-events-none pulse-glow-indigo" style={{ animationDelay: '-2s' }}></div>

      {/* Sleek Dark SRE Navigation Header */}
      <header className="bg-dark-800/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-650 to-indigo-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/25">
                M
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">MonitorPro</h1>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block -mt-1">Node SRE Module</span>
              </div>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800/60 transition-all text-slate-400 hover:text-slate-200 cursor-pointer shadow-sm hover:scale-105 duration-200"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400 animate-pulse" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>
          </div>

          {/* SRE Domain search filter bar */}
          <div className="flex-1 max-w-xl flex gap-2">
            <div className="flex-1 bg-dark-900 border border-slate-800/80 rounded-xl px-3.5 flex items-center gap-2 focus-within:border-indigo-500/70 transition-all shadow-inner">
              <Search className="text-slate-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Enter domain URL (e.g. wordpress.org)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-slate-200 placeholder-slate-600"
                onKeyDown={(e) => e.key === 'Enter' && fetchStats()}
              />
            </div>

            <button
              onClick={() => fetchStats()}
              disabled={loading || auditLoading}
              className="px-4 py-2 bg-dark-800 border border-slate-700/80 hover:bg-dark-700/60 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Filter
            </button>

            <button
              onClick={() => {
                setAutoRefresh(!autoRefresh);
                showToast(
                  !autoRefresh
                    ? '15s SRE auto-polling active.'
                    : 'Auto-polling disabled.',
                  'info'
                );
              }}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${autoRefresh
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-dark-800 border-slate-700/80 hover:bg-dark-700/60'
                }`}
            >
              <span>{autoRefresh ? 'Stop Monitor' : 'Auto-Monitor'}</span>
            </button>

            <button
              onClick={handleRunAudit}
              disabled={loading || auditLoading}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-550 hover:to-indigo-450 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${auditLoading ? 'rotate-infinite' : ''}`} />
              <span>{auditLoading ? 'Auditing...' : 'Audit Now'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Central workspace contents wrapper */}
      <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10">

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 text-sm animate-fade-in-up">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <strong>System Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Audit Target Status Header */}
        {stats && (
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-card p-6 rounded-2xl animate-fade-in-up">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">AUDIT TARGET SOURCE</span>
              <h2 className="text-xl font-extrabold text-slate-200 tracking-tight">{stats.url}</h2>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Core Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] mt-1.5 tracking-wider ${stats.latestStatus?.isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'}`}>
                  {stats.latestStatus?.isUp ? 'ACTIVE' : 'DOWN'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">WordPress Core</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] mt-1.5 tracking-wider ${stats.wordpress ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-slate-800 text-slate-400 border border-slate-750'}`}>
                  {stats.wordpress ? 'DETECTED' : 'NONE'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Module Switcher */}
        <div className="flex flex-wrap border-b border-slate-800/80 mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <button
            onClick={() => setActiveTab('uptime')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'uptime'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-250'
              }`}
          >
            Uptime & Error Logs
          </button>

          <button
            onClick={() => setActiveTab('wordpress')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'wordpress'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-250'
              }`}
          >
            WordPress CMS Diagnostics
          </button>

          <button
            onClick={() => setActiveTab('ssl')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'ssl'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-250'
              }`}
          >
            SSL & Security
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'seo'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-250'
              }`}
          >
            SEO Optimization
          </button>

          <button
            onClick={() => setActiveTab('accessibility')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'accessibility'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-250'
              }`}
          >
            UI Consistency & Accessibility
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-250'
              }`}
          >
            Gmail Alerts & Credentials
          </button>
        </div>

        {/* Dynamic tabs render panel */}
        {activeTab === 'settings' ? (
          <SettingsPanel showToast={showToast} />
        ) : loading && !stats ? (
          <div className="py-24 text-center animate-fade-in-up">
            <RefreshCw className="h-8 w-8 text-indigo-500 rotate-infinite mx-auto mb-4" />
            <h4 className="font-extrabold text-slate-300">Synchronizing SRE monitoring telemetry...</h4>
            <p className="text-xs text-slate-500 mt-1">Fetching local histories and alert logs from MongoDB</p>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {activeTab === 'uptime' && (
              <UptimeDashboard stats={stats} isSocketConnected={isSocketConnected} />
            )}
            {activeTab === 'wordpress' && (
              <WordPressDashboard wordpressData={stats.wordpress} />
            )}
            {activeTab === 'ssl' && (
              <SSLMonitor sslData={stats?.sslData} securityData={stats?.securityData} />
            )}
            {activeTab === 'seo' && (
              <SeoDashboard seoData={stats?.seoData} />
            )}
            {activeTab === 'accessibility' && (
              <AccessibilityAudit 
                uiUxData={stats?.uiUxData}
                mobileFriendliness={stats?.seoData?.mobileFriendliness}
              />
            )}
          </div>
        ) : (
          <div className="py-24 text-center glass-card border-dashed border-slate-800 rounded-3xl max-w-3xl mx-auto my-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Activity className="h-10 w-10 text-slate-650 mx-auto mb-4 animate-pulse" />
            <h4 className="font-extrabold text-slate-400">Auditer state is empty</h4>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">Please enter a valid website URL in the topbar above and click <strong className="text-indigo-455">Audit Now</strong> to launch crawler passes.</p>
          </div>
        )}

      </main>

      {/* Floating SRE toast alert card overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] animate-fade">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-bold ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              toast.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}>
            {toast.type === 'success' && <ShieldCheck className="h-4.5 w-4.5" />}
            {toast.type === 'error' && <AlertCircle className="h-4.5 w-4.5" />}
            {toast.type === 'info' && <BellRing className="h-4.5 w-4.5 animate-bounce" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
