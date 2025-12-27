import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { getPreference } from "../utils";

export type Model =
  | "gpt-3.5-turbo"
  | "gpt-4-turbo"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-5"
  | "gpt-5-mini"
  | "gpt-5-nano"
  | "gpt-5.1"
  | "gpt-5.1-mini"
  | "gpt-5.1-nano"
  | "gpt-5.2"
  | "gpt-5.2-mini"
  | "gpt-5.2-nano"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "gemini-3-pro"
  | "gemini-3-flash";

export const AvailableModels: Record<Model, string> = {
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "gpt-5": "GPT-5",
  "gpt-5-mini": "GPT-5 Mini",
  "gpt-5-nano": "GPT-5 Nano",
  "gpt-5.1": "GPT-5.1",
  "gpt-5.1-mini": "GPT-5.1 Mini",
  "gpt-5.1-nano": "GPT-5.1 Nano",
  "gpt-5.2": "GPT-5.2",
  "gpt-5.2-mini": "GPT-5.2 Mini",
  "gpt-5.2-nano": "GPT-5.2 Nano",
  "gemini-2.5-pro": "Gemini 2.5 Pro",
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "gemini-3-pro": "Gemini 3 Pro",
  "gemini-3-flash": "Gemini 3 Flash",
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
      cost = (input / 1_000_000) * 0.5 + (output / 1_000_000) * 1.5;
      break;
    case "gpt-4-turbo":
      cost = (input / 1_000_000) * 10.0 + (output / 1_000_000) * 30.0;
      break;
    case "gpt-4o":
      cost = (input / 1_000_000) * 2.5 + (output / 1_000_000) * 10.0;
      break;
    case "gpt-4o-mini":
      cost = (input / 1_000_000) * 0.15 + (output / 1_000_000) * 0.6;
      break;
    // Estimated pricing for future models
    case "gpt-5":
      cost = (input / 1_000_000) * 5.0 + (output / 1_000_000) * 15.0;
      break;
    case "gpt-5-mini":
      cost = (input / 1_000_000) * 0.25 + (output / 1_000_000) * 1.0;
      break;
    case "gpt-5-nano":
      cost = (input / 1_000_000) * 0.1 + (output / 1_000_000) * 0.4;
      break;
    case "gpt-5.1":
      cost = (input / 1_000_000) * 5.0 + (output / 1_000_000) * 15.0;
      break;
    case "gpt-5.1-mini":
      cost = (input / 1_000_000) * 0.25 + (output / 1_000_000) * 1.0;
      break;
    case "gpt-5.1-nano":
      cost = (input / 1_000_000) * 0.1 + (output / 1_000_000) * 0.4;
      break;
    case "gpt-5.2":
      cost = (input / 1_000_000) * 5.0 + (output / 1_000_000) * 15.0;
      break;
    case "gpt-5.2-mini":
      cost = (input / 1_000_000) * 0.25 + (output / 1_000_000) * 1.0;
      break;
    case "gpt-5.2-nano":
      cost = (input / 1_000_000) * 0.1 + (output / 1_000_000) * 0.4;
      break;
    case "gemini-2.5-pro":
      cost = (input / 1_000_000) * 1.25 + (output / 1_000_000) * 5.0; // Placeholder based on 1.5 Pro
      break;
    case "gemini-2.5-flash":
      cost = (input / 1_000_000) * 0.075 + (output / 1_000_000) * 0.3; // Placeholder based on 1.5 Flash
      break;
    case "gemini-3-pro":
      cost = (input / 1_000_000) * 1.25 + (output / 1_000_000) * 5.0; // Placeholder
      break;
    case "gemini-3-flash":
      cost = (input / 1_000_000) * 0.075 + (output / 1_000_000) * 0.3; // Placeholder
      break;
  }

  return cost;
};

const openai = createOpenAI({
  apiKey: getPreference("apikey"),
});

const google = createGoogleGenerativeAI({
  apiKey: getPreference("googleApiKey"),
});

export const getModel = (model: Model) => {
  if (model.startsWith("gemini")) {
    return google(model);
  }
  return openai(model);
};
