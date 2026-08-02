import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Target } from 'lucide-react';
import type { ScenarioDef, ScenarioCategory } from '../../utils/scenarios';
import { saveCustomScenario } from '../../utils/storage';
import { soundManager } from '../../utils/audio';

interface CustomScenarioModalProps {
  initialScenario?: ScenarioDef | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  initialScenario,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState(initialScenario?.name || 'CUSTOM DRILL // 01');
  const [category, setCategory] = useState<ScenarioCategory>(initialScenario?.category || 'clicking');
  const [description, setDescription] = useState(initialScenario?.description || 'Custom user-created training scenario.');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Pro'>(initialScenario?.difficulty || 'Intermediate');
  const [durationSeconds, setDurationSeconds] = useState(initialScenario?.durationSeconds || 60);
  const [targetCount, setTargetCount] = useState(initialScenario?.targetCount || 3);
  const [targetRadius, setTargetRadius] = useState(initialScenario?.targetRadius || 0.4);
  const [targetSpeed, setTargetSpeed] = useState(initialScenario?.targetSpeed || 0);
  const [arenaType, setArenaType] = useState<'1-wall' | '6-wall' | 'open-arena'>(initialScenario?.arenaType || '1-wall');
  const [hasLifetimeLimit, setHasLifetimeLimit] = useState(initialScenario?.hasLifetimeLimit || false);
  const [lifetimeMs, setLifetimeMs] = useState(initialScenario?.lifetimeMs || 600);
  const [pathType, setPathType] = useState<'linear' | 'sinusoidal' | 'erratic'>(initialScenario?.pathType || 'linear');
  const [directionChangeIntervalMs, setDirectionChangeIntervalMs] = useState(initialScenario?.directionChangeIntervalMs || 1000);
  const [enableJukes, setEnableJukes] = useState(initialScenario?.enableJukes || false);
  const [playerDistance, setPlayerDistance] = useState(initialScenario?.playerPosition?.z ?? 3.0);
  const [speedVariance, setSpeedVariance] = useState(initialScenario?.speedVariance ?? 0.2);
  const [maxHp, setMaxHp] = useState(initialScenario?.maxHp ?? 1);
  const [fireMode, setFireMode] = useState<'semi' | 'auto'>(initialScenario?.fireMode ?? 'semi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    const id = initialScenario?.id || 'custom-' + Date.now();
    const customDef: ScenarioDef = {
      id,
      name: name.toUpperCase(),
      category,
      description,
      difficulty,
      durationSeconds,
      targetCount,
      targetRadius,
      targetSpeed,
      maxHp,
      damagePerHit: 1,
      fireMode,
      arenaType,
      playerPosition: { x: 0, y: 2.2, z: playerDistance },
      hasLifetimeLimit,
      lifetimeMs: hasLifetimeLimit ? lifetimeMs : undefined,
      pathType: targetSpeed > 0 ? pathType : undefined,
      directionChangeIntervalMs: targetSpeed > 0 ? directionChangeIntervalMs : undefined,
      speedVariance: targetSpeed > 0 ? speedVariance : undefined,
      enableJukes: targetSpeed > 0 ? enableJukes : undefined,
      tags: ['CUSTOM', category.toUpperCase(), arenaType.toUpperCase()],
      recommendedCm360: '25-45 cm',
      iconName: 'Target',
      isCustom: true,
    };

    saveCustomScenario(customDef);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#141414] border border-pink/50 rounded-[12px] p-6 max-w-2xl w-full space-y-6 shadow-2xl my-8 text-left"
      >
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-pink" />
            <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-wider">
              {initialScenario ? 'EDIT CUSTOM DRILL' : 'CREATE CUSTOM DRILL'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold">DRILL NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-sm text-white font-bold focus:outline-none focus:border-pink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold">CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScenarioCategory)}
                className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-sm text-white focus:outline-none focus:border-pink"
              >
                <option value="clicking">CLICKING / FLICKING</option>
                <option value="tracking">TRACKING / SMOOTHNESS</option>
                <option value="switching">SWITCHING / REFLEX</option>
                <option value="precision">PRECISION / MICRO</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-400 font-bold">DESCRIPTION</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-xs text-white focus:outline-none focus:border-pink"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold">DURATION (SEC)</label>
              <input
                type="number"
                min="15"
                max="180"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 60)}
                className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-2.5 text-sm text-white focus:outline-none focus:border-pink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold">TARGET COUNT</label>
              <input
                type="number"
                min="1"
                max="10"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-2.5 text-sm text-white focus:outline-none focus:border-pink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold">RADIUS ({targetRadius.toFixed(2)}M)</label>
              <input
                type="range"
                min="0.15"
                max="1.5"
                step="0.05"
                value={targetRadius}
                onChange={(e) => setTargetRadius(parseFloat(e.target.value))}
                className="w-full accent-pink bg-[#262626] rounded-lg h-2.5 mt-2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold">SPEED ({targetSpeed}M/S)</label>
              <input
                type="range"
                min="0"
                max="8.0"
                step="0.2"
                value={targetSpeed}
                onChange={(e) => setTargetSpeed(parseFloat(e.target.value))}
                className="w-full accent-pink bg-[#262626] rounded-lg h-2.5 mt-2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold">TARGET HP ({maxHp})</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxHp}
                onChange={(e) => setMaxHp(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-2.5 text-sm text-white focus:outline-none focus:border-pink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold">FIRE MODE</label>
              <div className="flex gap-2">
                {(['semi', 'auto'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFireMode(mode)}
                    className={`flex-1 py-2 rounded-[8px] text-[10px] font-bold uppercase border transition-all ${
                      fireMode === mode ? 'bg-pink text-[#0d0d0d] border-pink' : 'bg-[#141414] text-neutral-400 border-[#262626]'
                    }`}
                  >
                    {mode === 'semi' ? 'SEMI-AUTO' : 'FULL-AUTO'}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-neutral-500 leading-tight">
                {fireMode === 'auto' ? 'Hold mouse to fire continuously (~600 RPM)' : 'One shot per click'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#262626]">
            <div className="space-y-2 bg-[#0d0d0d] p-3.5 rounded-[12px] border border-[#262626]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">LIFETIME EXPIRATION WINDOW</span>
                <button
                  type="button"
                  onClick={() => setHasLifetimeLimit(!hasLifetimeLimit)}
                  className={`px-3 py-1 rounded-[8px] text-[10px] font-bold border transition-all ${
                    hasLifetimeLimit ? 'bg-pink text-[#0d0d0d] border-pink' : 'bg-[#141414] text-neutral-500 border-[#262626]'
                  }`}
                >
                  {hasLifetimeLimit ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
              {hasLifetimeLimit && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>EXPIRE WINDOW</span>
                    <span className="text-white font-bold">{lifetimeMs} MS</span>
                  </div>
                  <input
                    type="range"
                    min="250"
                    max="1500"
                    step="50"
                    value={lifetimeMs}
                    onChange={(e) => setLifetimeMs(parseInt(e.target.value))}
                    className="w-full accent-pink bg-[#262626] rounded-lg h-2"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 bg-[#0d0d0d] p-3.5 rounded-[12px] border border-[#262626]">
              <label className="font-bold text-white block">PATH PATTERN & DYNAMICS</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['linear', 'sinusoidal', 'erratic'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPathType(type)}
                    className={`py-1.5 rounded-[8px] text-[9px] font-bold uppercase border transition-all ${
                      pathType === type ? 'bg-pink text-[#0d0d0d] border-pink' : 'bg-[#141414] text-neutral-400 border-[#262626]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-neutral-400 font-bold">ENABLE DIRECTION JUKES</span>
                <button
                  type="button"
                  onClick={() => setEnableJukes(!enableJukes)}
                  className={`px-2.5 py-0.5 rounded-[6px] text-[9px] font-bold border transition-all ${
                    enableJukes ? 'bg-pink text-[#0d0d0d] border-pink' : 'bg-[#141414] text-neutral-500 border-[#262626]'
                  }`}
                >
                  {enableJukes ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>HEADING DRIFT INTERVAL</span>
                  <span className="text-white font-bold">{directionChangeIntervalMs} MS</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="100"
                  value={directionChangeIntervalMs}
                  onChange={(e) => setDirectionChangeIntervalMs(parseInt(e.target.value))}
                  className="w-full accent-pink bg-[#262626] rounded-lg h-2"
                />
              </div>
              {targetSpeed > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>SPEED DRIFT VARIANCE</span>
                    <span className="text-white font-bold">{(speedVariance * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={speedVariance}
                    onChange={(e) => setSpeedVariance(parseFloat(e.target.value))}
                    className="w-full accent-pink bg-[#262626] rounded-lg h-2"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 bg-[#0d0d0d] p-3.5 rounded-[12px] border border-[#262626]">
              <label className="font-bold text-white block">ARENA & DIFFICULTY</label>
              <div className="grid grid-cols-2 gap-2">
                {(['1-wall', '6-wall'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setArenaType(type)}
                    className={`py-2 rounded-[8px] text-[10px] font-bold uppercase border transition-all ${
                      arenaType === type ? 'bg-pink text-[#0d0d0d] border-pink' : 'bg-[#141414] text-neutral-400 border-[#262626]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-neutral-400 font-bold">DIFFICULTY</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="bg-[#141414] text-white text-[10px] p-1 rounded border border-[#262626]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Pro">Pro</option>
                </select>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>DISTANCE TO TARGET WALL</span>
                  <span className="text-white font-bold">{playerDistance.toFixed(1)} M</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="10.0"
                  step="0.5"
                  value={playerDistance}
                  onChange={(e) => setPlayerDistance(parseFloat(e.target.value))}
                  className="w-full accent-pink bg-[#262626] rounded-lg h-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-[12px] bg-[#1a1a1a] hover:bg-[#262626] text-neutral-300 font-mono text-xs font-bold border border-[#262626] transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="btn-editorial-pink px-6 py-2.5 text-xs font-bold uppercase flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> SAVE DRILL
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
