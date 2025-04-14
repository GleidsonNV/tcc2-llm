import { generateObject, generateText, streamText } from 'ai';
import { myProvider, DEFAULT_CHAT_MODEL } from '../../../../lib/ai/models';
import { extractUserProblem, generateProblemKnowledge, generateRequirements, generateSpecificDomain, getGuardrail, systemBirdEye, systemExtractor, systemRequirementsEngineer } from '../../../../lib/ai/prompt';
import {z} from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

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

  //TODO: responder para o usuário inserir um problema
  // if(object.isProblem){
  //   const userResponse = await generateText({
  //     model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
  //     temperature: 0.2,
  //     maxSteps: 5,
  //     prompt: ,
  //     system: systemBirdEye
  //   })
  //   return
  // }
  

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

  const result = streamText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.8,
    maxSteps: 5,
    system: systemRequirementsEngineer,
    prompt: generateRequirements(problemKnowledge.text, extractProblem.text, messages[0].content)
  });

  return result.toDataStreamResponse();
}