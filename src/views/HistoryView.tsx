import { Action, ActionPanel, Color, Detail, Icon } from "@raycast/api";
import { ChatCompletionMessageParam } from "openai/resources";
import React, { useMemo, useState } from "react";
import { useMetadata } from "../hooks";
import { getModelName } from "../lib/OpenAI";
import { useHistoryState } from "../store/history";

interface Props {
  id: string;
}

export default function HistoryView({ id }: Props) {
  const history = useHistoryState((state) => state.history.find((a) => a.id === id));
  const [displayPrompt, setDisplayPrompt] = useState<boolean>(false);

  const chat = useMemo<ChatCompletionMessageParam[]>(() => {
    if (!history) {
      return [];
    }

    return [
      {
        role: "system",
        content: history.action.systemPrompt,
      },
      {
        role: "user",
        content: history.prompt,
      },
      {
        role: "assistant",
        content: history.result,
      },
    ];
  }, [history]);

  const metadata = useMetadata(chat, history?.action.model || "gpt-3.5-turbo");

  if (!history) {
    return (
      <Detail
        markdown={`## ⚠️ History Item Not Found\n\nWe're sorry, but it seems like the history item you're looking for does not exist.`}
      />
    );
  }

  return (
    <Detail
      markdown={displayPrompt ? `# Prompt\n\n---\n${history.prompt}` : `# Result\n\n---\n${history.result}`}
      navigationTitle={history.prompt}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Action" text={history.action.name} />
          <Detail.Metadata.Label title="Timestamp" text={new Date(history.timestamp).toLocaleString()} />
          <Detail.Metadata.Label title="System Prompt" text={history.action.systemPrompt} />
          <Detail.Metadata.Label title="Temperature" text={history.action.temperature.toString()} />
          <Detail.Metadata.Label title="Max Tokens" text={history.action.maxTokens.toString()} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.TagList title="Model">
            <Detail.Metadata.TagList.Item text={getModelName(history.action.model)} color={Color.SecondaryText} />
          </Detail.Metadata.TagList>
          <React.Fragment key={JSON.stringify(metadata)}>
            <Detail.Metadata.Label title="Prompt Tokens" text={metadata.promptTokens.toString()} />
            <Detail.Metadata.Label title="Result Tokens" text={metadata.resultTokens.toString()} />
            <Detail.Metadata.Label title="Total Tokens" text={metadata.totalTokens.toString()} />
            <Detail.Metadata.Label title="Cost" text={`$${metadata.cost.toFixed(6)}`} />
          </React.Fragment>
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Result" content={history.result} />
          {displayPrompt ? (
            <Action
              title="Show Result"
              onAction={() => setDisplayPrompt(false)}
              icon={Icon.Repeat}
              shortcut={{
                modifiers: ["cmd"],
                key: "return",
              }}
            />
          ) : (
            <Action
              title="Show Prompt"
              onAction={() => setDisplayPrompt(true)}
              icon={Icon.Repeat}
              shortcut={{
                modifiers: ["cmd"],
                key: "return",
              }}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
