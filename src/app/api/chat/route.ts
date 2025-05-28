import { generateObject, streamText } from "ai";
import { myProvider, DEFAULT_CHAT_MODEL } from "../../../../lib/ai/models";
import {
  extractUserProblem,
  generateProblemKnowledge,
  generateRequirements,
  generateSpecificDomain,
  getGuardrail,
  getRequirementsEvaluation,
  getUserInputPrompt,
  systemBirdEye,
  systemEvaluator,
  systemExtractor,
  systemRequirementsEngineer,
} from "../../../../lib/ai/prompt";
import {
  RequirementsEvaluation,
  EvaluationSchema,
  RequirementEvaluation,
} from "../../../../lib/ai/types";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model: selectedModelIdentifier = DEFAULT_CHAT_MODEL } = await req.json();
  let attempts = 0;
  const MAX_ITERATIONS = 3;

  try {
    console.log('testing new provider',selectedModelIdentifier);
    
    const extractProblem = await generateObject({
      model: myProvider.languageModel(selectedModelIdentifier),
      temperature: 0.2,
      schema: z.object({
        reasoning: z.string(),
        problem: z.string(),
      }),
      prompt: extractUserProblem(getUserInputPrompt(messages)),
      system: systemExtractor,
      schemaName: "problem extration",
      schemaDescription:
        "an object to capture a problem from user input and its reason",
    });

    console.log(`User problem : ${extractProblem.object.problem}`);

    const { object } = await generateObject({
      model: myProvider.languageModel(selectedModelIdentifier),
      schema: z.object({
        reasoning: z.string(),
        isProblem: z.boolean(),
      }),
      temperature: 0.2,
      prompt: getGuardrail(extractProblem.object.problem),
      system: systemBirdEye,
      schemaName: "problem guardrail",
      schemaDescription:
        "an object to capture whether the a problem was identified or not and its reason",
    });

    console.log("test guardrail", object);

    if (!object.isProblem) {
      const userResponse = await streamText({
        model: myProvider.languageModel(selectedModelIdentifier),
        temperature: 1,
        maxSteps: 5,
        prompt: `Solicite ao usuário para entrar com o problema novamente e explique que não foi possível identificar um problema. O texto deve ser final e não deve conter coisas como 'Claro, aqui está um exemplo de como você pode solicita...', ou 'Se precisar de mais alguma coisa, estou à disposição!'`,
        system: systemBirdEye,
      });
      return userResponse.toDataStreamResponse();
    }

    const problemDomain = await generateObject({
      model: myProvider.languageModel(selectedModelIdentifier),
      temperature: 0.2,
      schema: z.object({
        reasoning: z.string(),
        domain: z.string(),
      }),
      prompt: generateSpecificDomain(extractProblem.object.problem),
      system: systemBirdEye,
      schemaName: "business domain",
      schemaDescription:
        "an object to capture in what business area the user problem is in",
    });

    console.log(`Problem domain : ${problemDomain.object.domain}`);

    const problemKnowledge = await generateObject({
      model: myProvider.languageModel(selectedModelIdentifier),
      temperature: 0.3,
      schema: z.object({
        reasoning: z.string(),
        knowledge: z.array(z.string()),
      }),
      prompt: generateProblemKnowledge(problemDomain.object.domain),
      system: systemExtractor,
      schemaName: "facts about the problem",
      schemaDescription:
        "general and specific knowledge about the domain, what challenges it faces, what is the current state of the domain, what is the best practices, what is aleady common ground",
    });

    console.log(`Problem knowledge : ${problemKnowledge.object.knowledge}`);

    let requirements;
    let evaluationResults: RequirementsEvaluation = {
      evaluations: [],
      isQuantitySuitable: false,
    };
    do {
      requirements = streamText({
        model: myProvider.languageModel(selectedModelIdentifier),
        temperature: 0.8,
        maxSteps: 5,
        system: systemRequirementsEngineer,
        prompt: generateRequirements(
          problemKnowledge.object.knowledge,
          extractProblem.object.problem,
          getUserInputPrompt(messages),
          evaluationResults
        ),
        onError: (error) => {
          console.log(error);
        },
      });

      await requirements.consumeStream();

      const { object } = await generateObject({
        model: myProvider.languageModel(selectedModelIdentifier),
        schema: EvaluationSchema,
        temperature: 0.2,
        prompt: getRequirementsEvaluation(await requirements.text),
        system: systemEvaluator,
        schemaName: "evaluator",
        schemaDescription:
          "An array of evaluation objects. Each object captures whether a generated requirement is appropriate, complete, conforming, correct, feasible, necessary, singular, unambiguous, and verifiable.",
      });

      evaluationResults = object;

      const allOriginalEvaluationsArePerfect =
        evaluationResults.evaluations.length > 0 &&
        evaluationResults.evaluations.every(
          (evaluation: RequirementEvaluation) => {
            const { score } = evaluation;
            return (
              score.appropriate &&
              score.complete &&
              score.conforming &&
              score.correct &&
              score.feasible &&
              score.necessary &&
              score.singular &&
              score.unambiguous &&
              score.verifiable
            );
          }
        );

      if (allOriginalEvaluationsArePerfect) {
        return requirements.toDataStreamResponse();
      }

      attempts++;
    } while (attempts < MAX_ITERATIONS);

    return requirements.toDataStreamResponse();
  } catch (error) {
    console.log(error);
  }
}
