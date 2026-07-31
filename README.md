# 🎯 AimTrainer (AimTT) - 3D FPS Aim Trainer & Performance Analytics

**AimTrainer** is an esports-grade 3D FPS aim training application built with React 19, Three.js, `@react-three/fiber`, Zustand, and Tailwind CSS. Designed with a dark editorial aesthetic (`#0d0d0d` / `#f5b8c9`), it provides realistic mouse input handling (cm/360 sensitivity conversion), target practice scenarios, real-time analytics heatmaps, customizable crosshairs, and low-latency performance modes.

---

## ✨ Features

- **🎮 Esport-Grade 3D Arena**
  - Direct pointer-lock mouse aiming with raw 1:1 camera rotation.
  - Multi-engine sensitivity converter (Valorant, CS2/Source, Overwatch 2, Apex Legends) with accurate `cm/360` calculation.
  - High-contrast, accessibility-tested target palette (`#f5b8c9`, `#ffffff`, `#ffc9d6`, `#e2e2e2`).

- **🎯 Targeted Scenario Library**
  - **Clicking**: Gridshot, Sixshot, Micro-Flick.
  - **Tracking**: Tracking Sphere, Strafe Tracking, Air-Strafe Tracking.
  - **Switching & Precision**: Target Switching, Reflex Micro-Dots.
  - Global Target Speed Pacing Multiplier (`0.5x` – `1.5x`).

- **📊 Advanced Analytics & Heatmaps**
  - 2D target spatial impact heatmap visualization using HTML5 Canvas.
  - Detailed session summaries: Score, Accuracy %, Avg Time-to-Kill (TTK ms), Max Combo Streak, and Grade Ratings ($S^+$, $S$, $A$, $B$, $C$, $D$).
  - Personal Best (PB) tracking saved to `localStorage`.

- **🎨 Full Custom Crosshair Builder**
  - Real-time SVG preview against test grid.
  - Custom line length, thickness, center gap, opacity, line color (Hex input & presets).
  - Independent center dot controls (size, color, toggle).
  - Independent outline controls (thickness, color, toggle).
  - Save, load, and delete named custom presets (*"My Precision X"*, *"Tracking Dot"*).
  - JSON import/export compatibility.

- **⚡ Performance Mode for Low-End Hardware**
  - Caps 3D Canvas resolution to `1.0 DPR` and disables antialiasing.
  - Toggles background ambient particle fields and non-essential UI entrance animations for maximum FPS.

- **🎵 Web Audio Sound Engine**
  - Synthesized hit pop sounds and UI hover/click tick feedback without external asset latency.

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
- **Analytics Charts**: [Recharts](https://recharts.org/) + Canvas Heatmaps

---

## 📜 License

MIT License. Built for aim training enthusiasts and esports competitors.
