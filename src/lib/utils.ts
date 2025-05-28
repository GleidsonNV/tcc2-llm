import { Message } from "ai"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPreviousMessages(messages: Message[]) {
  return messages
    .slice(0, messages.length - 1)
    .map((e: Message, i: number) => `indext: ${i}; role: ${e.role}; input: ${e.content};`)
    .join("\n");
}
