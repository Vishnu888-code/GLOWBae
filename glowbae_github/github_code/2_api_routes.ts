// =============================================================================
// FILE: artifacts/api-server/src/routes/recommendations.ts
// GLOWBae — POST /api/recommendations (Express.js)
// =============================================================================

import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { GetRecommendationsBody } from "@workspace/api-zod";
import { rankProducts } from "../lib/cosine";

const router = Router();

router.post("/recommendations", async (req, res) => {
  const parsed = GetRecommendationsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  const { skinType, concern, budget } = parsed.data;
  const allProducts = await db.select().from(productsTable);

  const ranked = rankProducts(
    { skinType, concern, budget },
    allProducts.map((p) => ({
      id: String(p.id),
      skinTypes: p.skinTypes as string[],
      concerns: p.concerns as string[],
      price: p.price,
      name: p.name,
      brand: p.brand,
    }))
  );

  const productMap = new Map(allProducts.map((p) => [String(p.id), p]));

  const recommendations = ranked.map((r) => {
    const p = productMap.get(r.id)!;
    return {
      product: {
        id: String(p.id),
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        skinTypes: p.skinTypes as string[],
        concerns: p.concerns as string[],
        rating: p.rating,
        reviewCount: p.reviewCount,
        imageUrl: p.imageUrl,
        purplleUrl: p.purplleUrl,
        description: p.description,
        keyIngredients: p.keyIngredients as string[],
      },
      score: r.score,
      rank: r.rank,
      matchReasons: r.matchReasons,
    };
  });

  res.json(recommendations);
});

export default router;


// =============================================================================
// FILE: artifacts/api-server/src/routes/products.ts
// GLOWBae — GET /api/products, /trending, /categories
// =============================================================================

import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const productsRouter = Router();

productsRouter.get("/products", async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(desc(productsTable.rating));
  res.json(products.map(formatProduct));
});

productsRouter.get("/products/trending", async (_req, res) => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.rating))
    .limit(8);
  res.json(products.map(formatProduct));
});

productsRouter.get("/products/categories", async (_req, res) => {
  const result = await db
    .select({
      category: productsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(productsTable)
    .groupBy(productsTable.category)
    .orderBy(desc(sql`count(*)`));
  res.json(result);
});

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: String(p.id),
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    skinTypes: p.skinTypes as string[],
    concerns: p.concerns as string[],
    rating: p.rating,
    reviewCount: p.reviewCount,
    imageUrl: p.imageUrl,
    purplleUrl: p.purplleUrl,
    description: p.description,
    keyIngredients: p.keyIngredients as string[],
  };
}

export default productsRouter;


// =============================================================================
// FILE: artifacts/api-server/src/routes/skin-metadata.ts
// GLOWBae — GET /api/skin-metadata (quiz options)
// =============================================================================

import { Router } from "express";

const metaRouter = Router();

metaRouter.get("/skin-metadata", (_req, res) => {
  res.json({
    skinTypes: ["Oily", "Dry", "Combination", "Normal", "Sensitive"],
    concerns: [
      "Acne", "Aging", "Brightening", "Hydration", "Pigmentation",
      "Pores", "Dark Circles", "Uneven Texture", "Sun Protection", "Redness",
    ],
    budgetRanges: [
      { label: "Under ₹500", max: 500 },
      { label: "₹500 - ₹1000", max: 1000 },
      { label: "₹1000 - ₹2000", max: 2000 },
      { label: "₹2000 - ₹5000", max: 5000 },
      { label: "No limit", max: 99999 },
    ],
  });
});

export default metaRouter;
