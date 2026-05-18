# GLOWBae — AI Skincare Product Recommender

GLOWBae is an AI-powered skincare product recommender that uses **cosine similarity** to match products to your skin type, concern, and budget — with direct Purplle.com buy links.

---

## Live Preview

> Take the 3-step quiz → get AI-ranked product recommendations → buy directly on Purplle.

---

## Features

- **AI Recommendation Engine** — cosine similarity on skin type, concern, and price feature vectors
- **Personalized Results** — ranked by match score with human-readable reasons
- **Budget-Aware Ranking** — products filtered and scored within your budget
- **25 Curated Products** — serums, moisturizers, sunscreens, face washes, eye creams from top Indian brands
- **Direct Purplle Links** — every product card links to the Purplle.com listing
- **Modern UI** — SkinKraft-inspired rose-gold aesthetic, Playfair Display font, skeleton loaders, animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | Wouter |
| Data Fetching | TanStack React Query |
| Backend (production) | Express.js (Node.js 24) |
| Backend (local alt) | Python Flask |
| AI Engine | Cosine Similarity |
| Database | PostgreSQL + Drizzle ORM |
| API Contract | OpenAPI 3.1 + Orval codegen |
| Validation | Zod v4 |
| Build | Vite (frontend), esbuild (backend) |

---

## Project Structure

```
glowbae/
├── artifacts/
│   ├── api-server/             # Express.js backend
│   │   └── src/
│   │       ├── lib/cosine.ts   # AI cosine similarity engine
│   │       └── routes/         # API route handlers
│   └── glowbae/                # React frontend
│       └── src/
│           ├── pages/          # Home, Quiz, Results, Explore
│           └── components/     # ProductCard, Layout
├── lib/
│   ├── api-spec/openapi.yaml   # OpenAPI contract (source of truth)
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Drizzle ORM schema + client
├── flask_backend/              # Standalone Python Flask backend
│   ├── app.py                  # Flask API with cosine engine + full dataset
│   └── requirements.txt
└── README.md
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Hero landing page, trending products, how-it-works |
| `/quiz` | 3-step skin quiz: skin type → concern → budget |
| `/results` | AI-ranked recommendations with match scores + Purplle links |
| `/explore` | Full product catalog with category filters |

---

## How the AI Works

```
User Input → [Skin Type, Concern, Budget]
                    ↓
         One-hot encode feature vectors:
         SkinType vec: [oily, dry, combination, normal, sensitive]
         Concern vec:  [acne, aging, brightening, hydration, ...]
         Price score:  normalized 0–1 (lower price → higher score)
                    ↓
         Each product → same encoding
                    ↓
         Cosine Similarity = (A · B) / (|A| × |B|)
                    ↓
         Filter by budget → rank by score → return top 10
```

---

## Option A — Run with Node.js (Full Stack)

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/glowbae.git
cd glowbae

# Install all dependencies
pnpm install

# Set environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/glowbae"

# Push database schema
pnpm --filter @workspace/db run push

# Seed products (run once)
node scripts/seed.js

# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# In a new terminal, start the frontend (port 5173)
pnpm --filter @workspace/glowbae run dev
```

Open `http://localhost:5173`

### Regenerate API types (after OpenAPI changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Option B — Run with Python Flask (Simpler Local Setup)

The `flask_backend/` folder contains a fully self-contained Flask backend with the complete product dataset and cosine similarity engine built in — **no database required**.

### Prerequisites

```bash
pip install flask flask-cors numpy
```

### Run

```bash
cd flask_backend
python app.py
# API runs at http://localhost:5000
```

Then start the React frontend:

```bash
cd artifacts/glowbae
# Update vite.config.ts to proxy /api to http://localhost:5000
pnpm dev
```

### Flask API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/skin-metadata` | Quiz options (skin types, concerns, budgets) |
| `GET` | `/api/products` | Full product catalog |
| `GET` | `/api/products/trending` | Top 8 by rating |
| `GET` | `/api/products/categories` | Category breakdown |
| `POST` | `/api/recommendations` | AI recommendations |

#### Example recommendation request

```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"skinType": "Oily", "concern": "Acne", "budget": 1000}'
```

#### Example response

```json
[
  {
    "rank": 1,
    "score": 0.9428,
    "matchReasons": ["Formulated for Oily skin", "Targets Acne"],
    "product": {
      "id": "p001",
      "name": "Minimalist 2% Salicylic Acid Serum",
      "brand": "Minimalist",
      "category": "Serum",
      "price": 599,
      "rating": 4.4,
      "purplleUrl": "https://www.purplle.com/product/...",
      "keyIngredients": ["Salicylic Acid 2%", "Niacinamide", "Zinc"]
    }
  }
]
```

---

## Product Dataset (25 Products)

| Brand | Products |
|---|---|
| Minimalist | Salicylic Acid Serum, Niacinamide Serum, Hyaluronic Acid Serum, Alpha Arbutin Serum, Peptide Serum, Azelaic Acid Cream, Sulphur Serum, AHA/BHA Peeling Solution |
| Mamaearth | Vitamin C Serum, Ubtan Face Pack, Under Eye Cream |
| Dot & Key | Ceramide Moisturizer, Kojic Acid Serum |
| Plum | Retinol Serum, Salicylic Face Wash |
| Re'equil | SPF 50+ Sunscreen |
| CeraVe | Ceramide Repair Cream |
| WOW Skin Science | Aloe Vera Gel, Biotin Supplement |
| Garnier | Vitamin C Face Wash |
| The Body Shop | Tea Tree Face Wash |
| Lakme | 9to5 Foundation |
| Lotus Herbals | SPF 50 Sunscreen Gel |
| Forest Essentials | Moringa Night Cream |
| Some By Mi | Rice & Ceramide Serum |

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Node.js backend only) |
| `PORT` | API server port (default: 8080) |

---

## Design System

- **Primary**: Deep Burgundy `hsl(345, 40%, 35%)`
- **Secondary**: Blush Rose `hsl(11, 49%, 85%)`
- **Background**: Warm Cream `hsl(30, 50%, 98%)`
- **Font (Serif)**: Playfair Display
- **Font (Sans)**: Plus Jakarta Sans
- **Purplle Button**: `#8C2A69` (Purplle brand color)

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License — feel free to use, modify, and distribute.

---

*Built with love for the glow-obsessed.*
