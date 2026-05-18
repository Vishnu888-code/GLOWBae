import { useState } from "react";
import { useGetProducts, useGetProductCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Explore() {
  const { data: products, isLoading: loadingProducts } = useGetProducts();
  const { data: categories, isLoading: loadingCategories } = useGetProductCategories();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredProducts = products?.filter(
    p => activeCategory === "All" || p.category === activeCategory
  ) || [];

  return (
    <div className="min-h-screen pt-24 pb-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold mb-4">The GLOWBae Edit</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Browse our entire curated collection of luxury and essential skincare.
          </p>
        </div>

        {/* Category Filter Strip */}
        <div className="mb-12">
          {loadingCategories ? (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
              <button
                onClick={() => setActiveCategory("All")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === "All" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-secondary/50 text-foreground hover:bg-secondary"
                }`}
              >
                All Products
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeCategory === cat.category 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-secondary/50 text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="capitalize">{cat.category}</span>
                  <Badge variant={activeCategory === cat.category ? "secondary" : "outline"} className="px-1.5 py-0 text-[10px]">
                    {cat.count}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="animate-in fade-in zoom-in-95 duration-500">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-2xl border border-border/50">
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground">Check back later for new additions to this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
