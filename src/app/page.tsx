"use client";

import React from "react";
import FileUploader from "@/components/FileUploader";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [analysisResults, setAnalysisResults] = React.useState(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleFileAnalysis = async (file, fileContent) => {
    setIsAnalyzing(true);
    setError("");

    try {
      // Call to our Gemini-powered API
      const response = await fetch("/api/analyze-cobol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: fileContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze content");
      }

      const results = await response.json();
      setAnalysisResults(results);
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
            Code & Document Analyzer
          </h1>
          <p className="text-muted-foreground">
            Upload your code or document to analyze its complexity using Gemini
            AI
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
          <p>Code & Document Analyzer &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Powered by Gemini AI</p>
        </footer>
      </div>
    </main>
  );
}
