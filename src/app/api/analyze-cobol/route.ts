import { NextResponse } from "next/server";

// Gemini-based code and document analyzer
class GeminiCodeAnalyzer {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  // Extract basic metrics from the code/document
  private extractBasicMetrics(content: string) {
    // Count lines (rough estimate)
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    const linesOfCode = lines.length;

    // Count conditional blocks (simplified)
    const ifElseBlocks = (
      content.match(/\bIF\b|\bELSE\b|\bCASE\b|\bWHEN\b|\bSWITCH\b/gi) || []
    ).length;

    // Count variables (simplified approach)
    const variableMatches =
      content.match(
        /\b(?:var|let|const|dim|int|string|float|double|boolean|char|long)\s+[a-zA-Z0-9_]+/gi,
      ) || [];
    const variableCount = variableMatches.length;

    // Estimate nested depth (simplified)
    const nestedMatches =
      content.match(/[{(\[]|\bIF\b|\bFOR\b|\bWHILE\b|\bDO\b/gi) || [];
    const nestedDepth = Math.min(Math.ceil(nestedMatches.length / 15), 10);

    return {
      loc: linesOfCode,
      ifElseBlocks,
      variableCount,
      nestedDepth,
    };
  }

  // Call Gemini API for code analysis
  private async callGeminiAPI(content: string) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    try {
      const prompt = `
        Analyze the following code or document content and provide:
        1. A brief explanation of what this code/document is about
        2. Classification of complexity (Simple, Moderate, or Complex)
        3. Confidence score for your classification (0-100)
        4. Key factors that influenced your classification
        
        Content to analyze:
        ${content.substring(0, 8000)} // Limit content length
      `;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseGeminiResponse(data);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Fallback to rule-based classification if API fails
      return this.fallbackClassification(content);
    }
  }

  // Parse Gemini API response
  private parseGeminiResponse(response: any) {
    try {
      // Extract the text from Gemini response
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Extract classification (Simple, Moderate, Complex)
      let classification = "Moderate"; // Default
      if (text.match(/\bSimple\b/i)) classification = "Simple";
      else if (text.match(/\bComplex\b/i)) classification = "Complex";

      // Extract confidence score if present, or generate one
      const confidenceMatch = text.match(/confidence[:\s]+([0-9\.]+)/i);
      const confidenceScore = confidenceMatch
        ? parseFloat(confidenceMatch[1])
        : classification === "Simple"
          ? 85 + Math.random() * 10
          : classification === "Moderate"
            ? 75 + Math.random() * 15
            : 80 + Math.random() * 15;

      // Extract explanation
      const explanation = text.substring(0, 500); // Limit explanation length

      return {
        classification,
        confidenceScore: parseFloat(confidenceScore.toFixed(1)),
        explanation,
      };
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return this.fallbackClassification("");
    }
  }

  // Fallback classification when Gemini API fails
  private fallbackClassification(content: string) {
    const metrics = this.extractBasicMetrics(content);

    // Simple scoring system
    let complexityScore = 0;

    // Lines of code contribution
    if (metrics.loc < 100) complexityScore += 1;
    else if (metrics.loc < 300) complexityScore += 2;
    else if (metrics.loc < 500) complexityScore += 3;
    else complexityScore += 4;

    // Conditional blocks contribution
    if (metrics.ifElseBlocks < 10) complexityScore += 1;
    else if (metrics.ifElseBlocks < 25) complexityScore += 2;
    else if (metrics.ifElseBlocks < 50) complexityScore += 3;
    else complexityScore += 4;

    // Variable count contribution
    if (metrics.variableCount < 20) complexityScore += 1;
    else if (metrics.variableCount < 50) complexityScore += 2;
    else if (metrics.variableCount < 100) complexityScore += 3;
    else complexityScore += 4;

    // Nested depth contribution
    if (metrics.nestedDepth < 3) complexityScore += 1;
    else if (metrics.nestedDepth < 5) complexityScore += 2;
    else if (metrics.nestedDepth < 7) complexityScore += 3;
    else complexityScore += 4;

    // Classification based on total score
    let classification;
    let confidenceScore;

    if (complexityScore <= 6) {
      classification = "Simple";
      confidenceScore = 85 + Math.random() * 10;
    } else if (complexityScore <= 10) {
      classification = "Moderate";
      confidenceScore = 75 + Math.random() * 15;
    } else {
      classification = "Complex";
      confidenceScore = 80 + Math.random() * 15;
    }

    return {
      classification,
      confidenceScore: parseFloat(confidenceScore.toFixed(1)),
      explanation:
        "Analysis performed using fallback metrics-based classification due to API unavailability.",
    };
  }

  // Main analysis method
  public async analyze(content: string) {
    const metrics = this.extractBasicMetrics(content);

    // Try to get analysis from Gemini API
    let geminiAnalysis;
    try {
      geminiAnalysis = await this.callGeminiAPI(content);
    } catch (error) {
      console.error("Error with Gemini analysis, using fallback:", error);
      geminiAnalysis = this.fallbackClassification(content);
    }

    return {
      metrics: {
        loc: metrics.loc,
        ifElseBlocks: metrics.ifElseBlocks,
        variableCount: metrics.variableCount,
        nestedDepth: metrics.nestedDepth,
      },
      complexity: {
        classification: geminiAnalysis.classification,
        confidenceScore: geminiAnalysis.confidenceScore,
      },
      explanation: geminiAnalysis.explanation,
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
            data: [
              metrics.loc,
              metrics.ifElseBlocks,
              metrics.variableCount,
              metrics.nestedDepth,
            ],
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
  }
}

// API route handler
export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Invalid request: Code or document content is required" },
        { status: 400 },
      );
    }

    // Instantiate our analyzer and analyze the content
    const analyzer = new GeminiCodeAnalyzer();
    const results = await analyzer.analyze(code);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error analyzing content:", error);
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 },
    );
  }
}
