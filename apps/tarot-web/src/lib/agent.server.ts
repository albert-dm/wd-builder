/**
 * AI Agent for Guia da Roda.
 * DeepSeek integration with tool calling and streaming support.
 *
 * Architecture:
 * - Service layer: DeepSeek API communication
 * - Tool definitions: Available agent capabilities
 * - Message handling: History conversion and tool orchestration
 */

import process from "node:process";
import { TarotSystemPrompt } from "@webdrops/tarot-ai";
import type { TarotCard } from "@webdrops/tarot-core";

// ============================================================================
// Types
// ============================================================================

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
  tool_calls?: ToolCall[];
}

interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}

interface DeepSeekChunk {
  id: string;
  choices: {
    delta: {
      content?: string | null;
      role?: string;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
    index: number;
  }[];
  object: string;
}

interface DeepSeekResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: string;
  }[];
}

export interface ToolHandlers {
  sortearCarta: (userId: string) => Promise<unknown>;
  gerarPix: (userId: string) => Promise<unknown>;
  verificarPix: (userId: string) => Promise<unknown>;
}

export interface ToolExecution {
  toolName: string;
  rawOutput: string;
}

export interface ChatResult {
  response: string;
  history: ChatMessage[];
  toolExecution?: ToolExecution;
}

// ============================================================================
// Tool Definitions
// ============================================================================

const SORTEAR_CARTA_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "SortearCarta",
    description:
      "Revela a proxima carta disponivel para um consulente. Primeiro usa a carta gratuita do dia. Depois disso, so revela novas cartas se houver saldo de cartas extras compradas.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "Identificador do consulente que recebera a carta",
        },
      },
      required: ["user_id"],
    },
  },
};

const GERAR_PIX_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "GerarPixCartaExtra",
    description:
      "Gera um PIX QR Code de R$ 5,00 para liberar uma carta extra alem da carta gratuita do dia. Se ja houver um PIX pendente ou saldo extra disponivel, retorna esse estado em vez de criar duplicatas.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description:
            "Identificador do consulente que deseja comprar uma carta extra",
        },
      },
      required: ["user_id"],
    },
  },
};

const VERIFICAR_PIX_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "VerificarPixCartaExtra",
    description:
      "Verifica se o ultimo PIX de carta extra foi pago com sucesso e atualiza automaticamente o saldo de cartas extras quando o pagamento estiver confirmado.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description:
            "Identificador do consulente que deseja verificar o pagamento",
        },
      },
      required: ["user_id"],
    },
  },
};

const AGENT_TOOLS = [SORTEAR_CARTA_TOOL, GERAR_PIX_TOOL, VERIFICAR_PIX_TOOL];

// ============================================================================
// DeepSeek API Service
// ============================================================================

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY must be set");
  return key;
}

async function callDeepSeek(
  messages: ChatMessage[],
  tools?: ToolDefinition[],
): Promise<DeepSeekResponse> {
  const apiKey = getApiKey();

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      tools: tools?.length ? tools : undefined,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${body}`);
  }

  return response.json();
}

/**
 * Call DeepSeek API with streaming support.
 * Returns an async generator that yields text chunks.
 */
export async function* callDeepSeekStream(
  messages: ChatMessage[],
  tools?: ToolDefinition[],
): AsyncGenerator<{ content: string; done: boolean; toolCalls?: ToolCall[] }> {
  const apiKey = getApiKey();

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      tools: tools?.length ? tools : undefined,
      max_tokens: 900,
      stream: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${body}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  const toolCalls: ToolCall[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      if (trimmed === "data: [DONE]") {
        yield {
          content: "",
          done: true,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        };
        return;
      }

      try {
        const chunk: DeepSeekChunk = JSON.parse(trimmed.slice(6));
        const choice = chunk.choices?.[0];
        if (!choice) continue;

        // Handle tool calls
        if (choice.delta.tool_calls?.length) {
          for (const tc of choice.delta.tool_calls) {
            if (tc.id && tc.function?.name) {
              toolCalls.push(tc);
            } else if (toolCalls.length > 0 && tc.function?.arguments) {
              // Append arguments to the last tool call
              const last = toolCalls[toolCalls.length - 1];
              last.function.arguments += tc.function.arguments;
            }
          }
        }

        // Handle content
        if (choice.delta.content) {
          yield { content: choice.delta.content, done: false };
        }

        // Check if done
        if (
          choice.finish_reason === "stop" ||
          choice.finish_reason === "tool_calls"
        ) {
          yield {
            content: "",
            done: true,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          };
          return;
        }
      } catch {}
    }
  }

  yield {
    content: "",
    done: true,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
  };
}

// ============================================================================
// Tool Output Summarization
// ============================================================================

function summarizeToolOutput(toolName: string, output: string): string {
  try {
    const parsed = JSON.parse(output);

    switch (toolName) {
      case "SortearCarta": {
        const suit = parsed.carta?.naipe ?? "sem naipe";
        const keywords =
          parsed.carta?.chaves?.join(", ") ?? "sem palavras-chave";
        const status =
          parsed.status === "ja_revelada"
            ? "A mesma carta gratuita do dia segue valendo"
            : parsed.status === "revelada_extra"
              ? "Uma carta extra comprada foi revelada"
              : "Uma nova carta gratuita do dia foi revelada";

        return `Ferramenta SortearCarta: ${status}. Origem: ${parsed.origem ?? "gratis_diaria"}. Data: ${parsed.data}. Carta: ${parsed.carta?.nome}. Tipo: ${parsed.carta?.tipo}. Naipe: ${suit}. Palavras-chave: ${keywords}. Gratuita hoje: ${parsed.restantes_hoje}. Extras disponiveis: ${parsed.cartas_extras_disponiveis}. Use essa carta na interpretacao sem repetir JSON bruto.`;
      }

      case "GerarPixCartaExtra":
      case "VerificarPixCartaExtra": {
        const paymentSummary = parsed.pagamento
          ? `Valor: ${parsed.pagamento.valor_formatado}. Status do PIX: ${parsed.pagamento.status_pagamento}.`
          : "Nenhum novo QR code precisou ser exibido.";

        return `Ferramenta ${toolName}: status ${parsed.status}. ${paymentSummary} Extras disponiveis: ${parsed.cartas_extras_disponiveis}. PIX pendentes: ${parsed.pagamentos_pendentes}. Oriente o consulente sem repetir JSON bruto.`;
      }

      default:
        return `Ferramenta ${toolName} executada. Resuma o resultado sem citar JSON bruto: ${output}`;
    }
  } catch {
    return `Ferramenta ${toolName} executada. Resuma o resultado sem citar JSON bruto: ${output}`;
  }
}

// ============================================================================
// Message Conversion
// ============================================================================

/**
 * Convert DB chat history to API-compatible messages.
 * Only includes User and Assistant messages - System/Tool messages
 * from DB are intermediate results that don't need to be replayed.
 */
function historyToMessages(
  chatHistory: { role: string; content: string }[],
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  for (const msg of chatHistory) {
    if (msg.role === "User") {
      messages.push({ role: "user", content: msg.content });
    } else if (msg.role === "Assistant") {
      messages.push({ role: "assistant", content: msg.content });
    }
    // Skip System/Tool messages - they are tool outputs from previous sessions
  }

  return messages;
}

// ============================================================================
// Tool Execution
// ============================================================================

async function executeTool(
  toolName: string,
  toolArgs: Record<string, unknown>,
  handlers: ToolHandlers,
): Promise<unknown> {
  switch (toolName) {
    case "SortearCarta":
      return handlers.sortearCarta(toolArgs.user_id as string);
    case "GerarPixCartaExtra":
      return handlers.gerarPix(toolArgs.user_id as string);
    case "VerificarPixCartaExtra":
      return handlers.verificarPix(toolArgs.user_id as string);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ============================================================================
// Main Chat Orchestration (Non-streaming)
// ============================================================================

/**
 * Run a single chat turn with tool calling support.
 *
 * Flow:
 * 1. Build messages from history + system prompt + user message
 * 2. Call DeepSeek with tools available
 * 3. If tool call requested: execute tool, add [assistant, tool] messages, call again
 * 4. Return final response
 *
 * IMPORTANT: DeepSeek requires the message sequence:
 *   assistant (with tool_calls) -> tool -> assistant (final)
 * The assistant message with tool_calls MUST be present before the tool response.
 */
export async function runChatTurn(
  message: string,
  userId: string,
  chatHistory: { role: string; content: string }[],
  toolHandlers: ToolHandlers,
): Promise<ChatResult> {
  // Build messages: system + history + user
  const messages: ChatMessage[] = [
    { role: "system", content: TarotSystemPrompt },
    ...historyToMessages(chatHistory),
    {
      role: "user",
      content: `[Player ID: ${userId}] ${message}`,
    },
  ];

  // First API call with tools available
  const response = await callDeepSeek(messages, AGENT_TOOLS);
  const choice = response.choices[0];

  if (!choice) {
    throw new Error("No response from DeepSeek");
  }

  // If no tool call, return simple response
  if (!choice.message.tool_calls?.length) {
    return {
      response: choice.message.content ?? "A Roda silenciou por um momento.",
      history: [
        ...messages,
        { role: "assistant", content: choice.message.content ?? "" },
      ],
    };
  }

  // Handle tool call
  const toolCall = choice.message.tool_calls[0];
  const toolName = toolCall.function.name;
  const toolArgs = JSON.parse(toolCall.function.arguments) as Record<
    string,
    unknown
  >;

  // Execute the tool
  const toolOutput = await executeTool(toolName, toolArgs, toolHandlers);
  const toolOutputStr = JSON.stringify(toolOutput);
  const summarized = summarizeToolOutput(toolName, toolOutputStr);

  // CRITICAL: Add assistant message with tool_calls BEFORE tool response
  // DeepSeek requires: assistant (with tool_calls) -> tool -> assistant (final)
  messages.push({
    role: "assistant",
    content: choice.message.content ?? "",
    tool_calls: [
      {
        id: toolCall.id,
        type: toolCall.type,
        function: {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        },
      },
    ],
  });

  // Add tool response
  messages.push({
    role: "tool",
    content: summarized,
    tool_call_id: toolCall.id,
    name: toolName,
  });

  // Second API call to get final response after tool execution
  const finalResponse = await callDeepSeek(messages);
  const finalChoice = finalResponse.choices[0];

  return {
    response:
      finalChoice?.message?.content ?? "A Roda silenciou por um momento.",
    history: [
      ...messages,
      { role: "assistant", content: finalChoice?.message?.content ?? "" },
    ],
    toolExecution: {
      toolName,
      rawOutput: toolOutputStr,
    },
  };
}

// ============================================================================
// Streaming Chat Orchestration
// ============================================================================

/**
 * Run a streaming chat turn.
 * Yields text chunks as they arrive.
 * Returns the final result including tool execution if any.
 */
export async function* runChatTurnStream(
  message: string,
  userId: string,
  chatHistory: { role: string; content: string }[],
  toolHandlers: ToolHandlers,
): AsyncGenerator<{
  content: string;
  done: boolean;
  toolExecution?: ToolExecution;
}> {
  const messages: ChatMessage[] = [
    { role: "system", content: TarotSystemPrompt },
    ...historyToMessages(chatHistory),
    {
      role: "user",
      content: `[Player ID: ${userId}] ${message}`,
    },
  ];

  let collectedContent = "";
  let toolCalls: ToolCall[] | undefined;

  // First streaming call
  for await (const chunk of callDeepSeekStream(messages, AGENT_TOOLS)) {
    if (chunk.toolCalls) {
      toolCalls = chunk.toolCalls;
    }
    if (chunk.content) {
      collectedContent += chunk.content;
      yield { content: chunk.content, done: false };
    }
    if (chunk.done) {
      toolCalls = chunk.toolCalls;
      break;
    }
  }

  // If no tool calls, return
  if (!toolCalls?.length) {
    yield { content: "", done: true };
    return;
  }

  // Handle tool call
  const toolCall = toolCalls[0];
  const toolName = toolCall.function.name;
  let toolArgs: Record<string, unknown>;

  try {
    toolArgs = JSON.parse(toolCall.function.arguments) as Record<
      string,
      unknown
    >;
  } catch {
    // Arguments might be incomplete, try to handle gracefully
    toolArgs = { user_id: userId };
  }

  // Execute the tool
  const toolOutput = await executeTool(toolName, toolArgs, toolHandlers);
  const toolOutputStr = JSON.stringify(toolOutput);
  const summarized = summarizeToolOutput(toolName, toolOutputStr);

  // Add assistant message with tool_calls
  messages.push({
    role: "assistant",
    content: collectedContent,
    tool_calls: [
      {
        id: toolCall.id,
        type: toolCall.type,
        function: {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        },
      },
    ],
  });

  // Add tool response
  messages.push({
    role: "tool",
    content: summarized,
    tool_call_id: toolCall.id,
    name: toolName,
  });

  // Second streaming call
  let finalContent = "";
  for await (const chunk of callDeepSeekStream(messages)) {
    if (chunk.content) {
      finalContent += chunk.content;
      yield { content: chunk.content, done: false };
    }
    if (chunk.done) {
      break;
    }
  }

  yield {
    content: "",
    done: true,
    toolExecution: {
      toolName,
      rawOutput: toolOutputStr,
    },
  };
}

// ============================================================================
// Exports
// ============================================================================

export function formatCardForTool(card: TarotCard): Record<string, unknown> {
  return {
    nome: card.name,
    slug: card.slug,
    tipo: card.arcana === "Major" ? "Arcano Maior" : "Arcano Menor",
    naipe: card.suit ?? null,
    chaves: card.keywords,
    chaves_invertidas: card.reversedKeywords,
    visual: card.visualDescription,
    sentido: card.detailedDescription,
  };
}
