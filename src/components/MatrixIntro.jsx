import React, { useState, useEffect } from 'react';
import MatrixAttractorCanvas from './MatrixAttractorCanvas';
import { ArrowRight, Zap, Eye } from 'lucide-react';

export default function MatrixIntro({ onComplete }) {
  const [fade, setFade] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bootLog, setBootLog] = useState('CONNECTING TO LOCAL GATEWAY...');

  // Smooth, slower incremental counter (~6.5 seconds total)
  useEffect(() => {
    const totalDurationMs = 6500;
    const intervalMs = 65; // 100 ticks of 65ms = 6.5s
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      if (current <= 100) {
        setProgress(current);

        // Dynamic cyber telemetry logs as counter progresses
        if (current < 20) {
          setBootLog('INITIALIZING LOCAL API PROXY BRIDGE...');
        } else if (current < 40) {
          setBootLog('SPINNING UP 3D AIZAWA MATRIX ATTRACTOR...');
        } else if (current < 60) {
          setBootLog('CALIBRATING OWASP SCANNER & FUZZING CORES...');
        } else if (current < 80) {
          setBootLog('LOADING REST VALIDATOR & CONTRACT TEST SUITES...');
        } else if (current < 99) {
          setBootLog('SYNCHRONIZING SECURE TELEMETRY CHANNELS...');
        } else {
          setBootLog('CORE ONLINE. LAUNCHING API TESTING PLATFORM...');
        }
      } else {
        clearInterval(interval);
        // Hold at 100% for 800ms so user clearly sees 100% complete
        setTimeout(() => {
          handleExit();
        }, 800);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, []);

  const handleExit = () => {
    setFade(true);
    setTimeout(() => {
      onComplete();
    }, 800); // 800ms smooth fade transition
  };

  const secondsRemaining = Math.max(0, Math.ceil((100 - progress) * 0.065));

  return (
    <div
      onClick={handleExit}
      className={`fixed inset-0 z-50 bg-[#000402] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-1000 cursor-pointer ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Matrix Aizawa Attractor 3D Canvas */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <MatrixAttractorCanvas 
          particleCount={2600} 
          scaleMultiplier={1.3} 
          speed={0.9}
          className="w-full h-full opacity-95"
        />
      </div>

      {/* Subtle Scanline Overlay for Cyber Clarity */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />

      {/* Cyberpunk HUD Frame & Reticle Overlay */}
      <div className="absolute inset-5 md:inset-10 pointer-events-none border border-emerald-500/25 rounded-2xl flex flex-col justify-between p-5 md:p-8 backdrop-blur-[1px]">
        {/* Top HUD Telemetry */}
        <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#00ff66]" />
            <span className="tracking-widest font-bold">SYS.AIZAWA-ATTRACTOR // MATRIX-v2.6</span>
          </div>
          <div className="tracking-widest hidden sm:block bg-emerald-950/70 px-3 py-1 rounded border border-emerald-500/40 text-[10px]">
            STATUS: SECURE_CORE_ARMED
          </div>
          <div className="font-semibold text-emerald-300">PORT: 5000 / 5173</div>
        </div>

        {/* Center Target Brackets around Attractor (as in user reference image) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[360px] h-[360px] md:w-[480px] md:h-[480px] flex items-center justify-center">
            {/* Top-Left Bracket */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-400 shadow-[0_0_15px_#00ff66]" />
            {/* Top-Right Bracket */}
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-400 shadow-[0_0_15px_#00ff66]" />
            {/* Bottom-Left Bracket */}
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-400 shadow-[0_0_15px_#00ff66]" />
            {/* Bottom-Right Bracket */}
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-400 shadow-[0_0_15px_#00ff66]" />

            {/* Glowing radar rings */}
            <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border border-emerald-500/25 animate-[spin_30s_linear_infinite]" />
            <div className="absolute w-[240px] h-[240px] md:w-[320px] md:h-[320px] rounded-full border border-dashed border-emerald-400/20 animate-[spin_20s_linear_infinite_reverse]" />
          </div>
        </div>

        {/* Bottom HUD info */}
        <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400/80">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>LATENCY: 0.18ms</span>
          </div>
          <div className="hidden sm:block text-[10px] tracking-widest text-emerald-500/70">
            TARGET: LOCALHOST / 127.0.0.1
          </div>
          <div className="font-semibold text-emerald-400">OWASP TOP 10 AUDITOR</div>
        </div>
      </div>

      {/* Foreground Content: Title, Slower Counter & Telemetry */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl">
        {/* Glow badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-black/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold tracking-widest mb-4 shadow-[0_0_20px_rgba(0,255,102,0.3)] backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>NEURAL API TESTING CORE</span>
        </div>

        {/* Main Title: API TESTING */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-100 to-emerald-400 drop-shadow-[0_0_40px_rgba(0,255,102,0.7)]">
          API TESTING
        </h1>

        <p className="mt-3 text-xs md:text-sm font-mono tracking-widest text-emerald-300 drop-shadow-[0_0_12px_rgba(0,255,102,0.5)]">
          LLM-POWERED FUZZER & REST SCANNER
        </p>

        {/* Slower, Smooth Progress Bar & Digital Counter */}
        <div className="mt-9 w-72 md:w-96 bg-black/70 p-3 rounded-xl border border-emerald-500/40 shadow-[0_0_25px_rgba(0,255,102,0.15)] backdrop-blur-md">
          <div className="flex justify-between items-center text-[11px] font-mono text-emerald-400 mb-2">
            <span className="truncate pr-2 font-medium">{bootLog}</span>
            <span className="font-bold text-sm text-emerald-300 drop-shadow-[0_0_8px_#00ff66]">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-emerald-950/90 rounded-full overflow-hidden border border-emerald-500/40 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-300 to-white transition-all duration-75 ease-linear shadow-[0_0_15px_#00ff66]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between items-center text-[10px] font-mono text-emerald-500/80">
            <span>ENTERING MAIN WORKSPACE IN {secondsRemaining}s</span>
            <span className="text-emerald-400">{progress < 100 ? 'CALIBRATING...' : 'READY'}</span>
          </div>
        </div>

        {/* Skip / Enter Action Pill */}
        <div className="mt-7 flex items-center space-x-2 text-xs font-mono text-emerald-400/90 hover:text-emerald-200 transition-colors">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>Click anywhere to enter now</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 animate-pulse" />
          </span>
        </div>
      </div>
    </div>
  );
}
