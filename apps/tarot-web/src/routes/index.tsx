import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { requestMagicLink } from "../lib/auth";
import { friendlyError } from "../lib/errors";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestAccess = async () => {
    if (!email.trim()) {
      setError("Informe seu email para receber o link de acesso.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await requestMagicLink({
        data: { email: email.trim() },
      });
      const deliveryHint =
        response.deliveryMode === "dev-log"
          ? "Neste ambiente o link foi registrado nos logs do servidor."
          : "Se o email estiver acessivel, o link chegara em instantes.";

      setNotice(`Link preparado para ${response.email}. ${deliveryHint}`);
    } catch (err) {
      setError(
        friendlyError(
          err,
          "Não conseguimos preparar seu acesso agora. Confira o email e tente novamente.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="entry-shell auth-shell">
      <section className="auth-card glass-panel auth-card-entry">
        <div className="auth-orb">✦</div>

        <header className="auth-header">
          <p className="section-kicker">Tarot cotidiano</p>
          <h1 className="hero-title auth-title">O Guia da Roda</h1>
          <p className="hero-copy auth-copy">
            Sua jornada comeca com um toque de magia. Entre com seu email para
            receber o link de acesso e abrir o seu ritual de leitura.
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={(evt) => {
            evt.preventDefault();
            requestAccess();
          }}
        >
          <label className="field-label" htmlFor="entry-email">
            Email
          </label>
          <div className="auth-input-wrap">
            <span className="material-symbols-outlined auth-input-icon">
              mail
            </span>
            <input
              id="entry-email"
              className="name-input auth-input"
              type="email"
              value={email}
              placeholder="seu@cosmos.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {notice && <p className="notice-text">{notice}</p>}
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Preparando o link..." : "Enviar link magico"}
          </button>
        </form>

        <footer className="auth-footer">
          <p className="auth-footnote">Conectando voce ao destino</p>
          <Link className="auth-help-link" to="/profile">
            Ja entrou antes? Atualize seu perfil aqui
          </Link>
        </footer>
      </section>
    </main>
  );
}
