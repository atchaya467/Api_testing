import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Copy, 
  Check, 
  Clock, 
  Database, 
  Search, 
  FileCode, 
  Sparkles,
  Terminal,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Zap,
  Activity,
  Send
} from 'lucide-react';
import MatrixRainCanvas from './MatrixRainCanvas';
import MatrixAttractorCanvas from './MatrixAttractorCanvas';

export default function ResponsePanel({
  response,
  scanReport,
  testResults,
  isScanning,
  isLoading
}) {
  const [activeTab, setActiveTab] = useState(scanReport ? 'security' : 'body'); // 'body' | 'headers' | 'tests' | 'security'
  const [copied, setCopied] = useState(false);
  const [jsonFilter, setJsonFilter] = useState('');
  const [expandedVulns, setExpandedVulns] = useState({ 'VULN-API1-01': true, 'VULN-API3-01': true, 'VULN-API10-01': true });

  // Automatically switch to security tab when a scan finishes
  React.useEffect(() => {
    if (scanReport) {
      setActiveTab('security');
    }
  }, [scanReport]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleVuln = (id) => {
    setExpandedVulns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (status >= 400 && status < 500) color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (status >= 500) color = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${color}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {status} {response?.statusText}
      </span>
    );
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">LOW</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg select-none">
      {/* Top Header / Status Bar */}
      <div className="h-12 border-b border-cyber-border bg-cyber-panel/40 px-4 flex items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'body'
                ? 'bg-cyber-card text-cyan-300 border border-cyber-border'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Response Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'headers'
                ? 'bg-cyber-card text-cyan-300 border border-cyber-border'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Headers {response?.headers ? `(${Object.keys(response.headers).length})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'bg-cyber-card text-cyan-300 border border-cyber-border'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Test Results</span>
            {testResults?.length > 0 && (
              <span className="text-[10px] font-mono px-1 rounded bg-cyber-bg text-slate-300">
                {testResults.filter(t => t.passed).length}/{testResults.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>AI Security Audit</span>
            {scanReport && (
              <span className={`text-[10px] font-mono font-bold px-1.5 rounded ${
                scanReport.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {scanReport.grade}
              </span>
            )}
          </button>
        </div>

        {/* Telemetry Badges */}
        {response && (
          <div className="flex items-center space-x-2">
            {getStatusBadge(response.status)}
            <div className="flex items-center space-x-1 text-slate-400 font-mono text-xs px-2 py-1 rounded-lg bg-cyber-bg border border-cyber-border">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{response.duration} ms</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 font-mono text-xs px-2 py-1 rounded-lg bg-cyber-bg border border-cyber-border">
              <Database className="w-3 h-3 text-purple-400" />
              <span>{(response.size / 1024).toFixed(2)} KB</span>
            </div>
            <button
              onClick={() => copyToClipboard(response.data)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-cyber-bg border border-cyber-border transition-colors"
              title="Copy response JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Tab View */}
      <div className="flex-1 overflow-y-auto p-4 select-text">
        {/* Loading Spinner / Scan Radar */}
        {isLoading && (
          <div className="relative h-[calc(100vh-14rem)] min-h-[380px] flex flex-col items-center justify-center rounded-2xl border border-cyan-500/30 bg-black/70 overflow-hidden p-6 select-none shadow-[0_0_35px_rgba(6,182,212,0.15)]">
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <MatrixRainCanvas fontSize={13} opacity={0.35} speed={1.4} className="w-full h-full" />
            </div>
            {/* Animated Laser Scan line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-scan-line" />

            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin" />
                <div className="w-14 h-14 rounded-full bg-black/90 border border-cyan-500/60 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <MatrixAttractorCanvas width={56} height={56} particleCount={300} speed={1.5} className="w-full h-full" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold font-mono text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]">
                  DISPATCHING HTTP REQUEST...
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">Transmitting through secure local Node proxy tunnel</p>
              </div>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="relative h-[calc(100vh-14rem)] min-h-[380px] flex flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-black/70 overflow-hidden p-6 select-none shadow-[0_0_35px_rgba(244,63,94,0.15)]">
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <MatrixRainCanvas fontSize={13} opacity={0.35} speed={1.5} className="w-full h-full" />
            </div>
            {/* Animated Red Laser Scan line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] animate-scan-line" />

            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-rose-500/50 border-t-rose-400 animate-spin" />
                <div className="w-14 h-14 rounded-full bg-black/90 border border-rose-500/70 overflow-hidden shadow-[0_0_25px_rgba(244,63,94,0.5)]">
                  <MatrixAttractorCanvas width={56} height={56} particleCount={380} speed={1.8} className="w-full h-full" />
                </div>
              </div>
              <div className="text-center max-w-sm">
                <p className="text-sm md:text-base font-bold font-mono text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                  AI & OWASP DEEP FUZZING IN PROGRESS
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">Probing BOLA / IDOR, SQLi, Mass Assignment & Privilege Escalations</p>
              </div>
            </div>
          </div>
        )}

        {/* 1. BODY TAB */}
        {!isLoading && !isScanning && activeTab === 'body' && (
          <div>
            {!response ? (
              <div className="relative h-[calc(100vh-14rem)] min-h-[380px] flex flex-col items-center justify-center rounded-2xl border border-emerald-500/40 bg-black/90 overflow-hidden p-6 select-none shadow-[0_0_40px_rgba(0,255,102,0.12)]">
                {/* Background Falling Matrix Code - Vibrant & Bright */}
                <div className="absolute inset-0 pointer-events-none">
                  <MatrixRainCanvas fontSize={14} opacity={0.88} speed={1.1} className="w-full h-full" />
                </div>

                {/* Center Floating Glass HUD Panel */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-md bg-black/75 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/40 shadow-[0_0_35px_rgba(0,0,0,0.9)]">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                    {/* Reticle brackets around avatar */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 shadow-[0_0_12px_#00ff66]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 shadow-[0_0_12px_#00ff66]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 shadow-[0_0_12px_#00ff66]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 shadow-[0_0_12px_#00ff66]" />

                    {/* Rotating Radar Ring */}
                    <div className="absolute inset-1 rounded-full border border-emerald-500/40 animate-[spin_12s_linear_infinite]" />
                    
                    {/* 3D Moving Aizawa Attractor Avatar */}
                    <div className="w-20 h-20 rounded-full bg-black border border-emerald-500/70 overflow-hidden shadow-[0_0_30px_rgba(0,255,102,0.4)]">
                      <MatrixAttractorCanvas width={80} height={80} particleCount={500} speed={1.1} className="w-full h-full" />
                    </div>
                  </div>

                  {/* Matrix Cyber Title */}
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold tracking-widest mb-2 shadow-[0_0_12px_rgba(0,255,102,0.3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>SYSTEM STANDBY // READY</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 drop-shadow-[0_0_12px_rgba(0,255,102,0.5)]">
                    DISPATCH TO INSPECT API
                  </h3>

                  <p className="text-xs text-slate-300 font-mono mt-1.5 leading-relaxed">
                    Enter an endpoint on the left and click <span className="text-cyan-400 font-bold">"Send"</span> or <span className="text-rose-400 font-bold">"LLM Scan"</span> to receive live JSON telemetry, security audits & contract assertions.
                  </p>

                  {/* Telemetry Status Pills */}
                  <div className="mt-5 grid grid-cols-2 gap-2 w-full text-[10px] font-mono">
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-panel/90 border border-cyber-border text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Node.js Proxy: Active</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-panel/90 border border-cyber-border text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>CORS Bypass: Enabled</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-panel/90 border border-cyber-border text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>OWASP Scanner: Armed</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-panel/90 border border-cyber-border text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Fuzzing Array: Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search within response..."
                      value={jsonFilter}
                      onChange={(e) => setJsonFilter(e.target.value)}
                      className="w-full pl-8 pr-2 py-1 text-xs bg-cyber-panel border border-cyber-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">JSON Format</span>
                </div>
                <pre className="p-4 rounded-xl bg-[#050811] border border-cyber-border text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                  <code>{typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : String(response.data)}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 2. HEADERS TAB */}
        {!isLoading && !isScanning && activeTab === 'headers' && (
          <div>
            {!response?.headers ? (
              <p className="text-slate-500 italic text-xs py-8 text-center">No headers to display.</p>
            ) : (
              <div className="border border-cyber-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-cyber-panel text-slate-400 border-b border-cyber-border">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Header Key</th>
                      <th className="py-2.5 px-4 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/60 bg-cyber-bg">
                    {Object.entries(response.headers).map(([key, val]) => (
                      <tr key={key} className="hover:bg-cyber-panel/40">
                        <td className="py-2 px-4 text-cyan-400 font-semibold">{key}</td>
                        <td className="py-2 px-4 text-slate-300 break-all">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. TEST RESULTS TAB */}
        {!isLoading && !isScanning && activeTab === 'tests' && (
          <div className="space-y-3">
            {(!testResults || testResults.length === 0) ? (
              <div className="text-center py-10 text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">No contract tests evaluated for this request.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      t.passed
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{t.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Expected: <span className="text-cyan-400">{String(t.expected)}</span> | Received: <span className={t.passed ? 'text-emerald-400' : 'text-rose-400'}>{String(t.received)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      t.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {t.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. AI SECURITY AUDIT TAB */}
        {!isLoading && !isScanning && activeTab === 'security' && (
          <div>
            {!scanReport ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <ShieldAlert className="w-10 h-10 mx-auto text-rose-400 opacity-60" />
                <div>
                  <h4 className="text-sm font-bold text-slate-300">No Security Audit Generated Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click the red <strong>"LLM Scan"</strong> button above to run an automated OWASP API vulnerability scan against this endpoint.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score & Posture Header Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyber-panel to-[#0f172a] border border-cyber-border shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Radial Score Gauge */}
                      <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-cyber-bg border border-cyber-border shadow-inner">
                        <span className={`text-2xl font-black ${
                          scanReport.score >= 80 ? 'text-emerald-400' : scanReport.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {scanReport.grade}
                        </span>
                        <div className="absolute -bottom-1 text-[9px] font-mono text-slate-400">
                          {scanReport.score}/100
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-100">LLM Security Health Posture</h3>
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-cyber-bg border border-cyber-border">
                            {scanReport.scanId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 max-w-xl">{scanReport.executiveSummary}</p>
                      </div>
                    </div>

                    {/* Metric Counter Pills */}
                    <div className="flex items-center space-x-2">
                      <div className="text-center px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                        <div className="text-base font-bold text-rose-400">{scanReport.stats.criticalCount}</div>
                        <div className="text-[9px] font-bold text-rose-300 uppercase">Critical</div>
                      </div>
                      <div className="text-center px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30">
                        <div className="text-base font-bold text-orange-400">{scanReport.stats.highCount}</div>
                        <div className="text-[9px] font-bold text-orange-300 uppercase">High</div>
                      </div>
                      <div className="text-center px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="text-base font-bold text-amber-400">{scanReport.stats.mediumCount}</div>
                        <div className="text-[9px] font-bold text-amber-300 uppercase">Medium</div>
                      </div>
                      <div className="text-center px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <div className="text-base font-bold text-blue-400">{scanReport.stats.lowCount}</div>
                        <div className="text-[9px] font-bold text-blue-300 uppercase">Low</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations List */}
                  {scanReport.aiInsights?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-cyber-border/70">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-purple-300 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Remediation Insights</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {scanReport.aiInsights.map((insight, idx) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Vulnerability Accordion List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Vulnerabilities Detected ({scanReport.vulnerabilities?.length || 0})
                    </h4>
                  </div>

                  {(!scanReport.vulnerabilities || scanReport.vulnerabilities.length === 0) ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-3 text-xs">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>Zero high or critical vulnerabilities detected! Endpoint passed baseline fuzz tests.</span>
                    </div>
                  ) : (
                    scanReport.vulnerabilities.map(vuln => {
                      const isExpanded = expandedVulns[vuln.id];
                      return (
                        <div 
                          key={vuln.id} 
                          className="rounded-xl border border-cyber-border bg-cyber-card/60 overflow-hidden transition-all shadow-md"
                        >
                          {/* Card Header */}
                          <button
                            onClick={() => toggleVuln(vuln.id)}
                            className="w-full p-3 flex items-center justify-between text-left hover:bg-cyber-panel/40 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                              {getSeverityBadge(vuln.severity)}
                              <div>
                                <span className="text-xs font-bold text-slate-100">{vuln.title}</span>
                                <span className="ml-2 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                  {vuln.owaspCategory}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">CVSS {vuln.cvssScore}</span>
                          </button>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="p-3 pt-0 border-t border-cyber-border/60 text-xs space-y-3 mt-2">
                              {/* Description */}
                              <p className="text-slate-300 text-xs leading-relaxed">{vuln.description}</p>

                              {/* Exploit PoC */}
                              {vuln.exploitPoc && (
                                <div>
                                  <div className="text-[11px] font-mono text-rose-400 font-bold mb-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Proof of Concept (PoC)
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-cyber-bg border border-cyber-border text-rose-300 font-mono text-[11px] overflow-x-auto">
                                    <code>{vuln.exploitPoc}</code>
                                  </pre>
                                </div>
                              )}

                              {/* AI Remediation Fix */}
                              {vuln.remediationSnippet && (
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                                      <Sparkles className="w-3.5 h-3.5" />
                                      AI Fix / Remediation Code
                                    </div>
                                    <button
                                      onClick={() => copyToClipboard(vuln.remediationSnippet)}
                                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                                    >
                                      <Copy className="w-3 h-3" /> Copy Fix
                                    </button>
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-[#050811] border border-cyber-border text-emerald-300 font-mono text-[11px] overflow-x-auto">
                                    <code>{vuln.remediationSnippet}</code>
                                  </pre>
                                </div>
                              )}

                              {/* Reproduction Curl */}
                              {vuln.curlCommand && (
                                <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-bg border border-cyber-border font-mono text-[11px] text-slate-300">
                                  <span className="truncate mr-2"><Terminal className="w-3 h-3 inline mr-1 text-cyan-400" /> {vuln.curlCommand}</span>
                                  <button
                                    onClick={() => copyToClipboard(vuln.curlCommand)}
                                    className="text-slate-400 hover:text-cyan-300 shrink-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
