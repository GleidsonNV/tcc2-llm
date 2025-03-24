import { generateText, streamText } from 'ai';
import { myProvider, DEFAULT_CHAT_MODEL } from '../../../../lib/ai/models';
import { extractUserProblem, generateProblemKnowledge, generateRequirements, systemExtractor, systemRequirementsEngineer } from '../../../../lib/ai/prompt';

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
  

  const problemKnowledge = await generateText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.4,
    maxSteps: 5,
    prompt: generateProblemKnowledge(extractProblem.text),
    system: systemExtractor
  });

  console.log(`Problem knowledge : ${problemKnowledge.text}`);

  const result = streamText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    temperature: 0.6,
    maxSteps: 5,
    system: systemRequirementsEngineer,
    prompt: generateRequirements(problemKnowledge.text, extractProblem.text, messages[0].content)
  });

  return result.toDataStreamResponse();
}