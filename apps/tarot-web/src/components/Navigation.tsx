import { Link } from "@tanstack/react-router";

export type AppTab = "oracle" | "market" | "wallet" | "profile";

interface TopBarProps {
  balanceText?: string;
}

export function TopBar({ balanceText }: TopBarProps) {
  return (
    <header className="top-app-bar">
      <Link className="brand-link" to="/reading">
        <span
          className="material-symbols-outlined brand-icon"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <span className="brand-wordmark">O Guia da Roda</span>
      </Link>

      <div className="top-app-actions">
        {balanceText && (
          <Link className="top-balance-chip" to="/wallet">
            <span className="material-symbols-outlined top-balance-icon">
              account_balance_wallet
            </span>
            <span>{balanceText}</span>
          </Link>
        )}

        <Link className="top-icon-link material-symbols-outlined" to="/market">
          storefront
        </Link>
        <Link className="top-icon-link material-symbols-outlined" to="/profile">
          person
        </Link>
      </div>
    </header>
  );
}

interface BottomNavProps {
  activeTab: AppTab;
}

function tabClass(isActive: boolean): string {
  return isActive ? "bottom-nav-link is-active" : "bottom-nav-link";
}

export function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <nav className="bottom-nav-shell">
      <Link className={tabClass(activeTab === "oracle")} to="/reading">
        <span className="material-symbols-outlined">auto_awesome</span>
        <span className="bottom-nav-label">Oraculo</span>
      </Link>
      <Link className={tabClass(activeTab === "market")} to="/market">
        <span className="material-symbols-outlined">storefront</span>
        <span className="bottom-nav-label">Mercado</span>
      </Link>
      <Link className={tabClass(activeTab === "wallet")} to="/wallet">
        <span className="material-symbols-outlined">payments</span>
        <span className="bottom-nav-label">Carteira</span>
      </Link>
      <Link className={tabClass(activeTab === "profile")} to="/profile">
        <span className="material-symbols-outlined">person</span>
        <span className="bottom-nav-label">Perfil</span>
      </Link>
    </nav>
  );
}
