# =============================================================================
# GLOWBae — Python Flask Backend
# AI Skincare Product Recommender using Cosine Similarity
#
# Run:
#   pip install flask flask-cors numpy
#   python app.py
#
# API runs at: http://localhost:5000
# =============================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from collections import Counter

app = Flask(__name__)
CORS(app)

# =============================================================================
# PRODUCT DATASET (25 products with Purplle buy links)
# =============================================================================

PRODUCTS = [
    {
        "id": "p001",
        "name": "Minimalist 2% Salicylic Acid Serum",
        "brand": "Minimalist",
        "category": "Serum",
        "price": 599,
        "skinTypes": ["Oily", "Combination"],
        "concerns": ["Acne", "Pores", "Uneven Texture"],
        "rating": 4.4,
        "reviewCount": 8920,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/11/3_5fa97f17b6234.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-minimalist-2-salicylic-acid-serum-for-oily-and-acne-prone-skin/p/218093",
        "description": "Lightweight serum with 2% Salicylic Acid that unclogs pores, reduces breakouts and blackheads for clear, smooth skin.",
        "keyIngredients": ["Salicylic Acid 2%", "Niacinamide", "Zinc"]
    },
    {
        "id": "p002",
        "name": "Niacinamide 10% + Zinc 1% Serum",
        "brand": "Minimalist",
        "category": "Serum",
        "price": 649,
        "skinTypes": ["Oily", "Combination", "Normal"],
        "concerns": ["Pores", "Acne", "Brightening"],
        "rating": 4.5,
        "reviewCount": 12450,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/9/3_5f5c3a4e8c0e9.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-minimalist-niacinamide-10-zinc-1-face-serum/p/218090",
        "description": "High-strength niacinamide serum that visibly reduces pore size, controls oil, and evens skin tone.",
        "keyIngredients": ["Niacinamide 10%", "Zinc 1%", "Hyaluronic Acid"]
    },
    {
        "id": "p003",
        "name": "Hyaluronic Acid + PGA 02% Serum",
        "brand": "Minimalist",
        "category": "Serum",
        "price": 599,
        "skinTypes": ["Dry", "Normal", "Sensitive"],
        "concerns": ["Hydration", "Aging"],
        "rating": 4.3,
        "reviewCount": 6780,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/9/3_5f5c3e518c0ea.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-minimalist-hyaluronic-acid-02-pga-serum/p/218092",
        "description": "Multi-molecular hyaluronic acid formula that deeply hydrates and plumps skin from within.",
        "keyIngredients": ["Hyaluronic Acid 2%", "PGA", "Vitamin B5"]
    },
    {
        "id": "p004",
        "name": "Vitamin C 10% Face Serum",
        "brand": "Mamaearth",
        "category": "Serum",
        "price": 699,
        "skinTypes": ["Normal", "Dry", "Combination"],
        "concerns": ["Brightening", "Pigmentation", "Aging"],
        "rating": 4.2,
        "reviewCount": 15320,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/1/6_5ff9d2b3cd6c0.jpg",
        "purplleUrl": "https://www.purplle.com/product/mamaearth-vitamin-c-face-serum-with-vitamin-c-and-turmeric/p/222036",
        "description": "Potent Vitamin C serum that brightens skin, fades dark spots, and provides antioxidant protection.",
        "keyIngredients": ["Vitamin C 10%", "Turmeric Extract", "Hyaluronic Acid"]
    },
    {
        "id": "p005",
        "name": "Ubtan Face Pack",
        "brand": "Mamaearth",
        "category": "Face Pack",
        "price": 349,
        "skinTypes": ["All", "Normal", "Dry"],
        "concerns": ["Brightening", "Pigmentation", "Uneven Texture"],
        "rating": 4.1,
        "reviewCount": 22100,
        "imageUrl": "https://www.purplle.com/images/product/big/2019/1/6_5c4f5b3de61c9.jpg",
        "purplleUrl": "https://www.purplle.com/product/mamaearth-ubtan-face-pack-with-turmeric-saffron/p/181571",
        "description": "Traditional ubtan formula with turmeric and saffron for a natural golden glow.",
        "keyIngredients": ["Turmeric", "Saffron", "Sandalwood", "Chickpea Flour"]
    },
    {
        "id": "p006",
        "name": "Ceramide & Hyaluronic Acid Moisturizer",
        "brand": "Dot & Key",
        "category": "Moisturizer",
        "price": 795,
        "skinTypes": ["Dry", "Sensitive", "Normal"],
        "concerns": ["Hydration", "Redness", "Aging"],
        "rating": 4.5,
        "reviewCount": 9870,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/3/6_605f1a0b3d8e5.jpg",
        "purplleUrl": "https://www.purplle.com/product/dot-key-water-drench-hyaluronic-acid-moisturizer/p/230412",
        "description": "Ultra-lightweight gel moisturizer with ceramides and hyaluronic acid for 72-hour hydration.",
        "keyIngredients": ["Ceramides", "Hyaluronic Acid", "Snow Mushroom Extract"]
    },
    {
        "id": "p007",
        "name": "Aloe Vera Gel",
        "brand": "WOW Skin Science",
        "category": "Gel",
        "price": 249,
        "skinTypes": ["Oily", "Sensitive", "Combination"],
        "concerns": ["Acne", "Redness", "Hydration"],
        "rating": 4.3,
        "reviewCount": 34500,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/3/6_5e7c0e75e85c2.jpg",
        "purplleUrl": "https://www.purplle.com/product/wow-skin-science-99-pure-aloe-vera-multipurpose-beauty-gel/p/206726",
        "description": "Pure 99% Aloe Vera gel that soothes, hydrates and calms irritated skin naturally.",
        "keyIngredients": ["Aloe Vera 99%", "Vitamin E", "Vitamin B3"]
    },
    {
        "id": "p008",
        "name": "Retinol Face Serum",
        "brand": "Plum",
        "category": "Serum",
        "price": 1195,
        "skinTypes": ["Normal", "Combination", "Dry"],
        "concerns": ["Aging", "Uneven Texture", "Pigmentation"],
        "rating": 4.4,
        "reviewCount": 5640,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/6/6_60c52c79ab8c6.jpg",
        "purplleUrl": "https://www.purplle.com/product/plum-0-3-retinol-face-serum-for-fine-lines-wrinkles/p/236821",
        "description": "Gentle 0.3% retinol serum that reduces fine lines, improves skin texture and boosts cell turnover.",
        "keyIngredients": ["Retinol 0.3%", "Bakuchiol", "Hyaluronic Acid", "Vitamin E"]
    },
    {
        "id": "p009",
        "name": "Sunscreen SPF 50+ PA++++ Ultra Light",
        "brand": "Re'equil",
        "category": "Sunscreen",
        "price": 545,
        "skinTypes": ["Oily", "Combination", "Sensitive"],
        "concerns": ["Sun Protection", "Pores", "Acne"],
        "rating": 4.6,
        "reviewCount": 18900,
        "imageUrl": "https://www.purplle.com/images/product/big/2019/6/6_5d0d5e62b3b24.jpg",
        "purplleUrl": "https://www.purplle.com/product/re-equil-ultra-matte-dry-touch-sunscreen-spf-50/p/193561",
        "description": "Ultra-matte, non-greasy sunscreen with SPF 50+ that leaves zero white cast on all skin tones.",
        "keyIngredients": ["Tinosorb M", "Tinosorb S", "Uvinul A Plus", "Zinc Oxide"]
    },
    {
        "id": "p010",
        "name": "Alpha Arbutin 2% + HA Serum",
        "brand": "Minimalist",
        "category": "Serum",
        "price": 699,
        "skinTypes": ["All", "Normal", "Dry", "Combination"],
        "concerns": ["Pigmentation", "Brightening", "Dark Circles"],
        "rating": 4.4,
        "reviewCount": 9210,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/11/3_5fa97f17b6234.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-minimalist-alpha-arbutin-2-ha-serum/p/218095",
        "description": "Alpha Arbutin serum that fades dark spots, evens skin tone and reduces hyperpigmentation.",
        "keyIngredients": ["Alpha Arbutin 2%", "Hyaluronic Acid", "Kojic Acid"]
    },
    {
        "id": "p011",
        "name": "Vitamin C Brightening Face Wash",
        "brand": "Garnier",
        "category": "Face Wash",
        "price": 149,
        "skinTypes": ["Normal", "Combination", "Oily"],
        "concerns": ["Brightening", "Pigmentation", "Uneven Texture"],
        "rating": 4.0,
        "reviewCount": 45600,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/6/6_5ef3ae97c5d72.jpg",
        "purplleUrl": "https://www.purplle.com/product/garnier-skin-naturals-bright-complete-vitamin-c-face-wash/p/204861",
        "description": "Brightening face wash with Vitamin C that removes impurities while revealing a radiant complexion.",
        "keyIngredients": ["Vitamin C", "Lemon Essence", "Niacinamide"]
    },
    {
        "id": "p012",
        "name": "Tea Tree Skin Clearing Face Wash",
        "brand": "The Body Shop",
        "category": "Face Wash",
        "price": 895,
        "skinTypes": ["Oily", "Combination"],
        "concerns": ["Acne", "Pores", "Redness"],
        "rating": 4.3,
        "reviewCount": 12780,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/4/6_5e9f7bce89712.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-body-shop-tea-tree-skin-clearing-facial-wash/p/208621",
        "description": "Purifying face wash with tea tree oil that targets blemishes and leaves skin feeling fresh and clean.",
        "keyIngredients": ["Tea Tree Oil", "Community Fair Trade Tea Tree", "Aloe Vera"]
    },
    {
        "id": "p013",
        "name": "Lakme 9to5 Weightless Mousse Foundation",
        "brand": "Lakme",
        "category": "Foundation",
        "price": 599,
        "skinTypes": ["Normal", "Dry", "Combination"],
        "concerns": ["Uneven Texture", "Brightening"],
        "rating": 4.1,
        "reviewCount": 28900,
        "imageUrl": "https://www.purplle.com/images/product/big/2019/9/6_5d8bc5ea75e12.jpg",
        "purplleUrl": "https://www.purplle.com/product/lakme-9-to-5-weightless-mousse-foundation/p/196271",
        "description": "Featherlight mousse foundation with SPF 30 that gives buildable, natural coverage all day.",
        "keyIngredients": ["SPF 30", "Vitamin E", "Moisturizing Complex"]
    },
    {
        "id": "p014",
        "name": "Ceramide Repair Barrier Cream",
        "brand": "CeraVe",
        "category": "Moisturizer",
        "price": 1499,
        "skinTypes": ["Dry", "Sensitive", "Normal"],
        "concerns": ["Hydration", "Redness", "Aging"],
        "rating": 4.7,
        "reviewCount": 7650,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/7/6_60f1c8e2f5a19.jpg",
        "purplleUrl": "https://www.purplle.com/product/cerave-moisturizing-cream-for-normal-to-dry-skin/p/240132",
        "description": "Dermatologist-recommended moisturizing cream with three essential ceramides for lasting skin barrier repair.",
        "keyIngredients": ["Ceramides 1, 3, 6-II", "Hyaluronic Acid", "MVE Technology"]
    },
    {
        "id": "p015",
        "name": "Kojic Acid & Vitamin C Brightening Serum",
        "brand": "Dot & Key",
        "category": "Serum",
        "price": 895,
        "skinTypes": ["Normal", "Combination", "Dry"],
        "concerns": ["Pigmentation", "Brightening", "Dark Circles"],
        "rating": 4.3,
        "reviewCount": 6230,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/5/6_60b1c3d4e5f78.jpg",
        "purplleUrl": "https://www.purplle.com/product/dot-key-vitamin-c-kojic-acid-dark-spot-correcting-serum/p/235671",
        "description": "Brightening serum that combines Vitamin C and Kojic Acid to fade dark spots and reveal luminous skin.",
        "keyIngredients": ["Kojic Acid", "Vitamin C", "Niacinamide", "Alpha Arbutin"]
    },
    {
        "id": "p016",
        "name": "Peptide Complex Face Serum",
        "brand": "Minimalist",
        "category": "Serum",
        "price": 749,
        "skinTypes": ["Normal", "Dry", "Mature"],
        "concerns": ["Aging", "Hydration", "Uneven Texture"],
        "rating": 4.4,
        "reviewCount": 4890,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/11/3_5fa97f17b6234.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-minimalist-peptide-complex-face-serum/p/218098",
        "description": "Multi-peptide complex that boosts collagen production and visibly firms and plumps the skin.",
        "keyIngredients": ["Argireline", "Matrixyl 3000", "Leuphasyl", "Syn-Ake"]
    },
    {
        "id": "p017",
        "name": "Salicylic Acid 2% Face Wash",
        "brand": "Plum",
        "category": "Face Wash",
        "price": 395,
        "skinTypes": ["Oily", "Combination"],
        "concerns": ["Acne", "Pores", "Uneven Texture"],
        "rating": 4.3,
        "reviewCount": 11230,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/8/6_5f3d8c59e67a3.jpg",
        "purplleUrl": "https://www.purplle.com/product/plum-green-tea-pore-cleansing-face-wash/p/215842",
        "description": "Salicylic acid face wash that deep cleanses pores and prevents breakouts for clear, mattified skin.",
        "keyIngredients": ["Salicylic Acid 2%", "Green Tea Extract", "Glycerin"]
    },
    {
        "id": "p018",
        "name": "SPF 50 Matte Sunscreen Gel",
        "brand": "Lotus Herbals",
        "category": "Sunscreen",
        "price": 350,
        "skinTypes": ["Oily", "Combination"],
        "concerns": ["Sun Protection", "Pores"],
        "rating": 4.1,
        "reviewCount": 19870,
        "imageUrl": "https://www.purplle.com/images/product/big/2018/12/6_5c1891f1ced46.jpg",
        "purplleUrl": "https://www.purplle.com/product/lotus-herbals-safe-sun-uv-screen-matte-gel-pa-spf-50/p/174023",
        "description": "Oil-free matte sunscreen gel with SPF 50 PA+++ that protects and controls shine throughout the day.",
        "keyIngredients": ["Sunscreen Filters", "Cucumber Extract", "Green Tea Extract"]
    },
    {
        "id": "p019",
        "name": "Biotin Hair & Skin Supplement",
        "brand": "WOW Skin Science",
        "category": "Supplement",
        "price": 799,
        "skinTypes": ["All"],
        "concerns": ["Aging", "Brightening", "Hydration"],
        "rating": 4.2,
        "reviewCount": 8760,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/4/6_607f3a4b7e89c.jpg",
        "purplleUrl": "https://www.purplle.com/product/wow-skin-science-biotin-capsules-for-hair-skin/p/233471",
        "description": "High-potency biotin supplement that strengthens hair, improves skin elasticity and promotes nail growth.",
        "keyIngredients": ["Biotin 10000mcg", "Zinc", "Selenium", "Vitamin E"]
    },
    {
        "id": "p020",
        "name": "Under Eye Cream with Caffeine",
        "brand": "Mamaearth",
        "category": "Eye Cream",
        "price": 549,
        "skinTypes": ["All", "Normal", "Dry"],
        "concerns": ["Dark Circles", "Aging", "Hydration"],
        "rating": 4.0,
        "reviewCount": 13450,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/2/6_602b8f3c9e7a5.jpg",
        "purplleUrl": "https://www.purplle.com/product/mamaearth-bye-bye-dark-circles-eye-cream/p/228543",
        "description": "Caffeine-powered under eye cream that depuffs, brightens dark circles and hydrates the delicate eye area.",
        "keyIngredients": ["Caffeine", "Cucumber Extract", "Vitamin C", "Hyaluronic Acid"]
    },
    {
        "id": "p021",
        "name": "Azelaic Acid 10% Face Cream",
        "brand": "Minimalist",
        "category": "Moisturizer",
        "price": 699,
        "skinTypes": ["Oily", "Combination", "Sensitive"],
        "concerns": ["Acne", "Redness", "Pigmentation"],
        "rating": 4.3,
        "reviewCount": 5670,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/1/3_5ffb4e1f8c0e1.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-minimalist-azelaic-acid-10-face-cream/p/222890",
        "description": "Multifunctional azelaic acid cream that targets acne, rosacea and post-inflammatory hyperpigmentation.",
        "keyIngredients": ["Azelaic Acid 10%", "Niacinamide", "Ceramides"]
    },
    {
        "id": "p022",
        "name": "Sulphur 1% Anti-Acne Serum",
        "brand": "Minimalist",
        "category": "Serum",
        "price": 849,
        "skinTypes": ["Oily", "Combination"],
        "concerns": ["Acne", "Pores"],
        "rating": 4.2,
        "reviewCount": 4320,
        "imageUrl": "https://www.purplle.com/images/product/big/2020/11/3_5fa97f17b6234.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-minimalist-sulphur-1-acne-care-serum/p/218100",
        "description": "Sulfur-based serum with encapsulated salicylic acid that rapidly reduces active breakouts.",
        "keyIngredients": ["Sulphur 1%", "Salicylic Acid", "Niacinamide"]
    },
    {
        "id": "p023",
        "name": "Moringa & Vitamin E Overnight Cream",
        "brand": "Forest Essentials",
        "category": "Night Cream",
        "price": 2195,
        "skinTypes": ["Dry", "Normal", "Mature"],
        "concerns": ["Aging", "Hydration", "Brightening"],
        "rating": 4.6,
        "reviewCount": 3210,
        "imageUrl": "https://www.purplle.com/images/product/big/2019/11/6_5dca6f7f4e1b3.jpg",
        "purplleUrl": "https://www.purplle.com/product/forest-essentials-facial-night-cream-soundarya-youth-elixir/p/198643",
        "description": "Luxurious Ayurvedic night cream with moringa and vitamin E that deeply nourishes and rejuvenates skin overnight.",
        "keyIngredients": ["Moringa Oil", "Vitamin E", "Saffron", "Ashwagandha"]
    },
    {
        "id": "p024",
        "name": "AHA 30% + BHA 2% Peeling Solution",
        "brand": "Minimalist",
        "category": "Exfoliant",
        "price": 699,
        "skinTypes": ["Normal", "Combination", "Oily"],
        "concerns": ["Uneven Texture", "Brightening", "Acne"],
        "rating": 4.5,
        "reviewCount": 7840,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/3/3_605d1e2f8c0e4.jpg",
        "purplleUrl": "https://www.purplle.com/product/the-minimalist-aha-30-bha-2-peeling-solution/p/229761",
        "description": "Professional-grade chemical exfoliant that resurfaces skin, reduces congestion and reveals a brighter complexion.",
        "keyIngredients": ["Glycolic Acid 25%", "Lactic Acid 5%", "Salicylic Acid 2%", "Hyaluronic Acid"]
    },
    {
        "id": "p025",
        "name": "Rice & Ceramide Moisturizing Serum",
        "brand": "Some By Mi",
        "category": "Serum",
        "price": 1299,
        "skinTypes": ["All", "Dry", "Sensitive"],
        "concerns": ["Hydration", "Brightening", "Aging"],
        "rating": 4.5,
        "reviewCount": 6780,
        "imageUrl": "https://www.purplle.com/images/product/big/2021/8/6_6121f3ab7e8c9.jpg",
        "purplleUrl": "https://www.purplle.com/product/some-by-mi-yuja-niacin-brightening-moisture-gel-cream/p/242891",
        "description": "Korean beauty-inspired serum with rice extract and ceramides for intense brightening and hydration.",
        "keyIngredients": ["Rice Bran Extract", "Ceramides", "Niacinamide", "Panthenol"]
    },
]

# =============================================================================
# COSINE SIMILARITY ENGINE
# =============================================================================

SKIN_TYPES = ["oily", "dry", "combination", "normal", "sensitive"]
CONCERNS = [
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
]


def encode_product_vector(skin_types: list, concerns: list, price: float, max_price: float) -> np.ndarray:
    """
    One-hot encode a product into a feature vector:
      [skin_type_1, ..., skin_type_5, concern_1, ..., concern_10, price_norm]
    """
    skin_vec = [
        1 if s in [x.lower() for x in skin_types] else 0
        for s in SKIN_TYPES
    ]
    concern_vec = [
        1 if c in [x.lower() for x in concerns] else 0
        for c in CONCERNS
    ]
    price_norm = (1 - price / max_price) if max_price > 0 else 0
    return np.array(skin_vec + concern_vec + [price_norm], dtype=float)


def encode_query_vector(skin_type: str, concern: str) -> np.ndarray:
    """
    One-hot encode a user query into a feature vector.
    Price score is always 1.0 (user wants to spend their full budget).
    """
    skin_vec = [1 if s == skin_type.lower() else 0 for s in SKIN_TYPES]
    concern_vec = [1 if c == concern.lower() else 0 for c in CONCERNS]
    return np.array(skin_vec + concern_vec + [1.0], dtype=float)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """
    Cosine similarity = (A · B) / (|A| × |B|)
    Returns a value in [0, 1]. Higher = more similar.
    """
    dot = np.dot(a, b)
    mag_a = np.linalg.norm(a)
    mag_b = np.linalg.norm(b)
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return float(dot / (mag_a * mag_b))


def rank_products(skin_type: str, concern: str, budget: float) -> list:
    """
    Main recommendation function:
    1. Filter products by budget
    2. Encode each product and the query as feature vectors
    3. Compute cosine similarity for each product
    4. Sort by score descending
    5. Return top 10 with match reasons
    """
    filtered = [p for p in PRODUCTS if p["price"] <= budget]
    if not filtered:
        return []

    max_price = max(p["price"] for p in filtered)
    query_vec = encode_query_vector(skin_type, concern)

    scored = []
    for product in filtered:
        prod_vec = encode_product_vector(
            product["skinTypes"],
            product["concerns"],
            product["price"],
            max_price
        )
        score = cosine_similarity(query_vec, prod_vec)

        # Generate human-readable match reasons
        match_reasons = []
        skin_match = skin_type.lower() in [s.lower() for s in product["skinTypes"]] \
                     or "all" in [s.lower() for s in product["skinTypes"]]
        concern_match = concern.lower() in [c.lower() for c in product["concerns"]]

        if skin_match:
            match_reasons.append(f"Formulated for {skin_type} skin")
        if concern_match:
            match_reasons.append(f"Targets {concern}")
        if product["price"] <= budget * 0.6:
            match_reasons.append("Great value for money")
        if not match_reasons:
            match_reasons.append("Universally beneficial formula")

        scored.append({
            "product": product,
            "score": round(score, 4),
            "matchReasons": match_reasons
        })

    # Sort by score (highest first)
    scored.sort(key=lambda x: x["score"], reverse=True)

    # Return top 10 with rank
    return [{"rank": i + 1, **s} for i, s in enumerate(scored[:10])]


# =============================================================================
# API ROUTES
# =============================================================================

@app.route("/api/healthz", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


@app.route("/api/skin-metadata", methods=["GET"])
def get_skin_metadata():
    """Returns all available options for the quiz."""
    return jsonify({
        "skinTypes": ["Oily", "Dry", "Combination", "Normal", "Sensitive"],
        "concerns": [
            "Acne", "Aging", "Brightening", "Hydration", "Pigmentation",
            "Pores", "Dark Circles", "Uneven Texture", "Sun Protection", "Redness"
        ],
        "budgetRanges": [
            {"label": "Under ₹500", "max": 500},
            {"label": "₹500 - ₹1000", "max": 1000},
            {"label": "₹1000 - ₹2000", "max": 2000},
            {"label": "₹2000 - ₹5000", "max": 5000},
            {"label": "No limit", "max": 99999},
        ]
    })


@app.route("/api/products", methods=["GET"])
def get_products():
    """Returns all products sorted by rating."""
    sorted_products = sorted(PRODUCTS, key=lambda p: p["rating"], reverse=True)
    return jsonify(sorted_products)


@app.route("/api/products/trending", methods=["GET"])
def get_trending():
    """Returns top 8 products by rating."""
    sorted_products = sorted(PRODUCTS, key=lambda p: p["rating"], reverse=True)
    return jsonify(sorted_products[:8])


@app.route("/api/products/categories", methods=["GET"])
def get_categories():
    """Returns product count per category."""
    category_counts = Counter(p["category"] for p in PRODUCTS)
    result = [
        {"category": cat, "count": count}
        for cat, count in category_counts.most_common()
    ]
    return jsonify(result)


@app.route("/api/recommendations", methods=["POST"])
def get_recommendations():
    """
    AI recommendation endpoint.

    Request body:
        {
            "skinType": "Oily",
            "concern": "Acne",
            "budget": 1000
        }

    Response: Array of ranked recommendations with cosine similarity scores.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    skin_type = data.get("skinType", "").strip()
    concern = data.get("concern", "").strip()
    budget = data.get("budget", 0)

    # Validate inputs
    if not skin_type:
        return jsonify({"error": "skinType is required"}), 400
    if not concern:
        return jsonify({"error": "concern is required"}), 400
    if not isinstance(budget, (int, float)) or budget <= 0:
        return jsonify({"error": "budget must be a positive number"}), 400

    results = rank_products(skin_type, concern, float(budget))
    return jsonify(results)


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("  GLOWBae Flask Backend")
    print("  AI Skincare Product Recommender")
    print("  Running at: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)
