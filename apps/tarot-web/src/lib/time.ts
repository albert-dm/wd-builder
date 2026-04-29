/**
 * Time utilities for Guia da Roda.
 * All times are expressed in America/Sao_Paulo timezone.
 */

const SAO_PAULO_TZ = "America/Sao_Paulo";

export function nowSaoPaulo(): Date {
  const now = new Date();
  // Get the offset for Sao Paulo timezone
  const spString = now.toLocaleString("en-US", { timeZone: SAO_PAULO_TZ });
  return new Date(spString);
}

export function nowSaoPauloRfc3339(): string {
  return `${new Date()
    .toLocaleString("sv-SE", { timeZone: SAO_PAULO_TZ })
    .replace(" ", "T")}-03:00`;
}

export function todaySaoPauloString(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: SAO_PAULO_TZ });
}

export function parseRfc3339(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isSameSaoPauloDay(left: string, right: string): boolean {
  const leftDate = parseRfc3339(left);
  const rightDate = parseRfc3339(right);

  if (!leftDate || !rightDate) {
    return left.slice(0, 10) === right.slice(0, 10);
  }

  const leftSP = leftDate.toLocaleDateString("sv-SE", {
    timeZone: SAO_PAULO_TZ,
  });
  const rightSP = rightDate.toLocaleDateString("sv-SE", {
    timeZone: SAO_PAULO_TZ,
  });
  return leftSP === rightSP;
}

export function datePortionInSaoPaulo(value: string): string | null {
  const parsed = parseRfc3339(value);
  if (!parsed) {
    return value.slice(0, 10) || null;
  }
  return parsed.toLocaleDateString("sv-SE", { timeZone: SAO_PAULO_TZ });
}

export function leftIsNewerOrEqual(left: string, right: string): boolean {
  const leftDate = parseRfc3339(left);
  const rightDate = parseRfc3339(right);

  if (!leftDate || !rightDate) {
    return left >= right;
  }

  return leftDate >= rightDate;
}
