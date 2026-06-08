import React, { useState } from 'react';
import { Entity, Scenario, SimulationStep } from '../types';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, ChevronRight, HelpCircle, Layers, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScenarioPanelProps {
  entities: Entity[];
  scenarios: Scenario[];
  onTriggerSimulation: (
    title: string,
    description: string,
    initialShockEntityIds: string[],
    customTriggers: string[]
  ) => void;
  simulationSteps: SimulationStep[] | null;
  currentStepIndex: number;
  onSetStepIndex: (index: number) => void;
  isSimulating: boolean;
  onResetSimulation: () => void;
}

export default function ScenarioPanel({
  entities,
  scenarios,
  onTriggerSimulation,
  simulationSteps,
  currentStepIndex,
  onSetStepIndex,
  isSimulating,
  onResetSimulation
}: ScenarioPanelProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || '');
  const [showCustomConfig, setShowCustomConfig] = useState<boolean>(false);

  // Custom scenario creation state parameters
  const [customTitle, setCustomTitle] = useState<string>('Sovereign Cloud Sovereign Default');
  const [customDescription, setCustomDescription] = useState<string>('Critical hardware supply failure triggers sovereign defaults and widespread capital flight.');
  const [customSeverity, setCustomSeverity] = useState<'mild' | 'moderate' | 'severe' | 'existential'>('severe');
  const [customShockIds, setCustomShockIds] = useState<string[]>(['sovereign_debt_mkt']);
  const [newTriggerText, setNewTriggerText] = useState<string>('');
  const [customTriggers, setCustomTriggers] = useState<string[]>(['Clearing house collateral short squeeze', 'Emergency capital capital freezes']);

  const handleEntityToggle = (id: string) => {
    setCustomShockIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddTrigger = () => {
    if (newTriggerText.trim()) {
      setCustomTriggers([...customTriggers, newTriggerText.trim()]);
      setNewTriggerText('');
    }
  };

  const handleRemoveTrigger = (index: number) => {
    setCustomTriggers(customTriggers.filter((_, i) => i !== index));
  };

  const handleTriggerClick = () => {
    if (showCustomConfig) {
      if (customShockIds.length === 0) {
        alert('Please select at least one starting entity to shock.');
        return;
      }
      onTriggerSimulation(customTitle, customDescription, customShockIds, customTriggers);
    } else {
      const pScenario = scenarios.find((s) => s.id === selectedScenarioId);
      if (pScenario) {
        onTriggerSimulation(pScenario.title, pScenario.description, pScenario.initialShockEntityIds, pScenario.triggers);
      }
    }
  };

  // Get current active step
  const activeStep = simulationSteps ? simulationSteps[currentStepIndex] : null;

  return (
    <div className="border border-cyan-500/20 bg-slate-950/80 p-4 rounded-md font-mono" id="simulation-scenarios-panel">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-cyan-400">
            STRATEGY MATRIX & TEMPORAL STRESS ENGINE
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[9px]">
          <span className="text-gray-500 font-bold">STATE:</span>
          {simulationSteps ? (
            <span className="text-amber-400 font-bold animate-pulse">WARGAME RUNNING</span>
          ) : (
            <span className="text-green-400 font-bold">STANDBY READY</span>
          )}
        </div>
      </div>

      {!simulationSteps ? (
        /* Configuration Panel */
        <div>
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 mb-4">
            <button
              onClick={() => setShowCustomConfig(false)}
              className={`p-1.5 border text-center text-[10px] font-bold tracking-widest leading-none ${
                !showCustomConfig
                  ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30'
                  : 'border-cyan-500/10 text-gray-500 hover:text-cyan-400'
              } rounded uppercase transition-colors`}
            >
              Preset System Shocks
            </button>
            <button
              onClick={() => setShowCustomConfig(true)}
              className={`p-1.5 border text-center text-[10px] font-bold tracking-widest leading-none ${
                showCustomConfig
                  ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30'
                  : 'border-cyan-500/10 text-gray-500 hover:text-cyan-400'
              } rounded uppercase transition-colors`}
            >
              Establish Custom Catalyst
            </button>
          </div>

          {!showCustomConfig ? (
            /* Presets Mode */
            <div className="space-y-3">
              <div className="text-[10px] text-gray-400 leading-relaxed mb-3">
                Select a high-probability global bottleneck catastrophe trigger vector from the strategic catalog to simulate cascading supply chain failures.
              </div>

              {scenarios.map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => setSelectedScenarioId(scen.id)}
                  className={`p-3 border rounded cursor-pointer transition-all duration-200 ${
                    selectedScenarioId === scen.id
                      ? 'border-cyan-400 bg-cyan-950/20'
                      : 'border-cyan-500/10 bg-slate-900/20 hover:border-cyan-500/30 hover:bg-slate-900/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-bold ${selectedScenarioId === scen.id ? 'text-cyan-300' : 'text-gray-300'}`}>
                      {scen.title.toUpperCase()}
                    </span>
                    <span
                      className={`text-[8px] border px-1 rounded uppercase ${
                        scen.severity === 'existential'
                          ? 'border-red-500/40 text-red-400 bg-red-950/20'
                          : 'border-orange-500/40 text-orange-400 bg-orange-950/10'
                      }`}
                    >
                      {scen.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[8.5px] leading-relaxed mb-1">{scen.description}</p>
                  <div className="flex flex-wrap items-center mt-1.5 gap-2 text-[7.5px] text-gray-500 border-t border-cyan-500/5 pt-1.5">
                    <span>CATEGORY: <strong className="text-cyan-500">{scen.category.toUpperCase()}</strong></span>
                    <span>FOCUS NODES: <strong className="text-amber-500">{scen.initialShockEntityIds.join(', ')}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Custom Config Mode */
            <div className="space-y-3 font-mono text-[9px]">
              <div>
                <label className="text-gray-500 font-bold block mb-1">CATALYST SCENARIO TITLE</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/20 rounded p-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-gray-500 font-bold block mb-1">DESCRIPTIVE DISRUPTION OVERVIEW</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/20 rounded p-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500 h-14 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-500 font-bold block mb-1">HAZARD SEVERITY INDEX</label>
                  <select
                    value={customSeverity}
                    onChange={(e: any) => setCustomSeverity(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-500/20 rounded p-1 text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="mild">MILD INTERFERENCE</option>
                    <option value="moderate">MODERATE INTENSITY</option>
                    <option value="severe">SEVERE CRISIS</option>
                    <option value="existential">EXISTENTIAL THREAT</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 font-bold block mb-1">TRIGGER SEQUENCE</label>
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      placeholder="Add trigger details"
                      value={newTriggerText}
                      onChange={(e) => setNewTriggerText(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-500/20 rounded p-1 text-cyan-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500 text-[8.5px]"
                    />
                    <button
                      onClick={handleAddTrigger}
                      className="px-2 border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-950/30 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Triggers Tags */}
              {customTriggers.length > 0 && (
                <div className="flex flex-wrap gap-1 p-1.5 bg-slate-900 border border-cyan-500/10 rounded">
                  {customTriggers.map((trig, idx) => (
                    <span
                      key={`trig-${idx}`}
                      className="flex items-center space-x-1 bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 px-1 py-0.5 rounded text-[8px]"
                    >
                      <span>{trig}</span>
                      <button onClick={() => handleRemoveTrigger(idx)} className="text-red-400 hover:text-red-300">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Selection list of entities to shock directly */}
              <div>
                <label className="text-gray-500 font-bold block mb-1">TARGET INITIAL EPICENTER SHOCK NODES</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-h-24 overflow-y-auto p-1.5 bg-slate-900 border border-cyan-500/10 rounded">
                  {entities.map((node) => (
                    <label
                      key={`checkbox-${node.id}`}
                      className="flex items-center space-x-1.5 cursor-pointer text-gray-400 hover:text-cyan-300 select-none py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={customShockIds.includes(node.id)}
                        onChange={() => handleEntityToggle(node.id)}
                        className="accent-cyan-500 leading-none h-3 w-3"
                      />
                      <span className="text-[8px] truncate uppercase">{node.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trigger Play Action Button */}
          <button
            onClick={handleTriggerClick}
            disabled={isSimulating}
            className={`w-full mt-4 py-2 border bg-cyan-950/30 text-[10px] font-bold text-center tracking-widest text-cyan-400 rounded transition-all duration-200 uppercase flex items-center justify-center space-x-2 ${
              isSimulating
                ? 'opacity-50 cursor-not-allowed border-amber-500'
                : 'border-cyan-500 hover:bg-cyan-500 hover:text-slate-950'
            }`}
          >
            {isSimulating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>COMPILING NEURAL PATHWAYS...</span>
              </>
            ) : (
              <>
                <Play className="w-3w h-3 w-3" />
                <span>INITIATE SYSTEM DISRUPTION WARGAME</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Timeline and Active Cascades Playing Mode */
        <div className="space-y-4">
          
          {/* Timeline Phase Selection Slider Tabs */}
          <div className="grid grid-cols-3 gap-0.5 border border-cyan-500/20 p-0.5 bg-slate-900 rounded">
            {simulationSteps.map((step, idx) => (
              <button
                key={`phase-tab-${idx}`}
                onClick={() => onSetStepIndex(idx)}
                className={`py-1.5 px-1 text-center text-[7.5px] font-bold rounded uppercase leading-none ${
                  currentStepIndex === idx
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-gray-500 hover:text-cyan-400'
                }`}
              >
                PHASE {step.phase}: {step.timeframe}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`desc-${currentStepIndex}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-3 bg-slate-900/60 rounded border border-cyan-500/10 text-gray-300"
            >
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                <span>STAGE LOGS: OUTWARD PROPAGATION</span>
                <span className="text-[8px] text-gray-500 font-mono italic font-normal">TIMEFRAME: {activeStep?.timeframe}</span>
              </div>
              <p className="text-[8.5px] leading-relaxed italic text-gray-300 mb-2">{activeStep?.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* TELEMETRY METRIC READOUTS */}
          {activeStep && (
            <div className="grid grid-cols-3 gap-2 py-1.5">
              <div className="p-2 border border-red-500/10 bg-red-950/5 rounded text-center">
                <span className="text-gray-500 text-[8px] font-bold block leading-none mb-1">SYSTEM STABILITY</span>
                <span className="text-lg font-bold text-red-500 leading-none">{activeStep.globalMetrics.stabilityIndex}%</span>
                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden mt-1 px-0.5">
                  <div className="bg-red-500 h-full" style={{ width: `${activeStep.globalMetrics.stabilityIndex}%` }} />
                </div>
              </div>

              <div className="p-2 border border-orange-500/10 bg-orange-950/5 rounded text-center">
                <span className="text-gray-500 text-[8px] font-bold block leading-none mb-1">MARKET VOLATILITY</span>
                <span className="text-lg font-bold text-orange-400 leading-none">+{activeStep.globalMetrics.marketVolatility}%</span>
                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden mt-1 px-0.5">
                  <div className="bg-orange-500 h-full" style={{ width: `${activeStep.globalMetrics.marketVolatility}%` }} />
                </div>
              </div>

              <div className="p-2 border border-amber-500/10 bg-amber-950/5 rounded text-center">
                <span className="text-gray-500 text-[8px] font-bold block leading-none mb-1">LOGISTICS DISRUPT</span>
                <span className="text-lg font-bold text-amber-500 leading-none">+{activeStep.globalMetrics.supplyChainDisruption}%</span>
                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden mt-1 px-0.5">
                  <div className="bg-amber-500 h-full" style={{ width: `${activeStep.globalMetrics.supplyChainDisruption}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* CASCADING Node Degradation Effects list */}
          <div className="space-y-1">
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest pl-1">SPECIFIC RIPPLE EFFECTS REGISTERED ({activeStep?.activeEffects.length})</div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-1 bg-slate-900/40 border border-cyan-500/5 rounded">
              {activeStep?.activeEffects.map((item, idx) => {
                const node = entities.find(e => e.id === item.entityId);
                const isCritical = item.vulnerabilityScore > 75;
                
                let textColor = 'text-yellow-400';
                let borderColor = 'border-yellow-500/20';
                let fillColor = 'bg-yellow-950/10';

                if (item.statusChange === 'collapsed') {
                  textColor = 'text-red-500';
                  borderColor = 'border-red-500/20';
                  fillColor = 'bg-red-950/20';
                } else if (item.statusChange === 'stressed') {
                  textColor = 'text-orange-500';
                  borderColor = 'border-orange-500/20';
                  fillColor = 'bg-orange-950/15';
                }

                return (
                  <div
                    key={`ripple-item-${idx}`}
                    className={`p-2 border rounded ${borderColor} ${fillColor} flex items-start space-x-2`}
                  >
                    <div className="mt-0.5">
                      <AlertTriangle className={`w-3 h-3 ${textColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-[8.5px] font-black uppercase tracking-wider ${textColor}`}>
                          {node ? node.name : item.entityId.toUpperCase()}
                        </span>
                        <span className={`text-[7px] border rounded px-1 lowercase ${
                          item.statusChange === 'collapsed' ? 'border-red-500 text-red-400 bg-red-950/20' : 'border-amber-500 text-amber-400 bg-amber-950/20'
                        }`}>
                          {item.statusChange}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[8px] leading-relaxed">{item.impactDetail}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] text-gray-500 leading-none block">VULN</span>
                      <span className={`text-[10px] font-bold ${textColor}`}>{item.vulnerabilityScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={onResetSimulation}
            className="w-full py-1.5 border border-cyan-500/30 hover:border-cyan-500/80 hover:bg-cyan-950/20 text-gray-400 hover:text-cyan-300 text-[8.5px] tracking-wider rounded transition-all duration-200 uppercase flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET SIMULATION CORE</span>
          </button>
        </div>
      )}
    </div>
  );
}
