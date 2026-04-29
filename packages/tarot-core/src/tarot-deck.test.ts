import { describe, expect, test } from "vitest";
import {
  getAllTarotCards,
  getTarotCardById,
  getTarotCardBySlug,
} from "./tarot-deck";

describe("tarot deck", () => {
  test("loads all cards from the Flowise export", () => {
    expect(getAllTarotCards()).toHaveLength(78);
  });

  test("keeps rich card fields", () => {
    const fool = getTarotCardBySlug("o-louco");
    const aceOfOuros = getTarotCardBySlug("as-de-ouros");

    expect(fool).toBeDefined();
    expect(aceOfOuros).toBeDefined();

    expect(fool?.arcana).toBe("Major");
    expect(fool?.keywords).toContain("Viagem");
    expect(fool?.reversedKeywords.length).toBeGreaterThan(0);
    expect(fool?.visualDescription).toContain("precip");

    expect(aceOfOuros?.arcana).toBe("Minor");
    expect(aceOfOuros?.suit).toBe("Ouros");
  });

  test("resolves legacy ids from the previous Rust model", () => {
    const fool = getTarotCardById("major_fool");
    const king = getTarotCardById("paus_king");

    expect(fool?.slug).toBe("o-louco");
    expect(king?.slug).toBe("rei-de-paus");
  });
});
