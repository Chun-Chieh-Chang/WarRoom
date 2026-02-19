import { KnowledgeAsset, Knowledge } from './core/models/KnowledgeAsset';
import { Action } from './core/Action';
import { OllamaProvider } from './lib/providers/OllamaProvider';

async function runAICollaboration() {
    console.log('--- AI Collaboration: Knowledge Compounding Simulation ---');

    // 1. Initialize Objects
    const ai = new OllamaProvider();
    let projectKnowledge = new KnowledgeAsset('project-knowledge-01');

    const executeCycle = async (prompt: string, cycle: number) => {
        console.log(`\n[Cycle ${cycle}] Prompting AI: "${prompt}"...`);
        
        // 2a. Get current accumulated context
        const context = projectKnowledge.getContextString();

        // 2b. AI generates response based on accumulated context
        const response = await ai.generate(prompt, context);
        console.log(`[Cycle ${cycle}] AI Response: ${response.content.substring(0, 100)}...`);

        // 2c. System "Learns" from the interaction (Compounding)
        const learnAction: Action<Knowledge> = {
            type: 'LEARN',
            payload: {
                content: response.content,
                source: `AI-Cycle-${cycle}`,
                timestamp: Date.now()
            },
            timestamp: Date.now()
        };

        projectKnowledge = projectKnowledge.apply(learnAction);
        console.log(`[Cycle ${cycle}] Knowledge Accumulated. Version: v${projectKnowledge.version}`);
    };

    // 3. Start the Collaborative Loop
    // The AI will "Build" upon itself in these cycles
    await executeCycle("Generate a basic strategy for a compound effect project.", 1);
    await executeCycle("Refine the previous strategy by adding a specific technical focus on Node.js.", 2);
    await executeCycle("Synthesize the final plan and identify potential risks.", 3);

    console.log('\n--- Simulation Complete ---');
    console.log('Final Accumulated Context Length:', projectKnowledge.getContextString().length);
    console.log('Observe how the AI context naturally grows, creating a "Knowledge Flywheel".');
}

runAICollaboration().catch(err => console.error('Simulation Failed:', err));
