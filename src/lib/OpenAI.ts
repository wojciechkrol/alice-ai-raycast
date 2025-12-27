import OpenAI from "openai";
import { getPreference } from "../utils";

export type Model =
  | "gpt-3.5-turbo"
  | "gpt-4-turbo"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-5.0"
  | "gpt-5.1"
  | "gpt-5.2"
  | "gemini-2.5"
  | "gemini-3";

export const AvailableModels: Record<Model, string> = {
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-5.0": "GPT-5.0",
  "gpt-5.1": "GPT-5.1",
  "gpt-5.2": "GPT-5.2",
  "gemini-2.5": "Gemini 2.5",
  "gemini-3": "Gemini 3",
};

export const getAvailableModels = () => {
  return Object.keys(AvailableModels);
};

export const getModelName = (model: Model) => {
  return AvailableModels[model];
};

export const calculateCost = (model: Model, input: number, output: number) => {
  let cost = 0;

  switch (model) {
    case "gpt-3.5-turbo":
      cost = (input / 1_000_000) * 3.0 + (output / 1_000_000) * 6.0;
      break;
    case "gpt-4-turbo":
      cost = (input / 1_000_000) * 10.0 + (output / 1_000_000) * 30.0;
      break;
    case "gpt-4o":
      cost = (input / 1_000_000) * 5.0 + (output / 1_000_000) * 15.0;
      break;
    case "gpt-4o-mini":
      cost = (input / 1_000_000) * 0.15 + (output / 1_000_000) * 0.6;
      break;
    case "gpt-5.0":
    case "gpt-5.1":
    case "gpt-5.2":
    case "gemini-2.5":
    case "gemini-3":
      // Placeholder cost, same as GPT-4o
      cost = (input / 1_000_000) * 5.0 + (output / 1_000_000) * 15.0;
      break;
  }

  return cost;
};

const openai = new OpenAI({
  apiKey: getPreference("apikey"),
});

export default openai;
