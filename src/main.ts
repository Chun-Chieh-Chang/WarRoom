import { SqliteStore } from './lib/SqliteStore';
import { OllamaProvider } from './lib/providers/OllamaProvider';
import { FlywheelController } from './FlywheelController';

/**
 * Main Entry Point: Flywheel OS 2.0
 * Demonstrates the power of the central controller.
 */
async function main() {
  const store = new SqliteStore('./data/system.db');
  const ai = new OllamaProvider();
  
  // Create controllers for different assets
  const growthController = new FlywheelController(store, ai, 'main-growth-asset');
  
  console.log('--- Starting System Flywheel Cycles ---');

  // Run 3 autonomous cycles
  for (let i = 0; i < 3; i++) {
    await growthController.tick();
  }

  console.log('\n--- System state persisted and audited. ---');
  store.close();
}

main().catch(console.error);
