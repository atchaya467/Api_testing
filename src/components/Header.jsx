import React from 'react';
import { 
  ShieldAlert, 
  Settings, 
  Sparkles, 
  Server, 
  SlidersHorizontal,
  CheckCircle2,
  Play
} from 'lucide-react';
import MatrixAttractorCanvas from './MatrixAttractorCanvas';

export default function Header({ 
  currentEnv, 
  setCurrentEnv, 
  environments, 
  onOpenSettings, 
  onRunBatchScan,
  onReplayIntro,
  aiProvider,
  isScanningBatch
}) {
  return (
    <header className="relative h-14 border-b border-cyber-border bg-cyber-panel/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-20">
      {/* Neon Matrix Laser Line along Header bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent shadow-[0_0_10px_#00ff66]" />

      {/* Brand Logo with Moving Matrix Style Avatar */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={onReplayIntro}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-black border border-emerald-500/70 shadow-lg shadow-emerald-500/30 overflow-hidden cursor-pointer group hover:border-emerald-400 hover:shadow-emerald-400/50 transition-all active:scale-95"
          title="Click to replay Matrix Intro"
        >
          <MatrixAttractorCanvas 
            width={40} 
            height={40} 
            particleCount={340} 
            scaleMultiplier={0.9} 
            speed={1.2}
            className="w-full h-full pointer-events-none"
          />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-black animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-black" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 drop-shadow-[0_0_12px_rgba(0,255,102,0.4)]">
              API TESTING
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono shadow-[0_0_8px_rgba(0,255,102,0.15)]">
              <Sparkles className="w-2.5 h-2.5" /> MATRIX CORE
            </span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-wide font-mono">API Testing & Security Engine</p>
        </div>
      </div>

      {/* Middle Controls: Environment & Provider */}
      <div className="flex items-center space-x-3">
        {/* Environment Picker */}
        <div className="flex items-center space-x-1.5 bg-cyber-bg/80 border border-cyber-border px-2.5 py-1 rounded-lg text-xs">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[11px]">Env:</span>
          <select 
            value={currentEnv} 
            onChange={(e) => setCurrentEnv(e.target.value)}
            className="bg-transparent text-slate-200 font-medium text-xs focus:outline-none cursor-pointer pr-1"
          >
            {Object.entries(environments).map(([key, env]) => (
              <option key={key} value={key} className="bg-cyber-panel text-slate-200">
                {env.name}
              </option>
            ))}
          </select>
        </div>

        {/* AI Engine Status */}
        <div className="hidden md:flex items-center space-x-1.5 bg-cyber-bg/80 border border-cyber-border px-2.5 py-1 rounded-lg text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 text-[11px]">AI Engine:</span>
          <span className="text-indigo-300 font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/20">
            {aiProvider === 'gemini' ? 'Gemini 2.0' : aiProvider === 'openai' ? 'GPT-4o' : 'Built-in AST Engine'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Run Full Collection Scan */}
        <button
          onClick={onRunBatchScan}
          disabled={isScanningBatch}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-rose-500/20 to-orange-500/20 hover:from-rose-500/30 hover:to-orange-500/30 text-rose-300 border border-rose-500/30 transition-all duration-200 shadow-lg shadow-rose-950/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <ShieldAlert className={`w-3.5 h-3.5 text-rose-400 ${isScanningBatch ? 'animate-spin' : ''}`} />
          <span>{isScanningBatch ? 'Auditing APIs...' : 'Batch Security Audit'}</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-cyber-card border border-cyber-border transition-colors duration-150"
          title="Settings & Environment Variables"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
