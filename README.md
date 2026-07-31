# 🎯 AimTrainer (AimTT) - 3D FPS Aim Trainer & Performance Analytics

**AimTrainer** is an esports-grade 3D FPS aim training application built with React 19, Three.js, `@react-three/fiber`, Zustand, and Tailwind CSS. Designed with a dark editorial aesthetic (`#0d0d0d` / `#f5b8c9`), it provides realistic mouse input handling (cm/360 sensitivity conversion), custom target practice scenarios, automated warmup routines, benchmark ranking, weak-point analytics, shareable result cards, and low-latency performance modes.

---

## ✨ Key Features

- **🎮 Esport-Grade 3D Arena**
  - Direct pointer-lock mouse aiming with automatic session startup (no click needed).
  - Multi-engine sensitivity converter (Valorant, CS2/Source, Overwatch 2, Apex Legends) with accurate `cm/360` calculation.
  - High-contrast target palette (`#f5b8c9`, `#ffffff`, `#ffc9d6`, `#e2e2e2`).
  - Cosmetic Target Shapes (`Sphere`, `Torus`, `Cube`) & Arena Backdrops (`Grid Room`, `Minimal Void`, `Gradient Room`).

- **🛠️ Custom Scenario Creator**
  - Design custom training drills: adjust target count, radius, movement speed, path dynamics (`linear`, `sinusoidal`, `erratic`), direction jukes, heading drift intervals, lifetime expiration windows, and arena geometry.
  - Save, edit, and delete custom drills directly in local storage.

- **📜 Warmup Routine & Playlist Engine**
  - Chain drills together into automated warmup playlists.
  - Built-in presets (*"Valorant Warmup Routine"*, *"Tracking Mastery Playlist"*) or build custom playlists.
  - Seamless inter-drill transition overlays (`NEXT DRILL IN SEQUENCE`).

- **🏆 Official Benchmark Test & Composite Aim Rating**
  - Standardized 4-drill sequence evaluating Clicking, Tracking, Precision, and Switching.
  - Calculates normalized Composite Aim Score ($0 - 1000$) and assigns Letter Grades ($S^+$, $S$, $A$, $B$, $C$, $D$).

- **🔥 Daily Challenge & Streak Counter**
  - Deterministic daily featured drill.
  - Streak tracking counter and 30-day activity contribution heatmap grid.

- **🧠 Weak-Point Detector Analytics**
  - Analyzes accuracy across categories over your last 20 sessions.
  - Surfaces data-driven training recommendations to target your weakest skill area.

- **📊 Reaction Time Histogram & Spatial Heatmap**
  - Per-shot time-to-kill (TTK) reaction time distribution histogram (Recharts).
  - 2D target spatial impact error heatmap visualization (HTML5 Canvas).

- **🖼️ Shareable PNG Result Card Generator**
  - Download high-res PNG performance summary graphic directly from the results screen.

- **⌨️ Command Palette (`Ctrl+K` / `Cmd+K`)**
  - Quick global search navigation to jump to any drill, routine, or page instantly.

- **🎯 Per-Scenario Crosshair Profiles**
  - Map saved crosshair presets to specific scenarios or categories (e.g. dot for precision, cross for clicking).
  - Save, load, delete, import, and export crosshairs via JSON config codes.

- **💾 Data Backup & Restore**
  - Export all sessions and custom scenarios as JSON or CSV files.
  - Import JSON backups anytime.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- npm or pnpm / yarn / bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/artorias-01/AimTrainer.git
   cd AimTrainer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling & UI**: Vanilla CSS + Tailwind CSS + Framer Motion
- **Icons**: [Lucide React](https://lucide.dev/)
- **Analytics Charts**: [Recharts](https://recharts.org/) + Canvas Heatmaps & Histograms

---

## 📜 License

MIT License. Built for aim training enthusiasts and esports competitors.
