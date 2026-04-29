import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { consumeMagicLink } from "../lib/auth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const router = useRouter();
  const search = useSearch({ from: "/auth/callback" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = (search as { token?: string }).token;

    if (!token?.trim()) {
      setError("O link de acesso esta incompleto ou invalido.");
      return;
    }

    const consumeToken = async () => {
      try {
        const status = await consumeMagicLink({ data: { token } });
        if (status.needsProfileCompletion) {
          router.navigate({ to: "/profile" });
        } else {
          router.navigate({ to: "/reading" });
        }
      } catch (err) {
        setError(
          `Nao foi possivel validar este link de acesso: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
        );
      }
    };

    consumeToken();
  }, [search, router]);

  return (
    <main className="entry-shell auth-shell">
      <section className="auth-card glass-panel auth-card-entry">
        <div className="auth-orb">✦</div>
        <header className="auth-header">
          <p className="section-kicker">Validando o portal</p>
          <h1 className="hero-title auth-title">Entrando no circulo</h1>
          <p className="hero-copy auth-copy">
            Seu link magico esta sendo reconhecido pela Roda. Aguarde um
            instante enquanto o espaco ritual e restaurado.
          </p>
        </header>

        {error ? (
          <>
            <p className="error-text" role="alert">
              {error}
            </p>
            <button
              className="primary-button auth-submit"
              type="button"
              onClick={() => router.navigate({ to: "/" })}
            >
              Voltar ao inicio
            </button>
          </>
        ) : (
          <div className="loading-panel-inline">
            <div className="loading-orb" />
            <p>Validando o seu link de acesso...</p>
          </div>
        )}
      </section>
    </main>
  );
}
