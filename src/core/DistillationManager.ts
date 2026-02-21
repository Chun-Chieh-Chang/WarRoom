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
  async distill(assetId: string = 'default'): Promise<void> {
    console.log(`[Distill][${assetId}] Starting Meta-Knowledge Distillation...`);

    // 1. Fetch raw data
    const experiences = this.store.getRecentExperiences(20, assetId);
    const existingConstitution = this.store.getLatestConstitution(assetId);

    if (experiences.length < 5) {
      const errorMsg = `[Distill] Not enough experiences to distill for workspace [${assetId}] yet (minimum 5).`;
      console.log(errorMsg);
      throw new Error(errorMsg);
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
    
    console.log(`[Distill] AI is synthesizing wisdom...`);
    try {
      const response = await this.ai.generate(prompt, '', distillationRole);
      const newPrinciples = response.content.trim();

      // Robustness Check: Ensure response is not empty and has a minimum quality
      if (!newPrinciples || newPrinciples.length < 10) {
        throw new Error('AI returned insufficient or empty principles.');
      }

      // 4. Update the Constitution
      const nextVersion = (existingConstitution?.version || 0) + 1;
      this.store.updateConstitution(newPrinciples, nextVersion, assetId);
      
      console.log(`[Distill] System Constitution Evolved to Version ${nextVersion}!`);
    } catch (error: any) {
      console.error(`[Distill] Failed to evolve constitution for [${assetId}]:`, error.message);
      // Fallback: Re-save existing to bump timestamp or just log failure
      // This prevents the system from crashing if AI service is down
    }
  }
}
