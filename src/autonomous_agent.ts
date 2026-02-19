import { SqliteStore } from './lib/SqliteStore';
import { OllamaProvider } from './lib/providers/OllamaProvider';
import { FlywheelController } from './FlywheelController';

/**
 * The New Autonomous Agent (Powered by FlywheelController)
 */
async function runAgent() {
  const store = new SqliteStore('./data/system.db');
  const ai = new OllamaProvider();
  
  const controller = new FlywheelController(store, ai, 'optimized-savings');
  
  await controller.tick();
  
  store.close();
}

runAgent().catch(console.error);
