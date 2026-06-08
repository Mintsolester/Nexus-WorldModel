import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Lazily initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY environment variable is required but missing or unconfigured.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API HEALTH CHECK
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    });
  });

  // API SIMULATE ENDPOINT
  app.post('/api/simulate-shock', async (req: Request, res: Response) => {
    const { scenarioTitle, scenarioDescription, initialShockEntityIds, entities, dependencies, customTriggers } = req.body;

    const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

    if (!hasApiKey) {
      // Graceful realistic offline prediction engine fallback
      console.log('No GEMINI_API_KEY found, running deterministic terminal-grade local simulation model.');
      const simulatedResult = generateLocalSimulation(scenarioTitle, scenarioDescription, initialShockEntityIds, entities, dependencies, customTriggers);
      return res.json({
        ...simulatedResult,
        isSimulated: true,
        notice: 'Displaying offline simulation telemetry. Configure GEMINI_API_KEY in Secrets for dynamic neural-graph simulation.'
      });
    }

    try {
      const ai = getGeminiClient();

      // Formulate detailed, systematic prompt instructing the model to trace relationships
      const prompt = `You are the WorldModel Cognitive Forecasting System, a highly advanced systemic relationship computer running simulation cascades across countries, companies, industries, markets, and cities.
      
      SCENARIO UNDER TEST:
      Title: "${scenarioTitle}"
      Description: "${scenarioDescription}"
      Custom User Triggers: ${JSON.stringify(customTriggers || [])}
      Initial Shock Focus Nodes: ${JSON.stringify(initialShockEntityIds)}

      AVAILABLE GLOBAL ENTITY GRAPH CONTEXT:
      Entities to model:
      ${JSON.stringify(entities.map((e: any) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        description: e.description,
        coordinates: e.coordinates,
        currentStatus: e.status,
        importanceScore: e.importance
      })))}

      CURRENT DEPENDENCY LINKS (Entity Dependency directed edges):
      ${JSON.stringify(dependencies.map((d: any) => ({
        id: d.id,
        source: d.sourceId,
        target: d.targetId,
        type: d.type,
        strength: d.strength,
        criticality: d.criticality,
        description: d.description
      })))}

      INSTRUCTIONS:
      1. Model three distinct steps (Phase 1: Immediate Ripple [Short Term, e.g. Day 1 - 10], Phase 2: Structural Fracture [Medium Term, e.g. Month 1 - 3], Phase 3: Macro Realignment [Long Term, e.g. Year 1 - 5]).
      2. For each Phase/Step:
         - Create a comprehensive timeframe description detailing how the shock spreads.
         - Update affected entities' statuses ('stressed', 'volatile', 'collapsed', or 'stable') based strictly on their graph dependencies.
         - Calculate incremental degradation of Global Metrics (stabilityIndex starting at 100 decreasing, marketVolatility starting at 15 increasing, supplyChainDisruption starting at 10 increasing).
      3. Generate 1-2 Alternate Futures branching from this timeline, estimating their branch probabilities and socio-political summaries.
      4. Extrapolate 2-3 specific long-term logical Predictions (confidence, impact score 1-10, catalysts, and mitigating policies).
      5. Include a list of raw, high-vibe Bloomberg Terminal style log strings reporting internal simulation telemetry events (e.g. "[SYS_ALERT] TSMC wafer allocations choked", "[RE_ROUTE] Maritime container shipping corridors shifted north").`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are the WorldModel Bloomberg Terminal Simulation Engine. Your responses must be technical, objective, and styled with hyper-realistic macroeconomic intelligence.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.INTEGER, description: 'Phase identifier index (1, 2, or 3).' },
                    timeframe: { type: Type.STRING, description: 'Logical timeframe duration' },
                    description: { type: Type.STRING, description: 'Socio-economic narrative summarizing this phase.' },
                    activeEffects: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          entityId: { type: Type.STRING, description: 'The modified entity' },
                          statusChange: { type: Type.STRING, description: 'One of stable, stressed, volatile, collapsed' },
                          impactDetail: { type: Type.STRING, description: 'A brief, technical explanation of the specific cause of impact.' },
                          vulnerabilityScore: { type: Type.INTEGER, description: 'Vulnerability rating from 0 to 100' }
                        },
                        required: ['entityId', 'statusChange', 'impactDetail', 'vulnerabilityScore']
                      }
                    },
                    globalMetrics: {
                      type: Type.OBJECT,
                      properties: {
                        stabilityIndex: { type: Type.INTEGER },
                        marketVolatility: { type: Type.INTEGER },
                        supplyChainDisruption: { type: Type.INTEGER }
                      },
                      required: ['stabilityIndex', 'marketVolatility', 'supplyChainDisruption']
                    }
                  },
                  required: ['phase', 'timeframe', 'description', 'activeEffects', 'globalMetrics']
                }
              },
              alternateFutures: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING, description: 'Branch name (e.g. The Autarkic Rift)' },
                    scenarioTitle: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    probability: { type: Type.INTEGER },
                    metrics: {
                      type: Type.OBJECT,
                      properties: {
                        stability: { type: Type.INTEGER },
                        techProgress: { type: Type.INTEGER },
                        resourceAbundance: { type: Type.INTEGER },
                        economicGrowth: { type: Type.INTEGER }
                      },
                      required: ['stability', 'techProgress', 'resourceAbundance', 'economicGrowth']
                    },
                    keyEvents: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['id', 'name', 'scenarioTitle', 'summary', 'probability', 'metrics', 'keyEvents']
                }
              },
              predictions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    targetEntityId: { type: Type.STRING },
                    timeHorizon: { type: Type.STRING },
                    probability: { type: Type.INTEGER },
                    impactScore: { type: Type.INTEGER },
                    confidenceInterval: { type: Type.STRING },
                    catalysts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    mitigations: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['id', 'title', 'description', 'targetEntityId', 'timeHorizon', 'probability', 'impactScore', 'confidenceInterval', 'catalysts', 'mitigations']
                }
              },
              terminalLogs: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['steps', 'alternateFutures', 'predictions', 'terminalLogs']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini API returned an empty output');
      }

      const cleanJson = JSON.parse(responseText.trim());
      return res.json(cleanJson);
    } catch (err: any) {
      console.error('Error simulating via Gemini, failing over to local deterministic model:', err);
      // Failover gracefully, never crash!
      const simulatedResult = generateLocalSimulation(scenarioTitle, scenarioDescription, initialShockEntityIds, entities, dependencies, customTriggers);
      return res.json({
        ...simulatedResult,
        isSimulated: true,
        notice: `API error failed over to local simulation database: ${err.message || err}`
      });
    }
  });

  // MOUNT VITE MIDDLEWARE OR STATIC SERVER
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WorldModel server booting actively on http://0.0.0.0:${PORT}`);
  });
}

/**
 * DETERMINISTIC LOCAL SYSTEMIC SIMULATION LOGIC (FALLBACK)
 * Simulates cascading effects dynamically tracing network dependencies
 */
function generateLocalSimulation(
  title: string,
  desc: string,
  shocks: string[],
  entities: any[],
  dependencies: any[],
  customTriggers: string[]
) {
  // Construct a dependency map for quick traversal
  // Find which entity depends on which entity
  const affectedSet = new Set<string>(shocks);
  const stressedMap = new Map<string, 'stressed' | 'volatile' | 'collapsed'>();
  shocks.forEach(id => stressedMap.set(id, 'collapsed'));

  // PHASE 1: Direct Impacts
  const phase1Effects: any[] = [];
  entities.forEach(entity => {
    if (shocks.includes(entity.id)) {
      phase1Effects.push({
        entityId: entity.id,
        statusChange: 'collapsed',
        impactDetail: `Primary epicentre of systemic trigger "${title}". Direct containment issues.`,
        vulnerabilityScore: 100
      });
    }
  });

  // Trace immediate second level dependencies
  dependencies.forEach(dep => {
    // If source is collapsed, target inherits stress based on dependency strength
    if (shocks.includes(dep.sourceId)) {
      const targetEntity = entities.find(e => e.id === dep.targetId);
      if (targetEntity && !shocks.includes(targetEntity.id)) {
        affectedSet.add(targetEntity.id);
        const isCritical = dep.criticality === 'critical' || dep.criticality === 'high';
        const newStatus = isCritical ? 'stressed' : 'volatile';
        stressedMap.set(targetEntity.id, newStatus);

        phase1Effects.push({
          entityId: targetEntity.id,
          statusChange: newStatus,
          impactDetail: `Indirect exposure from primary shock "${dep.sourceId}" via physical/financial link "${dep.type}".`,
          vulnerabilityScore: Math.round(dep.strength * 100)
        });
      }
    }
  });

  // PHASE 2: Secondary Ripples (ripple one step deeper)
  const phase2Effects: any[] = [...phase1Effects];
  const phase2Visited = new Set(affectedSet);
  
  dependencies.forEach(dep => {
    // If the source was made stressed or volatile in phase 1, target is impacted in phase 2!
    if (stressedMap.has(dep.sourceId) && !phase2Visited.has(dep.targetId)) {
      const targetEntity = entities.find(e => e.id === dep.targetId);
      if (targetEntity) {
        phase2Visited.add(targetEntity.id);
        const strengthMultiplier = dep.strength;
        const newStatus = strengthMultiplier > 0.8 ? 'stressed' : 'volatile';
        stressedMap.set(targetEntity.id, newStatus);
        
        phase2Effects.push({
          entityId: targetEntity.id,
          statusChange: newStatus,
          impactDetail: `Secondary cascading failure. Critical dependency path: ${dep.sourceId} -> ${dep.targetId} is compromised.`,
          vulnerabilityScore: Math.round(strengthMultiplier * 85)
        });
      }
    }
  });

  // Create steps
  const step1 = {
    phase: 1,
    timeframe: 'Day 1 - Day 14',
    description: `The immediate shock wave of "${title}" breaks physical supply nodes. Risk clearing spreads rapidly across immediate bilateral counterparties.`,
    activeEffects: phase1Effects,
    globalMetrics: {
      stabilityIndex: 78,
      marketVolatility: 42,
      supplyChainDisruption: 55
    }
  };

  const step2 = {
    phase: 2,
    timeframe: 'Month 1 - Month 3',
    description: `Primary and secondary supplier defaults propagate globally. Regional resource bottlenecks lead to speculative hoarding and export bans.`,
    activeEffects: phase2Effects,
    globalMetrics: {
      stabilityIndex: 52,
      marketVolatility: 68,
      supplyChainDisruption: 82
    }
  };

  const step3 = {
    phase: 3,
    timeframe: 'Year 1 - Year 3',
    description: `Macro realIGNMENT taking hold. National industrial onshoring models force massive capital misallocations and sovereign currency friction.`,
    activeEffects: entities.map(e => {
      const status = stressedMap.get(e.id) || 'stressed';
      return {
        entityId: e.id,
        statusChange: status,
        impactDetail: `Persistent long-term structural restructuring of global positioning for "${e.name}".`,
        vulnerabilityScore: Math.min(e.importance + 10, 95)
      };
    }),
    globalMetrics: {
      stabilityIndex: 38,
      marketVolatility: 79,
      supplyChainDisruption: 90
    }
  };

  // Generate alternate futures
  const future1 = {
    id: 'alt_polarised',
    name: `The Autarkic Bloc Divided`,
    scenarioTitle: title,
    summary: `Global networks split permanently into hyper-localized regions. Trade clearing mechanisms are replaced with bilateral state-level raw material swaps.`,
    probability: 58,
    metrics: {
      stability: 42,
      techProgress: 55,
      resourceAbundance: 40,
      economicGrowth: 35
    },
    keyEvents: [
      `Creation of rival Sovereign Strategic Sandboxes in the West and East.`,
      `Critical chips and battery supply chains fully nationalized.`,
      `Multi-lateral currency agreements suspended or replaced with gold/compute reserves.`
    ]
  };

  const future2 = {
    id: 'alt_coordinated',
    name: 'Unified Synthetic Optimization',
    scenarioTitle: title,
    summary: `Sovereign countries agree on a digital optimization charter, delegating global logistical distribution grids to AI agents to coordinate emergency trade flows and stabilize prices.`,
    probability: 22,
    metrics: {
      stability: 78,
      techProgress: 88,
      resourceAbundance: 65,
      economicGrowth: 60
    },
    keyEvents: [
      `Emergency digital resource-swapping mechanism launched at G20.`,
      `Algorithmic allocation of critical raw neon, helium, and silicon substrates.`,
      `Commodity prices settled via standardized supply guarantees.`
    ]
  };

  // Generate Predictions
  const predictions: any[] = [
    {
      id: 'pred_local_1',
      title: 'Accelerated Sovereign Fab Construction',
      description: 'Governments in the EU and NA deploy $150B in emergency direct capital grants to build automated high-yield cleanrooms natively.',
      targetEntityId: 'semiconductors_ind',
      timeHorizon: '5y',
      probability: 78,
      impactScore: 9,
      confidenceInterval: '70% - 85%',
      catalysts: ['CHIPS Act 2.0 Tranches', 'Extreme lithography export control updates', 'Sovereign supply urgency'],
      mitigations: ['Standardized equipment pooling', 'Cross-continental tech-sharing pacts']
    },
    {
      id: 'pred_local_2',
      title: 'Automotive Electric-Drive Redesigns',
      description: 'Auto manufacturers launch rapid design upgrades to bypass rare-earth materials, integrating localized induction motors.',
      targetEntityId: 'auto_ind',
      timeHorizon: '1y',
      probability: 64,
      impactScore: 7,
      confidenceInterval: '55% - 72%',
      catalysts: ['OPEC supply targets', 'China permanent magnet restrictions', 'Lithium recycling breakthroughs'],
      mitigations: ['Heavy silicon-carbide tech investments', 'Legacy fleet fuel optimization']
    }
  ];

  const terminalLogs = [
    `[SYS_INIT] Loading global dependency matrix. 18 entities registered.`,
    `[SHOCK_ALERT] Injecting primary failure triggers into entity [${shocks.join(', ')}]`,
    `[TRACE_PATH] Analyzing directed edges: found ${phase1Effects.length} immediate risk propagation paths.`,
    `[PROPAGATION] Phase 2 systemic cascades loaded: volatile status mapped to downstream assets.`,
    `[METRICS_UPD] Global stability dropping: -48%. Market volatility rising: +64%.`,
    `[TELEMETRY] Terminal projection complete. Alternate future branches simulated.`
  ];

  return {
    steps: [step1, step2, step3],
    alternateFutures: [future1, future2],
    predictions,
    terminalLogs
  };
}

startServer();
