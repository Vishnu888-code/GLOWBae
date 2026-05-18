import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetRecommendations } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Sparkles, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Results() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const skinType = searchParams.get("skinType");
  const concern = searchParams.get("concern");
  const budget = Number(searchParams.get("budget"));

  const { mutate: getRecommendations, data: recommendations, isPending } = useGetRecommendations();

  useEffect(() => {
    if (!skinType || !concern || !budget) {
      setLocation("/quiz");
      return;
    }

    getRecommendations({
      data: {
        skinType,
        concern,
        budget
      }
    });
  }, [skinType, concern, budget, setLocation]);

  if (isPending) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-background/50 flex flex-col items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-pulse mb-6" />
        <h2 className="font-serif text-2xl font-medium animate-pulse mb-12">Curating your perfect routine...</h2>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <RefreshCcw className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-4">No perfect matches found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We couldn't find products that exactly match your criteria. Try adjusting your budget or exploring our full catalog.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setLocation("/quiz")}>Take Quiz Again</Button>
          <Button onClick={() => setLocation("/explore")}>Explore All Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full text-sm font-medium text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            Your Custom Routine
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Meet your new holy grails.
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on your profile ({skinType} skin, targeting {concern}), we've analyzed thousands of ingredients to find your perfect matches under ₹{budget}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((rec, i) => (
            <div 
              key={rec.product.id} 
              className="animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <ProductCard 
                product={rec.product} 
                recommendation={{
                  score: rec.score,
                  rank: rec.rank,
                  matchReasons: rec.matchReasons
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <Button variant="outline" size="lg" className="rounded-full" onClick={() => setLocation("/quiz")}>
            Refine Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
