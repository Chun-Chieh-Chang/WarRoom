import { Action } from './core/Action';
import { SqliteStore } from './lib/SqliteStore';
import { AIProvider } from './lib/AIProvider';
import { GrowthAsset } from './core/models/GrowthAsset';
import { GrowthAssetSchema } from './core/schemas';
import { SynergyManager } from './core/SynergyManager';
import { BlackSwanManager, EnvironmentalShock } from './core/BlackSwanManager';
import { DistillationManager } from './core/DistillationManager';

/**
 * The Central Flywheel Controller 6.0: Constitutional Edition.
 * Now distills meta-knowledge to evolve a set of guiding principles.
 */
export type ProgressCallback = (data: { type: 'THOUGHT' | 'ACTION' | 'DONE', message: string, role?: string }) => void;

export class FlywheelController {
  private synergy: SynergyManager;
  private blackSwan: BlackSwanManager;
  private distillation: DistillationManager;

  constructor(
    private store: SqliteStore,
    private ai: AIProvider,
    private assetId: string
  ) {
    this.synergy = new SynergyManager(store);
    this.blackSwan = new BlackSwanManager();
    this.distillation = new DistillationManager(store, ai);
  }

  async universities_asset_evolution(): Promise<void> {
    // Placeholder for future use if needed, Keeping current structure
  }

  async tick(onProgress?: ProgressCallback, userDirective?: string): Promise<void> {
    const report = (type: 'THOUGHT' | 'ACTION' | 'DONE', message: string, role?: string) => {
      console.log(`[Progress] ${role ? `(${role}) ` : ''}${message}`);
      if (onProgress) onProgress({ type, message, role });
    };

    report('THOUGHT', `啟動飛輪週期 [${this.assetId}]...`);
    if (userDirective) {
      report('THOUGHT', `接收到主席指令: ${userDirective}`, 'Chair');
    }

    let state = this.loadState();
    const experiences = this.store.getRecentExperiences(5);
    const constitution = this.store.getLatestConstitution();
    
    // 0. AUTO-DISTILL (Every few versions)
    if (state.version % 10 === 0 && state.version > 0) {
      await this.distillation.distill();
    }
    
    // 1. ENVIRONMENT: Check for Black Swan Shocks
    const shock = this.blackSwan.generateShock();
    if (shock.type !== 'STABLE') {
      report('THOUGHT', `環境波動偵測: ${shock.description}`, 'Environment');
      const beforeShock = state.value;
      const newValue = Math.round(state.value * shock.multiplier * 100) / 100;
      state = new GrowthAsset(state.id, newValue, state.version + 1, state.name, state.target);
      
      this.store.logAction(state.id, `EXTERNAL_${shock.type}`, { description: shock.description }, beforeShock, state.value);
      this.store.save(state.id, 'GROWTH', state, state.version);
    }

    // 2. SENSE SYNERGY
    const multipliers = this.synergy.getMultipliers();
    if (multipliers.growthMultiplier > 1) {
      report('THOUGHT', `偵測到資產協同效應: x${multipliers.growthMultiplier}`, 'Synergy');
    }

    // 3. CABINET DEBATE
    report('THOUGHT', '召集 AI 決策內閣進行辯論...', 'System');
    const consensus = await this.cabinetDebate(state, experiences, multipliers.growthMultiplier, shock, constitution?.principles, report, userDirective);
    
    report('ACTION', `執行決策: ${consensus.action}`, 'Cabinet');
    const nextAsset = this.execute(state, consensus.action, multipliers.growthMultiplier);
    
    // 4. REFLECT: Review outcomes
    report('THOUGHT', '決策後審查與反思中...', 'Distiller');
    const reflectionPrompt = `
      Current Value: $${nextAsset.value}. 
      External Context: ${shock.description} (Multiplier: ${shock.multiplier}).
      Internal Decision: ${consensus.action}.
      User Directive was: ${userDirective || 'None'}.
      Cabinet Memo: ${consensus.cabinetMemo}
    `;
    const response = await this.ai.generate(reflectionPrompt);
    const lesson = response.content.trim();
    const finalLesson = `${consensus.cabinetMemo}\n\n[系統回顧] ${lesson}`;

    this.persist(state, nextAsset, consensus.action, finalLesson, consensus.cabinetMemo, multipliers.growthMultiplier);
    report('DONE', `週期完成！資產價值: $${nextAsset.value}`);
  }

  private async cabinetDebate(current: GrowthAsset, history: any[], multiplier: number, shock: EnvironmentalShock, constitution?: string, report?: any, userDirective?: string): Promise<{ action: 'INVEST' | 'COMPOUND', cabinetMemo: string }> {
    const historyCtx = history.map(h => `- ${h.decision}: ${h.lesson}`).join('\n');
    const situation = `
      CURRENT CONSTITUTION (META-PRINCIPLES):
      ${constitution || 'No formal principles evolved yet.'}

      Current Value: $${current.value}. 
      Target Name: ${current.name || 'Default'}.
      Synergy Multiplier: x${multiplier}. 
      Current Environment: ${shock.description}.
      USER DIRECTIVE (IMPORTANT): ${userDirective || 'Ensure steady growth.'}
      History:\n${historyCtx}
    `;

    const proposerRole = "You are the 'Growth Proposer'. Factor in the current environmental shock if applicable. Propose INVEST or COMPOUND. [語言憲法] 嚴格使用繁體中文，禁止簡體字。";
    const auditorRole = "You are the 'Risk Auditor'. Your priority is protecting the system against shocks like ${shock.type}. [語言憲法] 嚴格使用繁體中文，禁止簡體字。";

    if (report) report('THOUGHT', '提案者與審核者正在分析現況...', 'AI Cabinet');
    const [proposerRes, auditorRes] = await Promise.all([
      this.ai.generate(`Propose action. Factor in the environment: ${shock.type}.`, situation, proposerRole),
      this.ai.generate(`Identify risks in the current environment: ${shock.description}. How should we react?`, situation, auditorRole)
    ]);

    const proposal = proposerRes.content;
    const audit = auditorRes.content;
    
    if (report) {
       report('THOUGHT', `提案亮點: ${proposal.substring(0, 50)}...`, 'Proposer');
       report('THOUGHT', `審核重點: ${audit.substring(0, 50)}...`, 'Auditor');
    }

    const chairRole = "You are the 'Cabinet Chair'. Make the final decision for an antifragile future. [語言憲法] 最終決策與備忘錄嚴格使用繁體中文，禁止使用任何簡體字。你的回覆必須包含兩個部分：1. [Decision] 關鍵字(INVEST/COMPOUND) 2. [Advice] 給使用者的具體實戰建議（50字以內）。";
    const chairPrompt = `Proposer opinion: ${proposal}\nAuditor opinion: ${audit}\nState: ${situation}\nMake the final decision and provide actionable advice.`;
    
    if (report) report('THOUGHT', '內閣主席正在進行最終裁決與實戰建議規劃...', 'Chair');
    const finalRes = await this.ai.generate(chairPrompt, "", chairRole);
    
    const decisionMatch = finalRes.content.match(/\[Decision\]\s*(INVEST|COMPOUND)/i);
    const decision = (decisionMatch ? decisionMatch[1].toUpperCase() : "COMPOUND") as 'INVEST' | 'COMPOUND';
    
    // Extract advice
    const adviceMatch = finalRes.content.match(/\[Advice\]\s*([\s\S]*)/i);
    const advice = adviceMatch ? adviceMatch[1].trim() : "持續累積，深化認知。";

    const cabinetMemo = `【決策背景】${finalRes.content.split('[Advice]')[0].replace('[Decision]', '').trim()}\n【實戰建議】${advice}`;

    return { action: decision, cabinetMemo: cabinetMemo };
  }

  private loadState(): GrowthAsset {
    const data = this.store.load<any>(this.assetId);
    if (!data) return new GrowthAsset(this.assetId, 1000);
    const validated = GrowthAssetSchema.parse({
      id: this.assetId,
      type: 'GROWTH',
      value: data.data.value,
      version: data.version
    });
    return new GrowthAsset(validated.id, validated.value, validated.version);
  }

  private execute(current: GrowthAsset, actionType: 'INVEST' | 'COMPOUND', multiplier: number): GrowthAsset {
    const boostedRate = 0.05 * multiplier;
    const action: Action<any> = actionType === 'COMPOUND' 
      ? { type: 'COMPOUND', payload: { rate: boostedRate }, timestamp: Date.now() }
      : { type: 'INVEST', payload: { amount: 200 * multiplier }, timestamp: Date.now() };
    return current.apply(action);
  }

  private persist(prev: GrowthAsset, current: GrowthAsset, action: string, lesson: string, memo: string, multiplier: number): void {
    this.store.save(current.id, 'GROWTH', { value: current.value }, current.version);
    this.store.logAction(current.id, action, { memo, multiplier }, prev.value, current.value);
    this.store.saveExperience({ value: prev.value }, action, `${lesson} | Synergy: x${multiplier}`, { delta: current.value - prev.value });
  }
}
