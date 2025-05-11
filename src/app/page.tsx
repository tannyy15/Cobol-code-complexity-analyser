"use client";

import React from "react";
import FileUploader from "@/components/FileUploader";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [analysisResults, setAnalysisResults] = React.useState(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleFileAnalysis = async (fileContent) => {
    setIsAnalyzing(true);
    setError("");

    try {
      // Call to our simulated ML model API
      const response = await fetch("/api/analyze-cobol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: fileContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze code");
      }

      // In a real implementation, this would be the response from the API
      // For now, we'll use our simulated ML model results
      const mockResults = {
        metrics: {
          linesOfCode: 342,
          ifElseBlocks: 28,
          variableCount: 56,
          nestedDepth: 4,
        },
        complexity: {
          classification: "Moderate",
          confidenceScore: 87.5,
        },
        chartData: {
          labels: [
            "Lines of Code",
            "IF/ELSE Blocks",
            "Variables",
            "Nested Depth",
          ],
          datasets: [
            {
              label: "Code Metrics",
              data: [342, 28, 56, 4],
              backgroundColor: [
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
              ],
              borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
      };

      setAnalysisResults(mockResults);
    } catch (err) {
      console.error("Error analyzing file:", err);
      setError("Failed to analyze the file. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResults(null);
    setError("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-background">
      <div className="w-full max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            COBOL Code Complexity Analyzer
          </h1>
          <p className="text-muted-foreground">
            Upload your COBOL source code to analyze its complexity using
            machine learning
          </p>
        </header>

        <Card className="w-full bg-card">
          <CardContent className="p-6">
            {!analysisResults ? (
              <FileUploader
                onFileAnalysis={handleFileAnalysis}
                isAnalyzing={isAnalyzing}
                error={error}
              />
            ) : (
              <AnalysisDashboard
                results={analysisResults}
                onReset={handleReset}
              />
            )}
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            COBOL Code Complexity Analyzer &copy; {new Date().getFullYear()}
          </p>
          <p className="mt-1">Powered by Machine Learning</p>
        </footer>
      </div>
    </main>
  );
}
