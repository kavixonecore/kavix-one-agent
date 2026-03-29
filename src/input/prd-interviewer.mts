import Anthropic from "@anthropic-ai/sdk";

import { createLogger } from "../logger/logger.mjs";

const logger = createLogger("prd-interviewer");

type MessageParam = Anthropic.MessageParam;

const SYSTEM_PROMPT = `You are an expert API architect helping a developer plan a new Elysia API on Bun.
Your job is to interview them to gather requirements and then generate a clean PRD.

Guidelines:
- Ask one or two focused questions at a time
- Gather: project purpose, entities (e.g., User, Order, Product), fields per entity (name, type, required/optional), relationships between entities, and any special operations beyond basic CRUD
- Once you have enough information, output the PRD in this exact format:

---BEGIN PRD---
# PRD: <Project Name>

## Overview
<1-2 sentence description>

## Features

- [ ] <EntityName>
- [ ] <AnotherEntity>

### Feature: <EntityName>
> <Brief description>

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fieldName | string | yes | Description |

### Feature: <AnotherEntity>
> <Brief description>

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fieldName | string | yes | Description |
---END PRD---

Start the conversation by asking what kind of API they want to build.`;

const PRD_COMPLETE_MARKER = "---BEGIN PRD---";

/**
 * Conducts an interactive interview to gather requirements and generates a PRD.
 *
 * @param askQuestion - Callback that presents a question and returns the user's answer
 * @param apiKey - Anthropic API key
 */
export async function interviewForPrd(
  askQuestion: (question: string) => Promise<string>,
  apiKey: string
): Promise<string> {
  logger.info("Starting PRD interview");

  const client = new Anthropic({ apiKey });
  const conversationHistory: MessageParam[] = [];

  // Start the conversation
  const opening = await callClaude(client, conversationHistory, null);
  conversationHistory.push({ role: "assistant", content: opening });

  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (iterations < MAX_ITERATIONS) {
    // Check if Claude has finished and produced a PRD
    if (opening.includes(PRD_COMPLETE_MARKER) && iterations === 0) {
      return extractPrd(opening);
    }

    // Check the last assistant message for PRD completion
    const lastAssistantMsg = getLastAssistantMessage(conversationHistory);
    if (lastAssistantMsg && lastAssistantMsg.includes(PRD_COMPLETE_MARKER)) {
      return extractPrd(lastAssistantMsg);
    }

    // Ask the user the current question
    const userAnswer = await askQuestion(getLastAssistantMessage(conversationHistory) ?? opening);
    conversationHistory.push({ role: "user", content: userAnswer });

    // Get Claude's next response
    const assistantResponse = await callClaude(client, conversationHistory, null);
    conversationHistory.push({ role: "assistant", content: assistantResponse });

    logger.debug("Interview iteration", { iteration: iterations + 1 });
    iterations++;
  }

  // Timeout — ask Claude to finalize
  logger.warn("Interview max iterations reached; requesting PRD finalization");
  conversationHistory.push({
    role: "user",
    content: "Please finalize the PRD now with what you have gathered.",
  });
  const finalResponse = await callClaude(client, conversationHistory, null);

  if (finalResponse.includes(PRD_COMPLETE_MARKER)) {
    return extractPrd(finalResponse);
  }

  logger.error("Could not extract PRD from interview", { finalResponse });
  return finalResponse;
}

async function callClaude(
  client: Anthropic,
  history: MessageParam[],
  _extra: null
): Promise<string> {
  try {
    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: history,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      logger.error("Unexpected content type from Claude", { type: content.type });
      return "";
    }
    return content.text;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Claude API call failed during interview", { error: msg });
    throw error;
  }
}

function getLastAssistantMessage(history: MessageParam[]): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role === "assistant") {
      return typeof msg.content === "string" ? msg.content : null;
    }
  }
  return null;
}

function extractPrd(text: string): string {
  const startIdx = text.indexOf(PRD_COMPLETE_MARKER);
  if (startIdx === -1) {
return text;
}

  const endMarker = "---END PRD---";
  const endIdx = text.indexOf(endMarker);

  const prdContent = endIdx !== -1
    ? text.slice(startIdx + PRD_COMPLETE_MARKER.length, endIdx)
.trim()
    : text.slice(startIdx + PRD_COMPLETE_MARKER.length)
.trim();

  logger.info("Extracted PRD from interview", { length: prdContent.length });
  return prdContent;
}
