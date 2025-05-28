import { z } from "zod";

const Evaluation = z.object({
  reasoning: z.string(),
  requirement: z.string(),
  score: z.object({
    appropriate: z.boolean(),
    complete: z.boolean(),
    conforming: z.boolean(),
    correct: z.boolean(),
    feasible: z.boolean(),
    necessary: z.boolean(),
    singular: z.boolean(),
    unambiguous: z.boolean(),
    verifiable: z.boolean(),
  }),
});

export type RequirementEvaluation = z.infer<typeof Evaluation>;

export const EvaluationSchema = z.object({
  evaluations: Evaluation.array(),
  isQuantitySuitable: z
    .boolean()
    .describe(
      "a boolean addressing if the functional requirements are appropriate"
    ),
});

export type RequirementsEvaluation = z.infer<typeof EvaluationSchema>;
