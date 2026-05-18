import { Router } from "express";

const router = Router();

router.get("/skin-metadata", (_req, res) => {
  res.json({
    skinTypes: ["Oily", "Dry", "Combination", "Normal", "Sensitive"],
    concerns: [
      "Acne",
      "Aging",
      "Brightening",
      "Hydration",
      "Pigmentation",
      "Pores",
      "Dark Circles",
      "Uneven Texture",
      "Sun Protection",
      "Redness",
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

export default router;
