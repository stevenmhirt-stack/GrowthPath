import { useEffect, useState, useCallback } from "react";
import { useTutorial } from "./TutorialProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialOverlay() {
  const {
    activeTutorial,
    currentStepIndex,
    isActive,
    nextStep,
    previousStep,
    skipTutorial,
  } = useTutorial();

  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentStep = activeTutorial?.steps[currentStepIndex];

  const updatePositions = useCallback(() => {
    if (!currentStep?.targetSelector) {
      setTargetPosition(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = currentStep.highlightPadding ?? 8;
      setTargetPosition({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) return;

    updatePositions();
    
    const handleResize = () => updatePositions();
    const handleScroll = () => updatePositions();
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    
    const observer = new MutationObserver(updatePositions);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [isActive, currentStepIndex, updatePositions]);

  useEffect(() => {
    if (!currentStep) return;

    const calculateTooltipPosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 400;
      const tooltipHeight = 200;
      const margin = 20;

      let top = viewportHeight / 2 - tooltipHeight / 2;
      let left = viewportWidth / 2 - tooltipWidth / 2;

      if (targetPosition) {
        const placement = currentStep.placement || "bottom";
        
        switch (placement) {
          case "top":
            top = targetPosition.top - tooltipHeight - margin;
            left = targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2;
            break;
          case "bottom":
            top = targetPosition.top + targetPosition.height + margin;
            left = targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2;
            break;
          case "left":
            top = targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2;
            left = targetPosition.left - tooltipWidth - margin;
            break;
          case "right":
            top = targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2;
            left = targetPosition.left + targetPosition.width + margin;
            break;
        }

        left = Math.max(margin, Math.min(left, viewportWidth - tooltipWidth - margin));
        top = Math.max(margin, Math.min(top, viewportHeight - tooltipHeight - margin));
      }

      setTooltipPosition({ top, left });
    };

    calculateTooltipPosition();
  }, [currentStep, targetPosition]);

  if (!isActive || !activeTutorial || !currentStep) return null;

  const progress = ((currentStepIndex + 1) / activeTutorial.steps.length) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeTutorial.steps.length - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-auto"
          style={{
            background: targetPosition
              ? `radial-gradient(ellipse at ${targetPosition.left + targetPosition.width / 2}px ${targetPosition.top + targetPosition.height / 2}px, transparent ${Math.max(targetPosition.width, targetPosition.height)}px, rgba(0, 0, 0, 0.75) ${Math.max(targetPosition.width, targetPosition.height) + 100}px)`
              : "rgba(0, 0, 0, 0.75)",
          }}
          onClick={skipTutorial}
        />

        {targetPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-2 border-primary rounded-lg pointer-events-none"
            style={{
              top: targetPosition.top,
              left: targetPosition.left,
              width: targetPosition.width,
              height: targetPosition.height,
              boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.4)",
            }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="absolute pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: 400,
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          <Card className="shadow-2xl border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Step {currentStepIndex + 1} of {activeTutorial.steps.length}
                    </p>
                    <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={skipTutorial}
                  data-testid="button-skip-tutorial"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {currentStep.description}
              </p>
              <Progress value={progress} className="mt-4 h-1.5" />
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousStep}
                disabled={isFirstStep}
                data-testid="button-tutorial-previous"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={nextStep}
                data-testid="button-tutorial-next"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
