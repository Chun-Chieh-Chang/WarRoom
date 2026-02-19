import axios from 'axios';
import { AIProvider, AIResponse } from '../AIProvider';

/**
 * Ollama implementation using the Chat API.
 * Provides better context handling and role-based prompting.
 */
export class OllamaProvider implements AIProvider {
  constructor(
    private endpoint: string = 'http://127.0.0.1:11434',
    private model: string = 'qwen3-coder:480b-cloud',
    private systemPrompt: string = 'You are an autonomous growth agent in a Compound Effect system. Your goal is to optimize asset accumulation and knowledge building. [語言憲法] 你必須嚴格使用「繁體中文」（Traditional Chinese）回答所有問題，絕對禁止使用簡體字。若輸入內容包含簡體，請在回覆時自動將其轉換為繁體。'
  ) {}

  async generate(prompt: string, context: string = '', overrideSystemPrompt?: string): Promise<AIResponse> {
    try {
      const response = await axios.post(`${this.endpoint}/api/chat`, {
        model: this.model,
        messages: [
          { role: 'system', content: overrideSystemPrompt || this.systemPrompt },
          { role: 'user', content: `Context:\n${context}\n\nUser Request: ${prompt}` }
        ],
        stream: false,
      });

      return {
        content: response.data.message.content,
      };
    } catch (error) {
      console.error('Error calling Ollama Chat API:', error);
      return {
        content: `錯誤：無法連接到 Ollama 服務 (${this.endpoint})。請確認 Ollama 軟體已啟動。`,
      };
    }
  }
}
