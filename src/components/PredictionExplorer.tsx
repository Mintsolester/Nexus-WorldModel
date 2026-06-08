import React, { useState, useMemo } from 'react';
import { Prediction, Entity } from '../types';
import { Search, Compass, Sliders, AlertTriangle, ShieldCheck, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PredictionExplorerProps {
  predictions: Prediction[];
  entities: Entity[];
}

export default function PredictionExplorer({ predictions, entities }: PredictionExplorerProps) {
  const [filterHorizon, setFilterHorizon] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Store custom adjusted sensitivities on a per-prediction ID basis
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const handleSliderChange = (id: string, val: number) => {
    setAdjustments({
      ...adjustments,
      [id]: val
    });
  };

  const handleResetAdjustments = () => {
    setAdjustments({});
  };

  // Filter predictions list
  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      const matchHorizon = filterHorizon === 'all' || p.timeHorizon === filterHorizon;
      
      const targetNode = entities.find((e) => e.id === p.targetEntityId);
      const searchStr = `${p.title} ${p.description} ${targetNode?.name || ''}`.toLowerCase();
      const matchSearch = searchStr.includes(searchQuery.toLowerCase());

      return matchHorizon && matchSearch;
    });
  }, [predictions, entities, filterHorizon, searchQuery]);

  const getTimeHorizonLabel = (horizon: string) => {
    switch (horizon) {
      case '1m': return 'ULTRA SHORT (1 MONTH)';
      case '1y': return 'TACTICAL (1 YEAR)';
      case '5y': return 'STRATEGIC (5 YEARS)';
      case '10y': return 'SECULAR (10 YEARS)';
      default: return horizon;
    }
  };

  return (
    <div className="border border-cyan-500/20 bg-slate-950/80 p-4 rounded-md font-mono" id="predictions-explorer">
      
      {/* Header HUD */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-cyan-400">
            PROBABILISTIC COGNITIVE FORECAST EXPLORER
          </span>
        </div>
        {Object.keys(adjustments).length > 0 && (
          <button
            onClick={handleResetAdjustments}
            className="text-[8px] border border-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-400 hover:bg-cyan-950/40"
          >
            RESET SLIDERS
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        {/* Search Input */}
        <div className="md:col-span-1 relative">
          <input
            type="text"
            placeholder="Search prediction matrix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-cyan-500/10 rounded pl-7 pr-2 py-1.5 text-[9px] text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2" />
        </div>

        {/* Horizon Tabs */}
        <div className="md:col-span-2 flex flex-wrap gap-1 items-center justify-end">
          <span className="text-[8px] text-gray-500 mr-2 uppercase">Time Horizon filter:</span>
          {['all', '1m', '1y', '5y', '10y'].map((horizon) => (
            <button
              key={`horizon-btn-${horizon}`}
              onClick={() => setFilterHorizon(horizon)}
              className={`text-[8px] uppercase px-2 py-1 text-center border rounded ${
                filterHorizon === horizon
                  ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-500/10 text-gray-500 hover:text-cyan-400'
              }`}
            >
              {horizon === 'all' ? 'All horizons' : horizon}
            </button>
          ))}
        </div>
      </div>

      {filteredPredictions.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-cyan-500/10 rounded">
          <p className="text-[9px] text-gray-500 uppercase">No forecasting anomalies found matching search vector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredPredictions.map((pred) => {
            const node = entities.find((e) => e.id === pred.targetEntityId);
            
            // Get user adjusted probability or default
            const originalProb = pred.probability;
            const currentProb = adjustments[pred.id] !== undefined ? adjustments[pred.id] : originalProb;
            
            // Dynamic sensitivity logic - if probability is raised, "Induced Friction Coeff" increases!
            const frictionCoefficient = Math.round((currentProb / 100) * pred.impactScore * 1.3 * 10) / 10;
            const isAdjusted = adjustments[pred.id] !== undefined;

            return (
              <div
                key={pred.id}
                className={`p-3.5 border rounded transition-all duration-200 ${
                  isAdjusted ? 'border-amber-500/50 bg-amber-950/5' : 'border-cyan-500/10 bg-slate-900/10'
                }`}
              >
                {/* Upper row info indicators */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-gray-200 tracking-wide">
                      {pred.title.toUpperCase()}
                    </span>
                    <span className="text-[7.5px] bg-slate-900 px-1 border border-cyan-500/20 text-indigo-400 rounded">
                      {getTimeHorizonLabel(pred.timeHorizon)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[8px] text-gray-500">
                    <span>SECTOR FOCUS:</span>
                    <span className="text-cyan-400 font-bold uppercase">{node ? node.name : pred.targetEntityId}</span>
                  </div>
                </div>

                <p className="text-gray-400 text-[8.5px] leading-relaxed mb-3.5 italic">
                  {pred.description}
                </p>

                {/* Analytical sliders, scores and dials */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-cyan-500/5 pt-3 mb-2.5">
                  {/* Slider Control Box */}
                  <div className="md:col-span-5 space-y-1.5 border-r border-cyan-500/5 pr-3">
                    <div className="flex justify-between items-center text-[7.5px]">
                      <span className="text-gray-500 font-bold flex items-center space-x-1">
                        <Sliders className="w-3 h-3 text-cyan-400" />
                        <span>PROBABILITY LOAD: {currentProb}%</span>
                      </span>
                      {isAdjusted && (
                        <span className="text-amber-500 text-[7px] animate-pulse font-black uppercase">
                          MANUAL INTERVENTION ACTIVE
                        </span>
                      )}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentProb}
                      onChange={(e) => handleSliderChange(pred.id, parseInt(e.target.value))}
                      className="w-full accent-cyan-400 cursor-ew-resize h-1 bg-slate-900 border border-cyan-500/10 rounded"
                    />
                    <div className="flex justify-between text-[6.5px] text-gray-500 leading-none">
                      <span>0% MIN</span>
                      <span>NOMINAL: {originalProb}%</span>
                      <span>100% MAXIMUM</span>
                    </div>
                  </div>

                  {/* Impact scores block */}
                  <div className="md:col-span-3 flex justify-around text-center items-center border-r border-cyan-500/5">
                    <div>
                      <span className="text-gray-500 text-[7px] block leading-none mb-1">SEVERITY</span>
                      <span className="text-sm font-bold text-red-400">{pred.impactScore}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[7px] block leading-none mb-1">INDUCED FRICTION</span>
                      <span className={`text-sm font-bold ${isAdjusted ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {frictionCoefficient.toFixed(1)}λ
                      </span>
                    </div>
                  </div>

                  {/* CI intervals */}
                  <div className="md:col-span-4 flex items-center justify-between text-[7px] pl-2 bg-slate-900/30 p-1.5 rounded">
                    <div className="flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-gray-400 leading-none">CONFIDENCE INTERVAL:</span>
                    </div>
                    <span className="text-indigo-400 font-bold font-mono text-[8px] bg-indigo-950/50 px-1 border border-indigo-500/20 rounded">
                      {pred.confidenceInterval}
                    </span>
                  </div>
                </div>

                {/* Mitigations / Catalysts list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-cyan-500/5">
                  {/* Catalysts list */}
                  <div className="bg-slate-900/40 p-2 rounded border border-cyan-500/5">
                    <span className="text-[7.5px] text-orange-400 font-black block mb-1 flex items-center space-x-1">
                      <Zap className="w-2.5 h-2.5" />
                      <span>ACCELERATION CATALYSTS</span>
                    </span>
                    <ul className="space-y-0.5 max-h-16 overflow-y-auto">
                      {pred.catalysts.map((cat, idx) => (
                        <li key={`cat-${idx}`} className="text-[7.5px] text-gray-400 flex items-center space-x-1 leading-normal">
                          <span className="text-orange-500">•</span>
                          <span>{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mitigations policy suggestions */}
                  <div className="bg-slate-900/40 p-2 rounded border border-cyan-500/5">
                    <span className="text-[7.5px] text-green-400 font-black block mb-1 flex items-center space-x-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>STRATEGIC POLICY MITIGATIONS</span>
                    </span>
                    <ul className="space-y-0.5 max-h-16 overflow-y-auto">
                      {pred.mitigations.map((mit, idx) => (
                        <li key={`mit-${idx}`} className="text-[7.5px] text-gray-400 flex items-center space-x-1 leading-normal">
                          <span className="text-green-500">•</span>
                          <span>{mit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
