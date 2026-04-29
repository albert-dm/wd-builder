/// <reference types="vite/client" />

import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import appCssUrl from "../styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Guia da Roda — Webdrops",
      },
      {
        name: "description",
        content:
          "Tarot experience migration scaffold for Guia da Roda inside the Webdrops TypeScript monorepo.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCssUrl }],
  }),
  component: RootComponent,
  notFoundComponent: () => <p>Rota não encontrada.</p>,
});

function RootComponent() {
  return (
    <RootDocument>
      <main className="appMain">
        <Outlet />
      </main>
      <TanStackRouterDevtools position="bottom-right" />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
