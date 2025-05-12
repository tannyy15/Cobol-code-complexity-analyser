"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, BarChart2, LineChart, PieChart } from "lucide-react";

interface MetricsVisualizerProps {
  metrics?: {
    loc: number;
    ifElseBlocks: number;
    variableCount: number;
    nestedDepth: number;
  };
  fileName?: string;
}

const MetricsVisualizer = ({
  metrics = {
    loc: 245,
    ifElseBlocks: 18,
    variableCount: 32,
    nestedDepth: 4,
  },
  fileName = "example-cobol-file.cbl",
}: MetricsVisualizerProps) => {
  const [activeChart, setActiveChart] = useState<string>("bar");
  const [chartInitialized, setChartInitialized] = useState<boolean>(false);
  const [chartInstance, setChartInstance] = useState<any>(null);

  useEffect(() => {
    // Dynamic import of Chart.js to avoid SSR issues
    const initializeChart = async () => {
      if (typeof window !== "undefined" && !chartInitialized) {
        try {
          const { Chart, registerables } = await import("chart.js");
          Chart.register(...registerables);

          const canvas = document.getElementById(
            "metrics-chart",
          ) as HTMLCanvasElement;
          if (canvas) {
            // Destroy previous chart instance if it exists
            if (chartInstance) {
              chartInstance.destroy();
            }

            // Create new chart
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const newChart = new Chart(ctx, {
                type:
                  activeChart === "bar"
                    ? "bar"
                    : activeChart === "line"
                      ? "line"
                      : "pie",
                data: {
                  labels: [
                    "Lines of Code",
                    "IF/ELSE Blocks",
                    "Variable Count",
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
                        "rgba(59, 130, 246, 0.6)", // blue
                        "rgba(16, 185, 129, 0.6)", // green
                        "rgba(249, 115, 22, 0.6)", // orange
                        "rgba(139, 92, 246, 0.6)", // purple
                      ],
                      borderColor: [
                        "rgba(59, 130, 246, 1)",
                        "rgba(16, 185, 129, 1)",
                        "rgba(249, 115, 22, 1)",
                        "rgba(139, 92, 246, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales:
                    activeChart !== "pie"
                      ? {
                          y: {
                            beginAtZero: true,
                          },
                        }
                      : undefined,
                },
              });

              setChartInstance(newChart);
            }
          }

          setChartInitialized(true);
        } catch (error) {
          console.error("Failed to initialize chart:", error);
        }
      }
    };

    initializeChart();
  }, [metrics, activeChart, chartInitialized, chartInstance]);

  const handleChartTypeChange = (type: string) => {
    setActiveChart(type);
    setChartInitialized(false); // Trigger chart re-initialization
  };

  const exportToCSV = () => {
    const headers = ["Metric", "Value"];
    const data = [
      ["Lines of Code", metrics.loc],
      ["IF/ELSE Blocks", metrics.ifElseBlocks],
      ["Variable Count", metrics.variableCount],
      ["Nested Depth", metrics.nestedDepth],
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName.split(".")[0]}-metrics.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full bg-background shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          Code Metrics Visualization
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChartTypeChange("bar")}
            className={
              activeChart === "bar" ? "bg-primary text-primary-foreground" : ""
            }
          >
            <BarChart2 className="h-4 w-4 mr-1" />
            Bar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChartTypeChange("line")}
            className={
              activeChart === "line" ? "bg-primary text-primary-foreground" : ""
            }
          >
            <LineChart className="h-4 w-4 mr-1" />
            Line
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChartTypeChange("pie")}
            className={
              activeChart === "pie" ? "bg-primary text-primary-foreground" : ""
            }
          >
            <PieChart className="h-4 w-4 mr-1" />
            Pie
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
          </TabsList>
          <TabsContent value="visualization" className="pt-4">
            <div className="h-[400px] w-full">
              <canvas id="metrics-chart"></canvas>
            </div>
          </TabsContent>
          <TabsContent value="raw-data" className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left bg-muted">
                      Metric
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left bg-muted">
                      Value
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left bg-muted">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Lines of Code
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {metrics.loc}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Total number of lines in the file
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      IF/ELSE Blocks
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {metrics.ifElseBlocks}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Number of conditional statements
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Variable Count
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {metrics.variableCount}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Total number of variables declared
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Nested Depth
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {metrics.nestedDepth}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Maximum nesting level of code blocks
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MetricsVisualizer;
