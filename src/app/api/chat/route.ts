import { generateObject, generateText, streamText } from 'ai';
import { myProvider, DEFAULT_CHAT_MODEL } from '../../../../lib/ai/models';
import { extractUserProblem, generateProblemKnowledge, generateRequirements, generateSpecificDomain, getGuardrail, getRequirementsEvaluation, systemBirdEye, systemEvaluator, systemExtractor, systemRequirementsEngineer } from '../../../../lib/ai/prompt';
import {z} from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  let attempts  = 0;
  const MAX_ITERATIONS = 3;

  const extractProblem = await generateText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.2,
    maxSteps: 5,
    prompt: extractUserProblem(messages[0].content),
    system: systemExtractor
  });

  console.log(`User problem : ${extractProblem.text}`);
  

  const problemDomain = await generateText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.2,
    maxSteps: 5,
    prompt: generateSpecificDomain(extractProblem.text),
    system: systemBirdEye
  });

  console.log(`Problem domain : ${problemDomain.text}`);

  const {object} = await generateObject({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    schema: z.object({
      reasoning: z.string(),
      isProblem: z.boolean()
    }),
    temperature: 0.2,
    prompt: getGuardrail(problemDomain.text),
    system: systemBirdEye
  })

  console.log("test guardrail", object);

  if(object.isProblem){
    const userResponse = await streamText({
      model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
      temperature: 1,
      maxSteps: 5,
      prompt: `Solicite ao usuário para entrar com o problema novamente e explique que não foi possível identificar um problema.`,
      system: systemBirdEye
    })
    return userResponse.toDataStreamResponse();
  }
  

  const problemKnowledge = await generateText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.3,
    maxSteps: 5,
    prompt: generateProblemKnowledge(problemDomain.text),
    system: systemExtractor
  });

  console.log(`Problem knowledge : ${problemKnowledge.text}`);

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
     requirements = await generateText({
      model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
      temperature: 0.8,
      maxSteps: 5,
      system: systemRequirementsEngineer,
      prompt: generateRequirements(problemKnowledge.text, extractProblem.text, messages[0].content)
    });

    const {object} = await generateObject({
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
      prompt: getRequirementsEvaluation(requirements.text),
      system: systemEvaluator
    })

    if(object.score.appropriate && object.score.complete && object.score.conforming && object.score.correct && object.score.feasible && object.score.necessary && object.score.singular && object.score.unambiguous && object.score.verifiable){
     return requirements.text;
    }

    attempts++;

    console.log(`tentativa: ${attempts}}`,object);
    

  } while (attempts < MAX_ITERATIONS);

  // const result = streamText({
  //   model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
  //   temperature: 0.8,
  //   maxSteps: 5,
  //   system: systemRequirementsEngineer,
  //   prompt: generateRequirements(problemKnowledge.text, extractProblem.text, messages[0].content)
  // });

  return requirements.text;
}