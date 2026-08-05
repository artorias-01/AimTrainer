import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Target, BarChart2, Settings, Command, Compass } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface NavbarProps {
  activePage?: string;
  onNavigate: (page: string) => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage = 'landing', onNavigate, onOpenCommandPalette }) => {
  const navItems = [
    { id: 'landing', label: 'HOME', icon: Compass },
    { id: 'library', label: 'DRILLS', icon: Target },
    { id: 'dashboard', label: 'ANALYTICS', icon: BarChart2 },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl pointer-events-auto">
      <div className="glass-pill rounded-[20px] px-4 md:px-6 py-2.5 flex items-center justify-between shadow-2xl backdrop-blur-2xl border border-white/10 bg-black/60">
        {/* Brand Logo */}
        <div
          onClick={() => {
            soundManager.playClick();
            onNavigate('landing');
          }}
          onMouseEnter={() => soundManager.playHover()}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-[12px] bg-white/5 border border-pink/40 text-pink flex items-center justify-center font-mono font-bold text-base group-hover:bg-pink group-hover:text-black group-hover:border-pink transition-all duration-300 shadow-md">
            <Crosshair className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-syne font-extrabold text-lg tracking-wider text-white leading-none group-hover:text-pink transition-colors">
              AIM<span className="text-pink">//</span>TT
            </span>
            <span className="text-[9px] font-mono tracking-widest text-neutral-400 group-hover:text-white transition-colors uppercase">
              PRECISION V2.4
            </span>
          </div>
        </div>

        {/* Center Navigation Capsule */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-[14px] p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  onNavigate(item.id);
                }}
                onMouseEnter={() => soundManager.playHover()}
                className={`relative px-4 py-1.5 rounded-[10px] text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  isActive ? 'text-black font-extrabold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-pink rounded-[10px] shadow-lg shadow-pink/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono font-bold text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            144 FPS READY
          </div>

          {onOpenCommandPalette && (
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenCommandPalette();
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="p-2 md:px-3 md:py-1.5 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
              title="Open Command Palette (Ctrl+K)"
            >
              <Command className="w-3.5 h-3.5 text-pink" />
              <span className="hidden md:inline text-[11px]">COMMAND</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-black/40 text-[9px] text-neutral-400 border border-white/10 font-mono">
                ⌘K
              </kbd>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
