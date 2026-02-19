import { z } from 'zod';

/**
 * Zod schemas for asset validation.
 * Ensures the data in the "Accumulator" remains healthy.
 */

export const KnowledgeSchema = z.object({
  content: z.string(),
  source: z.string(),
  timestamp: z.number()
});

export const GrowthAssetSchema = z.object({
  id: z.string(),
  type: z.literal('GROWTH'),
  value: z.number(),
  version: z.number(),
  name: z.string().optional(),
  target: z.number().optional()
});

export const KnowledgeAssetSchema = z.object({
  id: z.string(),
  type: z.literal('KNOWLEDGE'),
  value: z.array(KnowledgeSchema),
  version: z.number()
});

export const ExperienceSchema = z.object({
  id: z.number().optional(),
  context_state: z.any(),
  decision: z.string(),
  lesson: z.string(),
  outcome_metrics: z.any()
});

export type KnowledgeData = z.infer<typeof KnowledgeSchema>;
export type GrowthAssetData = z.infer<typeof GrowthAssetSchema>;
export type KnowledgeAssetData = z.infer<typeof KnowledgeAssetSchema>;
export type ExperienceData = z.infer<typeof ExperienceSchema>;
