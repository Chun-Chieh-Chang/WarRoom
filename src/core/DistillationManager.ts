import { SqliteStore } from '../lib/SqliteStore';
import { AIProvider } from '../lib/AIProvider';

/**
 * DistillationManager: Brain Refinement Tool.
 * It synthesizes raw experience into high-level principles.
 * This is the "Meta-Knowledge" layer of the Compound Effect.
 */
export class DistillationManager {
  constructor(
    private store: SqliteStore,
    private ai: AIProvider
  ) {}

  /**
   * Distills the last X experiences into a new version of the System Constitution.
   */
  async distill(): Promise<void> {
    console.log('[Distill] Starting Meta-Knowledge Distillation...');

    // 1. Fetch raw data
    const experiences = this.store.getRecentExperiences(20);
    const existingConstitution = this.store.getLatestConstitution();

    if (experiences.length < 5) {
      console.log('[Distill] Not enough experiences to distill yet (minimum 5).');
      return;
    }

    // 2. Format for AI
    const rawData = experiences.map((e: any) => `[${e.decision}] lesson: ${e.lesson}`).join('\n');
    const existingText = existingConstitution ? existingConstitution.principles : 'No existing principles.';

    // 3. AI Distillation Prompt
    const prompt = `
      CURRENT CONSTITUTION:
      ${existingText}

      RECENT RAW EXPERIENCES:
      ${rawData}

      TASK:
      Review the existing principles and the new experiences. 
      Update/Refine the System Constitution by providing 3 high-level 'Guiding Principles' 
      that will help the AI improve compounding growth and avoid pitfalls.
      
      Format: Return ONLY the list of 3 principles.
    `;

    const distillationRole = "You are the 'Great Architect'. Your job is to extract fundamental wisdom from raw data. [語言憲法] 你必須嚴格使用繁體中文，禁止使用任何簡體字。";
    
    console.log('[Distill] AI is synthesizing wisdom...');
    const response = await this.ai.generate(prompt, '', distillationRole);
    
    // 4. Update the Constitution
    const nextVersion = (existingConstitution?.version || 0) + 1;
    this.store.updateConstitution(response.content.trim(), nextVersion);
    
    console.log(`[Distill] System Constitution Evolved to Version ${nextVersion}!`);
    console.log(`[Wisdom] New Principles:\n${response.content.trim()}`);
  }
}
