"use client";

import React, { useState } from "react";
import FileUploader from "@/components/FileUploader";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  // Check if backend is available on component mount
  React.useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          // Set a timeout to avoid waiting too long
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch (err) {
        console.error("Backend connection error:", err);
        setBackendStatus("offline");
      }
    };

    checkBackendStatus();
  }, []);

  const handleFileAnalysis = async (file, fileContent) => {
    setIsAnalyzing(true);
    setError("");

    try {
      // First try direct backend if available
      if (backendStatus === "online") {
        try {
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
          const directResponse = await fetch(`${backendUrl}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: fileContent }),
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });

          if (directResponse.ok) {
            const results = await directResponse.json();
            setAnalysisResults(results);
            setIsAnalyzing(false);
            return;
          }
        } catch (directErr) {
          console.warn(
            "Direct backend call failed, falling back to API route",
            directErr,
          );
          // Continue to API route fallback
        }
      }

      // Fallback to API route (which may have its own fallback logic)
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
            COBOL Code Complexity Analyzer
          </h1>
          <p className="text-muted-foreground">
            Upload your code or document to analyze its complexity using Gemini
            AI
          </p>
        </header>

        {backendStatus === "offline" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Backend service is not available. Analysis will use limited
              fallback functionality. Please start the Python backend server for
              full features.
            </AlertDescription>
          </Alert>
        )}

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
          <p className="mt-1">Powered by Gemini AI</p>
        </footer>
      </div>
    </main>
  );
}
