// =============================================================================
// FILE: artifacts/glowbae/src/pages/quiz.tsx
// GLOWBae — 3-Step Skin Quiz Page
// =============================================================================

import { useState } from "react";
import { useLocation } from "wouter";
import { useGetSkinMetadata } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { data: metadata, isLoading } = useGetSkinMetadata();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({ skinType: "", concern: "", budget: 0 });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg space-y-8">
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
          <div className="grid gap-4 mt-8">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) return null;

  const steps = [
    {
      title: "How would you describe your skin?",
      subtitle: "Let's start with the basics to build your foundation.",
      field: "skinType",
      options: metadata.skinTypes.map((st) => ({ label: st, value: st })),
    },
    {
      title: "What's your primary skin concern?",
      subtitle: "We'll focus on products that target this specific goal.",
      field: "concern",
      options: metadata.concerns.map((c) => ({ label: c, value: c })),
    },
    {
      title: "What's your comfortable budget?",
      subtitle: "Great skin doesn't have to break the bank.",
      field: "budget",
      options: metadata.budgetRanges.map((b) => ({ label: b.label, value: b.max })),
    },
  ];

  const currentStepData = steps[step - 1];
  const progress = (step / steps.length) * 100;
  const isLastStep = step === steps.length;
  const canProceed = !!selections[currentStepData.field as keyof typeof selections];

  const handleNext = () => {
    if (isLastStep) {
      const params = new URLSearchParams({
        skinType: selections.skinType,
        concern: selections.concern,
        budget: selections.budget.toString(),
      });
      setLocation(`/results?${params.toString()}`);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background/50 pt-24 pb-12">
      <div className="container max-w-2xl mx-auto px-4 flex-grow flex flex-col">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 text-sm font-medium text-muted-foreground">
            <button
              onClick={() => (step > 1 ? setStep((s) => s - 1) : setLocation("/"))}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span>Step {step} of {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>

        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {currentStepData.title}
          </h1>
          <p className="text-muted-foreground text-lg">{currentStepData.subtitle}</p>
        </div>

        <div className="grid gap-4 mb-12">
          {currentStepData.options.map((option, i) => {
            const isSelected =
              selections[currentStepData.field as keyof typeof selections] === option.value;
            return (
              <Card
                key={`${currentStepData.field}-${i}`}
                className={`p-5 cursor-pointer transition-all duration-300 border-2 hover:border-primary/50 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                    : "border-transparent bg-card hover:shadow-sm"
                }`}
                onClick={() =>
                  setSelections((s) => ({ ...s, [currentStepData.field]: option.value }))
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium capitalize">{option.label}</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-auto text-center">
          <Button
            size="lg"
            className="w-full md:w-auto md:min-w-[240px] rounded-full text-lg h-14"
            disabled={!canProceed}
            onClick={handleNext}
          >
            {isLastStep ? "Reveal My Routine" : "Continue"}
            {isLastStep ? (
              <Sparkles className="w-5 h-5 ml-2" />
            ) : (
              <ArrowRight className="w-5 h-5 ml-2" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


// =============================================================================
// FILE: artifacts/glowbae/src/pages/results.tsx
// GLOWBae — AI Recommendations Results Page
// =============================================================================

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetRecommendations } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Sparkles, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Results() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const skinType = searchParams.get("skinType");
  const concern = searchParams.get("concern");
  const budget = Number(searchParams.get("budget"));

  const {
    mutate: getRecommendations,
    data: recommendations,
    isPending,
  } = useGetRecommendations();

  useEffect(() => {
    if (!skinType || !concern || !budget) {
      setLocation("/quiz");
      return;
    }
    getRecommendations({ data: { skinType, concern, budget } });
  }, [skinType, concern, budget]);

  if (isPending) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-background/50 flex flex-col items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-pulse mb-6" />
        <h2 className="font-serif text-2xl font-medium animate-pulse mb-12">
          Curating your perfect routine...
        </h2>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
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
          Try adjusting your budget or exploring our full catalog.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setLocation("/quiz")}>
            Take Quiz Again
          </Button>
          <Button onClick={() => setLocation("/explore")}>Explore All Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full text-sm font-medium text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            Your Custom Routine
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Meet your new holy grails.
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on your profile ({skinType} skin, targeting {concern}), we found your
            perfect matches under ₹{budget}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((rec, i) => (
            <div
              key={rec.product.id}
              className="animate-in fade-in slide-in-from-bottom-12 duration-700"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <ProductCard
                product={rec.product}
                recommendation={{
                  score: rec.score,
                  rank: rec.rank,
                  matchReasons: rec.matchReasons,
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
