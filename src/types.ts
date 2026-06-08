export type EntityType = 'country' | 'company' | 'industry' | 'market' | 'city';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  region: string;
  coordinates: [number, number]; // [lat, lng] for map visualization
  importance: number; // 1-100 rating
  status: 'stable' | 'stressed' | 'volatile' | 'collapsed';
  metrics: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    color?: string;
  }[];
}

export interface Dependency {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'supply' | 'financial' | 'regulatory' | 'geopolitical' | 'infrastructure';
  strength: number; // 0.1 to 1.0
  description: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'Geopolitical' | 'Technological' | 'Environmental' | 'Macroeconomic';
  triggers: string[];
  initialShockEntityIds: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'existential';
}

export interface SimulationStep {
  phase: number;
  timeframe: string;
  description: string;
  activeEffects: {
    entityId: string;
    statusChange: 'stable' | 'stressed' | 'volatile' | 'collapsed';
    impactDetail: string;
    vulnerabilityScore: number; // 0-100
  }[];
  globalMetrics: {
    stabilityIndex: number; // 0-100
    marketVolatility: number; // 0-100
    supplyChainDisruption: number; // 0-100
  };
}

export interface AlternateFuture {
  id: string;
  name: string;
  scenarioTitle: string;
  summary: string;
  probability: number; // percentage
  metrics: {
    stability: number;
    techProgress: number;
    resourceAbundance: number;
    economicGrowth: number;
  };
  keyEvents: string[];
}

export interface Prediction {
  id: string;
  title: string;
  description: string;
  targetEntityId: string;
  timeHorizon: '1m' | '1y' | '5y' | '10y';
  probability: number; // 0-100
  impactScore: number; // 1-10
  confidenceInterval: string;
  catalysts: string[];
  mitigations: string[];
}

export interface TerminalLog {
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'input';
  message: string;
}
