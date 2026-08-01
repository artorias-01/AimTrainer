import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, Layers } from 'lucide-react';
import { getAllScenarios } from '../../utils/scenarios';
import type { WarmupRoutine } from '../../utils/scenarios';
import { saveWarmupRoutine } from '../../utils/storage';
import { soundManager } from '../../utils/audio';

interface RoutineBuilderModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const RoutineBuilderModal: React.FC<RoutineBuilderModalProps> = ({ onClose, onSaved }) => {
  const [name, setName] = useState('MY CUSTOM WARMUP');
  const [description, setDescription] = useState('Custom multi-drill routine playlist.');
  const [selectedDrills, setSelectedDrills] = useState<string[]>(['gridshot-classic', 'strafe-tracking']);

  const allScenarios = getAllScenarios();

  const handleAddDrill = (id: string) => {
    soundManager.playClick();
    setSelectedDrills([...selectedDrills, id]);
  };

  const handleRemoveDrill = (index: number) => {
    soundManager.playClick();
    const updated = [...selectedDrills];
    updated.splice(index, 1);
    setSelectedDrills(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDrills.length === 0) return;
    soundManager.playClick();

    const routine: WarmupRoutine = {
      id: 'routine-' + Date.now(),
      name: name.toUpperCase(),
      description,
      drillIds: selectedDrills,
      isBuiltIn: false,
    };

    saveWarmupRoutine(routine);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#141414] border border-pink/50 rounded-[12px] p-6 max-w-xl w-full space-y-6 shadow-2xl my-8 text-left"
      >
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-pink" />
            <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-wider">
              CREATE WARMUP ROUTINE
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-neutral-400 font-bold">ROUTINE NAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-sm text-white font-bold focus:outline-none focus:border-pink"
            />
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

          {/* Selected Drills Sequence List */}
          <div className="space-y-2">
            <label className="text-neutral-400 font-bold flex justify-between">
              <span>PLAYLIST SEQUENCE ({selectedDrills.length} DRILLS)</span>
              <span className="text-pink">ORDERED SEQUENTIAL</span>
            </label>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {selectedDrills.map((drillId, idx) => {
                const sc = allScenarios.find((s) => s.id === drillId);
                return (
                  <div
                    key={`${drillId}-${idx}`}
                    className="flex items-center justify-between bg-[#0d0d0d] border border-[#262626] p-2.5 rounded-[12px]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-pink">#{idx + 1}</span>
                      <span className="font-display font-bold text-sm text-white">{sc?.name || drillId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDrill(idx)}
                      className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Drills Picker */}
          <div className="space-y-2 pt-2 border-t border-[#262626]">
            <label className="text-neutral-400 font-bold block">ADD DRILL TO ROUTINE</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {allScenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleAddDrill(sc.id)}
                  className="flex items-center justify-between p-2 rounded-[8px] bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#262626] hover:border-pink text-left transition-all group"
                >
                  <span className="font-display font-bold text-xs text-white truncate">{sc.name}</span>
                  <Plus className="w-3.5 h-3.5 text-pink shrink-0" />
                </button>
              ))}
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
              disabled={selectedDrills.length === 0}
              className="btn-editorial-pink px-6 py-2.5 text-xs font-bold uppercase flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> SAVE ROUTINE
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
