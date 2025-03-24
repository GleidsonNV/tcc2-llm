import { mistral } from "@ai-sdk/mistral";
import { customProvider } from "ai";

export const DEFAULT_CHAT_MODEL: string = 'mistralProvider';

export const myProvider = customProvider({
  languageModels: {
    mistralProvider: mistral('mistral-small-latest'),
  },
});