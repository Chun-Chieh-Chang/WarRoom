export interface AIResponse {
  content: string;
  usage?: {
    totalTokens: number;
  };
}

/**
 * Abstract interface for any AI service.
 */
export interface AIProvider {
  /**
   * Generates a completion based on a prompt and optional context.
   */
  generate(prompt: string, context?: string, overrideSystemPrompt?: string): Promise<AIResponse>;
}
