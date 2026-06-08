import { Entity, Dependency, Scenario, AlternateFuture, Prediction } from '../types';

export const INITIAL_ENTITIES: Entity[] = [
  // Countries
  {
    id: 'taiwan',
    name: 'Taiwan',
    type: 'country',
    description: 'Sovereign island in East Asia; supreme modern semiconductor hub with critical geopolitical significance.',
    region: 'East Asia',
    coordinates: [23.6978, 120.9605],
    importance: 98,
    status: 'stable',
    metrics: [
      { label: 'GDP Growth', value: '+3.4%', trend: 'up' },
      { label: 'Foundry Dominance', value: '62%', trend: 'stable', color: 'text-amber-400' },
      { label: 'Geopolitical Risk', value: 'High', trend: 'up', color: 'text-red-400' }
    ]
  },
  {
    id: 'usa',
    name: 'United States',
    type: 'country',
    description: 'Primary global economy, hub of tech IP design, financial clearing, and geopolitical security guarantor.',
    region: 'North America',
    coordinates: [37.0902, -95.7129],
    importance: 95,
    status: 'stable',
    metrics: [
      { label: 'Fed Funds Rate', value: '5.25%', trend: 'stable' },
      { label: 'Tech Indexes', value: '18,240', trend: 'up' },
      { label: 'Fiscal Deficit', value: '7.2%', trend: 'up', color: 'text-yellow-400' }
    ]
  },
  {
    id: 'china',
    name: 'China',
    type: 'country',
    description: 'Global manufacturing core, heavy raw material processor, and central consumer marketplace.',
    region: 'East Asia',
    coordinates: [35.8617, 104.1954],
    importance: 94,
    status: 'stable',
    metrics: [
      { label: 'Industrial Output', value: '+4.8%', trend: 'down' },
      { label: 'Rare Earth Control', value: '85%', trend: 'up', color: 'text-emerald-400' },
      { label: 'Property Sector', value: 'Volatile', trend: 'down', color: 'text-red-400' }
    ]
  },
  {
    id: 'germany',
    name: 'Germany',
    type: 'country',
    description: 'Industrial engine of Western Europe; core high-end automotive, mechanical, and chemical exporter.',
    region: 'Western Europe',
    coordinates: [51.1657, 10.4515],
    importance: 85,
    status: 'stable',
    metrics: [
      { label: 'Energy Cost Index', value: '142.1', trend: 'down' },
      { label: 'Automotive Surplus', value: '€12.4B', trend: 'stable' },
      { label: 'Manufacturing PMI', value: '44.8', trend: 'down', color: 'text-red-400' }
    ]
  },
  {
    id: 'saudi_arabia',
    name: 'Saudi Arabia',
    type: 'country',
    description: 'Swing oil producer of OPEC+, critical pillar of Middle Eastern energy logistics and sovereign wealth investments.',
    region: 'Middle East',
    coordinates: [23.8859, 45.0792],
    importance: 82,
    status: 'stable',
    metrics: [
      { label: 'Oil Budget Float', value: '$81/bbl', trend: 'stable' },
      { label: 'Sovereign Capital', value: '$925B', trend: 'up' },
      { label: 'Daily Export', value: '9.1M bpd', trend: 'down', color: 'text-yellow-400' }
    ]
  },

  // Companies & Foundries
  {
    id: 'tsmc',
    name: 'TSMC',
    type: 'company',
    description: 'Taiwan Semiconductor Manufacturing Co. - produces over 90% of the world’s most advanced microchips.',
    region: 'East Asia',
    coordinates: [24.7869, 120.9934],
    importance: 97,
    status: 'stable',
    metrics: [
      { label: 'EUV Tool Count', value: '84', trend: 'up' },
      { label: '3nm Wafer Yield', value: '74%', trend: 'up', color: 'text-emerald-400' },
      { label: 'CapEx Forecast', value: '$32.4B', trend: 'stable' }
    ]
  },
  {
    id: 'asml',
    name: 'ASML Holding',
    type: 'company',
    description: 'Netherlands based global monopoly provider of Extreme Ultraviolet (EUV) photolithography machinery.',
    region: 'Western Europe',
    coordinates: [51.4083, 5.4051],
    importance: 90,
    status: 'stable',
    metrics: [
      { label: 'Backlog Load', value: '€38B', trend: 'up' },
      { label: 'EUV Shipments', value: '54/yr', trend: 'stable' },
      { label: 'Export Controls', value: 'Severe', trend: 'up', color: 'text-red-400' }
    ]
  },
  {
    id: 'apple',
    name: 'Apple Inc.',
    type: 'company',
    description: 'Consumer technology behemoth dependent on complex global supply chains and foreign foundries.',
    region: 'North America',
    coordinates: [37.3318, -122.0311],
    importance: 88,
    status: 'stable',
    metrics: [
      { label: 'Active Devices', value: '2.2B', trend: 'up' },
      { label: 'Hardware Margin', value: '36.4%', trend: 'stable' },
      { label: 'Supply Diversification', value: '18%', trend: 'up', color: 'text-emerald-400' }
    ]
  },
  {
    id: 'saudi_aramco',
    name: 'Saudi Aramco',
    type: 'company',
    description: 'The world’s largest oil company by production and reserves, acting as global energy backbone.',
    region: 'Middle East',
    coordinates: [26.2886, 50.1140],
    importance: 86,
    status: 'stable',
    metrics: [
      { label: 'Cost of Extraction', value: '$4.20/bbl', trend: 'stable', color: 'text-emerald-400' },
      { label: 'Refinery Rate', value: '94%', trend: 'up' },
      { label: 'Dividend Payout', value: '$31B/qtr', trend: 'up' }
    ]
  },

  // Industries
  {
    id: 'semiconductors_ind',
    name: 'Semiconductor Foundry',
    type: 'industry',
    description: 'Primary industry of sub-7nm microchip fabrication, photolithography litho-staging, and silicon packaging.',
    region: 'Global',
    coordinates: [24.8, 121.0],
    importance: 93,
    status: 'stable',
    metrics: [
      { label: 'Global Lead Time', value: '18.4 wks', trend: 'down' },
      { label: 'Silicon Demand', value: '+7.2%', trend: 'up' },
      { label: 'Capacity Utilization', value: '91.2%', trend: 'stable' }
    ]
  },
  {
    id: 'rare_earths_ind',
    name: 'Rare Earth Processing',
    type: 'industry',
    description: 'Refined mining and element processing of Neodymium, Dysprosium, and Terbium required for permanent magnets.',
    region: 'East Asia',
    coordinates: [40.0, 110.0],
    importance: 84,
    status: 'stable',
    metrics: [
      { label: 'China Export Share', value: '87%', trend: 'stable', color: 'text-amber-400' },
      { label: 'Synthetic Sub Rates', value: '4.2%', trend: 'up' },
      { label: 'Market Capital', value: '$64B', trend: 'up' }
    ]
  },
  {
    id: 'auto_ind',
    name: 'Automotive Manufacturing',
    type: 'industry',
    description: 'Highly complex legacy and electric vehicle manufacturing relying on real-time chips and lithium logistics.',
    region: 'Western Europe',
    coordinates: [48.7758, 9.1829],
    importance: 78,
    status: 'stable',
    metrics: [
      { label: 'EV Adoption Curve', value: '+14%', trend: 'up' },
      { label: 'Supplier Vulnerability', value: 'High', trend: 'up', color: 'text-red-400' },
      { label: 'Dealer Inventory', value: '42 days', trend: 'down' }
    ]
  },
  {
    id: 'logistics_freight',
    name: 'Freight Logistics Maritime',
    type: 'industry',
    description: 'Bulk oceanic shipping lanes, global container logistics, and bottleneck canal operations.',
    region: 'Global',
    coordinates: [1.3521, 103.8198],
    importance: 81,
    status: 'stable',
    metrics: [
      { label: '40ft Spot Freight', value: '$3,840', trend: 'up' },
      { label: 'Suez Transit Rate', value: '-34%', trend: 'down', color: 'text-red-400' },
      { label: 'Chokepoint Security', value: 'Medium', trend: 'down' }
    ]
  },

  // Markets
  {
    id: 'brent_crude_mkt',
    name: 'Crude Oil Brent',
    type: 'market',
    description: 'Global benchmark financial price for North Sea oil contracts, anchoring chemical and fuel prices.',
    region: 'Global',
    coordinates: [56.5, 2.5],
    importance: 87,
    status: 'stable',
    metrics: [
      { label: 'Price per bbl', value: '$84.20', trend: 'up', color: 'text-amber-400' },
      { label: 'Option Volatility', value: '24%', trend: 'stable' },
      { label: 'Open Interest', value: '3.1M contr', trend: 'up' }
    ]
  },
  {
    id: 'tech_equities_mkt',
    name: 'Tech Equities / Nasdaq',
    type: 'market',
    description: 'Primary market capitalization matrix for technology, computing, enterprise AI, and chip design corporations.',
    region: 'North America',
    coordinates: [37.3541, -121.9552],
    importance: 83,
    status: 'stable',
    metrics: [
      { label: 'P/E Weighted Avg', value: '32.1x', trend: 'up' },
      { label: 'Short Ratio Net', value: '1.4%', trend: 'down' },
      { label: 'Yield Volatility', value: 'High', trend: 'up', color: 'text-yellow-400' }
    ]
  },
  {
    id: 'sovereign_debt_mkt',
    name: 'US Sovereign Bonds',
    type: 'market',
    description: 'US 10-Year Treasury Yield serving as the risk-free rate of global capitalism, pricing mortgage and national debt.',
    region: 'North America',
    coordinates: [38.9072, -77.0369],
    importance: 89,
    status: 'stable',
    metrics: [
      { label: '10Y Treasury Yield', value: '4.42%', trend: 'up' },
      { label: 'Foreign Holdings', value: '31%', trend: 'down', color: 'text-red-400' },
      { label: 'Liquidity Depth', value: '$24T', trend: 'stable' }
    ]
  },

  // Cities
  {
    id: 'shenzhen',
    name: 'Shenzhen',
    type: 'city',
    description: 'Mega-manufacturing hardware hub of Southern China; primary packaging base and supply coordinator.',
    region: 'East Asia',
    coordinates: [22.5431, 114.0579],
    importance: 79,
    status: 'stable',
    metrics: [
      { label: 'Hardware Shipments', value: '22M/mo', trend: 'up' },
      { label: 'Grid Power Draw', value: '18.4 GW', trend: 'stable' },
      { label: 'Logistics Delay', value: '1.2 days', trend: 'down' }
    ]
  },
  {
    id: 'new_york_city',
    name: 'New York City',
    type: 'city',
    description: 'Central hub of global financial plumbing, insurance underwriters, and equity clearing houses.',
    region: 'North America',
    coordinates: [40.7128, -74.0060],
    importance: 84,
    status: 'stable',
    metrics: [
      { label: 'Bank Reserves', value: '$3.1T', trend: 'stable' },
      { label: 'Commercial Vacancy', value: '19.4%', trend: 'up', color: 'text-yellow-400' },
      { label: 'Transaction Load', value: '$84T/day', trend: 'up' }
    ]
  }
];

export const INITIAL_DEPENDENCY_GRAPH: Dependency[] = [
  // ASML provides EUV steppers to TSMC
  {
    id: 'dep_asml_tsmc',
    sourceId: 'asml',
    targetId: 'tsmc',
    type: 'supply',
    strength: 0.95,
    description: 'TSMC is fully dependent on ASML for proprietary EUV (Extreme Ultraviolet) lithography steppers.',
    criticality: 'critical'
  },
  // TSMC manufactures custom silicon chips for Apple
  {
    id: 'dep_tsmc_apple',
    sourceId: 'tsmc',
    targetId: 'apple',
    type: 'supply',
    strength: 0.92,
    description: 'Apple relies exclusively on TSMC for Apple Silicon (A-series, M-series) 3nm microprocessors.',
    criticality: 'critical'
  },
  // Primary semiconductor industry is hosted in Taiwan
  {
    id: 'dep_taiwan_semiconductors',
    sourceId: 'taiwan',
    targetId: 'semiconductors_ind',
    type: 'geopolitical',
    strength: 0.88,
    description: 'Geographic clustering of foundry capabilities, logistics, and skilled engineers makes Taiwan indispensable to the microchip industry.',
    criticality: 'critical'
  },
  // ASML depends on stable European supply chain and US regulatory compliance
  {
    id: 'dep_usa_asml',
    sourceId: 'usa',
    targetId: 'asml',
    type: 'regulatory',
    strength: 0.75,
    description: 'ASML depends on US export control licensing to supply lithography tools to advanced foundries globally.',
    criticality: 'high'
  },
  // TSMC feeds directly into Nasdaq tech indexes
  {
    id: 'dep_tsmc_nasdaq',
    sourceId: 'tsmc',
    targetId: 'tech_equities_mkt',
    type: 'financial',
    strength: 0.85,
    description: 'TSMC is the absolute bellwether. Structural foundry bottlenecks trigger immediate massive corrections in tech stocks and Nasdaq indices.',
    criticality: 'high'
  },
  // Rare Earth Processing depends on China raw output
  {
    id: 'dep_china_rare_earths',
    sourceId: 'china',
    targetId: 'rare_earths_ind',
    type: 'regulatory',
    strength: 0.90,
    description: 'China controls over 80% of global light/heavy rare earth mining and refining capacity.',
    criticality: 'critical'
  },
  // Rare Earth magnets are a dependency for the Automotive Manufacturing sector
  {
    id: 'dep_rare_earths_auto',
    sourceId: 'rare_earths_ind',
    targetId: 'auto_ind',
    type: 'supply',
    strength: 0.68,
    description: 'Neodymium permanent magnets are core components of high-efficiency electric vehicle drivetrains.',
    criticality: 'high'
  },
  // Automotive Industry depends on Semiconductors for ECU controllers on cars
  {
    id: 'dep_semi_auto',
    sourceId: 'semiconductors_ind',
    targetId: 'auto_ind',
    type: 'supply',
    strength: 0.72,
    description: 'Modern automobiles require 1,000+ microcontrollers; chip shortages halt conveyor belts dynamically.',
    criticality: 'high'
  },
  // Freight Logistics connects manufacturing hubs like Shenzhen to New York consumption
  {
    id: 'dep_shenzhen_logistics',
    sourceId: 'shenzhen',
    targetId: 'logistics_freight',
    type: 'infrastructure',
    strength: 0.78,
    description: 'Shenzhen port is the physical shipping nexus for global consumer electronics freight pipelines.',
    criticality: 'medium'
  },
  {
    id: 'dep_logistics_apple',
    sourceId: 'logistics_freight',
    targetId: 'apple',
    type: 'supply',
    strength: 0.65,
    description: 'Apple depends on high-velocity maritime and air freight corridors to ship hardware units to primary depots.',
    criticality: 'medium'
  },
  // Brent Crude oil sets core feedstock energy prices for Saudi Arabia
  {
    id: 'dep_saudi_aramco_brent',
    sourceId: 'saudi_aramco',
    targetId: 'brent_crude_mkt',
    type: 'supply',
    strength: 0.89,
    description: 'Aramcos output tuning alters global oil pricing metrics directly, influencing chemical and utility feedstock.',
    criticality: 'critical'
  },
  // Brent Crude prices heavily influence European industrial costs including Germany
  {
    id: 'dep_brent_germany',
    sourceId: 'brent_crude_mkt',
    targetId: 'germany',
    type: 'supply',
    strength: 0.70,
    description: 'Germany’s chemical and manufacturing industries depend on Brent-correlated natural gas and petroleum indicators.',
    criticality: 'high'
  },
  // US national financial policy sets sovereign bonds pricing global risk
  {
    id: 'dep_usa_bonds',
    sourceId: 'usa',
    targetId: 'sovereign_debt_mkt',
    type: 'regulatory',
    strength: 0.94,
    description: 'Federal Reserve rate actions and treasury issuances directly set yields on US sovereign debt.',
    criticality: 'critical'
  },
  // Sovereign bonds determine treasury levels at clearing houses like NYC
  {
    id: 'dep_bonds_nyc',
    sourceId: 'sovereign_debt_mkt',
    targetId: 'new_york_city',
    type: 'financial',
    strength: 0.80,
    description: 'High bond yields contract credit supply and collateral pricing inside primary US banking institutions based in NYC.',
    criticality: 'high'
  }
];

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'strait_blockade',
    title: 'Taiwan Strait Maritime Embargo',
    description: 'A structural naval and aerial quarantine around Taiwan completely halting physical shipping, personnel transit, and dry dock raw materials.',
    category: 'Geopolitical',
    triggers: ['Severe regional naval build-up', 'Export quarantine declarations', 'Global strategic semiconductor stockpiling'],
    initialShockEntityIds: ['taiwan', 'tsmc', 'semiconductors_ind'],
    severity: 'existential'
  },
  {
    id: 'energy_shock',
    title: 'Sudden Straits of Hormuz Cutoff',
    description: 'Sovereign sabotage halts logistics across the Strait of Hormuz, cutting off 20% of global liquefied gas and crude oil flow.',
    category: 'Macroeconomic',
    triggers: ['Gulf shipping attacks', 'OPEC production halt', 'National emergency reserves release'],
    initialShockEntityIds: ['saudi_arabia', 'saudi_aramco', 'brent_crude_mkt'],
    severity: 'severe'
  },
  {
    id: 'rare_earth_ban',
    title: 'Rare Earth Strategic Embargo',
    description: 'China bans the export of advanced permanent magnets and heavy processed rare-earth components to non-complying nations.',
    category: 'Geopolitical',
    triggers: ['Escalation of trade sanctions', 'Sovereign element rationing', 'Rapid domestic processing mandates'],
    initialShockEntityIds: ['china', 'rare_earths_ind'],
    severity: 'moderate'
  },
  {
    id: 'agi_breakthrough',
    title: 'Autonomous Synthetic Intelligence Ascent',
    description: 'An unannounced superintelligence breakthrough activates, initiating rapid chip design optimizations and automatic network asset acquisition.',
    category: 'Technological',
    triggers: ['Megawatt cluster compute activation', 'Algorithmic recursive self-improvement', 'IP design takeover'],
    initialShockEntityIds: ['usa', 'apple', 'tech_equities_mkt'],
    severity: 'existential'
  }
];

export const INITIAL_PREDICTIONS: Prediction[] = [
  {
    id: 'pred_tsmc_diversify',
    title: 'US Intel/Foundry Inoculation',
    description: 'TSMC successfully scales and initiates automated commercial production of sub-2nm wafers inside its Arizona/Munich facilities.',
    targetEntityId: 'tsmc',
    timeHorizon: '5y',
    probability: 68,
    impactScore: 8,
    confidenceInterval: '60% - 75%',
    catalysts: ['US CHIPS Act tranche funding', 'Cross-border specialized labor immigration', 'Aggressive local tooling subsidies'],
    mitigations: ['Supply chain redundancy', 'Legacy node conversion']
  },
  {
    id: 'pred_china_rare_sub',
    title: 'Synthetic Rare Earth Magnet Substitutions',
    description: 'European and Japanese laboratory consortia successfully synthesize non-neodymium high-efficiency magnetic induction motors at scale.',
    targetEntityId: 'rare_earths_ind',
    timeHorizon: '10y',
    probability: 45,
    impactScore: 6,
    confidenceInterval: '35% - 55%',
    catalysts: ['Rare earth mineral pricing spikes', 'Government direct university grants', 'FeN-based nano-crystalline innovations'],
    mitigations: ['Secured bilateral trade treaties', 'Deep sea nodule mining permits']
  },
  {
    id: 'pred_saudi_green',
    title: 'Saudi Solar-Hydrogen Dominance',
    description: 'Saudi Arabia successfully matches oil royalty levels with synthetic green ammonia and low-cost hydrogen exports.',
    targetEntityId: 'saudi_arabia',
    timeHorizon: '10y',
    probability: 38,
    impactScore: 7,
    confidenceInterval: '28% - 46%',
    catalysts: ['Vision 2030 solar gigafarms', 'Western hydrogen carbon quotas', 'Red Sea logistical corridors'],
    mitigations: ['Alternative hydrocarbon applications', 'OPEC capacity recalibration']
  }
];

export const INITIAL_ALTERNATE_FUTURES: AlternateFuture[] = [
  {
    id: 'future_deglobalized',
    name: 'Bifurcated Iron Curtain 2.0',
    scenarioTitle: 'Rising Deglobalization',
    summary: 'The world fractures completely into two disconnected technological and energy supply ecosystems (US-Sovereign-West vs China-Eurasia Block).',
    probability: 42,
    metrics: {
      stability: 45,
      techProgress: 60,
      resourceAbundance: 52,
      economicGrowth: 38
    },
    keyEvents: [
      'Universal digital routing tariff walls implemented.',
      'Semi fabrication fully onshore-mirrored with high domestic costs.',
      'Bilateral raw supply bartering replaces multilateral WTO clearing.'
    ]
  },
  {
    id: 'future_harmony',
    name: 'Unified Hyper-Silicon Harmony',
    scenarioTitle: 'Autonomous Stabilization',
    summary: 'Sovereign entities yield trade jurisdiction to trusted automated decentralized AI allocation networks to preserve supply parameters.',
    probability: 15,
    metrics: {
      stability: 88,
      techProgress: 95,
      resourceAbundance: 78,
      economicGrowth: 85
    },
    keyEvents: [
      'Global automated resource-clearing DAO established.',
      'Patent sovereignty pooled under unified open science charters.',
      'Total nuclear disarmament in exchange for computational rights.'
    ]
  }
];
