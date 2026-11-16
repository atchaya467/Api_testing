import React from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles,
  Server,
  Play
} from 'lucide-react';

export default function BatchScanModal({
  isOpen,
  onClose,
  isScanning,
  progress,
  batchResults,
  onStartBatchScan
}) {
  if (!isOpen) return null;

  // Calculate overall metrics
  const totalEndpoints = batchResults.length;
  const criticalCount = batchResults.reduce((acc, r) => acc + (r.stats?.criticalCount || 0), 0);
  const highCount = batchResults.reduce((acc, r) => acc + (r.stats?.highCount || 0), 0);
  const avgScore = totalEndpoints > 0 
    ? Math.round(batchResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalEndpoints)
    : 0;

  const downloadReport = () => {
    const reportData = {
      auditTimestamp: new Date().toISOString(),
      platform: 'API Testing Security Suite',
      summary: { totalEndpoints, avgScore, criticalCount, highCount },
      results: batchResults
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-security-audit-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-3xl bg-cyber-panel border border-cyber-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-cyber-border flex items-center justify-between bg-cyber-bg/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Batch Collection Security Audit</h3>
              <p className="text-xs text-slate-400">Automated multi-vector OWASP API Top 10 fuzzing across all requests</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Progress Banner */}
          {isScanning && (
            <div className="p-4 rounded-xl bg-cyber-card border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-300 font-bold flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
                  Auditing endpoints with active fuzz vectors...
                </span>
                <span className="text-slate-400">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cyber-bg overflow-hidden border border-cyber-border">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results Summary Scorecard */}
          {batchResults.length > 0 && !isScanning && (
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border text-center">
                <div className="text-xs text-slate-400">Endpoints</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5">{totalEndpoints}</div>
              </div>
              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border text-center">
                <div className="text-xs text-slate-400">Average Score</div>
                <div className={`text-xl font-black mt-0.5 ${avgScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {avgScore}/100
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
                <div className="text-xs text-rose-300">Critical Risks</div>
                <div className="text-xl font-black text-rose-400 mt-0.5">{criticalCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
                <div className="text-xs text-orange-300">High Risks</div>
                <div className="text-xl font-black text-orange-400 mt-0.5">{highCount}</div>
              </div>
            </div>
          )}

          {/* Scanned Endpoints List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Audited Endpoints ({batchResults.length})
            </h4>

            {batchResults.length === 0 && !isScanning ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Click "Start Collection Audit" below to begin scanning.
              </div>
            ) : (
              batchResults.map((res, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-cyber-card/60 border border-cyber-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-slate-400 uppercase text-[11px] w-12">{res.target?.method}</span>
                    <span className="font-mono text-slate-200">{res.target?.url}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      res.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {res.grade} ({res.score} pts)
                    </span>
                    <span className="text-slate-400 text-[11px]">{res.vulnerabilities?.length || 0} issues</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyber-border bg-cyber-bg/50 flex items-center justify-between">
          <button
            onClick={downloadReport}
            disabled={batchResults.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyber-card border border-cyber-border text-slate-300 hover:text-white disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (JSON)</span>
          </button>

          <button
            onClick={onStartBatchScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-500/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Scanning Collection...' : 'Start Collection Audit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
