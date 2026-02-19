import { GrowthAsset, InvestAction, CompoundAction } from './core/models/GrowthAsset';
import { SqliteStore } from './lib/SqliteStore';
import { GrowthAssetSchema } from './core/schemas';

/**
 * Evolution: Now using SQLite and Zod Validation!
 */
async function runOptimizedLoop() {
  const store = new SqliteStore('./data/system.db');
  const assetId = 'optimized-savings';
  
  // 1. Load existing asset
  let assetData = store.load<any>(assetId);
  let asset: GrowthAsset;
  
  if (assetData) {
    // Validate with Zod before constructing
    const validated = GrowthAssetSchema.parse({
      id: assetId,
      type: 'GROWTH',
      value: assetData.data.value,
      version: assetData.version
    });
    
    asset = new GrowthAsset(validated.id, validated.value, validated.version);
    console.log(`[SQLite Start] Validated Asset Load: $${asset.value} (v${asset.version})`);
  } else {
    asset = new GrowthAsset(assetId, 1000);
    console.log(`[SQLite Start] Initialized New Asset: $${asset.value} (v${asset.version})`);
  }

  // 2. Growth
  const action: CompoundAction = { type: 'COMPOUND', payload: { rate: 0.05 }, timestamp: Date.now() };
  const newAsset = asset.apply(action);
  
  // 3. Persist with ACID compliance
  store.save(newAsset.id, 'GROWTH', { value: newAsset.value }, newAsset.version);

  console.log(`[SQLite End] Asset $${newAsset.value} persisted safely in SQLite.`);
  store.close();
}

runOptimizedLoop().catch(err => console.error('Loop Error:', err));
