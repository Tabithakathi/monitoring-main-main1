import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, ShieldCheck, ShieldAlert, Wifi, Globe, Database, FileText, AlertTriangle } from 'lucide-react';

export default function UptimeDashboard({ stats, isSocketConnected }) {
  if (!stats) return null;

  const { uptimePercentage, latestStatus, historyLog, activeAlerts } = stats;
  const isUp = latestStatus ? latestStatus.isUp : false;
  const ssl = latestStatus ? latestStatus.ssl : {};
  
  // Format history logs in chronological order for Recharts
  const chartData = [...historyLog]
    .reverse()
    .map(item => ({
      time: new Date(item.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      loadTime: item.isUp ? item.loadTimeMs : 0,
      ttfb: item.isUp ? item.ttfbMs : 0
    }));

  return (
    <div className="space-y-6">
      {/* Real-time Health Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Status Indicator card */}
        <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gateway Status</span>
            <div className="flex items-center gap-2">
              {isSocketConnected && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-widest animate-pulse">
                  LIVE
                </span>
              )}
              <span className={`flex h-2.5 w-2.5 relative`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isUp ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold tracking-tight">{isUp ? 'ONLINE' : 'DOWN'}</h2>
            <p className="text-slate-400 text-[10px] mt-1 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isSocketConnected ? 'bg-indigo-400' : 'bg-slate-500'}`}></span>
              {isSocketConnected ? 'Real-time WebSocket stream active' : 'SRE status probes active'}
            </p>
          </div>
        </div>

        {/* Uptime percentage card */}
        <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Uptime (24h)</span>
            <Activity className="text-violet-400 h-5 w-5" />
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-violet-400">{uptimePercentage}%</h2>
            <p className="text-slate-400 text-xs mt-1">Ideal SRE target: &gt;99.9%</p>
          </div>
        </div>

        {/* SSL Shield Validity */}
        <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">SSL Certificate</span>
            {ssl.valid ? (
              <ShieldCheck className="text-emerald-400 h-5 w-5" />
            ) : (
              <ShieldAlert className="text-rose-400 h-5 w-5" />
            )}
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-extrabold tracking-tight">
              {ssl.valid ? `${ssl.daysRemaining} Days` : 'EXPIRED'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {ssl.valid ? `Issued by ${ssl.issuer.split(' ')[0]}` : 'Immediate renewal required'}
            </p>
          </div>
        </div>

        {/* DNS resolution speed */}
        <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">DNS Speed</span>
            <Globe className="text-sky-400 h-5 w-5" />
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-sky-400">
              {latestStatus ? latestStatus.dnsResolutionTimeMs : 0}ms
            </h2>
            <p className="text-slate-400 text-xs mt-1">DNS resolving operational</p>
          </div>
        </div>

      </div>

      {/* Latency History Graph Area */}
      <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-slate-300 font-bold text-lg mb-6 flex items-center gap-2">
          <Wifi className="text-indigo-400 h-5 w-5" />
          Latency Trend Telemetry (ms)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b0e17', borderColor: '#1f2937', borderRadius: '8px', color: '#cbd5e1' }}
              />
              <Area type="monotone" dataKey="loadTime" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#latencyGrad)" name="Load Time" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Diagnostics: Alerts & Error Logs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Active Alerts List */}
        <div className="col-span-12 md:col-span-5 bg-dark-800 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-slate-300 font-bold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-400 h-5 w-5" />
            Active Alerts SRE Panel
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {activeAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">No active system alerts detected.</div>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert._id} className="p-4 bg-dark-900 border border-amber-900/30 rounded-xl flex items-start gap-3">
                  <div className="mt-0.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">{alert.category}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time Audit logs */}
        <div className="col-span-12 md:col-span-7 bg-dark-800 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-slate-300 font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="text-indigo-400 h-5 w-5" />
            Periodic Auditing Log History
          </h3>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Checked At</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">HTTP</th>
                  <th className="py-3 px-2">TTFB</th>
                  <th className="py-3 px-2">Load Time</th>
                  <th className="py-3 px-2">Errors</th>
                </tr>
              </thead>
              <tbody>
                {historyLog.map((log) => (
                  <tr key={log._id} className="border-b border-slate-800/40 hover:bg-dark-900/40">
                    <td className="py-3 px-2 text-slate-500 font-mono">
                      {new Date(log.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${log.isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {log.isUp ? 'UP' : 'DOWN'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-300 font-mono">{log.statusCode || '—'}</td>
                    <td className="py-3 px-2 text-slate-300 font-mono">{log.isUp ? `${log.ttfbMs}ms` : '—'}</td>
                    <td className="py-3 px-2 text-slate-300 font-mono">{log.isUp ? `${log.loadTimeMs}ms` : '—'}</td>
                    <td className="py-3 px-2 max-w-[140px] truncate text-rose-400" title={log.errors.join(', ')}>
                      {log.errors.length > 0 ? log.errors.join(', ') : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
