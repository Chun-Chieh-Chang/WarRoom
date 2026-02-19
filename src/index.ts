import { Action } from './core/Action';
import { GrowthAsset, InvestAction, CompoundAction } from './core/models/GrowthAsset';

console.log('--- Compound Effect System: MVP Loop ---');

// 1. Initialize Asset (The Accumulator)
let myAsset = new GrowthAsset('savings-01', 1000);
console.log(`[Start] Initial Value: $${myAsset.value}`);

// 2. Define the Loop (The Engine)
const runCycle = (cycle: number) => {
    // 2a. Input (Action)
    const action: CompoundAction = {
        type: 'COMPOUND',
        payload: { rate: 0.05 }, // 5% growth per cycle
        timestamp: Date.now()
    };

    // 2b. Process (Accumulation)
    myAsset = myAsset.apply(action);

    // 2c. Output (Feedback)
    console.log(`[Cycle ${cycle}] Growth... New Value: $${myAsset.value} (v${myAsset.version})`);
};

// 3. Execute Loop
for (let i = 1; i <= 10; i++) {
    runCycle(i);
}

console.log('--- Simulation Complete ---');
console.log('Observation: Notice how the gap between values grows larger in later cycles.');
