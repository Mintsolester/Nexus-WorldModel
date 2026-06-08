import React, { useState } from 'react';
import { AlternateFuture } from '../types';
import { GitFork, Eye, Shuffle, Shield, Server, Coins, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlternateFutureViewProps {
  futures: AlternateFuture[];
}

export default function AlternateFutureView({ futures }: AlternateFutureViewProps) {
  const [activeFutureId, setActiveFutureId] = useState<string>(futures[0]?.id || '');

  const activeFuture = futures.find((f) => f.id === activeFutureId);

  // Styling helper for metrics labels
  const getMetricIcon = (metricKey: string) => {
    switch (metricKey) {
      case 'stability':
        return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
      case 'techProgress':
        return <Server className="w-3.5 h-3.5 text-indigo-400" />;
      case 'resourceAbundance':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'economicGrowth':
        return <Coins className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return null;
    }
  };

  const getMetricLabel = (key: string) => {
    switch (key) {
      case 'stability': return 'SYSTEM ARCHITECTURE STABILITY';
      case 'techProgress': return 'RECURSIVE TECH DEVELOPMENT';
      case 'resourceAbundance': return 'RESOURCE AVAILABILITY';
      case 'economicGrowth': return 'MACRO GDP VELOCITY';
      default: return key.toUpperCase();
    }
  };

  const getPercentageColor = (val: number) => {
    if (val > 75) return 'bg-emerald-500';
    if (val > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPercentageTextColor = (val: number) => {
    if (val > 75) return 'text-emerald-400';
    if (val > 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="border border-cyan-500/20 bg-slate-950/80 p-4 rounded-md font-mono" id="alternate-future-view">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <GitFork className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-cyan-400">
            DIVERGENT TIMELINE MATRIX (BRANCH FORECASTS)
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] text-gray-500">
          <span>COOPERATIVE RATIO: 1:33</span>
        </div>
      </div>

      <div className="text-[10px] text-gray-400 leading-relaxed mb-4">
        Examine cascading probability outcomes based on alternate containment trajectories. These branches reflect system-level forks arising from critical national actions or sudden technological pivots.
      </div>

      {/* Grid of future selections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        {futures.map((fut) => (
          <div
            key={fut.id}
            onClick={() => setActiveFutureId(fut.id)}
            className={`p-3 border rounded cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              activeFutureId === fut.id
                ? 'border-indigo-500 bg-indigo-950/10'
                : 'border-cyan-500/10 bg-slate-900/10 hover:border-cyan-500/20'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-black tracking-wide ${activeFutureId === fut.id ? 'text-indigo-400' : 'text-gray-300'}`}>
                  {fut.name.toUpperCase()}
                </span>
                <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/40 px-1 border border-cyan-500/20 rounded">
                  {fut.probability}% LIKELY
                </span>
              </div>
              <p className="text-[8.5px] text-gray-400 leading-relaxed mb-1.5">{fut.summary}</p>
            </div>
            <div className="text-[7.5px] text-gray-500 pt-1 border-t border-cyan-500/5 uppercase">
              Parent Cascade: <strong className="text-cyan-500">{fut.scenarioTitle}</strong>
            </div>
          </div>
        ))}
      </div>

      {activeFuture && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFuture.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            {/* Left Metrics Column */}
            <div className="md:col-span-3 space-y-3.5 border-r border-cyan-500/5 pr-4">
              <div className="text-[8.5px] font-bold text-gray-500 tracking-wider uppercase mb-1">
                BRANCH INDEX METRIC SCORES
              </div>

              {Object.entries(activeFuture.metrics).map(([key, val]) => (
                <div key={`idx-${key}`} className="space-y-1">
                  <div className="flex justify-between text-[8px] font-bold">
                    <div className="flex items-center space-x-1.5 text-gray-400">
                      {getMetricIcon(key)}
                      <span>{getMetricLabel(key)}</span>
                    </div>
                    <span className={`font-black ${getPercentageTextColor(val)}`}>{val}%</span>
                  </div>
                  <div className="w-full bg-slate-900 border border-cyan-500/10 h-2.5 rounded overflow-hidden p-0.5">
                    <div
                      className={`h-full ${getPercentageColor(val)} transition-all duration-500`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Chronology cards */}
            <div className="md:col-span-2 space-y-2">
              <div className="text-[8.5px] font-bold text-gray-500 tracking-wider uppercase pl-1">
                TEMPORAL COINCIDENCE VECTOR EVENTS
              </div>
              
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {activeFuture.keyEvents.map((evt, idx) => (
                  <div
                    key={`evt-${idx}`}
                    className="p-2 border border-slate-800 bg-slate-900/40 rounded flex space-x-2"
                  >
                    <span className="text-[8px] font-bold text-indigo-400 mt-0.5">0{idx + 1}.</span>
                    <p className="text-[8px] text-gray-400 leading-relaxed font-mono">{evt}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
