// =============================================================================
// FILE: artifacts/glowbae/src/components/ProductCard.tsx
// GLOWBae — Reusable Product Card Component
// =============================================================================

import { Star, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Product, ProductRecommendation } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
  recommendation?: Omit<ProductRecommendation, "product">;
}

export function ProductCard({ product, recommendation }: ProductCardProps) {
  const isMatch = !!recommendation;

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-muted-foreground">
            No Image
          </div>
        )}

        {/* Top Match Badge */}
        {isMatch && recommendation.rank <= 3 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground shadow-md font-medium tracking-wide">
              Top Match #{recommendation.rank}
            </Badge>
          </div>
        )}
      </div>

      {/* Brand + Name */}
      <CardHeader className="p-4 flex-none space-y-1">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>
          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <CardTitle className="text-lg font-serif leading-snug line-clamp-2" title={product.name}>
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow flex flex-col gap-4">
        {/* AI Match Score Panel (only shown on results page) */}
        {isMatch && (
          <div className="space-y-3 bg-secondary/30 rounded-xl p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Match Score
              </span>
              <span className="font-bold text-primary">
                {Math.round(recommendation.score * 100)}%
              </span>
            </div>
            <Progress value={recommendation.score * 100} className="h-1.5" />

            {/* Match Reasons */}
            {recommendation.matchReasons?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {recommendation.matchReasons.map((reason, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] font-normal px-2 py-0">
                    {reason}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="text-xl font-medium mt-auto">₹{product.price}</div>
      </CardContent>

      {/* Buy on Purplle Button */}
      <CardFooter className="p-4 pt-0 mt-auto">
        <a
          href={product.purplleUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`link-purplle-${product.id}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#8C2A69] hover:bg-[#722055] text-white py-2.5 px-4 rounded-full font-medium transition-colors shadow-sm"
        >
          Buy on Purplle
          <ExternalLink className="w-4 h-4" />
        </a>
      </CardFooter>
    </Card>
  );
}
