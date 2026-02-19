import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

/**
 * A robust SQLite-based store to replace JsonStore.
 * Provides ACID compliance and better performance for the Accumulator.
 */
export class SqliteStore {
  private db: Database.Database;

  constructor(dbPath: string = './data/system.db') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    // Create the assets table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        version INTEGER NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create the experience table for AI self-evolution
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS experience (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_state TEXT NOT NULL,
        decision TEXT NOT NULL,
        outcome_metrics TEXT,
        lesson TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create the actions table for detailed auditing and backtracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        prev_value REAL,
        new_value REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create the constitution table for distilled meta-knowledge
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS constitution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        principles TEXT NOT NULL,
        version INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * Saves or updates an asset.
   */
  save(id: string, type: string, data: any, version: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO assets (id, type, data, version, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        version = excluded.version,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(id, type, JSON.stringify(data), version);
  }

  /**
   * Loads an asset.
   */
  load<T>(id: string): { data: T; version: number; type: string } | null {
    const stmt = this.db.prepare('SELECT type, data, version FROM assets WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;

    return {
      type: row.type,
      data: JSON.parse(row.data),
      version: row.version
    };
  }

  /**
   * Saves an AI experience/lesson.
   */
  saveExperience(context: any, decision: string, lesson: string, metrics: any = {}): void {
    const stmt = this.db.prepare(`
      INSERT INTO experience (context_state, decision, lesson, outcome_metrics)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(JSON.stringify(context), decision, lesson, JSON.stringify(metrics));
  }

  /**
   * Retrieves recent experiences to provide as context for AI.
   */
  getRecentExperiences(limit: number = 5): any[] {
    const stmt = this.db.prepare('SELECT * FROM experience ORDER BY created_at DESC LIMIT ?');
    return stmt.all(limit).map((row: any) => ({
      ...row,
      context_state: JSON.parse(row.context_state),
      outcome_metrics: JSON.parse(row.outcome_metrics)
    }));
  }

  /**
   * Logs a specific action applied to an asset.
   */
  logAction(assetId: string, type: string, payload: any, prev: number, next: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO actions (asset_id, action_type, payload, prev_value, new_value)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(assetId, type, JSON.stringify(payload), prev, next);
  }

  /**
   * Updates the system constitution with new principles.
   */
  updateConstitution(principles: string, version: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO constitution (principles, version)
      VALUES (?, ?)
    `);
    stmt.run(principles, version);
  }

  /**
   * Gets the latest set of distilled principles.
   */
  getLatestConstitution(): { principles: string, version: number } | null {
    const stmt = this.db.prepare('SELECT principles, version FROM constitution ORDER BY version DESC LIMIT 1');
    return (stmt.get() as any) || null;
  }

  /**
   * Deletes an asset.
   */
  delete(id: string): void {
    this.db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  }

  /**
   * Lists all assets of a certain type.
   */
  listByType(type: string): any[] {
    const stmt = this.db.prepare('SELECT * FROM assets WHERE type = ?');
    return stmt.all(type).map((row: any) => ({
      ...row,
      data: JSON.parse(row.data)
    }));
  }

  /**
   * Gets the full action audit log.
   */
  getActions(limit: number = 50): any[] {
    const stmt = this.db.prepare('SELECT * FROM actions ORDER BY timestamp DESC LIMIT ?');
    return stmt.all(limit);
  }

  /**
   * Clears all history for a fresh start.
   */
  clearActions(): void {
    this.db.prepare('DELETE FROM actions').run();
    this.db.prepare('DELETE FROM experience').run();
  }

  close() {
    this.db.close();
  }
}
