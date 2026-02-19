import { Asset } from '../Asset';
import { Action } from '../Action';

export interface InvestAction extends Action<{ amount: number }> {
    type: 'INVEST';
}

export interface CompoundAction extends Action<{ rate: number }> {
    type: 'COMPOUND';
}

export class GrowthAsset implements Asset<number> {
    public id: string;
    public type: string = 'GROWTH_ASSET';
    public value: number;
    public version: number;
    public name?: string;
    public target?: number;

    constructor(id: string, initialValue: number, version: number = 1, name?: string, target?: number) {
        this.id = id;
        this.value = initialValue;
        this.version = version;
        this.name = name;
        this.target = target;
    }

    apply(action: Action<unknown>): GrowthAsset {
        if (action.type === 'INVEST') {
            const payload = action.payload as { amount: number };
            return new GrowthAsset(
                this.id,
                this.value + payload.amount,
                this.version + 1,
                this.name,
                this.target
            );
        }

        if (action.type === 'COMPOUND') {
            const payload = action.payload as { rate: number };
            const newValue = this.value * (1 + payload.rate);
            return new GrowthAsset(
                this.id,
                Math.round(newValue * 100) / 100, // Round to 2 decimals
                this.version + 1,
                this.name,
                this.target
            );
        }

        return this;
    }
}
