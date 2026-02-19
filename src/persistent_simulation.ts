import { GrowthAsset, CompoundAction } from './core/models/GrowthAsset';
import { JsonStore } from './lib/JsonStore';

/**
 * This script demonstrates "Across-Session Compounding".
 * Every time you run this, the asset value grows and is saved.
 */
async function runPersistentLoop() {
  const store = new JsonStore('./data');
  const assetId = 'infinite-savings';
  
  // 1. Load existing asset or initialize new one
  let assetData = store.load<any>(assetId);
  let asset: GrowthAsset;
  
  if (assetData) {
    asset = new GrowthAsset(assetData.id, assetData.value, assetData.version);
    console.log(`[Session Start] Loaded Asset: $${asset.value} (v${asset.version})`);
  } else {
    asset = new GrowthAsset(assetId, 1000);
    console.log(`[Session Start] Created New Asset: $${asset.value} (v${asset.version})`);
  }

  // 2. Apply a compound action (5% growth)
  const action: CompoundAction = {
    type: 'COMPOUND',
    payload: { rate: 0.05 },
    timestamp: Date.now()
  };

  const newAsset = asset.apply(action);
  console.log(`[Session Growth] Applied 5% Compound. New Value: $${newAsset.value} (v${newAsset.version})`);

  // 3. Persist the results
  store.save(assetId, {
    id: newAsset.id,
    type: newAsset.type,
    value: newAsset.value,
    version: newAsset.version
  });

  console.log(`[Session End] Asset saved to disk. Run again to see it grow further!`);
}

runPersistentLoop().catch(err => console.error(err));
