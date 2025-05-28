import { mistral } from "@ai-sdk/mistral";
import { google } from "@ai-sdk/google";
import { customProvider } from "ai";

export const DEFAULT_CHAT_MODEL: string = "mistralProvider";
export const myProvider = customProvider({
  languageModels: {
    mistralProvider: mistral("mistral-small-latest"),
    googleProvider: google("gemini-2.5-flash-preview-05-20", { useSearchGrounding: true }),
  },
});
