/**
 * BlackSwanManager: Introduces randomness and external shocks to the system.
 * This tests the "Antifragility" of the Flywheel.
 */
export interface EnvironmentalShock {
  type: 'CRISIS' | 'WINDFALL' | 'STABLE';
  multiplier: number;
  description: string;
}

export class BlackSwanManager {
  /**
   * Generates a random environmental shock.
   * - 5% chance of a CRISIS (Major negative impact)
   * - 5% chance of a WINDFALL (Major positive impact)
   * - 90% chance of STABLE (No major impact)
   */
  generateShock(): EnvironmentalShock {
    const roll = Math.random();

    if (roll < 0.05) {
      return {
        type: 'CRISIS',
        multiplier: 0.7, // 30% loss
        description: 'Black Swan Event: Unexpected Market Contraction!'
      };
    }

    if (roll > 0.95) {
      return {
        type: 'WINDFALL',
        multiplier: 1.5, // 50% gain
        description: 'Exponential Opportunity: Breakthrough Innovation Discovered!'
      };
    }

    return {
      type: 'STABLE',
      multiplier: 1.0,
      description: 'Environment remains stable.'
    };
  }
}
