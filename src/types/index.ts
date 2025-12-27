import { Model } from "../lib/ai";

export interface Action {
  id: string;
  name: string;
  color: string;
  description: string;
  systemPrompt: string;
  model: Model;
  temperature: string;
  maxTokens: string;
  favorite: boolean;
}

export interface History {
  id: string;
  action: Action;
  timestamp: number;
  prompt: string;
  result: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
}
