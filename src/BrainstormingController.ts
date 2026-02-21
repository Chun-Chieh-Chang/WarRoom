import { AIProvider } from './lib/AIProvider';
import { SqliteStore } from './lib/SqliteStore';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface BrainstormProgress { 
  type: 'ROUND_START' | 'THOUGHT' | 'SUMMARY' | 'COMPLETE' | 'ERROR' | 'CONSENSUS' | 'PROGRESS'; 
  memberId?: string; 
  message: string; 
  memberName?: string;
  round?: number;
  progress?: number; // 0-100
}

export type BrainstormProgressCallback = (data: BrainstormProgress) => void;

export class BrainstormingController {
  constructor(
    private store: SqliteStore,
    private ai: AIProvider
  ) {}

  async executeMultiRoundSession(
    topic: string, 
    initialGoal: string, 
    members: TeamMember[], 
    onProgress: BrainstormProgressCallback,
    getCurrentGoal: () => string,
    analysisMode: string = 'default',
    assetId: string = 'default'
  ): Promise<void> {
    try {
      const history: { memberName: string, role: string, content: string }[] = [];
      const MAX_ROUNDS = 5;
      const MIN_ROUNDS = 2; // Force at least 2 rounds of debate
      let isSettled = false;

      onProgress({ type: 'THOUGHT', message: `戰略計畫啟動：議題「${topic}」...` });

      for (let round = 1; round <= MAX_ROUNDS && !isSettled; round++) {
        const currentGoal = getCurrentGoal() || initialGoal;
        onProgress({ type: 'ROUND_START', message: `第 ${round} 輪討論開始...`, round });

        const totalSteps = MAX_ROUNDS * members.length;
        
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          // Calculate overall progress: (current round - 1) * members + current member index
          const progressValue = Math.round(((round - 1) * members.length + i) / totalSteps * 90);
          onProgress({ type: 'PROGRESS', message: `進度: ${progressValue}%`, progress: progressValue });

          let modeInstruction = "";
          if (analysisMode === 'swot') {
            modeInstruction = "請優先使用 [優勢]、[劣勢]、[機會]、[威脅] 標籤來分析當前議題。";
          } else if (analysisMode === 'pestel') {
            modeInstruction = "請從 [政治]、[經濟]、[社會]、[技術]、[環境]、[法律] 等維度切入。";
          } else if (analysisMode === 'antifragile') {
            modeInstruction = "請專注於尋找「黑天鵝」風險，評估方案的「抗脆弱性」，找出最壞情況下的存續機制。";
          }

          const prompt = `
            你現在是 AI 團隊中的「${member.name}」。你的專業角色是「${member.role}」。
            ---
            議題：${topic}
            當前階段目標：${currentGoal}
            分析模式需求：${modeInstruction}
            ---
            對話歷史：
            ${history.map(h => `[${h.memberName} (${h.role})]: ${h.content}`).join('\n')}
            ---
            請根據你的專業視角對上述討論進行回應。你可以：
            1. 提出新見解或分析。
            2. 補充或質疑其他成員的觀點 (請扮演魔鬼代言人，不要輕易同意)。
            3. 向達成「${currentGoal}」的方向推進。
            
            [語言憲法] 嚴格使用繁體中文，禁止簡體字。
            請保持回覆精簡且具備挑戰性（約 100 字以內）。
            不要重複自己已說過的話。除非方案完美無缺，否則請嘗試找出潛在風險或執行漏洞。
          `;

          const res = await this.ai.generate(prompt);
          const content = res.content.trim();
          
          history.push({ memberName: member.name, role: member.role, content });
          onProgress({ 
            type: 'THOUGHT', 
            memberId: member.id, 
            memberName: member.name, 
            message: content,
            round
          });
        }

        // Consensus/Completion Check
        onProgress({ type: 'THOUGHT', message: `正在評估第 ${round} 輪討論是否達成目標...` });
        
        const checkPrompt = `
          你是一位「中立的會議裁判」。
          會議議題：${topic}
          主理人設定的目標：${currentGoal}
          當前輪數：${round} (最小輪數要求: ${MIN_ROUNDS})
          
          以下是討論紀錄：
          ${history.slice(-members.length).map(h => `[${h.memberName}]: ${h.content}`).join('\n')}
          
          請判斷團隊是否已經達成共識，或者已經充分回答了目標。
          
          【判斷標準】
          1. 若這是前 ${MIN_ROUNDS} 輪，除非極度完美，否則一律回覆「繼續討論」。
          2. 若成員間仍有分歧或方案缺乏具體執行細節，請回覆「繼續討論」。
          3. 只有當所有風險都已評估且方案具體可行時，才回覆以「已收斂」開頭，並簡述理由。
          
          [語言憲法] 繁體中文。
        `;

        const checkRes = await this.ai.generate(checkPrompt);
        const checkContent = checkRes.content.trim();
        
        // Robustness: Use regex to find "已收斂" or "consensus reached" anywhere in output
        const isConsensusReached = /已收斂|consensus reached/i.test(checkContent);

        // Enforce minimum rounds
        if (round < MIN_ROUNDS) {
             onProgress({ type: 'THOUGHT', message: `討論尚未深入 (未達最小輪數要求)，強制進入下一輪。` });
        } else if (isConsensusReached) {
          isSettled = true;
          onProgress({ type: 'CONSENSUS', message: checkContent });
        } else {
          onProgress({ type: 'THOUGHT', message: `第 ${round} 輪討論尚未收斂，進入下一輪分析。` });
        }
      }

      // Final Summary
      const summaryMode = isSettled ? 'CONSENSUS_REACHED' : 'CONFLICT_RESOLUTION';
      
      if (summaryMode === 'CONFLICT_RESOLUTION') {
        onProgress({ type: 'THOUGHT', message: `注意：團隊未能在 5 輪內達成完全共識。正在召集「首席戰略官」進行指令性決策裁決...` });
      } else {
        onProgress({ type: 'THOUGHT', message: `正在召集「首席戰略官」進行全案大成與戰略總結...` });
      }

      const summaryPrompt = isSettled ? `
        你是一位卓越的「首席戰略官 (Chief Strategy Officer)」。
        經過多輪討論，議題「${topic}」的最終目標為「${getCurrentGoal()}」。
        討論詳情如下：
        ${history.map(h => `[${h.memberName}]: ${h.content}`).join('\n')}

        請完成以下任務：
        1. 深刻檢討討論過程中的關鍵轉折。
        2. 提出最終達成的團隊共識或最優解決方案。
        3. 總結具體的行動指南 (Action Plan)。
        
        [語言憲法] 繁體中文，格式清晰。
      ` : `
        你是一位果斷的「首席戰略官 (Chief Strategy Officer)」。
        針對議題「${topic}」，團隊經過 5 輪激烈辯論仍未達成完全共識。
        
        討論詳情如下：
        ${history.map(h => `[${h.memberName}]: ${h.content}`).join('\n')}

        現在由你進行「最終裁決 (Command Decision)」。請完成：
        1. 【爭點分析】指出團隊的主要分歧點與矛盾所在。
        2. 【利弊權衡】分析各方觀點的潛在風險與收益。
        3. 【關鍵裁決】基於大局考量，給出明確、單一的執行方向，不得模稜兩可。
        4. 【執行命令】列出立即的行動步驟。

        [語言憲法] 繁體中文，語氣需權威且具建設性。
      `;

      const summaryRes = await this.ai.generate(summaryPrompt);
      onProgress({ type: 'SUMMARY', message: summaryRes.content.trim() });

      this.store.logAction('SESSION', 'MULTI_ROUND_BRAINSTORM', { topic, history, summary: summaryRes.content, settled: isSettled }, 0, 0);
      
      // Save for UI history display (Experience Table)
      this.store.saveExperience(
        { topic, goal: getCurrentGoal(), rounds: history.length, settled: isSettled },
        `【${isSettled ? '共識達成' : '裁決指令'}】${topic}`,
        summaryRes.content, // This will be the 'lesson' displayed in the list
        { members: members.map(m => m.name) },
        assetId
      );
      
      // Auto-archive to Markdown
      try {
        const fs = require('fs');
        const path = require('path');
        const sessionDir = path.join(process.cwd(), 'docs', 'sessions');
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `session_${timestamp}.md`;
        const filepath = path.join(sessionDir, filename);
        
        const mdContent = `
# AI 戰略會議紀錄
**Topic:** ${topic}
**Date:** ${new Date().toLocaleString()}
**Goal:** ${getCurrentGoal()}
**Status:** ${isSettled ? 'Consensus Reached' : 'Command Decision (Conflict Resolution)'}

## 參與團隊
${members.map(m => `- **${m.name}** (${m.role})`).join('\n')}

---

## 對話重點紀錄
${history.map(h => `
### ${h.memberName}
> ${h.content.replace(/\n/g, '\n> ')}
`).join('\n')}

---

## 首席戰略官總結與行動指南
${summaryRes.content}
        `.trim();
        
        fs.writeFileSync(filepath, mdContent, 'utf-8');
        onProgress({ type: 'THOUGHT', message: `會議紀錄已存檔：docs/sessions/${filename}` });
      } catch (err: any) {
        console.error('Failed to archive session:', err);
      }
      
      const completionMsg = isSettled ? '多輪會議圓滿結束。' : '已由首席戰略官強制裁決，會議結束。';
      onProgress({ type: 'COMPLETE', message: completionMsg });
      
    } catch (error: any) {
      onProgress({ type: 'ERROR', message: `會議中斷：${error.message}` });
    }
  }

  // Legacy fallback
  async executeSession(topic: string, context: string, members: TeamMember[], onProgress: BrainstormProgressCallback): Promise<void> {
    return this.executeMultiRoundSession(topic, context, members, onProgress, () => context, 'default');
  }
}
