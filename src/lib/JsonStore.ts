import * as fs from 'fs';
import * as path from 'path';

/**
 * A simple JSON-based store to persist assets on disk.
 * This ensures the "Accumulator" effect persists across system restarts.
 */
export class JsonStore {
  private baseDir: string;

  constructor(baseDir: string = './data') {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Saves an object to a JSON file.
   */
  save<T>(id: string, data: T): void {
    const filePath = path.join(this.baseDir, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Loads an object from a JSON file.
   */
  load<T>(id: string): T | null {
    const filePath = path.join(this.baseDir, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  }

  /**
   * Checks if an asset exists.
   */
  exists(id: string): boolean {
    return fs.existsSync(path.join(this.baseDir, `${id}.json`));
  }
}
