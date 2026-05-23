import React, { useEffect, useState } from 'react';

export default function History() {
    const PAGE_SIZE = 20;
    const [reports, setReports] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => { loadPage(1); }, []);

    async function loadPage(p = 1) {
        setLoading(true);
        setError(null);
        try {
            const q = filter ? `&url=${encodeURIComponent(filter)}` : '';
            const resp = await fetch(`/api/history-data/?page=${p}&page_size=${PAGE_SIZE}${q}`);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();
            setReports(data.reports || []);
            setPage(data.page || p);
            setTotal(data.total || 0);
            setTotalPages(data.total_pages || 1);
        } catch (e) {
            setError(e.message || String(e));
            setReports([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }

    function goPage(p) {
        if (p < 1 || p > totalPages) return;
        loadPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function viewReport(id) {
        if (!id) return;
        setModalData(null);
        try {
            const resp = await fetch(`/api/history-data/${id}/`);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const d = await resp.json();
            setModalData(d);
        } catch (e) {
            setModalData({ error: e.message || String(e) });
        }
    }

    function closeModal() { setModalData(null); }

    function exportPdfFromModal() {
        if (!modalData) return;
        const w = window.open('', '_blank');
        const html = `
      <html><head><title>WebMonitor Report</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111}h1{font-size:18px}pre{background:#f4f4f4;padding:10px;border-radius:6px}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:6px;vertical-align:top;border:1px solid #ddd}</style>
      </head><body>
      <h1>WebMonitor Report</h1>
      <div><strong>URL:</strong> ${modalData.url || '—'}</div>
      <div><strong>ID:</strong> ${modalData.report_id || modalData.id || '—'}</div>
      <div><strong>Analyzed at:</strong> ${modalData.analyzed_at || modalData.created_at || '—'}</div>
      <h3>Summary</h3>
      <table>
      <tr><td><strong>Overall Score</strong></td><td>${modalData.overall_score || '—'}</td></tr>
      <tr><td><strong>Performance</strong></td><td>${modalData.performance?.performance_score ?? '—'}</td></tr>
      <tr><td><strong>SEO</strong></td><td>${modalData.seo?.seo_score ?? '—'}</td></tr>
      <tr><td><strong>Security</strong></td><td>${modalData.security?.security_score ?? '—'}</td></tr>
      <tr><td><strong>Load Time</strong></td><td>${modalData.load_time ?? modalData.check?.load_time ?? '—'}s</td></tr>
      </table>
      <h3>Alerts</h3>
      <pre>${JSON.stringify(modalData.alerts || modalData.all_alerts || [], null, 2)}</pre>
      <script>window.onload = function(){ window.print(); };</script>
      </body></html>
    `;
        w.document.write(html);
        w.document.close();
    }

    return (
        <div className="history-root">
            <div className="history-toolbar">
                <input
                    className="search-input"
                    placeholder="Filter by URL"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadPage(1)}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => loadPage(1)}>Refresh</button>
                    <button className="btn btn-primary" onClick={() => loadPage(1)}>Search</button>
                </div>
                <div className="total-badge">{loading ? 'Loading…' : `${total} report${total !== 1 ? 's' : ''}`}</div>
            </div>

            {error && <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div>}

            <div id="table-area">
                {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>}
                {!loading && (!reports || reports.length === 0) && <div style={{ padding: '2rem', textAlign: 'center' }}>No reports found.</div>}
                {!loading && reports && reports.length > 0 && (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date / Time</th>
                                    <th>URL</th>
                                    <th>Status</th>
                                    <th>HTTP</th>
                                    <th>Load Time</th>
                                    <th>Perf</th>
                                    <th>SEO</th>
                                    <th>Security</th>
                                    <th>Overall</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#64748b' }}>{r.analyzed_at}</td>
                                        <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.url}>{r.url}</td>
                                        <td>{r.is_up ? 'UP' : r.is_up === false ? 'DOWN' : '—'}</td>
                                        <td>{r.status_code || '—'}</td>
                                        <td>{r.load_time != null ? `${r.load_time}s` : '—'}</td>
                                        <td>{r.performance_score != null ? Math.round(r.performance_score) : '—'}</td>
                                        <td>{r.seo_score != null ? Math.round(r.seo_score) : '—'}</td>
                                        <td>{r.security_score != null ? Math.round(r.security_score) : '—'}</td>
                                        <td>{r.overall_score != null ? Math.round(r.overall_score) : '—'}</td>
                                        <td><button className="btn-view" onClick={() => viewReport(r.id)}>View</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="pagination">
                <button className="page-btn" onClick={() => goPage(page - 1)} disabled={page <= 1}>‹</button>
                {[...Array(totalPages)].slice(0, 50).map((_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2).map(p => (
                    <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => goPage(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => goPage(page + 1)} disabled={page >= totalPages}>›</button>
            </div>

            {modalData && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <div style={{ marginBottom: 12, fontWeight: 700 }}>{modalData.url}</div>
                        {modalData.error && <div style={{ color: '#ef4444' }}>{modalData.error}</div>}
                        {!modalData.error && (
                            <div>
                                <div style={{ marginBottom: 12 }}>
                                    <strong>Status:</strong> {modalData.is_up ? 'UP' : 'DOWN'}
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <strong>Overall Score:</strong> {modalData.overall_score ?? '—'}
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <strong>Performance:</strong> {modalData.performance?.performance_score ?? '—'}
                                    {' • '}<strong>SEO:</strong> {modalData.seo?.seo_score ?? '—'}
                                    {' • '}<strong>Security:</strong> {modalData.security?.security_score ?? '—'}
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <strong>HTTP:</strong> {modalData.status_code || '—'}{' • '}
                                    <strong>Load time:</strong> {modalData.load_time ?? modalData.check?.load_time ?? '—'}s
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Alerts</strong>
                                    <ul>
                                        {(modalData.alerts || modalData.all_alerts || []).map((alert, idx) => (
                                            <li key={idx} style={{ marginBottom: 6 }}>
                                                <strong>{alert.level?.toUpperCase() || 'INFO'}</strong>: {alert.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button className="btn" onClick={exportPdfFromModal}>Export PDF</button>
                                    <button className="btn" onClick={closeModal}>Close</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
