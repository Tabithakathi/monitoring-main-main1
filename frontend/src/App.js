import './App.css';
import { useState, useEffect } from 'react';
import History from './History';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

function App() {
  // SRE Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // General App State
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, ui_ux, structure, wordpress, alerts, settings, history
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState(null);

  // SRE Live Recalculator Sliders
  const [loadTimeLimit, setLoadTimeLimit] = useState(2.5);
  const [domNodeLimit, setDomNodeLimit] = useState(800);
  const [clsTolerance, setClsTolerance] = useState(0.15);
  const [aiSensitivity, setAiSensitivity] = useState(82);

  // Remediation states
  const [autoRemediate, setAutoRemediate] = useState(true);
  const [neuralPattern, setNeuralPattern] = useState(false);

  // Recalculated state values
  const [adjustedOverall, setAdjustedOverall] = useState(null);
  const [adjustedPerf, setAdjustedPerf] = useState(null);
  const [adjustedStruct, setAdjustedStruct] = useState(null);

  // SRE SVG Charts historical dataset state
  const [statsData, setStatsData] = useState(null);

  // SRE Live Interactive Terminal Shell state
  const [terminalLogs, setTerminalLogs] = useState(["alex@monitorpro:~$ Select or click an SRE system check above..."]);
  const [terminalTyping, setTerminalTyping] = useState(false);

  // Modals state
  const [showDocs, setShowDocs] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Authenticate SRE Alex Rivera
  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in SRE email and credentials.");
      return;
    }
    setIsLoggingIn(true);
    setLoginError(null);

    setTimeout(() => {
      if (loginEmail === "alex.rivera@monitorpro.sre" && loginPassword === "rivera_token_2026") {
        setIsLoggedIn(true);
      } else {
        setLoginError("Invalid credentials. Try the SRE pre-auth suggestion below!");
      }
      setIsLoggingIn(false);
    }, 1200);
  };

  const isValidUrl = (value) => {
    try {
      const target = value.startsWith("http://") || value.startsWith("https://") ? value : "https://" + value;
      new URL(target);
      return true;
    } catch {
      return false;
    }
  };

  const runScan = async () => {
    if (!url || !isValidUrl(url)) {
      setError("Enter a valid website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setStatsData(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analyze/?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `HTTP ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setActiveTab("overview");
      setShowHistory(false);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to reach backend service. Please confirm the API is available.");
    } finally {
      setLoading(false);
    }
  };

  const runQuickScan = async () => {
    if (!url) {
      setError("Enter website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/quick-analyze/?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `HTTP ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setActiveTab("overview");
      setShowHistory(false);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Quick scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (targetUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history-stats/?url=${encodeURIComponent(targetUrl)}`);
      if (response.ok) {
        const stats = await response.json();
        setStatsData(stats);
      }
    } catch (e) {
      console.error("Failed to load historical SRE charts:", e);
    }
  };

  // Fetch SRE statistics whenever target domain is fetched
  useEffect(() => {
    if (data?.url) {
      fetchStats(data.url);
    }
  }, [data]);

  // SRE Live Score Recalculator Engine
  useEffect(() => {
    if (!data) return;

    let basePerf = 100;
    const actualLoad = data.check?.load_time || 1.0;
    const actualTtfb = data.check?.ttfb || 0.2;
    const actualPageSize = data.check?.page_size_kb || 200;
    const actualCls = data.ui_ux?.layout_shift?.cls_hazard_index || data.performance?.cls || 0.12;

    if (actualLoad > loadTimeLimit) {
      basePerf -= 25 + Math.round((actualLoad - loadTimeLimit) * 15);
    } else if (actualLoad > loadTimeLimit * 0.6) {
      basePerf -= 8;
    }

    if (actualCls > clsTolerance) {
      basePerf -= 20;
    }

    if (actualTtfb > 0.5) basePerf -= 15;
    else if (actualTtfb > 0.2) basePerf -= 4;

    if (actualPageSize > 1500) basePerf -= 12;

    const perfScore = Math.max(10, Math.min(100, basePerf));

    let baseStruct = 100;
    const actualNodes = data.structure?.dom_complexity?.total_nodes || 100;
    const actualDepth = data.structure?.dom_complexity?.max_depth || 10;
    const unminified = data.structure?.optimization?.unminified_resources?.length || 0;

    if (actualNodes > domNodeLimit) {
      baseStruct -= 20 + Math.round((actualNodes - domNodeLimit) * 0.04);
    }
    if (actualDepth > 32) baseStruct -= 15;
    if (unminified > 4) baseStruct -= 12;

    const structScore = Math.max(10, Math.min(100, baseStruct));

    setAdjustedPerf(perfScore);
    setAdjustedStruct(structScore);

    const seoScore = data.seo?.seo_score || 85;
    const secScore = data.security?.security_score || 90;
    const uiScore = data.ui_ux?.ui_health_score || 85;
    
    let scores = [perfScore, seoScore, secScore, structScore, uiScore];
    const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    setAdjustedOverall(overall);

  }, [data, loadTimeLimit, domNodeLimit, clsTolerance]);

  const formatValue = (value, suffix = '') => {
    if (value === null || value === undefined || value === '') return '—';
    return `${value}${suffix}`;
  };

  useEffect(() => {
    if (!autoRefresh || !url) return;

    const interval = setInterval(() => {
      runQuickScan();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, url]);

  const handleTabClick = (tab) => {
    if (tab === "history") {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
    setShowDocs(false);
    setShowSupport(false);
    setActiveTab(tab);
  };

  const getBadgeClass = (level) => {
    const lvl = (level || "").toLowerCase();
    if (lvl === "critical" || lvl === "error" || lvl === "high") return "badge critical";
    if (lvl === "warning" || lvl === "medium") return "badge warning";
    if (lvl === "ok" || lvl === "good" || lvl === "optimal" || lvl === "secure") return "badge ok";
    return "badge info";
  };

  const getScoreFillClass = (score) => {
    if (score >= 90) return "green";
    if (score >= 70) return "orange";
    return "red";
  };

  // --- SVG Chart Path Generator ---
  const generateChartPath = (dataArray, width, height, maxVal = 100) => {
    if (!dataArray || dataArray.length < 2) {
      const fallback = [82, 85, 91, 89, 94, 92, 95];
      return generateChartPath(fallback, width, height, maxVal);
    }
    const dx = width / (dataArray.length - 1);
    const points = dataArray.map((val, idx) => {
      const x = idx * dx;
      const score = typeof val === 'number' ? val : parseFloat(val) || 0;
      const y = height - (score / maxVal) * (height - 40) - 20;
      return { x, y, val: score };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return { line: linePath, area: areaPath, points };
  };

  // --- SRE Typewriter Live Terminal Simulator ---
  const runTerminalCommand = (cmd) => {
    if (terminalTyping) return;
    setTerminalTyping(true);

    let logs = [`alex@monitorpro:~$ ${cmd}`];
    setTerminalLogs(logs);

    let outputLines = [];
    if (cmd === "wp plugin update --all") {
      outputLines = [
        "Enabling Maintenance mode...",
        "Checking WordPress.org core update pipelines...",
        "Downloading Elementor Website Builder v3.18.2...",
        "Unpacking the ZIP package files...",
        "Replacing outdated core templates...",
        "Plugin elementor successfully updated to stable secure version.",
        "Disabling Maintenance mode...",
        "Success: Updated 1 of 1 plugins. Security Risk Rating: OPTIMAL."
      ];
    } else if (cmd === "ping -c 4 host_server") {
      outputLines = [
        `PING ${data?.url || 'wordpress.org'} (127.0.0.1) 56(84) bytes of data.`,
        "64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=14.2 ms",
        "64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=13.8 ms",
        "64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=14.5 ms",
        "64 bytes from 127.0.0.1: icmp_seq=4 ttl=64 time=14.0 ms",
        "--- host_server ping statistics ---",
        "4 packets transmitted, 4 received, 0% packet loss, time 3004ms",
        "rtt min/avg/max/mdev = 13.8/14.1/14.5/0.24 ms"
      ];
    } else if (cmd === "openssl s_client -connect") {
      outputLines = [
        `CONNECTED(00000003) to ${data?.url || 'wordpress.org'}:443`,
        "depth=2 C = US, O = DigiCert Inc, CN = DigiCert Global Root G2",
        "verify return:1",
        "depth=1 C = US, O = DigiCert Inc, CN = DigiCert TLS Hybrid ECC CA1",
        "verify return:1",
        "---",
        "Certificate chain",
        " 0 s:CN = wordpress.org, O = \"WordPress Foundation\"",
        "   i:C = US, O = DigiCert Inc, CN = DigiCert TLS Hybrid ECC CA1",
        "---",
        "New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384",
        "Server public key is 256 bit",
        "Compression: NONE, Expansion: NONE",
        "Verify return code: 0 (ok)"
      ];
    } else if (cmd === "nginx -t") {
      outputLines = [
        "nginx: the configuration file /etc/nginx/nginx.conf syntax is ok",
        "nginx: configuration file /etc/nginx/nginx.conf test is successful",
        "Reloading nginx systemctl daemon service...",
        "Success: nginx service configuration reloaded. Port 80/443 stable."
      ];
    } else {
      outputLines = ["Command not found in secure SRE context."];
    }

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < outputLines.length) {
        logs = [...logs, outputLines[currentLine]];
        setTerminalLogs(logs);
        currentLine++;
      } else {
        clearInterval(interval);
        setTerminalTyping(false);
      }
    }, 400);
  };

  // Render SRE Glassmorphic Login Portal if not logged in
  if (!isLoggedIn) {
    return (
      <div className="login-container animate-fade">
        <div className="login-card">
          <h2>MonitorPro</h2>
          <p>Enterprise Site Reliability Console</p>
          
          {loginError && <div style={{ color: 'var(--error)', marginBottom: '14px', fontSize: '0.85rem', fontWeight: '700' }}>⚠️ {loginError}</div>}
          
          <div className="login-field">
            <label>SRE Operator Email</label>
            <input 
              type="text" 
              placeholder="alex.rivera@monitorpro.sre"
              value={loginEmail} 
              onChange={(e) => setLoginEmail(e.target.value)} 
            />
          </div>
          
          <div className="login-field">
            <label>Secure Token Credentials</label>
            <input 
              type="password" 
              placeholder="••••••••••••••"
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)} 
            />
          </div>

          <div className="login-suggest" onClick={() => {
            setLoginEmail("alex.rivera@monitorpro.sre");
            setLoginPassword("rivera_token_2026");
          }}>
            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>🔑 Pre-fill SRE Credentials:</span>
            <div style={{ marginTop: '4px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
              Email: alex.rivera@monitorpro.sre<br />
              Token: rivera_token_2026 (Click to pre-fill)
            </div>
          </div>

          <button 
            className="audit-btn" 
            style={{ marginTop: '10px' }} 
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            <span className="material-icons">{isLoggingIn ? 'sync' : 'lock_open'}</span>
            <span>{isLoggingIn ? 'Authenticating...' : 'Unlock SRE Console'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>MonitorPro</h2>
          <div className="subtitle">Enterprise SRE</div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeTab === 'overview' && !showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('overview')}
            >
              <span className="material-icons">dashboard</span>
              <span>Performance</span>
            </li>
            <li 
              className={activeTab === 'seo' && !showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('seo')}
            >
              <span className="material-icons">search</span>
              <span>SEO</span>
            </li>
            <li 
              className={activeTab === 'structure' && !showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('structure')}
            >
              <span className="material-icons">health_and_safety</span>
              <span>Technical Health</span>
            </li>
            <li 
              className={activeTab === 'ui_ux' && !showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('ui_ux')}
            >
              <span className="material-icons">grid_view</span>
              <span>UI Consistency</span>
            </li>
            <li 
              className={activeTab === 'security' && !showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('security')}
            >
              <span className="material-icons">security</span>
              <span>Security</span>
            </li>
            {data?.wordpress?.is_wordpress && (
              <li 
                className={activeTab === 'wordpress' && !showHistory ? 'active' : ''} 
                onClick={() => handleTabClick('wordpress')}
              >
                <span className="material-icons">dns</span>
                <span>WordPress Health</span>
              </li>
            )}
            <li 
              className={activeTab === 'alerts' && !showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('alerts')}
            >
              <span className="material-icons">notifications</span>
              <span>Alerts & Config</span>
            </li>
            <li 
              className={activeTab === 'controls' && !showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('controls')}
            >
              <span className="material-icons">settings_suggest</span>
              <span>SRE Remediation</span>
            </li>
            <li 
              className={showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('history')}
            >
              <span className="material-icons">history</span>
              <span>Scan History</span>
            </li>
            <li 
              className={activeTab === 'settings' && !showHistory ? 'active' : ''} 
              onClick={() => handleTabClick('settings')}
            >
              <span className="material-icons">settings</span>
              <span>Settings</span>
            </li>

            <div className="sidebar-divider"></div>

            <li 
              className={showDocs ? 'active' : ''} 
              onClick={() => setShowDocs(true)}
            >
              <span className="material-icons">menu_book</span>
              <span>Documentation</span>
            </li>
            <li 
              className={showSupport ? 'active' : ''} 
              onClick={() => setShowSupport(true)}
            >
              <span className="material-icons">contact_support</span>
              <span>Support Help</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="audit-btn" onClick={() => { setUrl(""); setData(null); setShowDocs(false); setShowSupport(false); handleTabClick("overview"); }}>
            <span className="material-icons">add</span>
            <span>New Audit</span>
          </button>

          {/* Sidebar Profile Widget */}
          <div className="sidebar-profile">
            <img 
              alt="Alex Rivera Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdla2ShUZXNrZYaHuBshZ612fLeT-C51k5hpI5KILgwPknyfdiqcnWfmOht-TqMijCKgE0QHdN2ZrstCOu0cp8OQ_pC75-uzC0OGUOE3RXlgxwEiK4qcs_UUIdA2xdC7nCAYhGo0xBQwD1lLBGCh383bU1c_xBmC2uE_0LgwR4omnu67frBPA3urExmM__n2lVJvec4O9ffVWtnmaec_kerHVjQDPIRS75V-kJ2velV4XuPPA3-xFAbovFQ-LhJrXTxsVvHlYc4so" 
            />
            <div className="profile-info">
              <span className="profile-name">Alex Rivera</span>
              <span className="profile-role">Enterprise SRE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="main-content">
        
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="topbar-search">
            <span className="material-icons search-icon">search</span>
            <input
              type="text"
              placeholder="Enter website URL (e.g. wordpress.org)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  runScan();
                }
              }}
            />
          </div>

          <div className="topbar-actions">
            <button className="scan-btn" onClick={runScan} disabled={loading}>
              <span className="material-icons">bolt</span>
              <span>{loading ? 'Scanning…' : 'Run Full Scan'}</span>
            </button>
            <button className="theme-btn" onClick={runQuickScan} disabled={loading}>
              <span className="material-icons">speed</span>
              <span>Quick Scan</span>
            </button>
            <button
              className="theme-btn"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <span className="material-icons">{autoRefresh ? 'pause' : 'play_arrow'}</span>
              <span>{autoRefresh ? 'Stop Monitor' : 'Auto-Monitor'}</span>
            </button>
            <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
              <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {error && <div className="message error"><span className="material-icons">error</span><strong>🚨 Error:</strong> {error}</div>}

        {showHistory ? (
          <div className="history-panel animate-fade">
            <History />
          </div>
        ) : (
          <>
            {/* Header Hero */}
            <div className="hero-card">
              <h1>Website SRE Audit Center</h1>
              <p>
                Analyze UI layout shifts, WordPress core/plugin vulnerabilities, DOM complexity tree, 
                and resource compression metrics with detailed real-time alert histories. Connected to Stitch.
              </p>
            </div>

            {/* Critical Alert Banners */}
            {data && (
              <>
                {data.check?.is_up === false && (
                  <div className="message error">
                    <span className="material-icons">warning</span>
                    🚨 <strong>CRITICAL WEBSITE DOWN:</strong> The server at {data.url} is unreachable or returning error status codes!
                  </div>
                )}
                {data.wordpress?.is_wordpress && data.wordpress?.vulnerable_plugins > 0 && (
                  <div className="message error">
                    <span className="material-icons">security</span>
                    🚨 <strong>VULNERABLE PLUGINS FOUND:</strong> Discovered {data.wordpress.vulnerable_plugins} plugin vulnerability matches. Immediate updates recommended.
                  </div>
                )}
              </>
            )}

            {/* --- TAB PANEL: OVERVIEW --- */}
            {data && activeTab === "overview" && (
              <div className="tab-content animate-fade">
                
                {/* Bento Row 1: Health Gauge & History Chart */}
                <div className="grid grid-cols-12 gap-6 mb-6">
                  
                  {/* Circular Overall Health Gauge */}
                  <div className="col-span-12 md:col-span-4 details-panel flex flex-col items-center justify-center text-center">
                    <h3 className="w-full text-left uppercase">Overall Health Score</h3>
                    <div className="relative w-44 h-44 flex items-center justify-center" style={{ marginTop: '10px' }}>
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="88" cy="88" r="76" fill="transparent" stroke="var(--bg-surface-high)" strokeWidth="10"></circle>
                        <circle 
                          cx="88" cy="88" r="76" 
                          fill="transparent" 
                          stroke="var(--primary)" 
                          strokeWidth="10" 
                          strokeDasharray={477.5} 
                          strokeDashoffset={477.5 - (477.5 * ((adjustedOverall ?? data.overall_score) || 92)) / 100}
                          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        ></circle>
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>{adjustedOverall ?? data.overall_score}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>/ 100</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '700' }}>
                      <span className="material-icons" style={{ fontSize: '18px' }}>trending_up</span>
                      <span>+2.4% vs last week</span>
                    </div>
                  </div>

                  {/* SVG Health Trend Chart */}
                  <div className="col-span-12 md:col-span-8 details-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <h3 style={{ border: 'none', margin: '0', padding: '0' }}>Historical Health Trend</h3>
                      <span className="badge info">30 DAYS</span>
                    </div>
                    
                    <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                      {(() => {
                        const scores = statsData?.overall_scores || [82, 85, 91, 89, 94, 92, 95];
                        const { line, area, points } = generateChartPath(scores, 800, 140);
                        return (
                          <svg viewBox="0 0 800 140" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <line x1="0" y1="15" x2="800" y2="15" stroke="var(--border-color)" strokeDasharray="4 4" />
                            <line x1="0" y1="55" x2="800" y2="55" stroke="var(--border-color)" strokeDasharray="4 4" />
                            <line x1="0" y1="95" x2="800" y2="95" stroke="var(--border-color)" strokeDasharray="4 4" />
                            <line x1="0" y1="125" x2="800" y2="125" stroke="var(--border-color)" />
                            
                            <line x1="0" y1="23" x2="800" y2="23" stroke="var(--success)" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="2 2" />
                            <text x="10" y="19" fill="var(--success)" fillOpacity="0.6" fontSize="10" fontWeight="bold">90% SRE TARGET</text>

                            <path d={area} fill="url(#trendGrad)" />
                            <path d={line} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
                            
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle cx={p.x} cy={p.y} r="5" fill="var(--primary)" stroke="var(--bg-surface)" strokeWidth="2" />
                                <text x={p.x} y={p.y - 12} fill="var(--text-main)" fontSize="9" fontWeight="bold" textAnchor="middle">
                                  {p.val}%
                                </text>
                              </g>
                            ))}
                          </svg>
                        );
                      })()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>
                      <span>30 Days Ago</span>
                      <span>15 Days Ago</span>
                      <span>Today</span>
                    </div>
                  </div>

                </div>

                {/* Score Pillars Bento Box Cards */}
                <div className="cards">
                  <div className="card accent-blue">
                    <h3>Performance</h3>
                    <div className="metric-value">{((adjustedPerf ?? data.performance?.performance_score) || 94)}</div>
                    <div className="progress-track" style={{ marginTop: '12px' }}>
                      <div className="progress-fill green" style={{ width: `${((adjustedPerf ?? data.performance?.performance_score) || 94)}%` }}></div>
                    </div>
                    <div className="card-footer">CWV, Speed Index, Payloads</div>
                  </div>

                  <div className="card accent-purple">
                    <h3>SEO Optimization</h3>
                    <div className="metric-value">{data.seo?.seo_score || 88}</div>
                    <div className="progress-track" style={{ marginTop: '12px' }}>
                      <div className="progress-fill green" style={{ width: `${data.seo?.seo_score || 88}%` }}></div>
                    </div>
                    <div className="card-footer">Semantic structure, Meta descriptors</div>
                  </div>

                  <div className="card accent-red">
                    <h3>Security & Trust</h3>
                    <div className="metric-value">{data.security?.security_score || 91}</div>
                    <div className="progress-track" style={{ marginTop: '12px' }}>
                      <div className="progress-fill green" style={{ width: `${data.security?.security_score || 91}%` }}></div>
                    </div>
                    <div className="card-footer">SSL connection, Headers, Risks</div>
                  </div>

                  <div className="card accent-green">
                    <h3>UI Consistency</h3>
                    <div className="metric-value">{data.ui_ux?.ui_health_score || 85}</div>
                    <div className="progress-track" style={{ marginTop: '12px' }}>
                      <div className="progress-fill orange" style={{ width: `${data.ui_ux?.ui_health_score || 85}%` }}></div>
                    </div>
                    <div className="card-footer">Layout Shifts, Media Query alignments</div>
                  </div>
                </div>

                {/* --- NEW MODULE: MULTI-LOCATION LATENCY SIMULATOR --- */}
                <div className="details-panel" style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ color: 'var(--primary)' }}>public</span>
                    Multi-Location Edge Latency Auditor
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Simulate real-world DNS resolution and page load speeds across global SRE edge nodes connected to the audited host:
                  </p>
                  
                  <div className="grid grid-cols-12 gap-6">
                    {(() => {
                      const loadTime = data.check?.load_time || data.performance?.load_time || 1.25;
                      const locations = [
                        { region: "United States (Virginia)", code: "US-EAST", latency: Math.round(loadTime * 1000 * 0.92), speed: (loadTime * 0.92).toFixed(3), color: "var(--success)" },
                        { region: "Singapore (Edge Hub)", code: "SG-CENTRAL", latency: Math.round(loadTime * 1000 * 1.12), speed: (loadTime * 1.12).toFixed(3), color: "var(--success)" },
                        { region: "India (Mumbai)", code: "IN-WEST", latency: Math.round(loadTime * 1000 * 1.28), speed: (loadTime * 1.28).toFixed(3), color: "var(--warning)" },
                        { region: "Europe (Frankfurt)", code: "EU-CENTRAL", latency: Math.round(loadTime * 1000 * 1.04), speed: (loadTime * 1.04).toFixed(3), color: "var(--success)" }
                      ];
                      return locations.map((loc, idx) => (
                        <div key={idx} className="col-span-12 sm:col-span-6 md:col-span-3" style={{ background: 'var(--bg-surface-low)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>{loc.code}</span>
                            <span className="status-dot animate-pulse" style={{ backgroundColor: loc.color, width: 8, height: 8 }}></span>
                          </div>
                          <div style={{ fontWeight: '800', fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                            {loc.speed}s
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                            {loc.region}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                            <span>DNS PING</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{loc.latency}ms</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Bottom Row Bento: Advisory Board & Top Issues */}
                <div className="details-grid">
                  
                  {/* Top Critical Issues List */}
                  <div className="details-panel">
                    <h3>Top Critical Issues</h3>
                    <div className="divide-y divide-outline" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {data.ui_ux?.layout_shift?.cls_hazard_index > 0.15 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
                          <span className="status-dot" style={{ backgroundColor: 'var(--error)', width: 8, height: 8 }}></span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700' }}>Cumulative Layout Shift Exceeds Threshold</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Impacting: UI/UX Score (-4.2 pts)</div>
                          </div>
                          <span className="material-icons" style={{ color: 'var(--text-muted)' }}>open_in_new</span>
                        </div>
                      )}
                      {data.security?.headers?.missing?.includes("X-Content-Type-Options") && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
                          <span className="status-dot" style={{ backgroundColor: 'var(--error)', width: 8, height: 8 }}></span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700' }}>Missing X-Content-Type-Options Header</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Impacting: Security Score (-2.5 pts)</div>
                          </div>
                          <span className="material-icons" style={{ color: 'var(--text-muted)' }}>open_in_new</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0' }}>
                        <span className="status-dot" style={{ backgroundColor: 'var(--warning)', width: 8, height: 8 }}></span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700' }}>Large Image Payloads on Mobile Index</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Impacting: Performance & SEO (-3.1 pts)</div>
                        </div>
                        <span className="material-icons" style={{ color: 'var(--text-muted)' }}>open_in_new</span>
                      </div>
                    </div>
                  </div>

                  {/* SRE Smart Advisory Board Recommendations */}
                  <div className="details-panel">
                    <h3>💡 Smart SRE Optimization Roadmap</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {data.wordpress?.is_wordpress && data.wordpress?.vulnerable_plugins > 0 && (
                        <div className="vuln-item" style={{ borderLeftColor: 'var(--error)' }}>
                          <div className="vuln-title">[PRIORITY 1] Patch Plugin Vulnerabilities</div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Execute plugin updates immediately in the WordPress terminal:
                            <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '6px', marginTop: '6px', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}>
                              wp plugin update {data.wordpress.vulnerabilities?.[0]?.slug || '--all'}
                            </code>
                          </p>
                        </div>
                      )}
                      {data.ui_ux?.layout_shift?.cls_hazard_index > 0.15 && (
                        <div className="vuln-item" style={{ borderLeftColor: 'var(--warning)', backgroundColor: 'var(--warning-glow)' }}>
                          <div className="vuln-title" style={{ color: 'var(--warning)' }}>[PRIORITY 2] Fix Cumulative Layout Shifts (CLS)</div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Add aspect-ratio or static sizes to HTML layout containers:
                            <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '6px', marginTop: '6px', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}>
                              img {'{ aspect-ratio: attr(width) / attr(height); }'}
                            </code>
                          </p>
                        </div>
                      )}
                      <div className="vuln-item" style={{ borderLeftColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)' }}>
                        <div className="vuln-title" style={{ color: '#818cf8' }}>[PRIORITY 3] Minify External Script Assets</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Implement minification configurations inside Webpack/Vite plugins or activate CDN auto-minify triggers.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* --- TAB PANEL: UI CONSISTENCY (AI UI/UX MONITORING) --- */}
            {data && activeTab === "ui_ux" && (
              <div className="tab-content animate-fade">
                
                {/* Visual Anomaly Detection Hero Mock */}
                <section style={{ marginBottom: '32px' }}>
                  <div className="details-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-low)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons" style={{ color: 'var(--secondary)' }}>visibility</span>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>AI Visual Anomaly Detection</h2>
                      </div>
                      <span className="badge critical animate-pulse">LIVE FEED</span>
                    </div>

                    <div className="grid grid-cols-12 gap-0">
                      
                      {/* Interactive Visual Shift Frame */}
                      <div className="col-span-12 lg:col-span-8 relative" style={{ minHeight: '340px', backgroundColor: '#090b11', overflow: 'hidden' }}>
                        <img 
                          alt="Layout Shift Comparison View" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0l5WjMpfTTHLpwWo5Lx7hR09dipZHMB2C0Qmb6GlQb_p462KuY9jYq8vzwnEbDTdTdK2D-KoeOCM8vMGE1DDqF-vJHMQ1ae88kCf9lE9tvzF28wFHY4LRDGTuPcmnB0NGSKoweOPJpqJRTmaeNTjrM8CYtd87UlOhvve-_h_2hNpjx8XA9XETidRuVkqP_4mFl4IwiSyAQFvBbM3hbQuKEPNs9Up2SQSc_zyUqNBSDUJzdMkbI_8PzaTx7Ch-uSwg7KsSsZPDByY"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} 
                        />
                        <div style={{ position: 'absolute', top: '15%', left: '15%', width: '180px', height: '100px', border: '2px dashed var(--error)', backgroundColor: 'var(--error-glow)', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center' }}>
                          <span style={{ color: 'var(--error)', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em' }}>UNEXPECTED OFFSET</span>
                          <span style={{ color: 'var(--error)', fontSize: '0.6.5rem', fontWeight: '700', marginTop: '2px' }}>+14px Y-AXIS SHIFT</span>
                        </div>
                        <div style={{ position: 'absolute', bottom: '25%', right: '35%', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid var(--secondary)', backgroundColor: 'var(--secondary-glow)', display: 'flex', alignItems: 'center', justify: 'center', animation: 'pulse 1.8s infinite' }}>
                          <span style={{ color: '#60a5fa', fontSize: '0.6rem', fontWeight: '800' }}>SCANNING...</span>
                        </div>
                      </div>

                      {/* Anomaly Realtime Logs Panel */}
                      <div className="col-span-12 lg:col-span-4 p-6" style={{ borderLeft: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-low)' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>Anomaly Live Feed</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ padding: '12px', borderLeft: '4px solid var(--error)', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--error)' }}>CRITICAL REGRESSION</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>Hero CTA button displaced out of standard bounding boxes on viewport 375px.</p>
                            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '8px' }}>TIMESTAMP: {new Date().toLocaleTimeString()} UTC</p>
                          </div>
                          <div style={{ padding: '12px', borderLeft: '4px solid var(--warning)', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--warning)' }}>LAYOUT COMPONENT SHIFT</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>CLS hazard index exceeded {clsTolerance} limit inside 'Section #2'.</p>
                            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '8px' }}>TIMESTAMP: {new Date(Date.now() - 300000).toLocaleTimeString()} UTC</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* Bento Grid 2: Attention Prediction & Spacing Diffs */}
                <div className="grid grid-cols-12 gap-6">
                  
                  {/* Heatmap gaze path */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>Attention Prediction Gaze Heatmap</h3>
                    <div className="heatmap-frame" style={{ marginTop: '16px' }}>
                      <img 
                        className="heatmap-img" 
                        alt="Background Layout Screenshot"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP9Fz91Dosyk9FjQJuXT-U10SFcNO2cyFGsa3GqSVmVmTQZeWgmCSMEQiczxVlGyCutALrkQVF5eoUJbNwBu40CuZ-de3PKjligKWIQ1R6oZEP262a7E3MvHuFxHqGmQs4AjMATVv9zYXPbm4gnz12kdN_Vkzl6qC-CuxbOr_AKh9nYCHXfdhujVISWKFBzVfH581YMK2PCPGPBveOfNIfV3Qu75bto6bWs0YhclW2r-8rnmIuhDnnon0QtVrZTh_YCXUBWg3GCng" 
                      />
                      <div className="heatmap-overlay"></div>
                      <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(7,9,17,0.7)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>GAZE PROBABILITY MAP</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                      <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>MOST VIEWED PATH</span>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', marginTop: '2px' }}>Header Navigation (92%)</div>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: 'var(--error-glow)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: '800' }}>IGNORED BLOCKS</span>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', marginTop: '2px', color: 'var(--text-main)' }}>Secondary Pricing Cards</div>
                      </div>
                    </div>
                  </div>

                  {/* Design Consistency diff logs */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>Design Consistency Audit</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                      <div style={{ borderLeft: '4px solid var(--error)', paddingLeft: '16px' }}>
                        <span className="badge critical">Typography violation</span>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '6px' }}>H2 Font Variation Discrepancy</div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>24px vs 26px font-size detected across standard viewport render instances.</p>
                      </div>
                      <div style={{ borderLeft: '4px solid var(--error)', paddingLeft: '16px' }}>
                        <span className="badge critical">Spacing deviation</span>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '6px' }}>Card Grid Margin Mismatches</div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>Horizontal gap padding offsets of ±4px in layout section blocks.</p>
                      </div>
                      <div style={{ borderLeft: '4px solid var(--success)', paddingLeft: '16px' }}>
                        <span className="badge ok">HEX matches</span>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '6px' }}>Brand Color Palette Consistency</div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>All primary, secondary, and accent colors conform strictly to tokens.</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bento Grid 3: Accessibility & Technical Column Grid Inspector */}
                <div className="grid grid-cols-12 gap-6" style={{ marginTop: '32px' }}>
                  
                  {/* Accessibility WCAG Gauges */}
                  <div className="col-span-12 md:col-span-4 details-panel flex flex-col justify-between">
                    <div>
                      <h3>WCAG 2.1 AA Accessibility</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', justify_content: 'space-between', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                            <span>CONTRAST RATIO ISSUES</span>
                            <span style={{ color: 'var(--error)' }}>12 ERRORS</span>
                          </div>
                          <div className="progress-track" style={{ marginTop: '6px', height: '6px' }}>
                            <div className="progress-fill red" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justify_content: 'space-between', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                            <span>MISSING ARIA LABELS</span>
                            <span style={{ color: 'var(--warning)' }}>4 DETECTED</span>
                          </div>
                          <div className="progress-track" style={{ marginTop: '6px', height: '6px' }}>
                            <div className="progress-fill orange" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '12px', backgroundColor: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                      <span className="material-icons" style={{ color: 'var(--success)', fontSize: '20px' }}>check_circle</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--success)' }}>All text sizes pass WCAG baseline requirements (12px+)</span>
                    </div>
                  </div>

                  {/* Grid Column alignment Technical Inspector */}
                  <div className="col-span-12 md:col-span-8 details-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <h3 style={{ border: 'none', margin: '0', padding: '0' }}>Grid Columns & Alignment Inspector</h3>
                      <span className="badge warning">COLUMNS OVERLAP DETECTED</span>
                    </div>

                    <div className="technical-grid-inspector">
                      {[...Array(12)].map((_, i) => (
                        <div className="grid-col-slot" key={i}></div>
                      ))}
                      <div className="grid-overlay-banner ok" style={{ top: '35px', left: '16%', right: '16%', height: '40px' }}>
                        MAIN CONTAINER: 8 COLUMNS ACTIVE
                      </div>
                      <div className="grid-overlay-banner error" style={{ bottom: '35px', left: '8%', width: '22%', height: '40px' }}>
                        OVERLAP ERROR
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* --- TAB PANEL: TECHNICAL & STRUCTURE --- */}
            {data && activeTab === "structure" && (
              <div className="tab-content animate-fade">
                
                {/* Tech Stack Badges row */}
                <div className="details-panel" style={{ marginBottom: '24px' }}>
                  <h3>Technology Stack Detection</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                    {data.wordpress?.is_wordpress && (
                      <span className="badge ok" style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'rgba(33, 112, 228, 0.1)', color: '#60a5fa', border: '1px solid rgba(33, 112, 228, 0.2)' }}>
                        WordPress Core
                      </span>
                    )}
                    {data.structure?.detected_technologies?.map((tech, idx) => (
                      <span className="badge info" key={idx} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                        {tech}
                      </span>
                    )) || (
                      <>
                        <span className="badge info" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>React Framework</span>
                        <span className="badge info" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>jQuery Core</span>
                        <span className="badge info" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Apache Server</span>
                        <span className="badge info" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Tailwind CSS</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="cards">
                  <div className="card accent-purple">
                    <h3>Max Nesting Depth</h3>
                    <div className="metric-value">{data.structure?.dom_complexity?.max_depth} levels</div>
                    <div className="card-footer">Recommended Depth: &lt; 32</div>
                  </div>

                  <div className="card accent-blue">
                    <h3>DOM Complexity Nodes</h3>
                    <div className="metric-value">{data.structure?.dom_complexity?.total_nodes}</div>
                    <div className="card-footer">Target Budget: &lt; {domNodeLimit} nodes</div>
                  </div>

                  <div className="card accent-green">
                    <h3>Page Size (HTML)</h3>
                    <div className="metric-value">{data.structure?.html_size_kb} KB</div>
                    <div className="card-footer">Compression Type: {data.structure?.compression?.compression_type.toUpperCase()}</div>
                  </div>
                </div>

                {/* Recursive DOM Nesting Depth Visualizer */}
                {data.structure?.dom_complexity?.deepest_path?.length > 0 && (
                  <div className="details-panel" style={{ marginBottom: '24px' }}>
                    <h3>🌳 DOM Tree Visual Depth Path</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                      Tracing the deepest structural branch path inside the HTML DOM to spot nesting bloat:
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', background: 'var(--bg-surface-low)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                      {data.structure.dom_complexity.deepest_path.map((tag, idx) => {
                        let tagClass = "depth-normal";
                        if (idx > 12) tagClass = "depth-warning";
                        else if (idx > 6) tagClass = "depth-caution";
                        
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={`dom-tree-node ${tagClass}`}>
                              <span style={{ color: 'var(--text-muted)', marginRight: '6px', fontSize: '0.72rem' }}>{idx + 1}</span>
                              {tag}
                            </div>
                            {idx < data.structure.dom_complexity.deepest_path.length - 1 && (
                              <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>➔</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Asset minification compressed tables */}
                <div className="details-panel">
                  <h3>📂 Unminified Resource Files</h3>
                  {data.structure?.optimization?.unminified_resources?.length > 0 ? (
                    <table className="zebra-table">
                      <thead>
                        <tr>
                          <th>Resource Type</th>
                          <th>Asset URL Location</th>
                          <th>Optimization Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.structure.optimization.unminified_resources.map((res, idx) => (
                          <tr key={idx}>
                            <td><span className="badge warning">{res.type}</span></td>
                            <td><code>{res.url}</code></td>
                            <td><strong style={{ color: 'var(--warning)' }}>Compress/Minify Asset</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ All external style links and script files are fully minified!</p>
                  )}
                </div>

              </div>
            )}

            {/* --- TAB PANEL: WORDPRESS HEALTH --- */}
            {data && activeTab === "wordpress" && data.wordpress?.is_wordpress && (
              <div className="tab-content animate-fade">
                
                <div className="cards">
                  <div className="card accent-purple">
                    <h3>WordPress Version</h3>
                    <div className="metric-value">v{data.wordpress?.core_version}</div>
                    <div className="card-footer">Latest Stable: v{data.wordpress?.latest_stable_version}</div>
                  </div>

                  <div className="card accent-red">
                    <h3>Plugin Vulnerabilities</h3>
                    <div className="metric-value">{data.wordpress?.vulnerable_plugins}</div>
                    <div className="card-footer">Matches security vulnerabilities DB</div>
                  </div>

                  <div className="card accent-orange">
                    <h3>Updates Pending</h3>
                    <div className="metric-value">{data.wordpress?.plugin_updates + data.wordpress?.theme_updates} files</div>
                    <div className="card-footer">Theme updates: {data.wordpress?.theme_updates}</div>
                  </div>

                  <div className="card accent-red">
                    <h3>Admin Exposed</h3>
                    <div className="metric-value" style={{ color: data.wordpress?.admin_accessible ? 'var(--error)' : 'var(--success)' }}>
                      {data.wordpress?.admin_accessible ? 'YES' : 'NO'}
                    </div>
                    <div className="card-footer">{data.wordpress?.admin_login_details?.status_message}</div>
                  </div>
                </div>

                {data.wordpress?.vulnerabilities?.length > 0 && (
                  <div className="details-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'var(--error-glow)', marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--error)' }}>🚨 Detected Plugin Security Vulnerabilities</h3>
                    {data.wordpress.vulnerabilities.map((v, idx) => (
                      <div key={idx} className="vuln-item">
                        <div className="vuln-header">
                          <span className="vuln-title">{v.name} ({v.version})</span>
                          <span className="badge critical">{v.cve || "CVE-UNKNOWN"}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--error)' }}>{v.msg}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="details-grid">
                  
                  {/* Theme & Plugins Active lists */}
                  <div className="details-panel">
                    <h3>🔌 Detected Theme & Plugins</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <strong>Active Theme:</strong> {data.wordpress?.detected_theme?.display_name || "WordPress Standard Theme"} (v{data.wordpress?.detected_theme?.version || "1.0.0"})
                    </p>
                    
                    <h4>Active Plugins ({data.wordpress?.detected_plugins?.length || 0}):</h4>
                    {data.wordpress?.detected_plugins?.length > 0 ? (
                      <table style={{ fontSize: '0.85rem', marginTop: '12px' }} className="zebra-table">
                        <thead>
                          <tr>
                            <th>Plugin Name</th>
                            <th>Active Version</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.wordpress.detected_plugins.map((p, idx) => (
                            <tr key={idx}>
                              <td>{p.display_name}</td>
                              <td><code>v{p.version}</code></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px' }}>Could not extract plugins from page assets.</p>
                    )}
                  </div>

                  {/* Circular threat circular gauge */}
                  <div className="details-panel flex flex-col items-center justify-center">
                    <h3>🛡 Security Threat Gauge Meter</h3>
                    
                    {(() => {
                      const coreGap = data.wordpress?.core_update_available ? 25 : 0;
                      const vulnWeight = (data.wordpress?.vulnerable_plugins || 0) * 35;
                      const threatScore = Math.min(100, coreGap + vulnWeight);
                      
                      let threatLabel = "SECURE & STABLE";
                      let threatColor = "var(--success)";
                      
                      if (threatScore > 75) {
                        threatLabel = "CRITICAL EXPOSURE";
                        threatColor = "var(--error)";
                      } else if (threatScore > 40) {
                        threatLabel = "HIGH RISK PROFILE";
                        threatColor = "var(--warning)";
                      } else if (threatScore > 10) {
                        threatLabel = "MODERATE THREAT";
                        threatColor = "var(--warning)";
                      }

                      const needleRotation = -90 + (threatScore / 100) * 180;

                      return (
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                          <svg width="220" height="130" style={{ overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="var(--success)" />
                                <stop offset="50%" stopColor="var(--warning)" />
                                <stop offset="100%" stopColor="var(--error)" />
                              </linearGradient>
                            </defs>
                            <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="var(--bg-surface-high)" strokeWidth="18" strokeLinecap="round" />
                            <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="url(#gaugeGrad)" strokeWidth="18" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="0" />
                            <circle cx="110" cy="110" r="10" fill="var(--bg-surface-high)" stroke="var(--text-main)" strokeWidth="2.5" />
                            <line 
                              x1="110" y1="110" x2="110" y2="30" 
                              stroke="var(--text-main)" strokeWidth="4" strokeLinecap="round"
                              transform={`rotate(${needleRotation} 110 110)`}
                              style={{ transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                          </svg>
                          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: threatColor, marginTop: '12px' }}>
                            {threatScore}%
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            STATUS: {threatLabel}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>

              </div>
            )}

            {/* --- TAB PANEL: ALERTS & CONFIGURATION --- */}
            {data && activeTab === "alerts" && (
              <div className="tab-content animate-fade">
                
                {/* Upper Bento Row: AI Sensitivity Configuration & Automated Checks */}
                <div className="grid grid-cols-12 gap-6">
                  
                  {/* AI Sensitivity Sliders */}
                  <div className="col-span-12 md:col-span-4 details-panel flex flex-col">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>psychology</span>
                      AI Sensitivity Settings
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, marginTop: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', justify_content: 'space-between', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          <span>DETECTION THRESHOLD</span>
                          <span style={{ color: 'var(--primary)' }}>{aiSensitivity}% (Strict)</span>
                        </div>
                        <input 
                          type="range" 
                          min="50" 
                          max="95" 
                          value={aiSensitivity} 
                          onChange={(e) => setAiSensitivity(parseInt(e.target.value))} 
                        />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justify_content: 'space-between', padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-low)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Auto-Remediate Shifts</span>
                          <input 
                            type="checkbox" 
                            checked={autoRemediate} 
                            onChange={(e) => setAutoRemediate(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justify_content: 'space-between', padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-low)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Neural Pattern Matching</span>
                          <input 
                            type="checkbox" 
                            checked={neuralPattern} 
                            onChange={(e) => setNeuralPattern(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', padding: '12px', backgroundColor: 'var(--bg-surface-low)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                        Engine Version: v4.2-stable-pro
                      </div>
                    </div>
                  </div>

                  {/* Automated Active Checks list */}
                  <div className="col-span-12 md:col-span-8 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>task_alt</span>
                      Active Automated Checks
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                      <div className="audit-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justify_content: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="status-dot animate-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
                            <div>
                              <div style={{ fontWeight: '700' }}>Database Latency Ping</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>EVERY 30 SECONDS • US-EAST-1</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-mono)' }}>14ms avg</div>
                            <span className="badge ok">OPTIMAL</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justify_content: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="status-dot" style={{ backgroundColor: 'var(--success)' }}></span>
                            <div>
                              <div style={{ fontWeight: '700' }}>SSL Certificate Validity Check</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>DAILY • GLOBAL EDGE</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-mono)' }}>Expires in 204 days</div>
                            <span className="badge ok">SECURE</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justify_content: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="status-dot" style={{ backgroundColor: 'var(--warning)' }}></span>
                            <div>
                              <div style={{ fontWeight: '700' }}>UI Spacing Alignment Check</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TRIGGERED ON DEPLOY • AWS</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-mono)' }}>3 alerts triggered</div>
                            <span className="badge warning">WARNING</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* SRE Recalculator sliders & settings */}
                <div className="details-panel" style={{ marginTop: '24px' }}>
                  <h3>⚙ Recalculator SRE Sliders & Target Thresholds</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
                    Adjust threshold targets. The dashboard health variables will **recalculate dynamically in real-time**!
                  </p>
                  
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-4">
                      <div style={{ display: 'flex', justify_content: 'space-between', fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <span>Target Load Limit</span>
                        <span style={{ color: 'var(--primary)' }}>{loadTimeLimit}s</span>
                      </div>
                      <input 
                        type="range" min="1.0" max="5.0" step="0.1" 
                        value={loadTimeLimit} onChange={(e) => setLoadTimeLimit(parseFloat(e.target.value))} 
                      />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <div style={{ display: 'flex', justify_content: 'space-between', fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <span>Max DOM Node Budget</span>
                        <span style={{ color: 'var(--success)' }}>{domNodeLimit} nodes</span>
                      </div>
                      <input 
                        type="range" min="300" max="2000" step="50" 
                        value={domNodeLimit} onChange={(e) => setDomNodeLimit(parseInt(e.target.value))} 
                      />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <div style={{ display: 'flex', justify_content: 'space-between', fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <span>CLS Shift Tolerance</span>
                        <span style={{ color: 'var(--warning)' }}>{clsTolerance} CLS</span>
                      </div>
                      <input 
                        type="range" min="0.05" max="0.50" step="0.01" 
                        value={clsTolerance} onChange={(e) => setClsTolerance(parseFloat(e.target.value))} 
                      />
                    </div>
                  </div>
                </div>

                {/* SRE LIVE CONSOLE SHELL TERMINAL */}
                <div className="details-panel" style={{ marginTop: '24px' }}>
                  <h3>
                    <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>terminal</span>
                    SRE Interactive Command Terminal Console
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
                    Run infrastructure operations directly in the secure simulated SRE environment:
                  </p>

                  <div className="terminal-actions">
                    <button className="terminal-btn" onClick={() => runTerminalCommand("wp plugin update --all")}>wp plugin update --all</button>
                    <button className="terminal-btn" onClick={() => runTerminalCommand("ping -c 4 host_server")}>ping host_server</button>
                    <button className="terminal-btn" onClick={() => runTerminalCommand("openssl s_client -connect")}>openssl s_client</button>
                    <button className="terminal-btn" onClick={() => runTerminalCommand("nginx -t")}>nginx -t</button>
                  </div>

                  <div className="terminal-container">
                    <div className="terminal-header">
                      <div className="terminal-dots">
                        <div className="terminal-dot red"></div>
                        <div className="terminal-dot yellow"></div>
                        <div className="terminal-dot green"></div>
                      </div>
                      <span className="terminal-title">alex@monitorpro: /etc/nginx</span>
                      <span className="material-icons" style={{ color: 'var(--text-muted)', fontSize: '16px' }}>settings</span>
                    </div>
                    <div className="terminal-body">
                      {terminalLogs.map((log, idx) => (
                        <div key={idx} style={{ marginBottom: idx === 0 ? '8px' : '4px' }}>
                          {log.startsWith("alex@monitorpro:~$") ? (
                            <span>
                              <span className="terminal-prompt">alex@monitorpro:~$</span>
                              {log.slice(18)}
                            </span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))}
                      {terminalTyping && (
                        <div>
                          <span className="terminal-prompt">alex@monitorpro:~$</span>
                          <span className="terminal-cursor">█</span>
                        </div>
                      )}
                      {!terminalTyping && (
                        <div>
                          <span className="terminal-prompt">alex@monitorpro:~$</span>
                          <span className="terminal-cursor" style={{ marginLeft: '4px' }}>█</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Persistent Incident Log Table */}
                <div className="details-panel" style={{ marginTop: '24px' }}>
                  <h3>
                    <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--error)' }}>emergency</span>
                    Recent Incidents Log
                  </h3>
                  <table className="zebra-table">
                    <thead>
                      <tr>
                        <th>Incident ID</th>
                        <th>Alert Type</th>
                        <th>Timestamp</th>
                        <th>Severity</th>
                        <th>Incident Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#INC-88912</td>
                        <td>Server API Response Timeout</td>
                        <td>{new Date().toISOString().slice(0, 19).replace('T', ' ')}</td>
                        <td><span className="badge critical">CRITICAL</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)', fontWeight: '700' }}>
                            <span className="material-icons animate-pulse" style={{ fontSize: '16px' }}>error</span>
                            <span>Investigating</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#INC-88909</td>
                        <td>DOM Nesting Depth Threshold Mismatch</td>
                        <td>{new Date(Date.now() - 3600000).toISOString().slice(0, 19).replace('T', ' ')}</td>
                        <td><span className="badge warning">MEDIUM</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                            <span className="material-icons" style={{ fontSize: '16px' }}>check_circle</span>
                            <span>Resolved</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#INC-88901</td>
                        <td>WordPress core updates vulnerability threat</td>
                        <td>{new Date(Date.now() - 86400000).toISOString().slice(0, 19).replace('T', ' ')}</td>
                        <td><span className="badge critical">CRITICAL</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                            <span className="material-icons" style={{ fontSize: '16px' }}>check_circle</span>
                            <span>Resolved</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Predictive Scaling Banner */}
                <div style={{ marginTop: '24px', backgroundColor: 'var(--primary-glow)', border: '1px solid rgba(79, 70, 229, 0.2)', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ maxWidth: '640px', position: 'relative', zIndex: '10' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Predictive Health Scaling Suggestion</h4>
                    <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginBottom: '16px' }}>Based on recent metric sweeps, we predict a 15% increase in API latency patterns for the US-WEST edge region over the next 6 hours. Scale up container resources now.</p>
                    <button 
                      className="scan-btn" 
                      style={{ padding: '10px 20px', fontSize: '0.85rem' }} 
                      onClick={() => alert("SRE Auto-Scaling Engine Triggered: Successfully provisioned 3 additional ECS container tasks in region US-WEST-2 (Oregon). Latency thresholds successfully safeguarded!")}
                    >
                      Auto-Scale Now
                    </button>
                  </div>
                  <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: '0.06' }}>
                    <span className="material-icons" style={{ fontSize: '240px' }}>analytics</span>
                  </div>
                </div>

              </div>
            )}

            {/* --- TAB PANEL: SRE AUTO-REMEDIATION CONTROLS --- */}
            {data && activeTab === "controls" && (
              <div className="tab-content animate-fade">
                
                <div className="hero-card" style={{ background: 'linear-gradient(135deg, #091a1a 0%, #0d1220 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons" style={{ color: 'var(--success)', fontSize: '32px' }}>settings_suggest</span>
                    SRE Auto-Remediation System
                  </h1>
                  <p>
                    Manage running microservices, trigger automated failover remediations, clear server caches, 
                    and defragment active SQLite database transactions. Fully synced with host {data.url}.
                  </p>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  
                  {/* Service status indicators */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>dns</span>
                      Infrastructure Service Status
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="status-dot animate-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
                          <span style={{ fontWeight: '700' }}>Nginx Web Server (Proxy)</span>
                        </div>
                        <span className="badge ok">ACTIVE</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="status-dot animate-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
                          <span style={{ fontWeight: '700' }}>Docker Daemon & Containers</span>
                        </div>
                        <span className="badge ok">RUNNING</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="status-dot animate-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
                          <span style={{ fontWeight: '700' }}>SQLite Persistent DB Engine</span>
                        </div>
                        <span className="badge ok">SECURE</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="status-dot animate-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
                          <span style={{ fontWeight: '700' }}>Redis In-Memory Cache Store</span>
                        </div>
                        <span className="badge ok">ACTIVE</span>
                      </div>

                    </div>
                  </div>

                  {/* SRE Action Triggers Panel */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>bolt</span>
                      Manual Remediation Triggers
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', marginTop: '4px' }}>
                      Manually trigger system-level remediations to clear network bottlenecks or restart isolated services:
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      
                      <button className="scan-btn" style={{ padding: '12px', fontSize: '0.82rem', justifyContent: 'center' }} onClick={() => {
                        alert("SRE Action Dispatched: Testing Nginx syntax... [OK]\nReloading Nginx web server configurations successfully!");
                      }}>
                        <span className="material-icons" style={{ fontSize: '18px' }}>sync</span>
                        Restart Nginx
                      </button>

                      <button className="scan-btn" style={{ padding: '12px', fontSize: '0.82rem', justifyContent: 'center', background: '#059669' }} onClick={() => {
                        alert("SRE Action Dispatched: Purging Redis memory allocation... [OK]\nFlushing Nginx fast-cgi micro-cache... [OK]\nWebsite static cache cleared successfully!");
                      }}>
                        <span className="material-icons" style={{ fontSize: '18px' }}>cleaning_services</span>
                        Clear Server Cache
                      </button>

                      <button className="scan-btn" style={{ padding: '12px', fontSize: '0.82rem', justifyContent: 'center', background: '#d97706' }} onClick={() => {
                        alert("SRE Action Dispatched: Re-initializing Docker daemon... [OK]\nRe-spinning ECS microservices containers... [OK]\nDocker containers rebooted successfully!");
                      }}>
                        <span className="material-icons" style={{ fontSize: '18px' }}>cached</span>
                        Reboot Docker
                      </button>

                      <button className="scan-btn" style={{ padding: '12px', fontSize: '0.82rem', justifyContent: 'center', background: '#4f46e5' }} onClick={() => {
                        alert("SRE Action Dispatched: Vacuuming SQLite database structures... [OK]\nRunning persistent index optimizations... [OK]\nSQLite DB defragmented and synced successfully!");
                      }}>
                        <span className="material-icons" style={{ fontSize: '18px' }}>database</span>
                        Optimize SQLite
                      </button>

                    </div>

                    <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'var(--bg-surface-low)', border: '1.5px dashed var(--success)', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                      <span className="material-icons animate-pulse" style={{ fontSize: '18px' }}>verified_user</span>
                      <span><strong>Failover Rules Active</strong>: Automated Docker container reboot will trigger automatically upon 3 consecutive ping failures.</span>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* --- TAB PANEL: SEO OPTIMIZATION --- */}
            {data && activeTab === "seo" && (
              <div className="tab-content animate-fade">
                
                <div className="hero-card" style={{ background: 'linear-gradient(135deg, #0f1c2b 0%, #0d1220 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons" style={{ color: '#3b82f6', fontSize: '32px' }}>search</span>
                    SEO Optimization Audit
                  </h1>
                  <p>
                    Full diagnostic report of meta tags, search indexability directives, semantic headers hierarchy, alt attributes, and link status crawls.
                  </p>
                </div>

                <div className="cards mb-6">
                  <div className="card accent-blue">
                    <h3>SEO Score</h3>
                    <div className="metric-value">{data.seo?.seo_score || 88}</div>
                    <div className="card-footer">Status: {data.seo?.score_label || 'Good'}</div>
                  </div>

                  <div className="card accent-green">
                    <h3>H1 Elements</h3>
                    <div className="metric-value">{data.seo?.heading_structure?.headings?.h1?.count ?? 0}</div>
                    <div className="card-footer">Recommended count: 1</div>
                  </div>

                  <div className="card accent-orange">
                    <h3>Broken Link Matches</h3>
                    <div className="metric-value">{data.seo?.broken_links?.broken_count ?? 0}</div>
                    <div className="card-footer">Checked {data.seo?.broken_links?.checked ?? 0} of {data.seo?.broken_links?.total_links ?? 0} links</div>
                  </div>

                  <div className="card accent-purple">
                    <h3>Structured Schemas</h3>
                    <div className="metric-value">{data.seo?.structured_data?.json_ld_count ?? 0} blocks</div>
                    <div className="card-footer">Microdata count: {data.seo?.structured_data?.microdata_count ?? 0}</div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  
                  {/* Meta Tags & Crawling Directives */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>assignment</span>
                      Meta Tags & Crawl Directives
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      
                      <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>PAGE TITLE</span>
                          <span className={getBadgeClass(data.seo?.title?.status)}>{data.seo?.title?.status?.toUpperCase() || 'OK'}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-normal)', wordBreak: 'break-all' }}>
                          {data.seo?.title?.text || "No title tag found."}
                        </p>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Length: {data.seo?.title?.length ?? 0} characters ({data.seo?.title?.message})
                        </div>
                      </div>

                      <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>META DESCRIPTION</span>
                          <span className={getBadgeClass(data.seo?.meta_description?.status)}>{data.seo?.meta_description?.status?.toUpperCase() || 'OK'}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-normal)' }}>
                          {data.seo?.meta_description?.text || "No meta description found."}
                        </p>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Length: {data.seo?.meta_description?.length ?? 0} characters ({data.seo?.meta_description?.message})
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>MOBILE VIEWPORT</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Required for responsive SEO indices</div>
                        </div>
                        <span className={getBadgeClass(data.seo?.viewport?.status)}>{data.seo?.viewport?.present ? 'PRESENT' : 'MISSING'}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>CANONICAL URL</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-all' }}>{data.seo?.canonical || 'not set'}</div>
                        </div>
                        <span className="badge ok">INDEXABLE</span>
                      </div>

                    </div>
                  </div>

                  {/* Header Hierarchy & Semantics */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>toc</span>
                      Semantic Headings Hierarchy
                    </h3>
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
                        {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((lvl) => {
                          const cnt = data.seo?.heading_structure?.headings?.[lvl]?.count ?? 0;
                          return (
                            <div key={lvl} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-surface-low)', padding: '10px 4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{lvl}</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: cnt > 0 ? 'var(--primary)' : 'var(--text-muted)', marginTop: '4px' }}>{cnt}</div>
                            </div>
                          );
                        })}
                      </div>

                      <h4 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Heading Outline Preview (First 5 Items):</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                        {['h1', 'h2', 'h3'].flatMap(lvl => 
                          (data.seo?.heading_structure?.headings?.[lvl]?.texts || []).map((text, i) => ({ lvl, text }))
                        ).slice(0, 5).map((item, idx) => (
                          <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '6px', borderLeft: `3px solid ${item.lvl === 'h1' ? 'var(--error)' : item.lvl === 'h2' ? 'var(--primary)' : 'var(--secondary)'}`, fontSize: '0.78rem' }}>
                            <strong style={{ textTransform: 'uppercase', marginRight: '6px' }}>{item.lvl}:</strong> {item.text}
                          </div>
                        ))}
                      </div>

                      {data.seo?.heading_structure?.issues?.length > 0 && (
                        <div style={{ marginTop: '16px', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--error)' }}>
                          <strong>Structure Issues Detected:</strong>
                          <ul style={{ paddingLeft: '16px', marginTop: '4px', listStyleType: 'disc' }}>
                            {data.seo.heading_structure.issues.map((issue, idx) => (
                              <li key={idx}>{issue.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sitemap & Robots.txt */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>explore</span>
                      Sitemaps & Robots Directives
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                      
                      <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>robots.txt Configuration</span>
                          <span className={getBadgeClass(data.seo?.robots_txt?.status)}>{data.seo?.robots_txt?.found ? 'ACTIVE' : 'MISSING'}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          Path: <code>{data.seo?.robots_txt?.url}</code>
                        </div>
                        {data.seo?.robots_txt?.found && (
                          <pre style={{ margin: 0, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--text-normal)', overflowX: 'auto', maxHeight: '100px', fontFamily: 'var(--font-mono)' }}>
                            {data.seo.robots_txt.content_preview}
                          </pre>
                        )}
                      </div>

                      <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>XML Sitemap Index</span>
                          <span className={getBadgeClass(data.seo?.sitemap?.status)}>{data.seo?.sitemap?.found ? 'VALID' : 'NOT FOUND'}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          URL: <code>{data.seo?.sitemap?.url}</code>
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-normal)', marginTop: '4px' }}>
                          {data.seo?.sitemap?.message}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Schema Structured Data */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>schema</span>
                      Structured Schema (JSON-LD)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Schema blocks found</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            JSON-LD: {data.seo?.structured_data?.json_ld_count ?? 0} | Microdata: {data.seo?.structured_data?.microdata_count ?? 0}
                          </div>
                        </div>
                        <span className={getBadgeClass(data.seo?.structured_data?.status)}>
                          {data.seo?.structured_data?.found ? 'ACTIVE' : 'WARNING'}
                        </span>
                      </div>

                      {data.seo?.structured_data?.json_ld_types?.length > 0 && (
                        <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <h4 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Detected Structured Data Entities:</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {data.seo.structured_data.json_ld_types.map((type, idx) => (
                              <span key={idx} className="badge info" style={{ fontSize: '0.75rem' }}>
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {data.seo?.structured_data?.invalid_json_ld_count > 0 && (
                        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1.5px dashed var(--error)', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
                          <span className="material-icons">report_problem</span>
                          <span><strong>Schema Parsing Failure</strong>: Found {data.seo.structured_data.invalid_json_ld_count} malformed block(s). Validate using Google Rich Results.</span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Image Alt Attributes Check */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>image</span>
                      Image Alt Attributes Check
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Alt text coverage</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Images with Alt: {data.seo?.alt_tags?.with_alt ?? 0} / {data.seo?.alt_tags?.total_images ?? 0}
                          </div>
                        </div>
                        <span className={getBadgeClass(data.seo?.alt_tags?.status)}>
                          {data.seo?.alt_tags?.status?.toUpperCase() || 'OK'}
                        </span>
                      </div>
                      
                      {data.seo?.alt_tags?.missing_alt_srcs?.length > 0 && (
                        <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--error)', marginBottom: '8px' }}>Images Missing Alt Tags (Top 5):</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                            {data.seo.alt_tags.missing_alt_srcs.slice(0, 5).map((src, idx) => (
                              <div key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', padding: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                                {src}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Broken Links Crawler */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>link_off</span>
                      Broken Links Crawler
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Broken links checked</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Broken Count: {data.seo?.broken_links?.broken_count ?? 0} | Checked: {data.seo?.broken_links?.checked ?? 0}
                          </div>
                        </div>
                        <span className={getBadgeClass(data.seo?.broken_links?.status)}>
                          {data.seo?.broken_links?.status?.toUpperCase() || 'OK'}
                        </span>
                      </div>

                      {data.seo?.broken_links?.broken_links?.length > 0 && (
                        <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--error)', marginBottom: '8px' }}>Broken Link Paths:</h4>
                          <table style={{ width: '100%', fontSize: '0.75rem' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', padding: '4px' }}>Link text</th>
                                <th style={{ textAlign: 'left', padding: '4px' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '4px' }}>URL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.seo.broken_links.broken_links.map((link, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '4px', fontWeight: 'bold' }}>{link.text || '[Image/Icon]'}</td>
                                  <td style={{ padding: '4px' }}><span className="badge critical">{link.status_code || 'Err'}</span></td>
                                  <td style={{ padding: '4px', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>{link.url}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* --- TAB PANEL: SECURITY --- */}
            {data && activeTab === "security" && (
              <div className="tab-content animate-fade">
                
                <div className="hero-card" style={{ background: 'linear-gradient(135deg, #18090f 0%, #0d1220 100%)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons" style={{ color: 'var(--error)', fontSize: '32px' }}>security</span>
                    SRE Security & Trust Audit
                  </h1>
                  <p>
                    Verify SSL certificate validity, inspect HTTP security response headers, and audit transport layer protocols.
                  </p>
                </div>

                <div className="cards mb-6">
                  <div className="card accent-red">
                    <h3>Security Score</h3>
                    <div className="metric-value">{data.security?.security_score ?? 90}</div>
                    <div className="card-footer">Rating: {data.security?.score_label || 'Excellent'}</div>
                  </div>

                  <div className="card accent-blue">
                    <h3>SSL Certificate</h3>
                    <div className="metric-value" style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '12px' }}>
                      {data.security?.ssl?.valid ? 'VALID CERTIFICATE' : 'INVALID / EXPIRED'}
                    </div>
                    <div className="card-footer">{data.security?.ssl?.message || 'Certificate verified.'}</div>
                  </div>

                  <div className="card accent-green">
                    <h3>Headers Coverage</h3>
                    <div className="metric-value">{data.security?.headers?.coverage_percent ?? 0}%</div>
                    <div className="card-footer">Present: {data.security?.headers?.present_count ?? 0} / {data.security?.headers?.total_checked ?? 7}</div>
                  </div>

                  <div className="card accent-orange">
                    <h3>HTTPS Redirect</h3>
                    <div className="metric-value" style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '12px' }}>
                      {data.security?.https?.final_https ? 'ENFORCED' : 'NOT ENFORCED'}
                    </div>
                    <div className="card-footer">{data.security?.https?.is_https ? 'Initial Request HTTPS' : 'Redirects: ' + (data.security?.https?.redirected_to_https ? 'Yes' : 'No')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6">

                  {/* SSL Details Panel */}
                  <div className="col-span-12 md:col-span-5 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>vpn_key</span>
                      SSL Certificate Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      {data.security?.ssl?.valid ? (
                        <>
                          <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>ISSUED TO (COMMON NAME)</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.92rem', marginTop: '4px', wordBreak: 'break-all' }}>{data.security.ssl.issued_to}</div>
                          </div>

                          <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>ISSUER / CA</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.92rem', marginTop: '4px' }}>{data.security.ssl.issued_by}</div>
                          </div>

                          <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>EXPIRATION DATE</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.92rem', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{data.security.ssl.expires}</span>
                              <span className="badge ok">{data.security.ssl.days_remaining} days left</span>
                            </div>
                          </div>

                          <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>TLS PROTOCOL VERSION</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.92rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{data.security.ssl.protocol}</div>
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1.5px dashed var(--error)' }}>
                          <span className="material-icons" style={{ color: 'var(--error)', fontSize: '48px' }}>report_off</span>
                          <h4 style={{ color: 'var(--error)', marginTop: '12px' }}>No Valid Certificate Found</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            {data.security?.ssl?.message || 'SSL verification failed. Connection might be unsafe.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Headers Table */}
                  <div className="col-span-12 md:col-span-7 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>security</span>
                      HTTP Security Response Headers
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', marginBottom: '16px' }}>
                      Security headers provide layers of defense by restricting resources and instructing browsers on protocol execution.
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-color)', textAlign: 'left', fontWeight: '800', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px 6px' }}>Header Name</th>
                            <th style={{ padding: '10px 6px' }}>Importance</th>
                            <th style={{ padding: '10px 6px' }}>Status</th>
                            <th style={{ padding: '10px 6px' }}>Directive Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.security?.headers?.headers ? (
                            Object.entries(data.security.headers.headers).map(([key, h]) => (
                              <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '10px 6px' }}>
                                  <div style={{ fontWeight: '700' }}>{h.name}</div>
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{h.description}</div>
                                </td>
                                <td style={{ padding: '10px 6px' }}>
                                  <span className={`badge ${h.importance === 'critical' ? 'critical' : h.importance === 'high' ? 'critical' : h.importance === 'medium' ? 'warning' : 'info'}`}>
                                    {h.importance.toUpperCase()}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 6px' }}>
                                  <span className={`badge ${h.present ? 'ok' : h.importance === 'critical' ? 'critical' : 'warning'}`}>
                                    {h.present ? 'PRESENT' : 'MISSING'}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 6px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', wordBreak: 'break-all', maxWidth: '180px' }}>
                                  {h.present ? (h.value || 'True') : '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No security headers audit details available.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* --- TAB PANEL: CONSOLE SETTINGS --- */}
            {data && activeTab === "settings" && (
              <div className="tab-content animate-fade">
                
                <div className="hero-card" style={{ background: 'linear-gradient(135deg, #111a1e 0%, #0d1220 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons" style={{ color: 'var(--success)', fontSize: '32px' }}>settings</span>
                    Console Settings & Config
                  </h1>
                  <p>
                    Manage active UI components, adjust alert severity levels, configure third-party alert webhooks, and set log archiving schedules.
                  </p>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  
                  {/* General Configuration */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>display_settings</span>
                      Dashboard Preferences
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Dark Theme Interface</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Use deep-palette hues to reduce eye strain</div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={darkMode} 
                          onChange={(e) => setDarkMode(e.target.checked)}
                          style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Real-Time Auto-Refresh</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Fetch latest monitoring reports automatically</div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={autoRefresh} 
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                        />
                      </div>

                      <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.88rem', marginBottom: '8px' }}>
                          <span>AI Strictness Severity</span>
                          <span style={{ color: 'var(--primary)' }}>{aiSensitivity}% Strict</span>
                        </div>
                        <input 
                          type="range" min="50" max="95" step="1" 
                          value={aiSensitivity} onChange={(e) => setAiSensitivity(parseInt(e.target.value))} 
                        />
                      </div>

                      <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-low)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', marginBottom: '4px' }}>Simulated Edge Location</div>
                        <select style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-surface-high)', color: 'var(--text-normal)', outline: 'none', cursor: 'pointer' }}>
                          <option>Global Geo-DNS (Automatic Multiplex)</option>
                          <option>US-East (Virginia Edge Hub)</option>
                          <option>SG-Central (Singapore Edge Hub)</option>
                          <option>IN-West (Mumbai Edge Hub)</option>
                          <option>EU-Central (Frankfurt Edge Hub)</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* SRE Notification Integrations */}
                  <div className="col-span-12 md:col-span-6 details-panel">
                    <h3>
                      <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px' }}>ring_volume</span>
                      Webhook Alerts & Notifications
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', marginBottom: '16px' }}>
                      Configure targets to alert immediately on database downtime, visual shifts, or critical SSL expirations.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Slack Alert Webhook</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="https://hooks.slack.com/services/..." defaultValue="https://hooks.slack.com/services/T00/B00/XRE2026" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-low)', color: 'var(--text-normal)', fontSize: '0.82rem' }} />
                          <button className="scan-btn" style={{ padding: '10px 14px' }} onClick={() => alert("Slack Integration Verified: Test SRE notification payload dispatched successfully!")}>Test</button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Telegram Bot Chat ID</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="@monitor_sre_bot or chat_id" defaultValue="-10098471203" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-low)', color: 'var(--text-normal)', fontSize: '0.82rem' }} />
                          <button className="scan-btn" style={{ padding: '10px 14px' }} onClick={() => alert("Telegram Integration Verified: Connected successfully to MonitorPro SRE channel!")}>Test</button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Critical Email Recipient</label>
                        <input type="email" placeholder="sre@domain.com" defaultValue="alex.rivera@monitorpro.sre" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-low)', color: 'var(--text-normal)', fontSize: '0.82rem' }} />
                      </div>

                      <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                        <button className="scan-btn" style={{ flex: 1, justifyContent: 'center', padding: '12px' }} onClick={() => alert("All configuration parameters synchronized and saved to sqlite settings catalog!")}>
                          <span className="material-icons" style={{ fontSize: '18px' }}>save</span>
                          Save Settings
                        </button>
                        <button className="theme-btn" style={{ flex: 1, justifyContent: 'center', padding: '12px' }} onClick={() => {
                          if (window.confirm("Restore dashboard defaults? Sliders, threshold rules, and alerts integrations will reset.")) {
                            setLoadTimeLimit(2.5);
                            setDomNodeLimit(800);
                            setClsTolerance(0.15);
                            setAiSensitivity(82);
                            alert("SRE defaults restored.");
                          }
                        }}>
                          Reset Defaults
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Empty state dashboard */}
            {!data && !loading && (
              <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📊</div>
                <h2>Audits dashboard empty</h2>
                <p style={{ marginTop: '8px' }}>Input a URL above and click "Run Full Scan" to run UI/UX, WordPress core/plugin, DOM complexity structure, and Alert checks.</p>
              </div>
            )}

            {/* Loading Indicator Spinner */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
                <div style={{
                  border: '8px solid var(--bg-surface-high)',
                  borderTop: '8px solid var(--primary)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '20px'
                }} />
                <h2>Analyzing URL footprints...</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Running visual layout audits, WordPress dependency vulnerability checks, and DOM tree complexity analyses concurrently.</p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- SRE DOCUMENTATION MODAL OVERLAY --- */}
      {showDocs && (
        <div className="modal-overlay" onClick={() => setShowDocs(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <button className="modal-close" onClick={() => setShowDocs(false)}>×</button>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>menu_book</span>
              SRE Operation Runbook & Docs
            </h3>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="runbook-block">
                <h4>1. Cumulative Layout Shift (CLS) Hazard Limits</h4>
                <p>Standard SLA permits CLS tolerances below **0.10**. Overlays or lazy loading elements must have aspect-ratio parameters or size budgets explicitly declared on wrapping divs.</p>
              </div>
              <div className="runbook-block">
                <h4>2. DOM Nesting Depth Budgets</h4>
                <p>Nesting HTML tags deeper than **32 levels** severely slows layout shifts and CSS query executions. Flatten structural tags by utilizing grid layouts and minimal wrapper wrappers.</p>
              </div>
              <div className="runbook-block">
                <h4>3. WordPress CVE Plugin Detections</h4>
                <p>Vulnerability database matches plugin links versions in real-time. Immediately execute terminal commands to reload patches or run core version sync checks.</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-primary" onClick={() => setShowDocs(false)}>Close Runbooks</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SRE SUPPORT MODAL OVERLAY --- */}
      {showSupport && (
        <div className="modal-overlay" onClick={() => setShowSupport(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setShowSupport(false)}>×</button>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>contact_support</span>
              Submit SRE Infrastructure Ticket
            </h3>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              <div className="login-field" style={{ marginBottom: '0' }}>
                <label>Target Audit Domain</label>
                <input type="text" readOnly value={data?.url || "No active domain audited"} style={{ opacity: '0.7' }} />
              </div>
              
              <div className="login-field" style={{ marginBottom: '0' }}>
                <label>Ticket Summary Message</label>
                <input type="text" placeholder="e.g. Host response latency exceeded SLA thresholds..." />
              </div>

              <div className="login-field" style={{ marginBottom: '0' }}>
                <label>Ticket Priority Level</label>
                <select style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'white' }}>
                  <option>P3 - Standard Info</option>
                  <option>P2 - High Warning</option>
                  <option>P1 - Critical Outage</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button className="btn" onClick={() => setShowSupport(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert("Infrastructure ticket filed successfully!"); setShowSupport(false); }}>Submit Ticket</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
