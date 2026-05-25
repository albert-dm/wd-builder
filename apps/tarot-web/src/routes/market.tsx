import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "../components";

export const Route = createFileRoute("/market")({
  component: MarketPage,
});

import { useAuthGuard } from "../lib/guards";
import {
  prepareExtraCardPurchase,
  verifyExtraCardPurchase,
} from "../lib/payments";
import { loadTarotDashboard } from "../lib/tarot";

interface Purchase {
  pixId: string;
  amountCents: number;
  cardQuantity: number;
  status: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Dashboard {
  session: {
    cardsRemainingToday: number;
    purchasedCardsAvailable: number;
    pendingPaymentCount: number;
  };
  recentPurchases: Purchase[];
}

function formatBrlFromCents(amountCents: number): string {
  const reais = Math.floor(amountCents / 100);
  const cents = amountCents % 100;
  return `R$ ${reais},${cents.toString().padStart(2, "0")}`;
}

function purchaseStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pix_gerado: "PIX gerado",
    pix_pendente_existente: "PIX pendente",
    carta_extra_ja_disponivel: "Carta extra disponivel",
    pago_creditado_agora: "Pagamento confirmado agora",
    pago_creditado: "Pagamento confirmado",
    pending: "Pagamento pendente",
    paid: "Pagamento confirmado",
    expired: "PIX expirado",
    cancelled: "PIX cancelado",
    refunded: "PIX estornado",
  };
  return labels[status] ?? "Movimento ritual";
}

function MarketPage() {
  const { user, loading: authLoading, needsProfileCompletion } = useAuthGuard();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user || authLoading) return;

      if (needsProfileCompletion) return;

      try {
        const loaded = await loadTarotDashboard();
        setDashboard(loaded as unknown as Dashboard);
      } catch (err) {
        setError(
          `Nao foi possivel carregar o mercado arcano: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
        );
      }
    };

    loadData();
  }, [user, authLoading, needsProfileCompletion]);

  const requestPix = async () => {
    setBusy(true);
    setError(null);

    try {
      const result = await prepareExtraCardPurchase();
      setPurchase(result.purchase);
      const loaded = await loadTarotDashboard();
      setDashboard(loaded as unknown as Dashboard);
    } catch (err) {
      setError(
        `Nao foi possivel preparar o PIX da carta extra: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const verifyPix = async () => {
    setBusy(true);
    setError(null);

    try {
      const result = await verifyExtraCardPurchase();
      setPurchase(result.purchase);
      const loaded = await loadTarotDashboard();
      setDashboard(loaded as unknown as Dashboard);
    } catch (err) {
      setError(
        `Nao foi possivel verificar o PIX atual: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <main className="entry-shell">
        <section className="loading-panel surface-panel">
          <h1>Mercado Arcano</h1>
          <p>Ajustando o ceu do mercado ritual...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const totalAvailable =
    (dashboard?.session.cardsRemainingToday ?? 0) +
    (dashboard?.session.purchasedCardsAvailable ?? 0);
  const pendingCount = dashboard?.session.pendingPaymentCount ?? 0;
  const hasExtraBalance = (dashboard?.session.purchasedCardsAvailable ?? 0) > 0;
  const currentPurchase =
    purchase ??
    dashboard?.recentPurchases.find(
      (p) => p.status === "pending" || p.status === "paid",
    );

  return (
    <div className="app-shell">
      <TopBar balanceText={`${totalAvailable} cartas`} />

      <main className="app-canvas app-canvas-with-nav">
        <section className="hero-panel glass-panel market-hero">
          <p className="section-kicker">Mercado Arcano</p>
          <h1 className="hero-title">Liberar uma nova carta</h1>
          <p className="hero-copy">
            Aqui o mercado respeita a regra atual da Roda: uma carta gratuita
            por dia e, quando fizer sentido seguir alem dela, uma carta extra
            por PIX de R$ 5,00.
          </p>
          <div className="hero-metrics">
            <div className="metric-chip">
              <span className="metric-value">{totalAvailable}</span>
              <span className="metric-label">cartas disponiveis</span>
            </div>
            <div className="metric-chip">
              <span className="metric-value">{pendingCount}</span>
              <span className="metric-label">PIX em aberto</span>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          <article className="feature-card feature-card-primary glass-panel">
            <p className="section-kicker">Oferta real</p>
            <h2 className="feature-title">Carta extra individual</h2>
            <p className="feature-copy">
              A funcionalidade implementada hoje libera uma carta extra por vez.
              O pagamento cria ou reaproveita um PIX pendente e o credito fica
              disponivel assim que o pagamento for confirmado.
            </p>
            <div className="price-row">
              <strong className="price-tag">R$ 5,00</strong>
              <span className="price-meta">1 carta extra</span>
            </div>
            {hasExtraBalance ? (
              <>
                <div className="notice-text">
                  Voce ja tem uma carta extra liberada agora. Basta voltar para
                  a consulta e pedir a proxima revelacao.
                </div>
                <Link className="primary-button hero-action" to="/reading">
                  Voltar para a leitura
                </Link>
              </>
            ) : (
              <button
                className="primary-button hero-action"
                type="button"
                disabled={busy}
                onClick={requestPix}
              >
                {busy
                  ? "Preparando o PIX..."
                  : pendingCount > 0
                    ? "Reabrir PIX pendente"
                    : "Gerar PIX da carta extra"}
              </button>
            )}
          </article>

          <article className="feature-card glass-panel">
            <p className="section-kicker">Fluxo atual</p>
            <h2 className="feature-title">Como isso conversa com a Roda</h2>
            <ul className="ritual-list">
              <li>1. Gere ou recupere o PIX aqui no mercado.</li>
              <li>2. Pague e verifique o status nesta tela ou na carteira.</li>
              <li>
                3. Volte para a consulta para revelar a carta extra com o fluxo
                real da aplicacao.
              </li>
            </ul>
          </article>
        </section>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        {currentPurchase && (
          <section className="purchase-panel glass-panel">
            <div className="purchase-panel-copy">
              <p className="section-kicker">
                {purchaseStatusLabel(currentPurchase.status)}
              </p>
              <h2 className="feature-title">PIX atual da carta extra</h2>
              <p className="feature-copy">
                Este painel mostra o estado real do ultimo PIX da sua conta. Se
                o pagamento ja tiver sido reconhecido, o saldo extra aparecera
                automaticamente na leitura.
              </p>
              <p className="purchase-meta">
                Valor: {formatBrlFromCents(currentPurchase.amountCents)} ·
                Quantidade: {currentPurchase.cardQuantity} carta
              </p>
              <p className="purchase-meta">
                Expira em: {currentPurchase.expiresAt}
              </p>
              <p className="purchase-meta">PIX ID: {currentPurchase.pixId}</p>
            </div>

            {currentPurchase.brCodeBase64 && (
              <div className="purchase-qr-wrap">
                <img
                  className="purchase-qr"
                  src={currentPurchase.brCodeBase64}
                  alt="QR Code PIX para liberar carta extra"
                />
              </div>
            )}

            {currentPurchase.brCode && (
              <div className="pix-code-block">
                <p className="section-kicker">PIX copia e cola</p>
                <pre className="tool-output pix-code-output">
                  {currentPurchase.brCode}
                </pre>
              </div>
            )}

            <div className="purchase-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={busy}
                onClick={verifyPix}
              >
                {busy ? "Verificando..." : "Verificar pagamento"}
              </button>
              <Link className="secondary-link-button" to="/wallet">
                Abrir carteira
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
