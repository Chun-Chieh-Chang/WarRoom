
import os from 'os';

export interface ModelConfig {
  model: string;
  tier: string;
  reason: string;
}

export class HardwareDetector {
  /**
   * Automatically detects the best model based on environment.
   * Now includes Cloud-Awareness to bypass local hardware checks.
   */
  static getOptimalModel(currentModelName: string): ModelConfig {
    // Improved Cloud Detection (Regex matches :cloud, -cloud, /cloud at the end)
    const isCloud = /[:\-/]cloud|online|remote/i.test(currentModelName);

    if (isCloud) {
      return {
        tier: 'CLOUD',
        model: currentModelName,
        reason: `☁️ 偵測到雲端原生模型 [${currentModelName}]。算力來自雲端集群，已解鎖 600B+ 極致戰略邏輯，無視本地硬體限制。`
      };
    }

    const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
    console.log(`[Hardware] System Scan: ${totalMemoryGB.toFixed(2)} GB RAM available.`);
    // ... rest of the logic

    if (totalMemoryGB >= 48) {
      return {
        tier: 'ULTRA',
        model: 'deepseek-r1:70b',
        reason: '系統偵測到超過 48GB RAM，建議使用 70B 高階模型以獲得極致戰略深度。'
      };
    } else if (totalMemoryGB >= 24) {
      return {
        tier: 'HIGH',
        model: 'deepseek-r1:32b',
        reason: '系統偵測到 24GB-48GB RAM，建議使用 32B 模型，平衡邏輯與速度。'
      };
    } else if (totalMemoryGB >= 12) {
      return {
        tier: 'MID',
        model: 'deepseek-r1:14b',
        reason: '系統偵測到 12GB-24GB RAM，建議使用 14B 模型以確保運行流暢。'
      };
    } else {
      return {
        tier: 'LOW',
        model: 'deepseek-r1:7b',
        reason: '系統偵測到記憶體低於 12GB，自動切換至 7B 輕量級模型以節省資源。'
      };
    }
  }
}
