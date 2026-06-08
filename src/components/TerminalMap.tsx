import React, { useState, useMemo } from 'react';
import { Entity, Dependency } from '../types';
import { Globe, ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';

interface TerminalMapProps {
  entities: Entity[];
  dependencies: Dependency[];
  selectedEntity: Entity | null;
  onSelectEntity: (entity: Entity) => void;
  activeEffects: Array<{ entityId: string; statusChange: string; impactDetail: string }> | null;
}

// Simple simplified coordinate projection system: Map lat/lng coordinates to standard SVG dimensions (800x400)
// latitude range: 90 (top) to -60 (bottom, cropped for aesthetics)
// longitude range: -180 (left) to 180 (right)
function projectCoordinates(lat: number, lng: number, width: number, height: number): [number, number] {
  // Mercator-like clean scaling
  const x = ((lng + 180) * (width / 360));
  // Keep latitude within reasonable bounds to avoid extreme warp near poles
  const latRad = Math.max(-65, Math.min(75, lat));
  const y = height / 2 - (latRad * (height / 150)); // Adjusted offset
  return [x, y];
}

// Pre-defined futuristic abstract grid dots representing world landmasses so it renders beautifully offline
const WORLD_LANDMASS_REGIONS = [
  // North America
  { lat: 60, lng: -120, count: 8 }, { lat: 50, lng: -110, count: 12 }, { lat: 40, lng: -100, count: 15 }, { lat: 30, lng: -90, count: 18 }, { lat: 25, lng: -100, count: 6 },
  // South America
  { lat: 0, lng: -60, count: 8 }, { lat: -10, lng: -60, count: 10 }, { lat: -25, lng: -60, count: 8 }, { lat: -40, lng: -65, count: 5 }, { lat: -50, lng: -70, count: 3 },
  // Europe
  { lat: 55, lng: 15, count: 10 }, { lat: 50, lng: 10, count: 12 }, { lat: 45, lng: 12, count: 8 }, { lat: 40, lng: -2, count: 6 }, { lat: 60, lng: 20, count: 5 },
  // Africa
  { lat: 25, lng: 15, count: 12 }, { lat: 10, lng: 20, count: 14 }, { lat: 0, lng: 22, count: 10 }, { lat: -15, lng: 25, count: 8 }, { lat: -30, lng: 25, count: 6 },
  // Asia
  { lat: 60, lng: 90, count: 15 }, { lat: 50, lng: 85, count: 22 }, { lat: 40, lng: 100, count: 25 }, { lat: 30, lng: 110, count: 24 }, { lat: 20, lng: 100, count: 18 }, { lat: 10, lng: 115, count: 8 },
  // Middle East
  { lat: 25, lng: 45, count: 8 }, { lat: 15, lng: 48, count: 5 },
  // Australia / Indonesia
  { lat: -25, lng: 135, count: 10 }, { lat: -30, lng: 140, count: 8 }, { lat: -10, lng: 120, count: 6 }
];

export default function TerminalMap({
  entities,
  dependencies,
  selectedEntity,
  onSelectEntity,
  activeEffects
}: TerminalMapProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [hoveredNode, setHoveredNode] = useState<Entity | null>(null);
  const [showFlows, setShowFlows] = useState<boolean>(true);

  const mapWidth = 900;
  const mapHeight = 420;

  // Render base digital world grid dots for background
  const backgroundDots = useMemo(() => {
    const dots: React.ReactNode[] = [];
    let idCounter = 0;

    WORLD_LANDMASS_REGIONS.forEach((region) => {
      for (let i = 0; i < region.count; i++) {
        // Spread dots slightly around the central lat/lng row
        const dLat = region.lat + (Math.sin(i * 123) * 5);
        const dLng = region.lng + (Math.cos(i * 342) * 10);
        const [x, y] = projectCoordinates(dLat, dLng, mapWidth, mapHeight);

        // Render standard green-tinted high tech grid dots
        dots.push(
          <circle
            key={`grid-dot-${idCounter++}`}
            cx={x}
            cy={y}
            r={1.2}
            className="fill-cyan-950/20 stroke-none"
          />
        );
      }
    });

    return dots;
  }, [mapWidth, mapHeight]);

  // Project individual entities
  const nodes = useMemo(() => {
    return entities.map((entity) => {
      const [x, y] = projectCoordinates(entity.coordinates[0], entity.coordinates[1], mapWidth, mapHeight);
      
      // Determine if currently affected by active phase simulation
      const effect = activeEffects?.find((e) => e.entityId === entity.id);
      
      return {
        ...entity,
        x,
        y,
        effect
      };
    });
  }, [entities, activeEffects, mapWidth, mapHeight]);

  // Filter paths for dependencies that map between identified locations
  const paths = useMemo(() => {
    const lines: Array<{
      id: string;
      sourceName: string;
      targetName: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      type: string;
      strength: number;
      criticality: string;
      isPulsing: boolean;
    }> = [];

    dependencies.forEach((dep) => {
      const sourceNode = nodes.find((n) => n.id === dep.sourceId);
      const targetNode = nodes.find((n) => n.id === dep.targetId);

      if (sourceNode && targetNode) {
        // Check if either node is stressed or collapsed in the current ripple step
        const isSourceAffected = !!activeEffects?.some((e) => e.entityId === dep.sourceId);
        const isTargetAffected = !!activeEffects?.some((e) => e.entityId === dep.targetId);

        lines.push({
          id: dep.id,
          sourceName: sourceNode.name,
          targetName: targetNode.name,
          x1: sourceNode.x,
          y1: sourceNode.y,
          x2: targetNode.x,
          y2: targetNode.y,
          type: dep.type,
          strength: dep.strength,
          criticality: dep.criticality,
          isPulsing: isSourceAffected || isTargetAffected
        });
      }
    });

    return lines;
  }, [dependencies, nodes, activeEffects]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) => {
      if (direction === 'in') return Math.min(prev + 0.25, 2.5);
      return Math.max(prev - 0.25, 0.75);
    });
  };

  return (
    <div className="relative border border-cyan-500/20 bg-slate-950/80 p-4 rounded-md overflow-hidden" id="world-map-container">
      {/* Upper Status Bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-400">
            GEOSPATIAL DEPENDENCY MATRIX MAP (PROJECTION: EQUIRECTANGULAR)
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <button
            onClick={() => setShowFlows(!showFlows)}
            className={`px-2 py-0.5 border ${
              showFlows ? 'border-cyan-500 text-cyan-400 bg-cyan-950/30' : 'border-cyan-500/20 text-gray-400'
            } rounded hover:bg-cyan-950/40 transition-colors`}
          >
            {showFlows ? 'SYS FLOWS: ARM' : 'SYS FLOWS: OFF'}
          </button>
          <div className="flex items-center border border-cyan-500/20 rounded divide-x divide-cyan-500/20">
            <button onClick={() => handleZoom('out')} className="p-1 hover:text-cyan-400 transition-colors">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(1)} className="p-1 px-1.5 hover:text-cyan-400 transition-colors">
              Reset
            </button>
            <button onClick={() => handleZoom('in')} className="p-1 hover:text-cyan-400 transition-colors">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Workspace */}
      <div className="relative h-[420px] overflow-auto select-none bg-slate-950/40 rounded border border-cyan-500/5">
        <svg
          width={mapWidth * zoom}
          height={mapHeight * zoom}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="transition-transform duration-200 ease-out origin-center block"
          style={{ transform: `scale(${zoom > 1.5 ? 1.0 : zoom})` }}
        >
          {/* Background Matrix Mesh lines */}
          <g className="opacity-10 stroke-cyan-500 stroke-[0.3]" strokeDasharray="3,3">
            <line x1="0" y1={mapHeight / 2} x2={mapWidth} y2={mapHeight / 2} />
            <line x1={mapWidth / 2} y1="0" x2={mapWidth / 2} y2={mapHeight} />
            <line x1={mapWidth / 4} y1="0" x2={mapWidth / 4} y2={mapHeight} />
            <line x1={(mapWidth * 3) / 4} y1="0" x2={(mapWidth * 3) / 4} y2={mapHeight} />
          </g>

          {/* Dotted Continental Mass Background Grid */}
          <g>{backgroundDots}</g>

          {/* Dependency flows vector curves */}
          {showFlows && (
            <g className="flow-lines">
              {paths.map((path) => {
                const dx = path.x2 - path.x1;
                const dy = path.y2 - path.y1;
                // Cubic Bezier curve control points to draw nice curved paths over continents
                const dr = Math.sqrt(dx * dx + dy * dy);
                const sweepFlag = 1; // standard curve direction
                const isCritical = path.criticality === 'critical' || path.criticality === 'high';

                // Path colors according to hazard ratings
                let pathColor = 'stroke-cyan-500/20';
                if (path.isPulsing) {
                  pathColor = isCritical ? 'stroke-red-500/70' : 'stroke-orange-400/60';
                } else if (isCritical) {
                  pathColor = 'stroke-amber-500/25';
                }

                return (
                  <g key={`map-path-group-${path.id}`}>
                    {/* Glowing static connector path */}
                    <path
                      d={`M ${path.x1} ${path.y1} A ${dr} ${dr} 0 0 ${sweepFlag} ${path.x2} ${path.y2}`}
                      fill="none"
                      className={`${pathColor} stroke-[1.2] transition-colors duration-300`}
                    />
                    {/* Animated moving pulse node flowing from source to target */}
                    {path.isPulsing ? (
                      <path
                        d={`M ${path.x1} ${path.y1} A ${dr} ${dr} 0 0 ${sweepFlag} ${path.x2} ${path.y2}`}
                        fill="none"
                        className={`stroke-amber-400 stroke-[2]`}
                        strokeDasharray="8, 20"
                        strokeDashoffset="0"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="120;0"
                          dur={`${4 / path.strength}s`}
                          repeatCount="indefinite"
                        />
                      </path>
                    ) : (
                      <path
                        d={`M ${path.x1} ${path.y1} A ${dr} ${dr} 0 0 ${sweepFlag} ${path.x2} ${path.y2}`}
                        fill="none"
                        className="stroke-cyan-400/40 stroke-[1.5]"
                        strokeDasharray="4, 50"
                        strokeDashoffset="0"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="120;0"
                          dur="12s"
                          repeatCount="indefinite"
                        />
                      </path>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Interactive Node Hotspots */}
          <g className="location-nodes">
            {nodes.map((node) => {
              const isSelected = selectedEntity?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              
              // Node Status styling colors
              let nodeColor = 'fill-cyan-400';
              let pulseColor = 'bg-cyan-400';
              if (node.effect) {
                if (node.effect.statusChange === 'collapsed') {
                  nodeColor = 'fill-red-500';
                  pulseColor = 'bg-red-500';
                } else if (node.effect.statusChange === 'stressed') {
                  nodeColor = 'fill-orange-500';
                  pulseColor = 'bg-orange-500';
                } else if (node.effect.statusChange === 'volatile') {
                  nodeColor = 'fill-yellow-500';
                  pulseColor = 'bg-yellow-500';
                }
              } else if (node.status === 'collapsed') {
                nodeColor = 'fill-red-500';
              } else if (node.status === 'stressed') {
                nodeColor = 'fill-orange-500';
              } else if (node.status === 'volatile') {
                nodeColor = 'fill-amber-400';
              }

              // Larger hit target to make interactions comfortable on maps
              const radius = isSelected ? 6.5 : isHovered ? 5.5 : 4;

              return (
                <g
                  key={`map-node-${node.id}`}
                  className="cursor-pointer"
                  onClick={() => onSelectEntity(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Flashing pulse circle around node for stressed/shocks */}
                  {(node.effect || node.status !== 'stable') && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius * 3.5}
                      className={`${nodeColor} opacity-10`}
                    >
                      <animate
                        attributeName="r"
                        values={`${radius};${radius * 3.5};${radius}`}
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.30;0.05;0.30"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Node outer outline marker */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + (isSelected ? 2 : 1)}
                    className="fill-none stroke-slate-950 stroke-[2.5]"
                  />

                  {/* Core Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    className={`${nodeColor} stroke-slate-900 stroke-[1] transition-all duration-350`}
                  />

                  {/* Text Label next to Node with shadow backing */}
                  {(isSelected || isHovered || node.importance > 85) && (
                    <g>
                      <text
                        x={node.x + 8}
                        y={node.y + 4}
                        className="font-mono text-[9px] font-bold fill-slate-950 select-none stroke-slate-950 stroke-[3] opacity-80"
                      >
                        {node.name.toUpperCase()}
                      </text>
                      <text
                        x={node.x + 8}
                        y={node.y + 4}
                        className={`font-mono text-[9px] font-bold ${
                          isSelected ? 'fill-cyan-300' : 'fill-gray-300'
                        } select-none`}
                      >
                        {node.name.toUpperCase()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Dynamic Float Details Plate on Hover */}
        {hoveredNode && (
          <div
            className="absolute z-10 p-2 bg-slate-900 border border-cyan-500/50 rounded shadow-2xl pointer-events-none font-mono text-[10px]"
            style={{
              top: `${Math.min(hoveredNode.y + 10, mapHeight - 110)}px`,
              left: `${Math.min(hoveredNode.x + 15, mapWidth - 180)}px`,
              width: '180px'
            }}
          >
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1 mb-1">
              <span className="font-bold text-cyan-400">{hoveredNode.name.toUpperCase()}</span>
              <span className="text-[8px] bg-cyan-950 px-1 text-cyan-300 border border-cyan-500/20 rounded">
                {hoveredNode.type.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-400 text-[8px] leading-relaxed mb-1.5">{hoveredNode.description}</p>
            <div className="flex justify-between text-[8px]">
              <span className="text-gray-500">IMPORTANCE:</span>
              <span className="text-amber-400 font-bold">{hoveredNode.importance}/100</span>
            </div>
            <div className="flex justify-between text-[8px]">
              <span className="text-gray-500 font-bold">NODE STATUS:</span>
              <span
                className={`font-bold ${
                  hoveredNode.status === 'stable'
                    ? 'text-green-400'
                    : hoveredNode.status === 'stressed'
                    ? 'text-orange-400'
                    : 'text-red-400'
                }`}
              >
                {hoveredNode.status.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Grid Overlay HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 p-2 bg-slate-900/40 rounded border border-cyan-500/5 text-[10px] font-mono text-gray-400">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block" />
          <span>STABLE INFRASTRUCTURE</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block animate-pulse" />
          <span>VOLATILE EXP. CHANNELS</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block animate-pulse" />
          <span>STRESSED SUPPLY STAGE</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 block animate-pulse" />
          <span>SYSTEMIC DEF / COLLAPSED</span>
        </div>
      </div>
    </div>
  );
}
