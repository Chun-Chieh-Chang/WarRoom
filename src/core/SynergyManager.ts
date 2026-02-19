import { SqliteStore } from '../lib/SqliteStore';

/**
 * SynergyManager: The "Multiplier" of the system.
 * It calculates how different assets influence each other.
 * 
 * Concept: Knowledge (KnowledgeAsset) provides a "Wisdom Multiplier" 
 * that boosts the growth rate of financial assets (GrowthAsset).
 */
export class SynergyManager {
  constructor(private store: SqliteStore) {}

  /**
   * Calculates current multipliers based on other assets in the system.
   */
  getMultipliers(): { growthMultiplier: number; riskReduction: number } {
    let growthMultiplier = 1.0;
    let riskReduction = 0;

    // 1. Wisdom Multiplier: Based on KnowledgeAsset version and content count
    // We search for KNOWLEDGE type assets
    const knowledgeAssets = this.store.listByType('KNOWLEDGE');
    
    knowledgeAssets.forEach(ka => {
      // Every version of knowledge provides 1% boost
      growthMultiplier += ka.version * 0.01;
      
      // Every 5 knowledge entries provide 2% boost
      if (Array.isArray(ka.data)) {
        growthMultiplier += Math.floor(ka.data.length / 5) * 0.02;
      }
    });

    // 2. Experience Multiplier: Based on number of lessons learned
    const experiences = this.store.getRecentExperiences(100);
    // Every 10 experiences reduce structural "friction" (represented as a small direct boost here)
    growthMultiplier += Math.floor(experiences.length / 10) * 0.01;

    // Cap the multiplier to avoid infinite runaway (though that is the dream!)
    growthMultiplier = Math.min(growthMultiplier, 2.5);

    return { 
      growthMultiplier: Math.round(growthMultiplier * 100) / 100,
      riskReduction: Math.min(experiences.length * 0.005, 0.5)
    };
  }
}
