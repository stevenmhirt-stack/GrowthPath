import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAssistButtonProps {
  fieldName: string;
  formType: "goals" | "levers" | "routines" | "assessment";
  context?: string;
  currentValue?: string;
  onApply?: (suggestion: string) => void;
}

export function AIAssistButton({
  fieldName,
  formType,
  context = "",
  currentValue = "",
  onApply,
}: AIAssistButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getSuggestion = async () => {
    setLoading(true);
    setSuggestion("");

    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fieldName,
          formType,
          context,
          currentValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get suggestion");
      }

      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      toast({
        title: "Error",
        description: "Couldn't get AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApply && suggestion) {
      onApply(suggestion);
      setOpen(false);
      setSuggestion("");
      toast({
        title: "Applied",
        description: "AI suggestion has been applied to your form.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-primary hover:text-primary/80"
          data-testid={`btn-ai-assist-${fieldName}`}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Ask AI</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Writing Assistant
          </DialogTitle>
          <DialogDescription>
            Get AI help with your "{fieldName}" field
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!suggestion && !loading && (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm mb-4">
                Click below to get a personalized suggestion for this field.
              </p>
              <Button onClick={getSuggestion} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Suggestion
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          )}

          {suggestion && !loading && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 border">
                <Textarea
                  value={suggestion}
                  readOnly
                  className="min-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                {onApply && (
                  <Button size="sm" onClick={handleApply} className="gap-1">
                    <Check className="h-4 w-4" />
                    Apply to Form
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getSuggestion}
                  className="gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
