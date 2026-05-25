import { Link } from "@tanstack/react-router";

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
