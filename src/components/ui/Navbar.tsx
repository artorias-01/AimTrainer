import React from 'react';
import { Crosshair } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface NavbarProps {
  activePage?: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <nav className="w-full bg-[#040a12]/95 backdrop-blur-md text-white sticky top-0 z-40 px-6 md:px-16 py-4 flex items-center justify-between select-none border-b border-[#00d2ff]/30 bg-p3r-dots shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Brand Logo - P3R Slanted Glass Badge */}
      <div
        onClick={() => {
          soundManager.playClick();
          onNavigate('landing');
        }}
        onMouseEnter={() => soundManager.playHover()}
        className="cursor-pointer flex items-center gap-3.5 group"
      >
        <div className="-skew-x-12 bg-[#081424] border-2 border-[#00d2ff] text-[#00d2ff] p-2.5 shadow-[0_0_15px_rgba(0,210,255,0.4),3px_3px_0_0_#000] group-hover:bg-[#00d2ff] group-hover:text-[#040a12] transition-all duration-200">
          <div className="skew-x-12 flex items-center justify-center">
            <Crosshair className="w-5 h-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
          </div>
        </div>
        <div className="flex flex-col -skew-x-6">
          <span className="font-display font-black text-2xl tracking-tight text-white leading-none group-hover:text-[#00d2ff] transition-colors drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]">
            AIM<span className="text-[#00d2ff]">//</span>TT
          </span>
          <span className="text-[10px] font-mono tracking-widest text-[#00d2ff] group-hover:text-white transition-colors uppercase font-extrabold">
            P3R RE-AIM ENGINE
          </span>
        </div>
      </div>
    </nav>
  );
};
