import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "../components";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
});

import { friendlyError } from "../lib/errors";
import { useAuthGuard } from "../lib/guards";
import { verifyExtraCardPurchase } from "../lib/payments";
import {
  type Dashboard,
  formatBrlFromCents,
  purchaseStatusClass,
  purchaseStatusLabel,
} from "../lib/purchases";
import { loadTarotDashboard } from "../lib/tarot";

function WalletPage() {
  const { user, loading: authLoading, needsProfileCompletion } = useAuthGuard();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditedNow, setCreditedNow] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user || authLoading) return;

      if (needsProfileCompletion) return;

      try {
        const loaded = await loadTarotDashboard();
        setDashboard(loaded as unknown as Dashboard);
      } catch (err) {
        setError(
          friendlyError(
            err,
            "Não conseguimos abrir sua carteira agora. Tente novamente em instantes.",
          ),
        );
      }
    };

    loadData();
  }, [user, authLoading, needsProfileCompletion]);

  const verifyPix = async () => {
    setBusy(true);
    setError(null);

    try {
      const result = await verifyExtraCardPurchase();
      setCreditedNow(result.creditedNow);
      const loaded = await loadTarotDashboard();
      setDashboard(loaded as unknown as Dashboard);
    } catch (err) {
      setError(
        friendlyError(err, "Não conseguimos verificar seu PIX agora. Tente novamente."),
      );
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <main className="entry-shell">
        <section className="loading-panel surface-panel">
          <h1>Carteira</h1>
          <p>Consultando o saldo ritual...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const session = dashboard?.session;
  const latestPurchase = dashboard?.recentPurchases[0];

  return (
    <div className="app-shell">
      <TopBar
        balanceText={`${(session?.cardsRemainingToday ?? 0) + (session?.purchasedCardsAvailable ?? 0)} cartas`}
      />

      <main className="app-canvas app-canvas-with-nav">
        <section className="hero-panel glass-panel wallet-hero">
          <p className="section-kicker">Carteira ritual</p>
          <h1 className="hero-title">Seu saldo mistico</h1>
          <div className="wallet-balance-grid">
            <div className="metric-chip">
              <span className="metric-value">
                {session?.cardsRemainingToday ?? 0}
              </span>
              <span className="metric-label">gratuita hoje</span>
            </div>
            <div className="metric-chip">
              <span className="metric-value">
                {session?.purchasedCardsAvailable ?? 0}
              </span>
              <span className="metric-label">extras liberadas</span>
            </div>
            <div className="metric-chip">
              <span className="metric-value">
                {session?.pendingPaymentCount ?? 0}
              </span>
              <span className="metric-label">PIX em aberto</span>
            </div>
          </div>
          <p className="hero-copy">
            Aqui aparecem apenas dados reais da sua conta atual: saldo gratuito,
            cartas extras compradas e os ultimos movimentos de PIX registrados
            pela aplicacao.
          </p>
          <div className="purchase-actions">
            <Link className="secondary-link-button" to="/reading">
              Voltar para a leitura
            </Link>
            <Link className="secondary-link-button" to="/market">
              Abrir mercado
            </Link>
          </div>
        </section>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        {creditedNow && (
          <p className="notice-text">
            Pagamento confirmado agora. Sua carta extra ja esta pronta para ser
            revelada na consulta.
          </p>
        )}

        {latestPurchase && (
          <section className="purchase-panel glass-panel">
            <div className="purchase-panel-copy">
              <p className="section-kicker">Ultimo PIX</p>
              <h2 className="feature-title">
                {purchaseStatusLabel(latestPurchase.status)}
              </h2>
              <p className="purchase-meta">
                Valor: {formatBrlFromCents(latestPurchase.amountCents)} ·
                Quantidade: {latestPurchase.cardQuantity} carta
              </p>
              <p className="purchase-meta">
                Expira em: {latestPurchase.expiresAt}
              </p>
              <p className="purchase-meta">PIX ID: {latestPurchase.pixId}</p>
            </div>
            <div className="purchase-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={busy}
                onClick={verifyPix}
              >
                {busy ? "Verificando..." : "Verificar pagamento"}
              </button>
              <Link className="secondary-link-button" to="/market">
                Abrir mercado
              </Link>
            </div>
          </section>
        )}

        <section className="history-panel glass-panel">
          <div className="section-heading-row">
            <p className="section-kicker">Historico</p>
            <Link className="history-link" to="/market">
              Mercado
            </Link>
          </div>
          <h2 className="feature-title">Ultimos movimentos</h2>

          {!dashboard?.recentPurchases.length ? (
            <p className="feature-copy">
              Ainda nao ha registros de PIX ou compras extras nesta conta.
            </p>
          ) : (
            <div className="history-list">
              {dashboard.recentPurchases.map((purchase) => (
                <article key={purchase.pixId} className="history-item">
                  <div className="history-item-main">
                    <h3 className="history-title">Carta extra via PIX</h3>
                    <p className="history-copy">{purchase.createdAt}</p>
                    <p className="history-copy">{purchase.pixId}</p>
                  </div>
                  <div className="history-item-side">
                    <strong className="history-amount">
                      {formatBrlFromCents(purchase.amountCents)}
                    </strong>
                    <span className={purchaseStatusClass(purchase.status)}>
                      {purchaseStatusLabel(purchase.status)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
