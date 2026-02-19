import { Action } from '../Action';
import { Asset } from '../Asset';

export interface Knowledge {
  content: string;
  source: string;
  timestamp: number;
}

export class KnowledgeAsset implements Asset<Knowledge[]> {
  public type: string = 'KNOWLEDGE';

  constructor(
    public id: string,
    public value: Knowledge[] = [],
    public version: number = 1
  ) {}

  apply(action: Action<unknown>): KnowledgeAsset {
    if (action.type === 'LEARN') {
      const payload = action.payload as Knowledge;
      return new KnowledgeAsset(
        this.id,
        [...this.value, payload],
        this.version + 1
      );
    }
    return this;
  }

  getContextString(): string {
    return this.value
      .map(
        (k) =>
          `[Source: ${k.source} @ ${new Date(k.timestamp).toISOString()}]\n${k.content}`
      )
      .join('\n\n---\n\n');
  }
}
