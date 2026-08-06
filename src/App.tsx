import { useState, useEffect } from 'react';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import { ParticleBackground } from './components/ui/ParticleBackground';
import { LandingPage } from './pages/LandingPage';
import { LibraryPage } from './pages/LibraryPage';
import { ArenaPage } from './pages/ArenaPage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { OnboardingOverlay } from './components/ui/OnboardingOverlay';
import { CommandPalette } from './components/ui/CommandPalette';
import { IntroTransition } from './components/3d/IntroTransition';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useGameStore } from './store/useGameStore';
import { getOnboardingCompleted } from './utils/storage';

function getInitialPage(): string {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const validPages = ['landing', 'library', 'arena', 'results', 'dashboard', 'settings'];
  return validPages.includes(hash) ? hash : 'landing';
}

export function App() {
  const [activePage, setActivePage] = useState<string>(getInitialPage);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!getOnboardingCompleted());
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('aimtt_intro_played_v1');
    } catch {
      return true;
    }
  });
  const { setScenario } = useGameStore();

  // Listen to browser Back / Forward buttons and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const page = getInitialPage();
      setActivePage(page);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Global keyboard listener for Ctrl+K Command Palette and app-wide ESC navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (showCommandPalette) {
          setShowCommandPalette(false);
          return;
        }

        // Do not interfere with Arena in-game pause listener
        if (activePage === 'arena') return;

        // Navigate back to Landing page from top-level views (library, dashboard, results, settings)
        e.preventDefault();
        handleNavigate('landing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, activePage]);

  const handleNavigate = (page: string, scenarioId?: string) => {
    if (scenarioId) {
      setScenario(scenarioId);
    }
    setActivePage(page);
    window.location.hash = page === 'landing' ? '' : `#${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans-ui selection:bg-pink selection:text-[#0d0d0d]">
      {/* 3D Intro Transition (played once per session) */}
      {showIntro && <IntroTransition onComplete={() => setShowIntro(false)} />}

      {/* Onboarding Overlay for first-run users */}
      {showOnboarding && <OnboardingOverlay onDismiss={() => setShowOnboarding(false)} />}

      {/* Command Palette Modal (Cmd/Ctrl + K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleNavigate}
      />

      {/* Dynamic Floating Ambient Particle Field (Inner pages ONLY, NOT landing or arena) */}
      {activePage !== 'arena' && activePage !== 'landing' && <ParticleBackground />}

      {/* Persistent Global Header Navbar */}
      {activePage !== 'arena' && <Navbar activePage={activePage} onNavigate={handleNavigate} />}

      {/* Main Game Content Area */}
      <main className="relative z-10 flex-1 w-full">
        {activePage === 'landing' && (
          <ErrorBoundary fallbackTitle="LANDING PAGE ERROR">
            <LandingPage onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}
        {activePage === 'library' && (
          <ErrorBoundary fallbackTitle="DRILL LIBRARY ERROR">
            <LibraryPage onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}
        {activePage === 'arena' && (
          <ErrorBoundary fallbackTitle="ARENA SESSION ERROR">
            <ArenaPage onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}
        {activePage === 'results' && (
          <ErrorBoundary fallbackTitle="RESULTS PAGE ERROR">
            <ResultsPage onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}
        {activePage === 'dashboard' && (
          <ErrorBoundary fallbackTitle="ANALYTICS DASHBOARD ERROR">
            <DashboardPage onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}
        {activePage === 'settings' && (
          <ErrorBoundary fallbackTitle="OPTIONS PAGE ERROR">
            <SettingsPage onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}
      </main>

      {/* Persistent Global Footer */}
      {activePage !== 'arena' && activePage !== 'landing' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;
