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
  
  const [selections, setSelections] = useState({
    skinType: "",
    concern: "",
    budget: 0
  });

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
      options: metadata.skinTypes.map(st => ({ label: st, value: st }))
    },
    {
      title: "What's your primary skin concern?",
      subtitle: "We'll focus on products that target this specific goal.",
      field: "concern",
      options: metadata.concerns.map(c => ({ label: c, value: c }))
    },
    {
      title: "What's your comfortable budget?",
      subtitle: "Great skin doesn't have to break the bank. Let's find your sweet spot.",
      field: "budget",
      options: metadata.budgetRanges.map(b => ({ label: b.label, value: b.max }))
    }
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
        budget: selections.budget.toString()
      });
      setLocation(`/results?${params.toString()}`);
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background/50 pt-24 pb-12">
      <div className="container max-w-2xl mx-auto px-4 flex-grow flex flex-col">
        {/* Progress header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 text-sm font-medium text-muted-foreground">
            <button 
              onClick={() => step > 1 ? setStep(s => s - 1) : setLocation("/")}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span>Step {step} of {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>

        {/* Question Area */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 key={step}">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {currentStepData.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {currentStepData.subtitle}
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150 key={step}">
          {currentStepData.options.map((option, i) => {
            const isSelected = selections[currentStepData.field as keyof typeof selections] === option.value;
            return (
              <Card 
                key={`${currentStepData.field}-${i}`}
                className={`p-5 cursor-pointer transition-all duration-300 border-2 hover:border-primary/50 ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                    : 'border-transparent bg-card hover:shadow-sm'
                }`}
                onClick={() => setSelections(s => ({ ...s, [currentStepData.field]: option.value }))}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium capitalize">{option.label}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Action */}
        <div className="mt-auto text-center animate-in fade-in duration-500 delay-300 key={step}">
          <Button 
            size="lg" 
            className="w-full md:w-auto md:min-w-[240px] rounded-full text-lg h-14"
            disabled={!canProceed}
            onClick={handleNext}
          >
            {isLastStep ? 'Reveal My Routine' : 'Continue'} 
            {isLastStep ? <Sparkles className="w-5 h-5 ml-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
