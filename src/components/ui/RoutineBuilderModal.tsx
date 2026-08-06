import React, { useState } from 'react';
import { X, Save, Trash2, Layers } from 'lucide-react';
import { getAllScenarios } from '../../utils/scenarios';
import type { WarmupRoutine } from '../../utils/scenarios';
import { saveWarmupRoutine } from '../../utils/storage';
import { soundManager } from '../../utils/audio';
import { MotionModal } from './MotionModal';

interface RoutineBuilderModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const RoutineBuilderModal: React.FC<RoutineBuilderModalProps> = ({ onClose, onSaved }) => {
  const [name, setName] = useState('MY CUSTOM WARMUP');
  const [description, setDescription] = useState('Custom multi-drill routine playlist.');
  const [selectedDrills, setSelectedDrills] = useState<string[]>(['gridshot-classic', 'airstrafe-tracking']);

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
    <MotionModal isOpen={true} onClose={onClose} maxWidthClass="max-w-xl">
      <div className="p-6 space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-pink" />
            <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-wider">
              BUILD WARMUP ROUTINE
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
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-xs text-white focus:outline-none focus:border-pink"
            />
          </div>

          {/* Drill Playlist Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white uppercase tracking-wider">
                ROUTINE DRILLS SEQUENCE ({selectedDrills.length})
              </label>
            </div>

            {/* Selected Sequence List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 thin-pink-scrollbar">
              {selectedDrills.map((id, index) => {
                const sc = allScenarios.find((s) => s.id === id);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#0d0d0d] p-3 rounded-[12px] border border-[#262626]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-bold text-[10px]">#{index + 1}</span>
                      <span className="font-bold text-white">{sc ? sc.name : id}</span>
                      <span className="text-[9px] text-pink font-bold uppercase bg-pink/10 px-2 py-0.5 rounded-[4px]">
                        {sc?.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDrill(index)}
                      className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove from routine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Drill Select Box */}
            <div className="space-y-1 pt-2">
              <label className="text-neutral-400 font-bold">ADD DRILL TO SEQUENCE</label>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddDrill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-[#0d0d0d] border border-[#262626] rounded-[12px] p-3 text-xs text-white font-bold focus:outline-none focus:border-pink"
                >
                  <option value="">+ SELECT DRILL TO ADD...</option>
                  {allScenarios.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.category.toUpperCase()} - {sc.durationSeconds}S)
                    </option>
                  ))}
                </select>
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
              disabled={selectedDrills.length === 0}
              className="btn-editorial-pink px-6 py-2.5 text-xs font-bold uppercase flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> SAVE ROUTINE
            </button>
          </div>
        </form>
      </div>
    </MotionModal>
  );
};
