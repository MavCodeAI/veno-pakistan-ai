import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getPromptsByCategory } from "@/data/viralPrompts";
import { Sparkles, Heart, Copy } from "lucide-react";
import { toast } from "sonner";

interface PromptCategoriesProps {
  onSelectPrompt: (prompt: string) => void;
}

export const PromptCategories = ({ onSelectPrompt }: PromptCategoriesProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = [
    { id: "asmr", label: "ASMR & Relaxing", icon: "🎧" },
    { id: "nature", label: "Nature", icon: "🌿" },
    { id: "cinematic", label: "Cinematic", icon: "🎬" },
    { id: "food", label: "Food", icon: "🍽️" },
    { id: "abstract", label: "Abstract", icon: "🎨" },
  ];

  const toggleFavorite = (prompt: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(prompt)) {
      newFavorites.delete(prompt);
      toast.info("Removed from favorites");
    } else {
      newFavorites.add(prompt);
      toast.success("Added to favorites!");
    }
    setFavorites(newFavorites);
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied!");
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
      <Tabs defaultValue="asmr" className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-4 bg-muted/50">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
              <span className="mr-1">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-2">
            <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
              {getPromptsByCategory(cat.id).map((prompt, idx) => (
                <div
                  key={idx}
                  className="group relative p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border hover:border-accent transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onSelectPrompt(prompt)}
                      className="flex-1 text-left text-sm"
                    >
                      {prompt}
                    </button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(prompt);
                        }}
                      >
                        <Heart
                          className={`h-3 w-3 ${
                            favorites.has(prompt) ? "fill-accent text-accent" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPrompt(prompt);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {favorites.size > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm font-medium">Favorites</span>
            <Badge variant="secondary" className="ml-auto">
              {favorites.size}
            </Badge>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Array.from(favorites).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt)}
                className="w-full text-left text-xs p-2 bg-accent/10 hover:bg-accent/20 rounded border border-accent/30 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};