import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/wd-builder",
  "packages/wd-ui",
  "packages/auth-core",
  "packages/payments-core",
  "packages/tarot-core",
  "packages/tarot-ai",
  "packages/tarot-db",
]);
