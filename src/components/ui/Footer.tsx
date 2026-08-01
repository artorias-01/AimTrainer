import React from 'react';
import { Target, ArrowUpRight, Keyboard } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#0d0d0d] text-white border-t border-[#262626] py-16 px-8 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Col 1: Stamped Brand */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[12px] bg-pink text-[#0d0d0d] flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">
              AIM<span className="text-pink">//</span>TT
            </span>
          </div>
          <p className="text-neutral-400 text-sm max-w-md leading-relaxed font-sans-ui">
            High-performance browser-based 3D FPS aim trainer designed for spatial precision, reaction time, flick accuracy, and smooth tracking. Built with React Three Fiber.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-[#1a1a1a] border border-[#2d2d2d] text-xs font-mono text-neutral-300">
            <Keyboard className="w-3.5 h-3.5 text-pink" />
            <span>POINTER LOCK :: 1000HZ RAW SENSITIVITY</span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs text-pink uppercase tracking-widest">DRILL MATRIX</h4>
          <ul className="space-y-2 text-sm text-neutral-300 font-sans-ui">
            <li>
              <button onClick={() => onNavigate('library')} className="hover:text-pink transition-colors flex items-center gap-1">
                Gridshot Classic <ArrowUpRight className="w-3 h-3" />
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('library')} className="hover:text-pink transition-colors flex items-center gap-1">
                Sphere Tracking <ArrowUpRight className="w-3 h-3" />
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('library')} className="hover:text-pink transition-colors flex items-center gap-1">
                Micro Precision <ArrowUpRight className="w-3 h-3" />
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('library')} className="hover:text-pink transition-colors flex items-center gap-1">
                360° Arena <ArrowUpRight className="w-3 h-3" />
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: System Specs */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs text-pink uppercase tracking-widest">ENGINE SPECS</h4>
          <ul className="space-y-2 text-xs font-mono text-neutral-400">
            <li>RENDERER: THREE.JS (R3F)</li>
            <li>TARGET REFRESH: 60 - 240 FPS</li>
            <li>PALETTE: DYNAMIC THEME ACCENT</li>
            <li>BOUNDING RADIUS: 12PX UNIFIED</li>
            <li>AUDIO: WEB AUDIO API SYNTH</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#262626] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-4">
        <span>© 2026 AIM//TT EDITORIAL AIM TRAINER. ALL RIGHTS RESERVED.</span>
        <span>DYNAMIC ACCENT EDITORIAL SYSTEM</span>
      </div>
    </footer>
  );
};
