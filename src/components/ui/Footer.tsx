import React from 'react';
import { Crosshair, ArrowUpRight, Keyboard, Zap, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#030303] text-white border-t border-white/10 pt-20 pb-12 px-6 md:px-16 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-pink/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
        {/* Col 1: Stamped Brand */}
        <div className="space-y-6 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-pink text-black flex items-center justify-center font-bold shadow-lg shadow-pink/30">
              <Crosshair className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-syne font-extrabold text-3xl tracking-tight text-white">
              AIM<span className="text-pink">//</span>TT
            </span>
          </div>
          <p className="text-neutral-400 text-sm max-w-md leading-relaxed font-sans-ui">
            Next-generation 3D browser aim engine built for high-tier mouse precision, spatial rhythm, zero latency response, and real-time performance analytics.
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-white/[0.04] border border-white/10 text-neutral-300">
              <Keyboard className="w-3.5 h-3.5 text-pink" />
              <span>[ESC] PAUSE</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-white/[0.04] border border-white/10 text-neutral-300">
              <Zap className="w-3.5 h-3.5 text-pink" />
              <span>[R] RESTART</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-white/[0.04] border border-white/10 text-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>50MB INDEXEDDB READY</span>
            </div>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="space-y-4">
          <h4 className="font-syne font-bold text-xs text-pink uppercase tracking-widest">NAVIGATION</h4>
          <ul className="space-y-2.5 text-sm text-neutral-400 font-sans-ui">
            {[
              { label: 'Featured Drills', page: 'library' },
              { label: 'Performance Dashboard', page: 'dashboard' },
              { label: 'Custom Backdrops', page: 'settings' },
              { label: 'Crosshair Studio', page: 'settings' },
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onNavigate(link.page);
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="hover:text-white transition-colors flex items-center gap-1.5 group text-xs font-mono font-medium"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-pink opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Engine Specs */}
        <div className="space-y-4">
          <h4 className="font-syne font-bold text-xs text-pink uppercase tracking-widest">ENGINE TECH</h4>
          <ul className="space-y-2 text-xs font-mono text-neutral-500">
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>RENDERER</span> <span className="text-neutral-300 font-bold">THREE.JS / R3F</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>INPUT DELAY</span> <span className="text-emerald-400 font-bold">&lt; 1 MS RAW</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>BACKDROP STORAGE</span> <span className="text-neutral-300 font-bold">INDEXEDDB</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>AUDIO SYNTH</span> <span className="text-neutral-300 font-bold">WEB AUDIO API</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-4 relative z-10">
        <span>© 2026 AIM//TT ENGINE. ALL RIGHTS RESERVED.</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          SYSTEM OPERATIONAL
        </span>
      </div>
    </footer>
  );
};
