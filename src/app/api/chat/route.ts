import { generateObject, streamText } from "ai";
import { myProvider, DEFAULT_CHAT_MODEL } from "../../../../lib/ai/models";
import {
  extractUserProblem,
  generateProblemKnowledge,
  generateRequirements,
  generateSpecificDomain,
  getGuardrail,
  getRequirementsEvaluation,
  systemBirdEye,
  systemEvaluator,
  systemExtractor,
  systemRequirementsEngineer,
} from "../../../../lib/ai/prompt";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  let attempts = 0;
  const MAX_ITERATIONS = 3;

  const extractProblem = await generateObject({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.2,
    schema: z.object({
      reasoning: z.string(),
      problem: z.string(),
    }),
    prompt: extractUserProblem(messages[0].content),
    system: systemExtractor,
  });

  console.log(`User problem : ${extractProblem.object.problem}`);

  const { object } = await generateObject({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    schema: z.object({
      reasoning: z.string(),
      isProblem: z.boolean(),
    }),
    temperature: 0.2,
    prompt: getGuardrail(extractProblem.object.problem),
    system: systemBirdEye,
  });

  console.log("test guardrail", object);

  if (!object.isProblem) {
    const userResponse = await streamText({
      model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
      temperature: 1,
      maxSteps: 5,
      prompt: `Solicite ao usuário para entrar com o problema novamente e explique que não foi possível identificar um problema.`,
      system: systemBirdEye,
    });
    return userResponse.toDataStreamResponse();
  }

  const problemDomain = await generateObject({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.2,
    schema: z.object({
      reasoning: z.string(),
      domain: z.string(),
    }),
    prompt: generateSpecificDomain(extractProblem.object.problem),
    system: systemBirdEye,
  });

  console.log(`Problem domain : ${problemDomain.object.domain}`);

  const problemKnowledge = await generateObject({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.3,
    schema: z.object({
      reasoning: z.string(),
      knowledge: z.array(z.string()),
    }),
    prompt: generateProblemKnowledge(problemDomain.object.domain),
    system: systemExtractor,
  });

  console.log(`Problem knowledge : ${problemKnowledge.object.knowledge}`);

  // const {testObject} = await generateObject({

  //   model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
  //   output: 'array',
  //   schema: z.object({
  //     requisitos: z.string()
  //   }),
  //   temperature: 0.8,
  //   system: systemRequirementsEngineer,
  //   prompt: generateRequirements(problemKnowledge.text, extractProblem.text, messages[0].content)
  // })
  let requirements;
  do {
    requirements = streamText({
      model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
      temperature: 0.8,
      maxSteps: 5,
      system: systemRequirementsEngineer,
      prompt: generateRequirements(
        problemKnowledge.object.knowledge,
        extractProblem.object.problem,
        messages[0].content
      ),
      onError: (error) => {
        console.log(error);
      },
    });

    await requirements.consumeStream();

    const { object } = await generateObject({
      model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
      schema: z.object({
        reasoning: z.string(),
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
      }),
      temperature: 0.2,
      prompt: getRequirementsEvaluation(await requirements.text),
      system: systemEvaluator,
    });

    if (
      object.score.appropriate &&
      object.score.complete &&
      object.score.conforming &&
      object.score.correct &&
      object.score.feasible &&
      object.score.necessary &&
      object.score.singular &&
      object.score.unambiguous &&
      object.score.verifiable
    ) {
      return requirements.toDataStreamResponse();
    }

    attempts++;
  } while (attempts < MAX_ITERATIONS);

  return requirements.toDataStreamResponse();
}
