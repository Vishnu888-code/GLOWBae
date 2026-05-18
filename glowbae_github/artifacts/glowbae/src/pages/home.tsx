import { Link } from "wouter";
import { useGetTrendingProducts } from "@workspace/api-client-react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero.png";
import textureImage from "@/assets/texture.png";

export default function Home() {
  const { data: trendingProducts, isLoading } = useGetTrendingProducts();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
          <img src={heroImage} alt="Glowing skin models" className="w-full h-full object-cover object-center opacity-40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-primary mb-6 animate-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            Your AI Skincare Bestie
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 animate-in slide-in-from-bottom-8 duration-700 delay-150">
            Discover the exact <br className="hidden md:block" />
            products your skin craves.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-300">
            GLOWBae uses scientific precision to match your unique skin type, concerns, and budget to the perfect luxury and everyday skincare essentials.
          </p>
          <div className="animate-in slide-in-from-bottom-8 duration-700 delay-500">
            <Link 
              href="/quiz" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
            >
              Find My Routine
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">How GLOWBae Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to your most radiant skin yet.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Tell us about your skin", desc: "Share your skin type, primary concerns, and what you're looking to spend." },
              { step: "02", title: "AI analyzes the ingredients", desc: "Our algorithm cross-references thousands of products and their active ingredients." },
              { step: "03", title: "Get your personalized routine", desc: "Discover highly targeted recommendations with exact match scores." }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6 text-xl font-serif font-bold text-primary group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Showcase */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 z-0">
           <img src={textureImage} alt="Cream texture" className="w-full h-full object-cover object-left" />
           <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
              <p className="text-muted-foreground max-w-xl">The most loved products by the GLOWBae community this week.</p>
            </div>
            <Link href="/explore" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Explore All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : trendingProducts && trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No trending products available at the moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
