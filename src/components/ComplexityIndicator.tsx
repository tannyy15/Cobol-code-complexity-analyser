"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ComplexityIndicatorProps {
  complexity?: "Simple" | "Moderate" | "Complex";
  confidenceScore?: number;
  metrics?: {
    loc?: number;
    ifElseBlocks?: number;
    variableCount?: number;
    nestedDepth?: number;
  };
}

const ComplexityIndicator = ({
  complexity = "Moderate",
  confidenceScore = 75,
  metrics = {
    loc: 250,
    ifElseBlocks: 15,
    variableCount: 30,
    nestedDepth: 3,
  },
}: ComplexityIndicatorProps) => {
  // Determine color based on complexity
  const getComplexityColor = () => {
    switch (complexity) {
      case "Simple":
        return "bg-green-500";
      case "Moderate":
        return "bg-yellow-500";
      case "Complex":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getComplexityTextColor = () => {
    switch (complexity) {
      case "Simple":
        return "text-green-500";
      case "Moderate":
        return "text-yellow-500";
      case "Complex":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getBadgeVariant = () => {
    switch (complexity) {
      case "Simple":
        return "secondary";
      case "Moderate":
        return "default";
      case "Complex":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Complexity Classification</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Classification based on code metrics and ML analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          {/* Complexity Badge */}
          <div className="flex justify-center">
            <Badge variant={getBadgeVariant()} className="text-lg py-2 px-6">
              {complexity}
            </Badge>
          </div>

          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Confidence Score</span>
              <span className="text-sm font-bold">{confidenceScore}%</span>
            </div>
            <Progress value={confidenceScore} className="h-2" />
          </div>

          {/* Metrics Summary */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                Lines of Code
              </span>
              <span className="text-lg font-semibold">{metrics.loc}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                IF/ELSE Blocks
              </span>
              <span className="text-lg font-semibold">
                {metrics.ifElseBlocks}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Variables</span>
              <span className="text-lg font-semibold">
                {metrics.variableCount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                Nested Depth
              </span>
              <span className="text-lg font-semibold">
                {metrics.nestedDepth}
              </span>
            </div>
          </div>

          {/* Visual Indicator */}
          <div className="pt-2">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getComplexityColor()}`}
                style={{
                  width:
                    complexity === "Simple"
                      ? "33%"
                      : complexity === "Moderate"
                        ? "66%"
                        : "100%",
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Simple</span>
              <span>Moderate</span>
              <span>Complex</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplexityIndicator;
