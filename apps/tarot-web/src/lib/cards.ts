/**
 * Shared helpers for tarot card rendering.
 */

const CARD_BACK_IMAGE = "/assets/img/baralho_atras.png";

/**
 * Slugs that currently ship with bespoke artwork. Any other card gracefully
 * falls back to the card back so the UI never renders a broken image.
 */
const CARD_IMAGE_BY_SLUG: Record<string, string> = {
  "a-sacerdotisa": "/assets/img/a-sacerdotisa.png",
  "a-imperatriz": "/assets/img/a-imperatriz.png",
  "o-hierofante": "/assets/img/o-hierofante.png",
  "o-imperador": "/assets/img/o-imperador.png",
  "o-louco": "/assets/img/o-louco.png",
  "o-mago": "/assets/img/o-mago.png",
};

export function cardImagePath(slug: string): string {
  return CARD_IMAGE_BY_SLUG[slug] ?? CARD_BACK_IMAGE;
}

export { CARD_BACK_IMAGE };

/** Safely parse a JSON string, returning null instead of throwing. */
export function tryParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
