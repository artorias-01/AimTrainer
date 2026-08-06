import React from 'react';
import { Crosshair } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface NavbarProps {
  activePage?: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <nav className="w-full bg-[#0d0d0d] border-b border-[#262626] text-white sticky top-0 z-40 px-6 md:px-16 py-3.5 flex items-center justify-between select-none">
      {/* Brand Logo - Dynamic Theme Accent */}
      <div
        onClick={() => {
          soundManager.playClick();
          onNavigate('landing');
        }}
        onMouseEnter={() => soundManager.playHover()}
        className="cursor-pointer flex items-center gap-3 group"
        title="Return to Main Menu"
      >
        <div className="w-9 h-9 rounded-[10px] bg-[#141414] border border-pink/40 text-pink flex items-center justify-center font-mono font-bold text-base group-hover:bg-pink group-hover:text-[#0d0d0d] group-hover:border-pink transition-all duration-300">
          <Crosshair className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-xl tracking-tight text-white leading-none group-hover:text-pink transition-colors">
            AIM<span className="text-pink">//</span>TT
          </span>
          <span className="text-[9px] font-mono tracking-widest text-neutral-400 group-hover:text-white transition-colors">
            3D AIM ENGINE
          </span>
        </div>
      </div>
    </nav>
  );
};


