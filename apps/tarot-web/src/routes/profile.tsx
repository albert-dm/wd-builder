import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "../components";
import { completeAuthProfile, logoutAuth } from "../lib/auth";
import { useAuthGuard } from "../lib/guards";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading: authLoading } = useAuthGuard();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.displayName) {
        setDisplayName(user.displayName);
        setProfileReady(true);
      }
    }
  }, [user]);

  const saveProfile = async () => {
    if (!displayName.trim()) {
      setError("Informe o nome que a Roda deve usar na consulta.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await completeAuthProfile({ data: { displayName } });
      window.location.href = "/reading";
    } catch (err) {
      setError(
        `Nao foi possivel concluir seu perfil: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
      setLoading(false);
    }
  };

  const performLogout = async () => {
    setLoggingOut(true);
    setError(null);

    try {
      await logoutAuth();
      window.location.href = "/";
    } catch (err) {
      setError(
        `Nao foi possivel encerrar sua sessao: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
      setLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <main className="entry-shell auth-shell">
        <section className="loading-panel surface-panel auth-card">
          <h1>Perfil</h1>
          <p>Preparando o seu nome de consulta...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const title = profileReady
    ? "Seu nome de consulta"
    : "Como a Roda deve te chamar?";
  const subtitle = profileReady
    ? "Voce pode ajustar o nome mostrado durante a leitura sempre que quiser."
    : "Seu email ja foi confirmado. Falta apenas definir o nome que aparecera durante a leitura.";

  return (
    <div className="app-shell">
      <TopBar balanceText="Perfil" />

      <main className="app-canvas app-canvas-with-nav">
        <section className="profile-shell glass-panel">
          <header className="auth-header profile-header">
            <p className="section-kicker">
              {profileReady ? "Perfil" : "Primeiro acesso"}
            </p>
            <h1 className="hero-title auth-title">{title}</h1>
            <p className="hero-copy auth-copy">{subtitle}</p>
          </header>

          <div className="profile-avatar-wrap">
            <div className="profile-avatar-circle">
              <span className="material-symbols-outlined">person</span>
            </div>
          </div>

          <div className="profile-meta-grid">
            <article className="profile-meta-card">
              <p className="section-kicker">Email autenticado</p>
              <p className="profile-meta-value">{user.email}</p>
              <p className="profile-helper-copy">
                Este email continua sendo usado apenas para acesso seguro por
                link magico.
              </p>
            </article>

            <article className="profile-meta-card">
              <p className="section-kicker">Atalhos</p>
              <div className="quick-link-stack">
                <Link className="secondary-link-button" to="/reading">
                  Voltar para a leitura
                </Link>
                <Link className="secondary-link-button" to="/market">
                  Abrir mercado
                </Link>
                <Link className="secondary-link-button" to="/wallet">
                  Ver carteira
                </Link>
              </div>
            </article>
          </div>

          <form
            className="auth-form profile-form"
            onSubmit={(evt) => {
              evt.preventDefault();
              saveProfile();
            }}
          >
            <label className="field-label" htmlFor="entry-display-name">
              Nome de consulta
            </label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined auth-input-icon">
                fingerprint
              </span>
              <input
                id="entry-display-name"
                className="name-input auth-input"
                type="text"
                value={displayName}
                placeholder="Ex.: Marina, Theo, Sol"
                autoComplete="nickname"
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <p className="profile-helper-copy">
              Este nome e exibido no seu ritual de leitura. A identidade
              autenticada continua separada do estado da consulta.
            </p>

            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}

            <div className="profile-actions">
              <button
                className="primary-button auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Guardando o nome..."
                  : profileReady
                    ? "Salvar e voltar a leitura"
                    : "Entrar na leitura"}
              </button>

              <button
                className="ghost-danger-button"
                type="button"
                disabled={loggingOut}
                onClick={performLogout}
              >
                {loggingOut ? "Saindo..." : "Encerrar sessao"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
