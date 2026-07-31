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
import { useGameStore } from './store/useGameStore';

function getInitialPage(): string {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const validPages = ['landing', 'library', 'arena', 'results', 'dashboard', 'settings'];
  return validPages.includes(hash) ? hash : 'landing';
}

export function App() {
  const [activePage, setActivePage] = useState<string>(getInitialPage);
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

  const handleNavigate = (page: string, scenarioId?: string) => {
    if (scenarioId) {
      setScenario(scenarioId);
    }
    setActivePage(page);
    window.location.hash = page === 'landing' ? '' : `#${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans-ui selection:bg-[#f5b8c9] selection:text-[#0d0d0d]">
      {/* Dynamic Floating Ambient Particle Field (Inner pages ONLY, NOT landing or arena) */}
      {activePage !== 'arena' && activePage !== 'landing' && <ParticleBackground />}

      {/* Persistent Global Header Navbar */}
      {activePage !== 'arena' && <Navbar activePage={activePage} onNavigate={handleNavigate} />}

      {/* Main Game Content Area */}
      <main className="relative z-10 flex-1 w-full">
        {activePage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {activePage === 'library' && <LibraryPage onNavigate={handleNavigate} />}
        {activePage === 'arena' && <ArenaPage onNavigate={handleNavigate} />}
        {activePage === 'results' && <ResultsPage onNavigate={handleNavigate} />}
        {activePage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {activePage === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
      </main>

      {/* Persistent Global Footer */}
      {activePage !== 'arena' && activePage !== 'landing' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;
