import { generateText, streamText } from 'ai';
import { myProvider, DEFAULT_CHAT_MODEL } from '../../../../lib/ai/models';
import { extractUserProblem, generateProblemKnowledge, generateRequirements, generateSpecificDomain, systemBirdEye, systemExtractor, systemRequirementsEngineer } from '../../../../lib/ai/prompt';

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

  const problemKnowledge = await generateText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.3,
    maxSteps: 5,
    prompt: generateProblemKnowledge(problemDomain.text),
    system: systemExtractor
  });

  console.log(`Problem knowledge : ${problemKnowledge.text}`);

  const result = streamText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.8,
    maxSteps: 5,
    system: systemRequirementsEngineer,
    prompt: generateRequirements(problemKnowledge.text, extractProblem.text, messages[0].content)
  });

  return result.toDataStreamResponse();
}