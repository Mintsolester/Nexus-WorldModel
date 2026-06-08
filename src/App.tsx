import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Entity, Dependency, Scenario, SimulationStep, AlternateFuture, Prediction, TerminalLog } from './types';
import {
  INITIAL_ENTITIES,
  INITIAL_DEPENDENCY_GRAPH,
  PRESET_SCENARIOS,
  INITIAL_PREDICTIONS,
  INITIAL_ALTERNATE_FUTURES
} from './data/initialEntities';
import TerminalMap from './components/TerminalMap';
import DependencyGraph from './components/DependencyGraph';
import ScenarioPanel from './components/ScenarioPanel';
import AlternateFutureView from './components/AlternateFutureView';
import PredictionExplorer from './components/PredictionExplorer';

import {
  Database,
  Terminal,
  Shield,
  Percent,
  Play,
  RotateCcw,
  Maximize2,
  ChevronDown,
  Info,
  Server,
  Zap,
  Globe,
  Share2,
  List,
  Compass,
  Link2,
  KeyRound
} from 'lucide-react';

export default function App() {
  // Primary core graph matrices states
  const [entities, setEntities] = useState<Entity[]>(JSON.parse(JSON.stringify(INITIAL_ENTITIES)));
  const [dependencies] = useState<Dependency[]>(INITIAL_DEPENDENCY_GRAPH);
  const [scenarios] = useState<Scenario[]>(PRESET_SCENARIOS);
  
  // Dynamic predictions and branching futures lists (can be overridden by AI outputs)
  const [predictions, setPredictions] = useState<Prediction[]>(INITIAL_PREDICTIONS);
  const [futures, setFutures] = useState<AlternateFuture[]>(INITIAL_ALTERNATE_FUTURES);

  // Inspector Focus Node Tracing
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(entities.find(e => e.id === 'tsmc') || null);
  const [activeTab, setActiveTab] = useState<'map' | 'graph' | 'scenario' | 'futures' | 'predictions'>('map');

  // Leverage Multipliers adjustments states on selected inspector node
  const [leverageMultipliers, setLeverageMultipliers] = useState<Record<string, number>>({});

  // Simulation Running State Tracing
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isApiKeyActive, setIsApiKeyActive] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Terminal CLI log stream
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    { timestamp: new Date().toISOString().substring(11, 19), type: 'success', message: 'WDM-COGNITIVE CORE SYSTEM ONLINE. BUILD v5.9a-STABLE' },
    { timestamp: new Date().toISOString().substring(11, 19), type: 'info', message: 'Type "help" in terminal prompt to query available macros.' },
    { timestamp: new Date().toISOString().substring(11, 19), type: 'info', message: 'Geospatial network projection mapped across 18 high-importance nodes.' }
  ]);
  const [commandText, setCommandText] = useState<string>('');
  
  // Ref to automatically scroll terminal logs bottom
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Check backend capability on init
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setIsApiKeyActive(data.hasApiKey);
        if (data.hasApiKey) {
          addLog('info', 'Secure connection established. Gemini-3.5-flash AI core armed.');
        } else {
          addLog('warn', 'Running on offline cognitive emulation. API key not declared in Secrets.');
        }
      })
      .catch(() => {
        addLog('warn', 'Neural network backend host unreachable. Running client emulation only.');
      });
  }, []);

  const addLog = (type: 'info' | 'warn' | 'error' | 'success' | 'input', message: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setTerminalLogs(prev => [...prev, { timestamp, type, message }]);
  };

  // Upstream / Downstream relationship tracing for Inspector Panel
  const relationshipsForSelected = useMemo(() => {
    if (!selectedEntity) return { upstream: [], downstream: [] };

    const upstream = dependencies.filter(dep => dep.targetId === selectedEntity.id);
    const downstream = dependencies.filter(dep => dep.sourceId === selectedEntity.id);

    return { upstream, downstream };
  }, [selectedEntity, dependencies]);

  // Trigger POST API simulation query
  const handleTriggerSimulation = async (
    title: string,
    description: string,
    initialShockEntityIds: string[],
    customTriggers: string[]
  ) => {
    setIsSimulating(true);
    addLog('info', `Compiling telemetry matrix for trigger event: "${title}"`);
    addLog('info', `Focus nodes mapped inside shock vector: ${initialShockEntityIds.join(', ')}`);

    try {
      const response = await fetch('/api/simulate-shock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: title,
          scenarioDescription: description,
          initialShockEntityIds,
          entities,
          dependencies,
          customTriggers
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();

      // Update state with AI generated/offline-calculated data
      setSimulationSteps(data.steps);
      setCurrentStepIndex(0);
      setPredictions(data.predictions);
      setFutures(data.alternateFutures);
      setNoticeMessage(data.notice || null);

      if (data.isSimulated) {
        addLog('warn', 'Local emulation engine fallback triggered.');
      } else {
        addLog('success', 'Neural simulation sequence resolved via Gemini G-3.5 cognitive pathways.');
      }

      // Load AI trace logs nicely inside the terminal trace
      if (data.terminalLogs && Array.isArray(data.terminalLogs)) {
        data.terminalLogs.forEach((logLine: string) => {
          setTimeout(() => {
            addLog('info', logLine);
          }, 300);
        });
      }

      // Auto-focus first Schritt phase with updated nodes statuses corresponding
      applySimulationStepStatuses(data.steps[0]);
      setActiveTab('scenario'); // switch to scenario tab for instant feedback!
    } catch (err: any) {
      addLog('error', `Simulation core failure: ${err.message || err}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Mutates entity statuses based on active simulation step phase
  const applySimulationStepStatuses = (step: SimulationStep) => {
    const updatedEntities = INITIAL_ENTITIES.map(ent => {
      const activeEffect = step.activeEffects.find(eff => eff.entityId === ent.id);
      if (activeEffect) {
        return {
          ...ent,
          status: activeEffect.statusChange
        };
      }
      return {
        ...ent,
        status: 'stable' as const
      };
    });
    setEntities(updatedEntities);
    // Sync inspector if needed
    if (selectedEntity) {
      const updatedInspectorNode = updatedEntities.find(e => e.id === selectedEntity.id);
      if (updatedInspectorNode) setSelectedEntity(updatedInspectorNode);
    }
  };

  // Sync simulation playback step index change
  const handleSetStepIndex = (idx: number) => {
    setCurrentStepIndex(idx);
    if (simulationSteps && simulationSteps[idx]) {
      applySimulationStepStatuses(simulationSteps[idx]);
      addLog('info', `Visualizing phase index sequence ${idx + 1} (${simulationSteps[idx].timeframe})`);
    }
  };

  const handleResetSimulation = () => {
    setEntities(JSON.parse(JSON.stringify(INITIAL_ENTITIES)));
    setSimulationSteps(null);
    setCurrentStepIndex(0);
    setPredictions(INITIAL_PREDICTIONS);
    setFutures(INITIAL_ALTERNATE_FUTURES);
    setNoticeMessage(null);
    if (selectedEntity) {
      const resetInspector = INITIAL_ENTITIES.find(e => e.id === selectedEntity.id);
      if (resetInspector) setSelectedEntity(resetInspector);
    }
    addLog('success', 'Simulation network restored. Initial baseline vectors reset.');
  };

  // Interactive CLI prompt interpreter
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commandRaw = commandText.trim();
    if (!commandRaw) return;

    addLog('input', `> ${commandRaw}`);
    setCommandText('');

    const tokens = commandRaw.toLowerCase().split(' ');
    const primaryCmd = tokens[0];

    switch (primaryCmd) {
      case 'help':
        addLog('success', 'AVAILABLE MACROS:');
        addLog('info', '  focus [id]       - Lock sensor focus directly to specific node (e.g. "focus tsmc").');
        addLog('info', '  shock [id]       - Triggers dynamic local simulation centered on focus target.');
        addLog('info', '  clear            - Wipe active terminal console lines.');
        addLog('info', '  list [type]      - Display catalog indices (e.g. "list country", "list company").');
        addLog('info', '  reset            - Reset simulation matrix and dependencies.');
        break;

      case 'clear':
        setTerminalLogs([]);
        break;

      case 'reset':
        handleResetSimulation();
        break;

      case 'focus': {
        const id = tokens[1];
        if (!id) {
          addLog('error', 'SYNTAX ERROR: Specify target ID (e.g., "focus asml")');
          break;
        }
        const found = entities.find(e => e.id === id || e.name.toLowerCase() === id);
        if (found) {
          setSelectedEntity(found);
          addLog('success', `FOCUS LOCKED: ${found.name.toUpperCase()} system parameters established.`);
        } else {
          addLog('error', `SYSTEM DISREGARD: Entity with ID "${id}" is unregistered on grid.`);
        }
        break;
      }

      case 'shock': {
        const id = tokens[1];
        if (!id) {
          addLog('error', 'SYNTAX ERROR: Specify target epicentre ID (e.g., "shock taiwan")');
          break;
        }
        const found = entities.find(e => e.id === id || e.name.toLowerCase() === id);
        if (found) {
          handleTriggerSimulation(
            `Sudden Shock Epicentre: ${found.name}`,
            `A high-impact focused macro shock initiated manually via command-terminal targeted directly at ${found.name} system layers.`,
            [found.id],
            ['Manual command override trigger']
          );
        } else {
          addLog('error', `TRIGGER FAIL: Entity "${id}" not found on active grid.`);
        }
        break;
      }

      case 'list': {
        const arg = tokens[1];
        if (!arg) {
          addLog('error', 'SYNTAX ERROR: Specify type "country", "company", "market", "industry", "city"');
          break;
        }
        const matches = entities.filter(e => e.type === arg);
        if (matches.length > 0) {
          addLog('success', `REGISTERED CATEGORY INDEX: "${arg.toUpperCase()}"`);
          matches.forEach(m => {
            addLog('info', `  • ID: [${m.id}] - ${m.name} (Priority Score: ${m.importance}/100)`);
          });
        } else {
          addLog('error', `SYSTEM RETRIEVAL EMPTY: Type "${arg}" returned zero records.`);
        }
        break;
      }

      default:
        addLog('error', `COMMAND NOT RECOGNIZED: "${primaryCmd}". Type "help" for trace documentation.`);
        break;
    }
  };

  // Adjust direct leverage multiplier for selected entity
  const handleLeverageChange = (id: string, val: number) => {
    setLeverageMultipliers({
      ...leverageMultipliers,
      [id]: val
    });
    addLog('info', `Adjusting leverage coefficient for [${id}] to ${val.toFixed(1)}x.`);
  };

  return (
    <div className="min-h-screen bg-[#03060a] text-gray-100 flex flex-col p-3 overflow-x-hidden border-2 border-slate-900 selection:bg-cyan-500 selection:text-slate-900">
      
      {/* COGNITIVE TOP BANNER HUD */}
      <header className="border border-cyan-500/30 bg-slate-950/80 p-3 rounded-md mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden" id="world-model-header">
        
        {/* Subtle grid watermark */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

        <div className="flex items-center space-x-3.5 z-10">
          <Database className="w-8 h-8 text-cyan-400 stroke-[1.5] animate-pulse" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-black tracking-widest text-cyan-100 font-mono">WORLDMODEL v1.0.8</h1>
              <span className="text-[7.5px] font-mono px-1.5 py-0.5 border border-cyan-500/40 text-cyan-400 bg-cyan-950/40 rounded animate-pulse">
                SYS LIVE DIRECT ARCHITECTURE
              </span>
            </div>
            <p className="text-[9px] text-gray-500 font-mono tracking-wide uppercase">
              AI-Powered Simulation Corridors • Downstream Cascades • Macro Diagnostics
            </p>
          </div>
        </div>

        {/* Real-Time Telemetry Counters info */}
        <div className="flex flex-wrap items-center gap-4 z-10 text-[9px] font-mono">
          <div className="flex flex-col border-l border-cyan-500/20 pl-3">
            <span className="text-gray-500 leading-none">CORE PROCESSOR:</span>
            <span className="text-cyan-400 font-bold leading-normal">EMULATOR v1.02</span>
          </div>
          <div className="flex flex-col border-l border-cyan-500/20 pl-3">
            <span className="text-gray-500 leading-none">SYS LATENCY:</span>
            <span className="text-green-400 font-bold leading-normal">14.2ms OVERRIDE</span>
          </div>
          <div className="flex flex-col border-l border-cyan-500/20 pl-3">
            <span className="text-gray-500 leading-none">NEURAL LINK STATE:</span>
            <span className="flex items-center space-x-1 mt-0.5">
              <span className={`w-2 h-2 rounded-full inline-block ${isApiKeyActive ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
              <strong className={isApiKeyActive ? 'text-green-400' : 'text-amber-400'}>
                {isApiKeyActive ? 'GEMINI COGNITIVE ARMED' : 'OFFLINE CHANNELS'}
              </strong>
            </span>
          </div>
        </div>
      </header>

      {/* Warning notices area */}
      {noticeMessage && (
        <div className="mb-3 p-2 bg-amber-950/20 border border-amber-500/20 rounded font-mono text-[9px] text-amber-400 flex items-center space-x-2 animate-pulse">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* PRIMARY CENTRAL SYSTEM FRAME */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
        
        {/* LEFT COLUMN: Sidebar controllers, Terminal log stream, stats counters */}
        <aside className="lg:col-span-3 flex flex-col space-y-3">
          
          {/* Quick HUD Metrics Panel */}
          <section className="border border-cyan-500/20 bg-slate-950/80 p-3.5 rounded-md font-mono space-y-3">
            <div className="text-[10px] text-cyan-400 font-black tracking-widest border-b border-cyan-500/10 pb-1.5 flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5" />
              <span>SYSTEM GRID METRICS</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="p-2 border border-cyan-500/5 bg-slate-900/30 rounded">
                <span className="text-gray-500 block leading-none mb-1">TOTAL NODES</span>
                <span className="text-sm font-black text-white">{entities.length}</span>
              </div>
              <div className="p-2 border border-cyan-500/5 bg-slate-900/30 rounded">
                <span className="text-gray-500 block leading-none mb-1">ACTIVE LINKS</span>
                <span className="text-sm font-black text-white">{dependencies.length}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[8px] font-bold">
                <span className="text-gray-500">GLOBAL COHERENCE RANK:</span>
                <span className="text-green-400 font-bold">STABLE (94.8%)</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                <div className="bg-green-500 h-full w-[94%]" />
              </div>
            </div>
          </section>

          {/* REAL TIME TERMINAL COMMAND PANEL */}
          <section className="flex-1 min-h-[300px] border border-cyan-500/20 bg-slate-950/80 rounded-md p-3 flex flex-col font-mono" id="realtime-terminal-cli">
            <div className="flex items-center justify-between border-b border-cyan-500/10 pb-1.5 mb-2">
              <div className="flex items-center space-x-1.5">
                <Terminal className="w-4.5 h-4.5 text-cyan-400" />
                <span className="text-[10px] font-black tracking-wider text-cyan-400">
                  COGNITIVE ROUTER CONSOLE CLI
                </span>
              </div>
              <span className="text-[7.5px] text-gray-500">TRACE_LOGS: ON</span>
            </div>

            {/* Trace log stream */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 p-2 bg-[#04070a] border border-cyan-500/5 rounded font-mono text-[8px] leading-relaxed max-height-[320px]">
              {terminalLogs.map((log, index) => {
                let textClass = 'text-cyan-400';
                if (log.type === 'success') textClass = 'text-green-400 font-bold';
                if (log.type === 'warn') textClass = 'text-amber-400';
                if (log.type === 'error') textClass = 'text-red-500 font-bold animate-pulse';
                if (log.type === 'input') textClass = 'text-indigo-300 font-mono';

                return (
                  <div key={`log-${index}`} className="flex space-x-1.5">
                    <span className="text-gray-600 block shrink-0">{log.timestamp}</span>
                    <span className={`block break-all ${textClass}`}>{log.message}</span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>

            {/* Prompt input field */}
            <form onSubmit={handleTerminalSubmit} className="mt-2 flex space-x-1 border border-cyan-500/20 rounded overflow-hidden bg-slate-900/30">
              <span className="text-cyan-400 font-black pl-2 py-1 select-none pr-1 focus:outline-none text-[9px]">{">"}</span>
              <input
                type="text"
                placeholder="Type 'help' for macros..."
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                className="w-full bg-transparent text-[9px] text-cyan-300 placeholder-gray-600 py-1 focus:outline-none focus:ring-0 leading-none border-none font-mono"
              />
            </form>
          </section>
        </aside>

        {/* CENTER PRIMARY VISUAL CANVAS FRAME: Tab choices */}
        <main className="lg:col-span-6 flex flex-col space-y-3">
          
          {/* Main system tab navigation */}
          <nav className="flex space-x-0.5 border border-cyan-500/10 p-0.5 bg-slate-950 rounded-md text-[9px] font-mono">
            {[
              { id: 'map', label: '1. SYSTEM MAP' },
              { id: 'graph', label: '2. DEPENDENCY NETWORK' },
              { id: 'scenario', label: '3. TEMP FORECASTS' },
              { id: 'futures', label: '4. ALTERNATE PATHWAYS' },
              { id: 'predictions', label: '5. PROBABILITY PREDICTIONS' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 text-center border font-bold uppercase transition-all duration-150 leading-none rounded-sm ${
                  activeTab === tab.id
                    ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                    : 'border-transparent text-gray-500 hover:text-cyan-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Active Visual Window */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'map' && (
              <TerminalMap
                entities={entities}
                dependencies={dependencies}
                selectedEntity={selectedEntity}
                onSelectEntity={(node) => setSelectedEntity(node)}
                activeEffects={simulationSteps ? simulationSteps[currentStepIndex].activeEffects : null}
              />
            )}

            {activeTab === 'graph' && (
              <DependencyGraph
                entities={entities}
                dependencies={dependencies}
                selectedEntity={selectedEntity}
                onSelectEntity={(node) => setSelectedEntity(node)}
                activeEffects={simulationSteps ? simulationSteps[currentStepIndex].activeEffects : null}
              />
            )}

            {activeTab === 'scenario' && (
              <ScenarioPanel
                entities={entities}
                scenarios={scenarios}
                onTriggerSimulation={handleTriggerSimulation}
                simulationSteps={simulationSteps}
                currentStepIndex={currentStepIndex}
                onSetStepIndex={handleSetStepIndex}
                isSimulating={isSimulating}
                onResetSimulation={handleResetSimulation}
              />
            )}

            {activeTab === 'futures' && (
              <AlternateFutureView futures={futures} />
            )}

            {activeTab === 'predictions' && (
              <PredictionExplorer predictions={predictions} entities={entities} />
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: Primary Inspector details parameter board for selectedEntity */}
        <section className="lg:col-span-3 border border-cyan-500/20 bg-slate-950/80 p-3.5 rounded-md flex flex-col font-mono" id="right-inspector-panel">
          
          <div className="text-[10px] text-cyan-400 font-black tracking-widest border-b border-cyan-500/10 pb-1.5 mb-3 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>NODE CONSOLE INSPECTOR</span>
          </div>

          {selectedEntity ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Node name, Type, Description card */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-cyan-100 uppercase tracking-wide">
                    {selectedEntity.name}
                  </span>
                  <span className="text-[8px] font-bold border border-cyan-500/20 text-cyan-400 bg-cyan-950/40 px-1 rounded uppercase">
                    {selectedEntity.type}
                  </span>
                </div>
                
                <p className="text-[8.5px] text-gray-400 leading-relaxed italic mb-3">
                  {selectedEntity.description}
                </p>

                {/* Micro metrics attributes tags list */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[7.5px] text-gray-500 font-bold border-b border-cyan-500/5 pb-1 uppercase">GRID ATTRIBUTES INDEX</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {selectedEntity.metrics.map((met, idx) => (
                      <div key={`met-${idx}`} className="flex justify-between items-center text-[8.5px] bg-[#090e14] border border-cyan-950 p-1.5 rounded">
                        <span className="text-gray-500 uppercase">{met.label}</span>
                        <span className={`font-bold ${met.color || 'text-cyan-300'}`}>
                          {met.value} {met.trend === 'up' ? '▲' : met.trend === 'down' ? '▼' : '■'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leverage Multiplier adjustment */}
                <div className="p-2.5 bg-indigo-950/10 border border-indigo-500/20 rounded font-mono space-y-1 mb-4">
                  <div className="flex justify-between text-[7px] font-bold">
                    <span className="text-indigo-400 uppercase">LEVERAGE MULTIPLIER EFFECT</span>
                    <span className="text-amber-400 font-bold font-mono">
                      {leverageMultipliers[selectedEntity.id] ? leverageMultipliers[selectedEntity.id].toFixed(1) : '1.0'}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={leverageMultipliers[selectedEntity.id] || 1.0}
                    onChange={(e) => handleLeverageChange(selectedEntity.id, parseFloat(e.target.value))}
                    className="w-full accent-indigo-400 h-1 bg-slate-900 border border-indigo-500/20 rounded"
                  />
                  <p className="text-[6px] text-gray-500 leading-tight">
                    Tuning structural leverage ratios alters the node status vulnerability index dynamically during simulation runs.
                  </p>
                </div>

                {/* Directed upstream connections list */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[7px] text-gray-500 font-bold flex items-center space-x-1 uppercase">
                    <Link2 className="w-3 h-3 text-cyan-400" />
                    <span>UPSTREAM DEPENDENCY SENSOR</span>
                  </div>
                  {relationshipsForSelected.upstream.length === 0 ? (
                    <div className="text-center p-1.5 bg-[#090e14] border border-dashed border-cyan-500/5 rounded">
                      <span className="text-[7.5px] text-gray-600">ZERO DIRECT UPSTREAM CHANNELS</span>
                    </div>
                  ) : (
                    <div className="space-y-1 overflow-y-auto max-h-24">
                      {relationshipsForSelected.upstream.map((up) => {
                        const upNode = entities.find(e => e.id === up.sourceId);
                        return (
                          <div
                            key={`up-${up.id}`}
                            className="p-1 px-1.5 bg-[#090e14] border border-cyan-950 rounded flex justify-between items-center text-[7.5px] cursor-pointer hover:border-cyan-800"
                            onClick={() => { if (upNode) setSelectedEntity(upNode); }}
                          >
                            <span className="text-cyan-400 font-bold uppercase">{upNode ? upNode.name : up.sourceId}</span>
                            <span className="text-gray-500 text-[6.5px]">STRENGTH: <strong className="text-amber-400">{(up.strength * 10).toFixed(0)}</strong></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Directed downstream linkages list */}
                <div className="space-y-1.5">
                  <div className="text-[7px] text-gray-500 font-bold flex items-center space-x-1 uppercase">
                    <Link2 className="w-3 h-3 text-indigo-400" />
                    <span>DOWNSTREAM FEED SENSOR</span>
                  </div>
                  {relationshipsForSelected.downstream.length === 0 ? (
                    <div className="text-center p-1.5 bg-[#090e14] border border-dashed border-cyan-500/5 rounded">
                      <span className="text-[7.5px] text-gray-600">ZERO DIRECT DOWNSTREAM LOADS</span>
                    </div>
                  ) : (
                    <div className="space-y-1 overflow-y-auto max-h-24">
                      {relationshipsForSelected.downstream.map((down) => {
                        const downNode = entities.find(e => e.id === down.targetId);
                        return (
                          <div
                            key={`down-${down.id}`}
                            className="p-1 px-1.5 bg-[#090e14] border border-cyan-950 rounded flex justify-between items-center text-[7.5px] cursor-pointer hover:border-cyan-800"
                            onClick={() => { if (downNode) setSelectedEntity(downNode); }}
                          >
                            <span className="text-indigo-400 font-bold uppercase">{downNode ? downNode.name : down.targetId}</span>
                            <span className="text-gray-500 text-[6.5px]">CRITICALITY: <strong className="text-red-450">{down.criticality.toUpperCase()}</strong></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Node status readout footer block */}
              <div className="pt-2 border-t border-cyan-500/5 flex items-center justify-between text-[9px]">
                <span className="text-gray-500 font-bold">VULNERABILITY LEVEL:</span>
                <span className={`font-black uppercase tracking-wider ${
                  selectedEntity.status === 'stable'
                    ? 'text-green-400'
                    : selectedEntity.status === 'stressed'
                    ? 'text-orange-400 animate-pulse'
                    : 'text-red-500 animate-pulse'
                }`}>
                  {selectedEntity.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-cyan-500/10 rounded">
              <span className="text-[8px] text-gray-500 uppercase">NO ACTIVE TRACK FOCUS. SELECTED NODE SYSTEM OFFLINE.</span>
            </div>
          )}
        </section>
      </div>

      {/* FOOTER SYSTEM INFORMATION BAR */}
      <footer className="border border-cyan-500/10 bg-slate-950/80 p-2 rounded-md flex justify-between items-center text-[7.5px] font-mono text-gray-600">
        <div>COGNITIVE NETWORK TELEMETRY SCAN ACTIVE • TRACING 18 ENTITY LINK CHANNELS</div>
        <div className="flex space-x-2">
          <span>UTC: 2026-06-08 10:57:55</span>
          <span>•</span>
          <span>WDM-SERVER CLEAR ONLINE</span>
        </div>
      </footer>
    </div>
  );
}
