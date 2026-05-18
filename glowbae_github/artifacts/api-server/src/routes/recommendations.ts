import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { GetRecommendationsBody } from "@workspace/api-zod";
import { rankProducts } from "../lib/cosine";
import { eq } from "drizzle-orm";

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
