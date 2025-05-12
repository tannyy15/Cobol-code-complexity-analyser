import { NextResponse } from "next/server";

// API route handler that proxies requests to the Python backend
export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Invalid request: Code or document content is required" },
        { status: 400 },
      );
    }

    // Forward the request to the Python backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const results = await response.json();
      return NextResponse.json(results);
    } catch (fetchError) {
      console.error("Error connecting to backend:", fetchError);

      // Fallback response when backend is unavailable
      return NextResponse.json({
        metrics: {
          loc: code.split("\n").filter((line) => line.trim().length > 0).length,
          ifElseBlocks: (code.match(/\bIF\b|\bELSE\b/gi) || []).length,
          variableCount: 30, // Default value
          nestedDepth: 3, // Default value
        },
        complexity: {
          classification: "Moderate",
          confidenceScore: 75.0,
        },
        explanation:
          "Backend service unavailable. This is a fallback analysis. Please ensure the Python backend is running.",
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
                code.split("\n").filter((line) => line.trim().length > 0)
                  .length,
                (code.match(/\bIF\b|\bELSE\b/gi) || []).length,
                30,
                3,
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
      });
    }
  } catch (error) {
    console.error("Error analyzing content:", error);
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 },
    );
  }
}
