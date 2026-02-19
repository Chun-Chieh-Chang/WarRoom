import { describe, it, expect } from 'vitest';
import { GrowthAsset, InvestAction } from '../src/core/models/GrowthAsset';

describe('GrowthAsset (The Flywheel Core)', () => {
  it('should initialize with a base value', () => {
    const asset = new GrowthAsset('test-1', 100);
    expect(asset.value).toBe(100);
    expect(asset.version).toBe(1);
  });

  it('should accrue value when "InvestAction" is applied', () => {
    const asset = new GrowthAsset('test-1', 100);
    const action: InvestAction = {
        type: 'INVEST',
        payload: { amount: 10 },
        timestamp: Date.now()
    };
    
    const newAsset = asset.apply(action);
    
    // 100 + 10 = 110
    expect(newAsset.value).toBe(110);
    expect(newAsset.version).toBe(2);
    expect(newAsset).not.toBe(asset); // Immutability check
  });

  it('should compound when "CompoundAction" is applied', () => {
    const asset = new GrowthAsset('test-1', 100);
    // Let's say we have a rule: 10% growth per cycle
    const action = { type: 'COMPOUND', payload: { rate: 0.1 }, timestamp: Date.now() };
    
    const newAsset = asset.apply(action);
    
    // 100 * 1.1 = 110
    expect(newAsset.value).toBe(110);
  });
});
