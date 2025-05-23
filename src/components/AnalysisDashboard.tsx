"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart2, AlertCircle } from "lucide-react";
import MetricsVisualizer from "@/components/MetricsVisualizer";
import ComplexityIndicator from "@/components/ComplexityIndicator";

interface AnalysisResult {
  fileName: string;
  metrics: {
    loc: number;
    ifElseBlocks: number;
    variableCount: number;
    nestedDepth: number;
  };
  complexity: {
    classification: "Simple" | "Moderate" | "Complex";
    confidenceScore: number;
  };
  explanation?: string;
  timestamp: string;
}

interface AnalysisDashboardProps {
  results?: any;
  onReset?: () => void;
  isLoading?: boolean;
}

export function AnalysisDashboard({
  results = {
    metrics: {
      loc: 250,
      ifElseBlocks: 15,
      variableCount: 45,
      nestedDepth: 3,
    },
    complexity: {
      classification: "Moderate",
      confidenceScore: 78.5,
    },
    explanation: "This is a sample analysis result.",
    timestamp: new Date().toISOString(),
  },
  onReset = () => {},
  isLoading = false,
}: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const handleExportCSV = () => {
    // This would be implemented to export the analysis data as CSV
    console.log("Exporting CSV...");
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Analyzing COBOL code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Analysis Results
          </h2>
          <p className="text-muted-foreground">
            Analyzed: {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onReset} variant="outline">
            New Analysis
          </Button>
          <Button onClick={handleExportCSV} className="gap-2">
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lines of Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.metrics.loc}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total lines in the COBOL file
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              IF/ELSE Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {results.metrics.ifElseBlocks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Conditional logic structures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Complexity Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {results.complexity.classification}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {results.complexity.confidenceScore}% confidence
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="complexity">Complexity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {results.explanation && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  Gemini AI explanation of the code/document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-md">
                  <p className="text-sm">{results.explanation}</p>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Summary of code analysis metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lines of Code</span>
                    <span>{results.metrics.loc}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">IF/ELSE Blocks</span>
                    <span>{results.metrics.ifElseBlocks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Variable Count</span>
                    <span>{results.metrics.variableCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Nested Depth</span>
                    <span>{results.metrics.nestedDepth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Complexity Assessment</CardTitle>
                <CardDescription>
                  ML-based classification results
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center pt-6">
                <ComplexityIndicator
                  complexity={results.complexity.classification}
                  confidenceScore={results.complexity.confidenceScore}
                  metrics={{
                    loc: results.metrics.loc,
                    ifElseBlocks: results.metrics.ifElseBlocks,
                    variableCount: results.metrics.variableCount,
                    nestedDepth: results.metrics.nestedDepth,
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics Visualization</CardTitle>
              <CardDescription>
                Interactive charts of code metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <MetricsVisualizer
                metrics={{
                  loc: results.metrics.loc,
                  ifElseBlocks: results.metrics.ifElseBlocks,
                  variableCount: results.metrics.variableCount,
                  nestedDepth: results.metrics.nestedDepth,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complexity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Complexity Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of complexity factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Code Size Impact</h4>
                    <p className="text-sm text-muted-foreground">
                      {results.metrics.loc > 500
                        ? "Large codebase"
                        : "Moderate codebase"}{" "}
                      with {results.metrics.loc} lines of code
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <BarChart2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">
                      Control Flow Complexity
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {results.metrics.ifElseBlocks > 20 ? "High" : "Moderate"}{" "}
                      complexity with {results.metrics.ifElseBlocks} conditional
                      blocks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Nesting Depth</h4>
                    <p className="text-sm text-muted-foreground">
                      {results.metrics.nestedDepth > 4 ? "Deep" : "Moderate"}{" "}
                      nesting with maximum depth of{" "}
                      {results.metrics.nestedDepth} levels
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-medium mb-2">
                    ML Classification Confidence
                  </h4>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${results.complexity.confidenceScore}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">0%</span>
                    <span className="text-xs text-muted-foreground">100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
