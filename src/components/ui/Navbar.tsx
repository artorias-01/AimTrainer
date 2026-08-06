import React from 'react';
import { Crosshair } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface NavbarProps {
  activePage?: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <nav className="w-full bg-[#0d0d0d] text-white sticky top-0 z-40 px-6 md:px-16 py-4 flex items-center justify-between select-none">
      {/* Brand Logo - Dynamic Theme Accent */}
      <div
        onClick={() => {
          soundManager.playClick();
          onNavigate('landing');
        }}
        onMouseEnter={() => soundManager.playHover()}
        className="cursor-pointer flex items-center gap-3.5 group pointer-events-auto z-50"
      >
        <div className="w-10 h-10 rounded-[12px] bg-[#141414] border border-accent/40 text-accent flex items-center justify-center font-mono font-bold text-lg group-hover:bg-accent group-hover:text-[#0d0d0d] group-hover:border-accent transition-all duration-300">
          <Crosshair className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-2xl tracking-tight text-white leading-none group-hover:text-accent transition-colors">
            AIM<span className="text-accent">//</span>TT
          </span>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 group-hover:text-white transition-colors">
            3D EDITORIAL TRAINER
          </span>
        </div>
      </div>
    </nav>
  );
};
