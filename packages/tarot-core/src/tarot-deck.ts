import flowiseToolExportJson from "./resources/sortearCarta-flowise-tool.json";
import {
  type FlowiseTarotToolExport,
  FlowiseTarotToolExportSchema,
  type TarotCard,
  TarotCardSchema,
} from "./schemas";

type FlowiseTarotCardRaw = {
  nome: string;
  slug: string;
  tipo: "Arcano Maior" | "Arcano Menor";
  naipe?: "Ouros" | "Espadas" | "Copas" | "Paus";
  palavras_chave: string[];
  palavras_chave_invertida?: string[];
  descricao_visual: string;
  descricao_detalhada: string;
};

const LEGACY_MAJOR_ID_TO_SLUG: Record<string, string> = {
  major_fool: "o-louco",
  major_magician: "o-mago",
  major_high_priestess: "a-sacerdotisa",
  major_empress: "a-imperatriz",
  major_emperor: "o-imperador",
  major_hierophant: "o-hierofante",
  major_lovers: "os-amantes",
  major_chariot: "o-carro",
  major_strength: "a-forca",
  major_hermit: "o-eremita",
  major_wheel_of_fortune: "a-roda-da-fortuna",
  major_justice: "a-justica",
  major_hanged_man: "o-enforcado",
  major_death: "a-morte",
  major_temperance: "a-temperanca",
  major_devil: "o-diabo",
  major_tower: "a-torre",
  major_star: "a-estrela",
  major_moon: "a-lua",
  major_sun: "o-sol",
  major_judgement: "o-julgamento",
  major_world: "o-mundo",
};

const LEGACY_MINOR_RANK_TO_PT: Record<string, string> = {
  ace: "as",
  two: "dois",
  three: "tres",
  four: "quatro",
  five: "cinco",
  six: "seis",
  seven: "sete",
  eight: "oito",
  nine: "nove",
  ten: "dez",
  page: "pajem",
  knight: "cavaleiro",
  queen: "rainha",
  king: "rei",
};

const LEGACY_MINOR_SUIT_TO_PT: Record<string, string> = {
  ouros: "ouros",
  espadas: "espadas",
  copas: "copas",
  paus: "paus",
};

function extractCardsSource(functionSource: string): string {
  const startToken = "const tarotCards = ";
  const startIndex = functionSource.indexOf(startToken);
  const endIndex = functionSource.indexOf("function getRandom");

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Failed to extract tarotCards array from Flowise export");
  }

  return functionSource
    .slice(startIndex + startToken.length, endIndex)
    .trim()
    .replace(/;$/, "")
    .trim();
}

function quoteKnownObjectKeys(source: string): string {
  return source.replace(
    /(^|[{,]\s*)(nome|slug|tipo|naipe|palavras_chave|palavras_chave_invertida|descricao_visual|descricao_detalhada)\s*:/gm,
    '$1"$2":',
  );
}

function stripTrailingCommas(source: string): string {
  return source.replace(/,(\s*[}\]])/g, "$1");
}

function parseFlowiseCards(
  toolExport: FlowiseTarotToolExport,
): FlowiseTarotCardRaw[] {
  const cardsSource = extractCardsSource(toolExport.func);
  const jsonSource = stripTrailingCommas(quoteKnownObjectKeys(cardsSource));

  return JSON.parse(jsonSource) as FlowiseTarotCardRaw[];
}

function mapFlowiseCardToTarotCard(card: FlowiseTarotCardRaw): TarotCard {
  return TarotCardSchema.parse({
    id: card.slug,
    slug: card.slug,
    name: card.nome,
    arcana: card.tipo === "Arcano Maior" ? "Major" : "Minor",
    suit: card.naipe,
    keywords: card.palavras_chave,
    reversedKeywords: card.palavras_chave_invertida ?? [],
    visualDescription: card.descricao_visual,
    detailedDescription: card.descricao_detalhada,
  });
}

export function normalizeFlowiseTarotDeck(
  toolExport: FlowiseTarotToolExport,
): TarotCard[] {
  return parseFlowiseCards(toolExport).map(mapFlowiseCardToTarotCard);
}

function resolveLegacyMinorSlug(id: string): string | undefined {
  const [suit, rank] = id.split("_");
  const rankPt = LEGACY_MINOR_RANK_TO_PT[rank ?? ""];
  const suitPt = LEGACY_MINOR_SUIT_TO_PT[suit ?? ""];

  if (!rankPt || !suitPt) {
    return undefined;
  }

  return `${rankPt}-de-${suitPt}`;
}

function resolveLegacySlug(id: string): string | undefined {
  return LEGACY_MAJOR_ID_TO_SLUG[id] ?? resolveLegacyMinorSlug(id);
}

const tarotToolExport = FlowiseTarotToolExportSchema.parse(
  flowiseToolExportJson,
);
const tarotDeck = normalizeFlowiseTarotDeck(tarotToolExport);
const tarotDeckBySlug = new Map(tarotDeck.map((card) => [card.slug, card]));
const tarotDeckById = new Map(tarotDeck.map((card) => [card.id, card]));

export function getAllTarotCards(): readonly TarotCard[] {
  return tarotDeck;
}

export function getTarotCardBySlug(slug: string): TarotCard | undefined {
  return tarotDeckBySlug.get(slug);
}

export function getTarotCardById(id: string): TarotCard | undefined {
  return (
    tarotDeckById.get(id) ?? tarotDeckBySlug.get(resolveLegacySlug(id) ?? "")
  );
}
