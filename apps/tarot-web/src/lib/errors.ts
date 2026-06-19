/**
 * Turns an unknown error (often a raw backend or network failure) into a
 * friendly, user-facing message in pt-BR. The technical detail is logged to
 * the console for developers but is never surfaced to the user.
 */
export function friendlyError(err: unknown, message: string): string {
  console.error(message, err);

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "Você parece estar sem conexão com a internet. Verifique sua rede e tente novamente.";
  }

  return message;
}
