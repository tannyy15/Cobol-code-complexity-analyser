"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Upload, FileCode, AlertCircle, Code } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FileUploaderProps {
  onFileAnalysis?: (file: File, content: string) => void;
  isAnalyzing?: boolean;
  error?: string;
}

const FileUploader = ({
  onFileAnalysis = () => {},
  isAnalyzing = false,
  error: externalError = "",
}: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [manualInput, setManualInput] = useState<string>("");

  // Update error state when external error changes
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): boolean => {
    // Support a wider range of file types
    const validExtensions = [
      ".cob",
      ".cbl",
      ".cpy",
      ".txt",
      ".docx",
      ".pdf",
      ".doc",
      ".rtf",
      ".md",
    ];
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (!validExtensions.includes(fileExtension)) {
      setError(
        "Please upload a valid file (.cob, .cbl, .cpy, .txt, .docx, .pdf, .doc, .rtf, .md)",
      );
      return false;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    setFile(file);
    setError("");

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            setFileContent(content);
            onFileAnalysis(file, content);
          } catch (err) {
            console.error("Error processing file content:", err);
            setError("Error processing file content");
          }
        };
        reader.onerror = () => {
          setError("Error reading file");
        };
        reader.readAsText(file);
      }
    }, 100);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      try {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && validateFile(droppedFile)) {
          processFile(droppedFile);
        }
      } catch (err) {
        console.error("Error handling dropped file:", err);
        setError("Error processing dropped file");
      }
    },
    [onFileAnalysis],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        processFile(selectedFile);
      }
    } catch (err) {
      console.error("Error handling file selection:", err);
      setError("Error processing selected file");
    }
  };

  const handleManualInputSubmit = () => {
    if (!manualInput.trim()) {
      setError("Please enter some code to analyze");
      return;
    }

    setError("");
    // Create a virtual file for consistency
    const virtualFile = new File([manualInput], "manual-input.cbl", {
      type: "text/plain",
    });
    setFile(virtualFile);
    setFileContent(manualInput);
    onFileAnalysis(virtualFile, manualInput);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-background border-2">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          COBOL Code Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    Drag and drop your COBOL file
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: .cob, .cbl, .cpy, .txt, .docx, .pdf,
                    .doc, .rtf, .md files up to 10MB
                  </p>
                </div>
                <div className="flex justify-center">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={isAnalyzing}>
                      Select File
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".cob,.cbl,.cpy,.txt,.docx,.pdf,.doc,.rtf,.md"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isAnalyzing}
                    />
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Paste COBOL Code</h3>
              </div>
              <textarea
                className="w-full h-64 p-4 border rounded-md bg-muted/30 font-mono text-sm"
                placeholder="Paste your COBOL code here..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                disabled={isAnalyzing}
              />
              <Button
                onClick={handleManualInputSubmit}
                disabled={isAnalyzing || !manualInput.trim()}
                className="w-full"
              >
                {isAnalyzing ? "Processing..." : "Analyze Code"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {file && uploadProgress < 100 && activeTab === "upload" && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading {file.name}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {fileContent && activeTab === "upload" && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">File Preview:</h4>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-60">
              <pre className="text-xs">
                {fileContent.slice(0, 1000)}
                {fileContent.length > 1000 ? "..." : ""}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {file &&
            activeTab === "upload" &&
            `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
        </div>
        {file && fileContent && activeTab === "upload" && (
          <Button
            onClick={() => onFileAnalysis(file, fileContent)}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Processing..." : "Analyze Content"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FileUploader;
