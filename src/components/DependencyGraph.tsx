import React, { useState, useMemo } from 'react';
import { Entity, Dependency } from '../types';
import { GitCommit, HelpCircle, ArrowRight, Activity, Zap } from 'lucide-react';

interface DependencyGraphProps {
  entities: Entity[];
  dependencies: Dependency[];
  selectedEntity: Entity | null;
  onSelectEntity: (entity: Entity) => void;
  activeEffects: Array<{ entityId: string; statusChange: string; impactDetail: string }> | null;
}

export default function DependencyGraph({
  entities,
  dependencies,
  selectedEntity,
  onSelectEntity,
  activeEffects
}: DependencyGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<Entity | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<Dependency | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Define column layout bounds
  const stageWidth = 900;
  const stageHeight = 440;

  // Layer mapping coordinates based on entity category to give a high-visibility ordered downstream value flow matching real logic
  const columnsList = useMemo(() => {
    return [
      { key: 'country', label: 'PRIMARY COUNTRIES', index: 0, x: 80 },
      { key: 'company', label: 'FOUNDRIES & FIRMS', index: 1, x: 270 },
      { key: 'industry', label: 'MANUFACTURING CELLS', index: 2, x: 470 },
      { key: 'market', label: 'RESOURCE & FINANCIAL MKTS', index: 3, x: 670 },
      { key: 'city', label: 'CONSUMING CITIES', index: 4, x: 830 },
    ];
  }, []);

  const columnsMap = useMemo(() => {
    return {
      country: { label: 'PRIMARY COUNTRIES', index: 0, x: 80 },
      company: { label: 'FOUNDRIES & FIRMS', index: 1, x: 270 },
      industry: { label: 'MANUFACTURING CELLS', index: 2, x: 470 },
      market: { label: 'RESOURCE & FINANCIAL MKTS', index: 3, x: 670 },
      city: { label: 'CONSUMING CITIES', index: 4, x: 830 },
    };
  }, []);

  // Compute neat nodes coordinates arranged logically across columns to avoid crowded overlaps
  const computedNodes = useMemo(() => {
    // Group entities by their category to space them along Y column
    const groups: { [key: string]: Entity[] } = {
      country: [],
      company: [],
      industry: [],
      market: [],
      city: []
    };

    entities.forEach(entity => {
      if (groups[entity.type]) {
        groups[entity.type].push(entity);
      }
    });

    const nodesWithCoords: Array<Entity & { x: number; y: number; activeEffect?: any }> = [];

    Object.keys(groups).forEach((type) => {
      const typeEntities = groups[type];
      const columnConfig = columnsMap[type as keyof typeof columnsMap];
      
      typeEntities.forEach((entity, idx) => {
        // Space nodes vertically in each column
        let yOffset = stageHeight / 2;
        if (typeEntities.length > 1) {
          const gap = (stageHeight - 100) / (typeEntities.length - 1);
          yOffset = 50 + idx * gap;
        }

        const effect = activeEffects?.find(e => e.entityId === entity.id);

        nodesWithCoords.push({
          ...entity,
          x: columnConfig.x,
          y: yOffset,
          activeEffect: effect
        });
      });
    });

    return nodesWithCoords;
  }, [entities, columnsMap, stageHeight, activeEffects]);

  // Compute connections coordinates
  const computedEdges = useMemo(() => {
    const edges: Array<Dependency & { x1: number; y1: number; x2: number; y2: number; isHighlighted: boolean }> = [];

    dependencies.forEach(dep => {
      const source = computedNodes.find(n => n.id === dep.sourceId);
      const target = computedNodes.find(n => n.id === dep.targetId);

      if (source && target) {
        // Highlighting rules based on hovering state
        const isHighlighted = 
          (hoveredNode && (dep.sourceId === hoveredNode.id || dep.targetId === hoveredNode.id)) ||
          (selectedEntity && (dep.sourceId === selectedEntity.id || dep.targetId === selectedEntity.id)) ||
          false;

        edges.push({
          ...dep,
          x1: source.x,
          y1: source.y,
          x2: target.x,
          y2: target.y,
          isHighlighted
        });
      }
    });

    return edges;
  }, [dependencies, computedNodes, hoveredNode, selectedEntity]);

  // Filter edges depending on selection
  const visibleEdges = useMemo(() => {
    if (filterType === 'all') return computedEdges;
    return computedEdges.filter(e => e.type === filterType);
  }, [computedEdges, filterType]);

  // Handle dependency-type labels
  const getDependencyTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'supply': return 'bg-emerald-950 text-emerald-400 border-emerald-500/30';
      case 'financial': return 'bg-amber-950 text-amber-400 border-amber-500/30';
      case 'regulatory': return 'bg-indigo-950 text-indigo-400 border-indigo-500/30';
      case 'geopolitical': return 'bg-red-950 text-red-400 border-red-500/30';
      default: return 'bg-slate-950 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="border border-cyan-500/20 bg-slate-950/80 p-4 rounded-md relative" id="dependency-graph-visual">
      
      {/* Upper Status Line */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-500/10 pb-2 mb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-green-400">
            SYSTEMIC DIRECTED CRITICALITY CHART (LINKAGE LOAD)
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[9px] font-mono text-gray-500 mr-2">FILTER PATH TYPE:</span>
          {['all', 'supply', 'financial', 'regulatory', 'geopolitical', 'infrastructure'].map((t) => (
            <button
              key={`graph-filter-${t}`}
              onClick={() => setFilterType(t)}
              className={`text-[8px] font-mono px-2 py-0.5 border rounded uppercase ${
                filterType === t ? 'border-cyan-500 text-cyan-300 bg-cyan-950/40' : 'border-cyan-500/10 text-gray-500 hover:text-cyan-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Workspace */}
      <div className="relative h-[440px] overflow-x-auto overflow-y-hidden bg-slate-950/40 rounded border border-cyan-500/5 select-none">
        
        {/* Draw column backdrop tags */}
        <div className="absolute inset-x-0 top-1.5 flex justify-between px-6 pointer-events-none opacity-40">
          {columnsList.map(col => (
            <div
              key={`col-hdr-${col.index}`}
              className="text-[8px] font-mono text-cyan-500 tracking-widest border-t border-cyan-500/20 pt-1 text-center"
              style={{
                width: '130px',
                position: 'absolute',
                left: `${col.x - 65}px`
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        <svg width={stageWidth} height={stageHeight} className="block mx-auto">
          {/* SVG Marker Definitions for path arrow heads */}
          <defs>
            <marker id="arrow-cyan" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00e5ff" className="opacity-75" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ffb000" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" className="opacity-90" />
            </marker>
          </defs>

          {/* Render dependency connecting lines */}
          <g className="edges">
            {visibleEdges.map((edge) => {
              const isSelectedSource = selectedEntity?.id === edge.sourceId;
              const isSelectedTarget = selectedEntity?.id === edge.targetId;
              
              // Determine path styling based on severity and select status
              let opacityClass = 'opacity-30';
              let strokeColor = '#0891b2'; // standard slate cyan
              let strokeWidth = 1.0;
              let marker = 'url(#arrow-cyan)';

              if (edge.isHighlighted || isSelectedSource || isSelectedTarget) {
                opacityClass = 'opacity-95';
                strokeWidth = 2.0;

                if (edge.criticality === 'critical' || edge.criticality === 'high') {
                  strokeColor = '#ff2e56'; // Alert Red
                  marker = 'url(#arrow-red)';
                } else {
                  strokeColor = '#ffb000'; // Warning Amber
                  marker = 'url(#arrow-amber)';
                }
              } else if (edge.criticality === 'critical') {
                strokeColor = '#f43f5e';
                strokeWidth = 1.3;
                opacityClass = 'opacity-40';
              }

              // Draw beautiful soft curves representing flows instead of rigid lines
              const midX = (edge.x1 + edge.x2) / 2;
              const curvePath = `M ${edge.x1} ${edge.y1} C ${midX} ${edge.y1}, ${midX} ${edge.y2}, ${edge.x2} ${edge.y2}`;

              return (
                <g key={`graph-edge-${edge.id}`}>
                  {/* Invisible broad curve behind to make hover interactions easy */}
                  <path
                    d={curvePath}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={12}
                    className="cursor-help"
                    onMouseEnter={() => setHoveredEdge(edge)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                  {/* Visual curve path */}
                  <path
                    d={curvePath}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className={`${opacityClass} transition-opacity duration-200`}
                    markerEnd={marker}
                  />
                  
                  {/* Little pulsing dots tracing the flow on highlight */}
                  {edge.isHighlighted && (
                    <circle r="3" fill={strokeColor}>
                      <animateMotion dur={`${3 - edge.strength * 2}s`} repeatCount="indefinite" path={curvePath} />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* Render node objects */}
          <g className="nodes">
            {computedNodes.map((node) => {
              const isSelected = selectedEntity?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              
              // Color mapping
              let statusBorder = 'stroke-cyan-500/50';
              let statusFill = 'fill-slate-900';
              let textColor = 'fill-cyan-100';

              if (node.activeEffect) {
                if (node.activeEffect.statusChange === 'collapsed') {
                  statusBorder = 'stroke-red-500';
                  statusFill = 'fill-red-950/80';
                  textColor = 'fill-red-200';
                } else if (node.activeEffect.statusChange === 'stressed') {
                  statusBorder = 'stroke-orange-500';
                  statusFill = 'fill-orange-950/60';
                  textColor = 'fill-orange-200';
                } else if (node.activeEffect.statusChange === 'volatile') {
                  statusBorder = 'stroke-amber-400';
                  statusFill = 'fill-amber-950/40';
                  textColor = 'fill-amber-200';
                }
              } else if (node.status !== 'stable') {
                statusBorder = node.status === 'collapsed' ? 'stroke-red-500' : 'stroke-orange-400';
                statusFill = node.status === 'collapsed' ? 'fill-red-950/80' : 'fill-slate-900';
              }

              if (isSelected) {
                statusBorder = 'stroke-cyan-300';
                statusFill = 'fill-cyan-950/50';
              }

              return (
                <g
                  key={`graph-node-${node.id}`}
                  className="cursor-pointer"
                  onClick={() => onSelectEntity(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Pulse aura on hovered or selected */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      className="fill-none stroke-cyan-500/20 stroke-[1.5] scale-125 origin-center animate-pulse"
                    />
                  )}

                  {/* Base node circle backing */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={16}
                    className={`${statusFill} ${statusBorder} stroke-[1.5] transition-all duration-200`}
                  />

                  {/* Icon Representation inner drawing */}
                  <g transform={`translate(${node.x - 7}, ${node.y - 7})`}>
                    <path
                      d="M2 2h10v10H2V2z"
                      className={`fill-none ${node.activeEffect ? 'stroke-current' : 'stroke-cyan-500/60'}`}
                      strokeWidth={1}
                    />
                    {node.type === 'country' && <polygon points="5,5 9,5 7,9" className="fill-cyan-400" />}
                    {node.type === 'company' && <circle cx="7" cy="7" r="2.5" className="fill-emerald-400" />}
                    {node.type === 'industry' && <rect x="5" y="5" width="4" height="4" className="fill-amber-400" />}
                    {node.type === 'market' && <path d="M 5,8 L 7,5 L 9,8 Z" className="fill-indigo-400" />}
                    {node.type === 'city' && <line x1="4" y1="7" x2="10" y2="7" className="stroke-fuchsia-400" />}
                  </g>

                  {/* Node Label underneath/on-side */}
                  <text
                    x={node.x}
                    y={node.y + 28}
                    textAnchor="middle"
                    className="font-mono text-[9px] font-bold fill-slate-950 stroke-slate-950 stroke-[2.5]"
                  >
                    {node.name.toUpperCase()}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 28}
                    textAnchor="middle"
                    className={`font-mono text-[8.5px] font-bold ${
                      isSelected ? 'fill-cyan-300' : 'fill-gray-300'
                    }`}
                  >
                    {node.name.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Float Edge Linkage Details when hovered */}
        {hoveredEdge && (
          <div
            className="absolute z-10 p-2.5 bg-slate-900/95 border border-amber-500/40 rounded shadow-2xl pointer-events-none font-mono text-[9px] text-gray-300"
            style={{
              top: '12px',
              left: '12px',
              maxWidth: '300px'
            }}
          >
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-1 mb-1.5">
              <span className="font-bold text-amber-400">DEPENDENCY CONNECTION DATA</span>
              <span className="text-[7.5px] bg-amber-950 px-1 text-amber-300 border border-amber-500/20 rounded">
                {hoveredEdge.type.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mb-2">
              <span className="text-cyan-400 font-bold">{hoveredEdge.sourceName.toUpperCase()}</span>
              <ArrowRight className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-cyan-400 font-bold">{hoveredEdge.targetName.toUpperCase()}</span>
            </div>
            <p className="text-gray-400 text-[8px] leading-relaxed mb-1.5">{hoveredEdge.description}</p>
            <div className="grid grid-cols-2 gap-x-4 text-[8px] mt-1 border-t border-cyan-500/5 pt-1.5">
              <div>
                <span className="text-gray-500">STRENGTH COEFFICIENT:</span>{' '}
                <span className="text-emerald-400 font-bold">{hoveredEdge.strength * 10} / 10</span>
              </div>
              <div>
                <span className="text-gray-500">CRITICALITY RANK:</span>{' '}
                <span
                  className={`font-bold ${
                    hoveredEdge.criticality === 'critical'
                      ? 'text-red-400'
                      : hoveredEdge.criticality === 'high'
                      ? 'text-orange-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {hoveredEdge.criticality.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
