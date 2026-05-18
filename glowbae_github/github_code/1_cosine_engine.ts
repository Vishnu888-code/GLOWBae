// =============================================================================
// FILE: artifacts/api-server/src/lib/cosine.ts
// GLOWBae — AI Cosine Similarity Recommendation Engine (TypeScript/Node.js)
// =============================================================================

export type ProductVector = {
  id: string;
  skinTypeVec: number[];
  concernVec: number[];
  priceNorm: number;
};

const SKIN_TYPES = ["oily", "dry", "combination", "normal", "sensitive"];
const CONCERNS = [
  "acne",
  "aging",
  "brightening",
  "hydration",
  "pigmentation",
  "pores",
  "dark circles",
  "uneven texture",
  "sun protection",
  "redness",
];

export function encodeProduct(
  skinTypes: string[],
  concerns: string[],
  price: number,
  maxPrice: number
): { skinTypeVec: number[]; concernVec: number[]; priceNorm: number } {
  const skinTypeVec = SKIN_TYPES.map((s) =>
    skinTypes.map((x) => x.toLowerCase()).includes(s) ? 1 : 0
  );
  const concernVec = CONCERNS.map((c) =>
    concerns.map((x) => x.toLowerCase()).includes(c) ? 1 : 0
  );
  const priceNorm = maxPrice > 0 ? 1 - price / maxPrice : 0;
  return { skinTypeVec, concernVec, priceNorm };
}

export function encodeQuery(
  skinType: string,
  concern: string
): { skinTypeVec: number[]; concernVec: number[]; priceNorm: number } {
  const skinTypeVec = SKIN_TYPES.map((s) =>
    s === skinType.toLowerCase() ? 1 : 0
  );
  const concernVec = CONCERNS.map((c) =>
    c === concern.toLowerCase() ? 1 : 0
  );
  return { skinTypeVec, concernVec, priceNorm: 1 };
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0);
}

function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = dotProduct(a, b);
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function buildFeatureVector(
  skinTypeVec: number[],
  concernVec: number[],
  priceScore: number
): number[] {
  return [...skinTypeVec, ...concernVec, priceScore];
}

export type ScoredProduct = {
  id: string;
  score: number;
  rank: number;
  matchReasons: string[];
};

export function rankProducts(
  query: { skinType: string; concern: string; budget: number },
  products: Array<{
    id: string;
    skinTypes: string[];
    concerns: string[];
    price: number;
    name: string;
    brand: string;
  }>
): ScoredProduct[] {
  const maxPrice = Math.max(...products.map((p) => p.price), 1);
  const queryEnc = encodeQuery(query.skinType, query.concern);
  const queryVec = buildFeatureVector(queryEnc.skinTypeVec, queryEnc.concernVec, 1);

  const scored = products
    .filter((p) => p.price <= query.budget)
    .map((p) => {
      const prodEnc = encodeProduct(p.skinTypes, p.concerns, p.price, maxPrice);
      const prodVec = buildFeatureVector(
        prodEnc.skinTypeVec,
        prodEnc.concernVec,
        prodEnc.priceNorm
      );
      const score = cosineSimilarity(queryVec, prodVec);

      const matchReasons: string[] = [];
      const skinMatch = p.skinTypes
        .map((s) => s.toLowerCase())
        .includes(query.skinType.toLowerCase());
      const concernMatch = p.concerns
        .map((c) => c.toLowerCase())
        .includes(query.concern.toLowerCase());
      if (skinMatch) matchReasons.push(`Formulated for ${query.skinType} skin`);
      if (concernMatch) matchReasons.push(`Targets ${query.concern}`);
      if (p.price <= query.budget * 0.6) matchReasons.push("Great value for money");
      if (!skinMatch && !concernMatch) matchReasons.push("Universally beneficial formula");

      return { id: p.id, score, matchReasons };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10).map((s, i) => ({ ...s, rank: i + 1 }));
}
