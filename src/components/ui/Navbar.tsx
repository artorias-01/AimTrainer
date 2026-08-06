import React, { useState, useEffect } from 'react';
import { Crosshair, Maximize2, Minimize2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { toggleFullscreen } from '../../utils/fullscreen';

interface NavbarProps {
  activePage?: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !!document.fullscreenElement : false
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <nav className="w-full bg-[#0d0d0d] border-b border-[#262626] text-white sticky top-0 z-40 px-6 md:px-16 py-3 flex items-center justify-between select-none">
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

      {/* Right Side Controls: Fullscreen Toggle */}
      <button
        onClick={() => {
          soundManager.playClick();
          toggleFullscreen();
        }}
        onMouseEnter={() => soundManager.playHover()}
        className="px-3 py-1.5 rounded-[8px] bg-[#141414] hover:bg-[#1f1f1f] text-neutral-400 hover:text-white border border-[#262626] hover:border-pink transition-all flex items-center gap-2 text-xs font-mono font-bold focus:outline-none"
        title={isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen Mode'}
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-pink" /> : <Maximize2 className="w-3.5 h-3.5 text-pink" />}
        <span className="hidden sm:inline uppercase text-[11px]">{isFullscreen ? 'WINDOWED' : 'FULLSCREEN'}</span>
      </button>
    </nav>
  );
};


