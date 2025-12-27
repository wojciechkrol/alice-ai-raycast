import { Action, ActionPanel, Color, Detail, Icon, Keyboard } from "@raycast/api";
import { ModelMessage, streamText } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCost } from "../hooks";
import { getModel, getModelName } from "../lib/ai";
import { useHistoryState } from "../store/history";
import { Action as StoreAction } from "../types";

interface Props {
  action: StoreAction;
  prompt: string;
}

export default function ExecuteAction({ action, prompt }: Props) {
  const addHistoryItem = useHistoryState((state) => state.addItem);
  const generateLock = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

  const [inputTokens, setInputTokens] = useState<number>(0);
  const [outputTokens, setOutputTokens] = useState<number>(0);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const cost = useCost(action.model, inputTokens, outputTokens);

  const generateResponse = useCallback(async () => {
    if (generateLock.current) {
      return;
    }

    generateLock.current = true;
    setIsLoading(true);

    setError("");
    setResult("");
    setInputTokens(0);
    setOutputTokens(0);
    setTotalTokens(0);

    const messages: ModelMessage[] = [
      {
        role: "system",
        content: action.systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    abortControllerRef.current = new AbortController();

    try {
      const { textStream, usage } = await streamText({
        model: getModel(action.model),
        messages: messages,
        temperature: parseFloat(action.temperature),
        maxOutputTokens: +action.maxTokens === -1 ? undefined : +action.maxTokens,
        abortSignal: abortControllerRef.current.signal,
      });

      for await (const textPart of textStream) {
        setResult((prev) => prev + textPart);
      }

      const usageInfo = await usage;
      setInputTokens(usageInfo.inputTokens || 0);
      setOutputTokens(usageInfo.outputTokens || 0);
      setTotalTokens(usageInfo.totalTokens || 0);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        // Ignore abort errors
      } else {
        const error = e as Error;
        setError(`## ⚠️ Error Encountered\n### ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      generateLock.current = false;
      abortControllerRef.current = null;
    }
  }, [action, prompt]);

  useEffect(() => {
    generateResponse();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading && error.length === 0 && result.length > 0) {
      addHistoryItem({
        action: action!,
        timestamp: Date.now(),
        prompt,
        result,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
      });
    }
  }, [result, isLoading]);

  let markdown = result;
  if (error.length > 0) {
    if (markdown.length > 0) {
      markdown += "\n\n---\n\n";
    }

    markdown += error;
  }

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      navigationTitle={action.name}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Model">
            <Detail.Metadata.TagList.Item text={getModelName(action.model)} color={Color.SecondaryText} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Input Tokens" text={inputTokens.toString()} />
          <Detail.Metadata.Label title="Output Tokens" text={outputTokens.toString()} />
          <Detail.Metadata.Label title="Total Tokens" text={totalTokens.toString()} />
          <Detail.Metadata.Label title="Cost" text={`$${cost.toFixed(6)}`} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          {isLoading && <Action title="Stop generating..." icon={Icon.Stop} onAction={() => abortControllerRef.current?.abort()} />}
          <Action.CopyToClipboard title="Copy Result" content={result} />
          <Action.Paste title="Paste Result" content={result} />
          {!isLoading && (
            <Action title="Regenerate" onAction={() => generateResponse()} icon={Icon.Redo} shortcut={Keyboard.Shortcut.Common.Refresh} />
          )}
        </ActionPanel>
      }
    />
  );
}
