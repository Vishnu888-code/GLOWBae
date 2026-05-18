import { pgTable, text, serial, real, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  skinTypes: jsonb("skin_types").$type<string[]>().notNull().default([]),
  concerns: jsonb("concerns").$type<string[]>().notNull().default([]),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  imageUrl: text("image_url"),
  purplleUrl: text("purplle_url").notNull(),
  description: text("description"),
  keyIngredients: jsonb("key_ingredients").$type<string[]>().notNull().default([]),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
