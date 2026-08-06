import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface NavbarProps {
  activePage?: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage = 'landing', onNavigate }) => {
  const navItems = [
    { id: 'landing', label: 'HOME' },
    { id: 'library', label: 'LIBRARY' },
    { id: 'dashboard', label: 'ANALYTICS' },
    { id: 'settings', label: 'OPTIONS' },
  ];

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

      {/* Nav Items with Sliding Indicator */}
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                onNavigate(item.id);
              }}
              onMouseEnter={() => soundManager.playHover()}
              className={`relative px-3.5 py-1.5 rounded-[8px] font-mono text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none ${
                isActive ? 'text-pink' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-pink shadow-[0_0_8px_var(--accent-color)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

