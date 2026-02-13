import { useTutorial } from "./TutorialProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";

export function TutorialMenu() {
  const { startTutorial, availableTutorials, completedTutorials } = useTutorial();

  const incompleteTutorials = availableTutorials.filter(
    (t) => !completedTutorials.includes(t.id)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="button-tutorial-menu"
        >
          <HelpCircle className="h-5 w-5" />
          {incompleteTutorials.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {incompleteTutorials.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Interactive Tutorials
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTutorials.map((tutorial) => {
          const isCompleted = completedTutorials.includes(tutorial.id);
          return (
            <DropdownMenuItem
              key={tutorial.id}
              onClick={() => startTutorial(tutorial.id)}
              className="flex items-start gap-3 py-3 cursor-pointer"
              data-testid={`menu-item-tutorial-${tutorial.id}`}
            >
              <div className="mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <PlayCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tutorial.name}</span>
                  {isCompleted && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Done
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tutorial.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tutorial.steps.length} steps
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-xs text-muted-foreground text-center">
          {completedTutorials.length} of {availableTutorials.length} completed
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
