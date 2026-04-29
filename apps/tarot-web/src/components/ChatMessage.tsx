import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageData {
  role: "User" | "Assistant" | "System" | "Tool";
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
}

interface ChatMessageProps {
  message: ChatMessageData;
  isStreaming?: boolean;
}

function cardImagePath(slug: string): string {
  const imageMap: Record<string, string> = {
    "a-sacerdotisa": "/assets/img/a-sacerdotisa.png",
    "o-hierofante": "/assets/img/o-hierofante.png",
    "o-imperador": "/assets/img/o-imperador.png",
    "o-louco": "/assets/img/o-louco.png",
    "o-mago": "/assets/img/o-mago.png",
  };
  return imageMap[slug] ?? "/assets/img/baralho_atras.png";
}

interface SortearCartaOutput {
  status: string;
  origem?: string;
  restantes_hoje: number;
  cartas_extras_disponiveis: number;
  data: string;
  carta: {
    nome: string;
    slug: string;
    tipo: string;
    naipe?: string;
    chaves: string[];
    visual: string;
    sentido: string;
  };
}

interface PixOutput {
  status: string;
  cartas_extras_disponiveis: number;
  pagamentos_pendentes: number;
  pagamento: {
    pix_id: string;
    valor_centavos: number;
    valor_formatado: string;
    cartas_liberadas: number;
    status_pagamento: string;
    pix_copia_cola: string;
    qr_code_base64: string;
  } | null;
}

function parseToolMessage(
  content: string,
): { toolName: string; toolOutput: string } | null {
  const position = content.indexOf("->\n");
  if (position === -1) return null;

  const prefix = content.slice(0, position).trim();
  const toolName = prefix.replace("Tool:", "").trim();
  const toolOutput = content.slice(position + 3).trim();

  return { toolName, toolOutput };
}

function parseSortearOutput(toolOutput: string): SortearCartaOutput | null {
  try {
    return JSON.parse(toolOutput);
  } catch {
    return null;
  }
}

function parsePixOutput(toolOutput: string): PixOutput | null {
  try {
    return JSON.parse(toolOutput);
  } catch {
    return null;
  }
}

function SortearCartaPanel({ payload }: { payload: SortearCartaOutput }) {
  const kicker =
    payload.status === "ja_revelada"
      ? "Carta gratuita do dia preservada"
      : payload.status === "revelada_extra"
        ? "Carta extra revelada"
        : "Carta revelada agora";

  const meta = payload.carta.naipe
    ? `${payload.carta.tipo} · ${payload.carta.naipe}`
    : payload.carta.tipo;

  const sourceCopy =
    payload.origem === "carta_extra_comprada"
      ? "Origem: carta extra comprada"
      : "Origem: carta gratuita do dia";

  return (
    <div className="tool-card-panel">
      <div className="tool-card-visual">
        <img
          className="tool-card-art"
          src={cardImagePath(payload.carta.slug)}
          alt={`Carta ${payload.carta.nome} revelada pela Guia da Roda`}
        />
        <div className="tool-card-seal">{payload.data}</div>
      </div>
      <div className="tool-card-body">
        <p className="tool-card-kicker">{kicker}</p>
        <h3 className="tool-card-title">{payload.carta.nome}</h3>
        <p className="tool-card-meta">{meta}</p>
        <p className="tool-card-rest">{sourceCopy}</p>
        <p className="tool-card-rest">
          Gratuita hoje: {payload.restantes_hoje} · Extras disponiveis:{" "}
          {payload.cartas_extras_disponiveis}
        </p>
        {payload.carta.chaves.length > 0 && (
          <ul className="tool-card-keywords">
            {payload.carta.chaves.map((keyword) => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
        )}
        <div className="tool-card-copy">
          <p>{payload.carta.visual}</p>
          <p>{payload.carta.sentido}</p>
        </div>
      </div>
    </div>
  );
}

function PixPanel({ payload }: { payload: PixOutput }) {
  const hasPayment = payload.pagamento != null;
  const isPending = payload.pagamento?.status_pagamento === "pending";

  return (
    <div className="tool-pix-panel">
      <div className="tool-pix-header">
        <span className="tool-pix-status">{payload.status}</span>
        <span className="tool-pix-count">
          Extras: {payload.cartas_extras_disponiveis} · Pendentes:{" "}
          {payload.pagamentos_pendentes}
        </span>
      </div>
      {hasPayment && payload.pagamento && (
        <div className="tool-pix-body">
          <p className="tool-pix-value">{payload.pagamento.valor_formatado}</p>
          {isPending && (
            <>
              <img
                className="tool-pix-qr"
                src={payload.pagamento.qr_code_base64}
                alt="QR Code PIX"
              />
              <button
                className="tool-pix-copy-btn"
                onClick={() =>
                  navigator.clipboard.writeText(
                    payload.pagamento!.pix_copia_cola,
                  )
                }
                type="button"
              >
                Copiar código PIX
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div
      className="chat-loading"
      aria-live="polite"
      role="status"
      aria-label="A Guia da Roda esta preparando a resposta"
    >
      <div className="loading-orb" />
      <div className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loading-copy">
        A Guia da Roda esta alinhando simbolos e pressagios...
      </p>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom renderers for tarot-specific styling
        p: ({ children }) => <p className="md-paragraph">{children}</p>,
        strong: ({ children }) => (
          <strong className="md-strong">{children}</strong>
        ),
        em: ({ children }) => <em className="md-em">{children}</em>,
        ul: ({ children }) => <ul className="md-list">{children}</ul>,
        ol: ({ children }) => (
          <ol className="md-list md-list-ordered">{children}</ol>
        ),
        li: ({ children }) => <li className="md-list-item">{children}</li>,
        code: ({ children }) => <code className="md-code">{children}</code>,
        pre: ({ children }) => <pre className="md-pre">{children}</pre>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="md-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function ChatMessageBubble({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const classMap: Record<string, string> = {
    User: "chat-bubble user",
    Assistant: "chat-bubble assistant",
    System: "chat-bubble system",
    Tool: "chat-bubble tool",
  };

  const labelMap: Record<string, string> = {
    User: "Você",
    Assistant: "Guia da Roda",
    System: "Sistema",
    Tool: "Movimento ritual",
  };

  const className = classMap[message.role] ?? "chat-bubble";
  const label = labelMap[message.role] ?? message.role;

  // Parse tool messages (from System or Tool role)
  const toolMessage =
    message.role === "System" || message.role === "Tool"
      ? parseToolMessage(message.content)
      : null;

  let content: React.ReactNode;

  if (isStreaming && !message.content) {
    content = <LoadingIndicator />;
  } else if (toolMessage) {
    if (toolMessage.toolName === "SortearCarta") {
      const payload = parseSortearOutput(toolMessage.toolOutput);
      if (payload) {
        content = <SortearCartaPanel payload={payload} />;
      } else {
        content = <pre className="tool-output">{toolMessage.toolOutput}</pre>;
      }
    } else if (
      toolMessage.toolName === "GerarPixCartaExtra" ||
      toolMessage.toolName === "VerificarPixCartaExtra"
    ) {
      const payload = parsePixOutput(toolMessage.toolOutput);
      if (payload) {
        content = <PixPanel payload={payload} />;
      } else {
        content = <pre className="tool-output">{toolMessage.toolOutput}</pre>;
      }
    } else {
      content = <pre className="tool-output">{toolMessage.toolOutput}</pre>;
    }
  } else {
    content = (
      <div className="chat-content">
        <MarkdownContent content={message.content} />
      </div>
    );
  }

  // Show avatar for assistant messages
  const showAvatar = message.role === "Assistant" || message.role === "Tool";

  return (
    <div className={className} aria-busy={isStreaming ? "true" : "false"}>
      {showAvatar && (
        <div className="chat-avatar">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        </div>
      )}
      <article className="chat-bubble-inner">
        <div className="chat-label">{label}</div>
        {content}
      </article>
    </div>
  );
}
