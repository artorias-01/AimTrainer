import React from 'react';
import { Crosshair } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface NavbarProps {
  activePage?: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <nav className="w-full bg-[#0d0d0d] text-white sticky top-0 z-40 px-6 md:px-16 py-4 flex items-center justify-between select-none border-b border-[#262626] bg-persona-dots">
      {/* Brand Logo - Persona Slanted Badge */}
      <div
        onClick={() => {
          soundManager.playClick();
          onNavigate('landing');
        }}
        onMouseEnter={() => soundManager.playHover()}
        className="cursor-pointer flex items-center gap-3.5 group"
      >
        <div className="-skew-x-6 bg-[#141414] border-2 border-pink text-pink p-2 shadow-[3px_3px_0_0_var(--accent-color)] group-hover:bg-pink group-hover:text-[#0d0d0d] transition-all duration-200">
          <div className="skew-x-6 flex items-center justify-center">
            <Crosshair className="w-5 h-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
          </div>
        </div>
        <div className="flex flex-col -skew-x-3">
          <span className="font-display font-black text-2xl tracking-tight text-white leading-none group-hover:text-pink transition-colors drop-shadow-[2px_2px_0_#000]">
            AIM<span className="text-pink">//</span>TT
          </span>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 group-hover:text-white transition-colors uppercase font-bold">
            3D EDITORIAL TRAINER
          </span>
        </div>
      </div>
    </nav>
  );
};
