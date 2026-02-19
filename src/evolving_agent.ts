import { GrowthAsset } from './core/models/GrowthAsset';
import { SqliteStore } from './lib/SqliteStore';
import { OllamaProvider } from './lib/providers/OllamaProvider';
import { GrowthAssetSchema } from './core/schemas';

/**
 * Autonomous Agent 3.0: Self-Evolving Layer
 * Now learns from past decisions stored in the Experience DB.
 */
async function runEvolvingAgent() {
  console.log('--- Evolving AE Agent 3.0: Memory & Reflection Loop ---');
  
  const store = new SqliteStore('./data/system.db');
  const ai = new OllamaProvider();
  const assetId = 'evolving-asset';
  
  // 1. Load current state
  let assetData = store.load<any>(assetId);
  let asset: GrowthAsset;
  
  if (assetData) {
    const validated = GrowthAssetSchema.parse({
      id: assetId,
      type: 'GROWTH',
      value: assetData.data.value,
      version: assetData.version
    });
    asset = new GrowthAsset(validated.id, validated.value, validated.version);
  } else {
    asset = new GrowthAsset(assetId, 1000);
  }
  console.log(`[Status] Value: $${asset.value}, Version: v${asset.version}`);

  // 2. Retrieve Past Experiences (The "Self-Evolution" part)
  const experiences = store.getRecentExperiences(3);
  const experienceContext = experiences.length > 0
    ? experiences.map(e => `- Past State: $${e.context_state.value}, Decision: ${e.decision}, Lesson: ${e.lesson}`).join('\n')
    : 'No prior experience yet.';

  // 3. Ask AI for Decision with Experience Context
  const prompt = `
    CURRENT STATE: Asset is worth $${asset.value}.
    TARGET: $5000.
    
    PAST EXPERIENCES:
    ${experienceContext}
    
    OPTIONS:
    1. "INVEST": Adds $200 instantly.
    2. "COMPOUND": Grows the current value by 5%.
    
    Considering your past experiences, what is the best strategic choice?
    Respond in JSON format: { "decision": "INVEST" | "COMPOUND", "justification": "...", "prediction": "value after action" }
  `;

  console.log(`[Thinking] AI is reviewing past lessons...`);
  const response = await ai.generate(prompt);
  
  // Simple JSON extraction from AI response (assuming AI follows JSON or at least mentions the word)
  let decision: 'INVEST' | 'COMPOUND' = response.content.includes('INVEST') ? 'INVEST' : 'COMPOUND';
  console.log(`[Decision] AI chose ${decision}`);

  // 4. Apply Action
  let nextAsset: GrowthAsset;
  if (decision === 'COMPOUND') {
    nextAsset = asset.apply({ type: 'COMPOUND', payload: { rate: 0.05 }, timestamp: Date.now() });
  } else {
    nextAsset = asset.apply({ type: 'INVEST', payload: { amount: 200 }, timestamp: Date.now() });
  }

  // 5. Reflection Phase (Final loop of the flywheel)
  console.log(`[Reflection] Analyzing results...`);
  const reflectionPrompt = `
    Previous Value: $${asset.value}
    Decision Made: ${decision}
    New Value: $${nextAsset.value}
    
    Did this decision align with the compounding goal? (Note: INVEST is better when value is low, COMPOUND is better when value is high).
    Write 1 short sentence summarizing the lesson learned.
  `;
  const reflection = await ai.generate(reflectionPrompt);
  
  // 6. Save Experience & State
  store.saveExperience({ value: asset.value }, decision, reflection.content.trim(), { newValue: nextAsset.value });
  store.save(nextAsset.id, 'GROWTH', { value: nextAsset.value }, nextAsset.version);

  console.log(`[Evolution] Experience saved. Lesson: ${reflection.content.trim()}`);
  console.log(`[Growth] Result: $${nextAsset.value}`);
  
  store.close();
}

runEvolvingAgent().catch(err => console.error('Evolving Agent Error:', err));
