import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reading")({
  component: ReadingPage,
});

import { useEffect, useRef, useState } from "react";
import { ChatInput, ChatMessageBubble, TopBar } from "../components";
import { CARD_BACK_IMAGE, cardImagePath } from "../lib/cards";
import { friendlyError } from "../lib/errors";
import { useAuthGuard } from "../lib/guards";
import { ensureTarotSession, streamTarotMessage } from "../lib/tarot";

interface ReadingSession {
  userId: string;
  userName: string;
  spread: "SingleCard";
  cardsRemainingToday: number;
  purchasedCardsAvailable: number;
  pendingPaymentCount: number;
  lastResetAt: string;
  currentReading: {
    cardId: string;
    revealedAt: string;
    source: string;
    card?: {
      id: string;
      slug: string;
      name: string;
      arcana: string;
      suit?: string;
      keywords: string[];
      reversedKeywords: string[];
      visualDescription: string;
      detailedDescription: string;
    };
  } | null;
  chatHistory: {
    role: "User" | "Assistant" | "System" | "Tool";
    content: string;
    timestamp: string;
  }[];
}

function ReadingPage() {
  const { user, loading: authLoading, needsProfileCompletion } = useAuthGuard();
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM has updated after React re-render
    setTimeout(() => {
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    }, 10);
  };

  useEffect(() => {
    const loadSession = async () => {
      if (!user || authLoading) return;

      if (needsProfileCompletion) {
        return; // Auth guard will redirect
      }

      try {
        const loadedSession = await ensureTarotSession();
        setSession(loadedSession as unknown as ReadingSession);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        setError(
          friendlyError(
            err,
            "Não conseguimos abrir sua leitura agora. Tente novamente em instantes.",
          ),
        );
      }
    };

    loadSession();
  }, [user, authLoading, needsProfileCompletion]);

  const handleSend = async (message: string) => {
    if (!session) return;

    const previousSession = { ...session };
    setLoading(true);
    setError(null);

    // Optimistic update - add user message and empty assistant message
    const optimisticSession = {
      ...session,
      chatHistory: [
        ...session.chatHistory,
        { role: "User" as const, content: message, timestamp: "" },
        { role: "Assistant" as const, content: "", timestamp: "" },
      ],
    };
    setSession(optimisticSession);
    // Scroll after optimistic update renders
    setTimeout(scrollToBottom, 50);

    try {
      // Use TanStack Start server function for streaming
      const result = await streamTarotMessage({ data: { message } });

      // Handle streaming response
      if (result instanceof Response) {
        const reader = result.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Check for error
          if (chunk.includes("[ERROR]")) {
            const errorMsg = chunk.split("[ERROR]")[1];
            throw new Error(errorMsg);
          }

          accumulatedContent += chunk;

          // Update the last message (assistant) with accumulated content
          setSession((prev) => {
            if (!prev) return prev;
            const history = [...prev.chatHistory];
            if (
              history.length > 0 &&
              history[history.length - 1].role === "Assistant"
            ) {
              history[history.length - 1] = {
                ...history[history.length - 1],
                content: accumulatedContent,
              };
            }
            return { ...prev, chatHistory: history };
          });
          scrollToBottom();
        }
      } else {
        throw new Error("Unexpected response format");
      }

      // Reload session to get final state with tool messages
      const finalSession = await ensureTarotSession();
      setSession(finalSession as unknown as ReadingSession);
    } catch (err) {
      setSession(previousSession);
      setError(
        friendlyError(
          err,
          "A Roda não respondeu desta vez. Aguarde um instante e tente de novo.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="entry-shell auth-shell">
        <section className="loading-panel surface-panel auth-card">
          <h1>Roda da Fortuna</h1>
          <p>Restabelecendo o seu circulo de leitura...</p>
        </section>
      </main>
    );
  }

  if (!user || !session) {
    return (
      <main className="entry-shell auth-shell">
        <section className="loading-panel surface-panel auth-card">
          <h1>Roda da Fortuna</h1>
          <p>Preparando o espaco simbolico da leitura...</p>
          {error && <p className="error-text">{error}</p>}
        </section>
      </main>
    );
  }

  const currentCard = session.currentReading?.card;
  const currentKeywords = currentCard?.keywords.join(", ") ?? "";
  const currentSourceLabel =
    session.currentReading?.source === "DailyFree"
      ? "Carta gratuita do dia"
      : session.currentReading?.source === "PurchasedExtra"
        ? "Carta extra liberada"
        : null;
  const balanceText = `${session.cardsRemainingToday + session.purchasedCardsAvailable} cartas`;

  return (
    <div className="app-shell">
      <TopBar balanceText={balanceText} />

      <main className="app-canvas oracle-layout">
        <section className="oracle-summary-grid">
          <article className="glass-panel revealed-card-panel">
            <p className="section-kicker">Ultima carta revelada</p>
            {currentCard ? (
              <div className="revealed-card-layout">
                <div className="revealed-card-media">
                  <img
                    className="revealed-card-art"
                    src={cardImagePath(currentCard.slug)}
                    alt={`Carta revelada ${currentCard.name}`}
                  />
                </div>
                <div className="revealed-card-copy">
                  {currentSourceLabel && (
                    <p className="current-reading-source">
                      {currentSourceLabel}
                    </p>
                  )}
                  <h2 className="feature-title">{currentCard.name}</h2>
                  {currentKeywords && (
                    <p className="card-keywords">
                      Palavras-chave: {currentKeywords}
                    </p>
                  )}
                  <p className="feature-copy">
                    {currentCard.visualDescription}
                  </p>
                </div>
              </div>
            ) : (
              <div className="revealed-card-layout is-empty">
                <div className="revealed-card-media">
                  <img
                    className="revealed-card-art"
                    src={CARD_BACK_IMAGE}
                    alt="Verso do baralho aguardando revelacao"
                  />
                </div>
                <div className="revealed-card-copy">
                  <h2 className="feature-title">Carta velada</h2>
                  <p className="feature-copy">
                    Quando a proxima revelacao acontecer, a carta surgira aqui
                    com seus simbolos e a interpretacao principal.
                  </p>
                </div>
              </div>
            )}
            {currentCard && (
              <p className="card-reflection">
                {currentCard.detailedDescription}
              </p>
            )}
          </article>

          <article className="glass-panel quick-links-panel">
            <p className="section-kicker">Atalhos</p>
            <h2 className="feature-title">Caminhos disponiveis</h2>
            <div className="quick-link-stack">
              <Link className="secondary-link-button" to="/market">
                Abrir mercado de cartas extras
              </Link>
              <Link className="secondary-link-button" to="/wallet">
                Ver carteira e PIX atuais
              </Link>
            </div>
          </article>
        </section>

        <section className="chat-panel glass-panel">
          <div
            ref={chatHistoryRef}
            className="chat-history"
            id="tarot-chat-history"
            aria-live="polite"
            aria-label="Historico da conversa com a Roda da Fortuna"
          >
            {session.chatHistory.map((message, index) => (
              <ChatMessageBubble
                key={`${index}-${message.timestamp}`}
                message={message}
                isStreaming={
                  loading &&
                  index + 1 === session.chatHistory.length &&
                  message.role === "Assistant"
                }
              />
            ))}
          </div>

          <footer className="chat-composer ritual-composer glass-panel">
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}

            <ChatInput onSend={handleSend} disabled={loading} />
          </footer>
        </section>
      </main>
    </div>
  );
}
