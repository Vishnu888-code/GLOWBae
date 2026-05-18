import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router = Router();

router.get("/products", async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(desc(productsTable.rating));
  res.json(
    products.map((p) => ({
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
    }))
  );
});

router.get("/products/trending", async (_req, res) => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.rating))
    .limit(8);
  res.json(
    products.map((p) => ({
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
    }))
  );
});

router.get("/products/categories", async (_req, res) => {
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

export default router;
