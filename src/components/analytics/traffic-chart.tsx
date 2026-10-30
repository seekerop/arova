"use client";

import { useState } from "react";
import { TimeSeriesDataPoint } from "@/lib/analytics/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrafficChartProps {
  data: TimeSeriesDataPoint[];
  loading?: boolean;
}

type ChartMetric = "pageViews" | "uniqueVisitors" | "sessions";

export function TrafficChart({ data, loading }: TrafficChartProps) {
  const [metric, setMetric] = useState<ChartMetric>("pageViews");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const metricColors: Record<ChartMetric, { stroke: string; fill: string; label: string }> = {
    pageViews: {
      stroke: "#E84B2C",
      fill: "url(#emberGradient)",
      label: "Total Page Views",
    },
    uniqueVisitors: {
      stroke: "#34D399",
      fill: "url(#emeraldGradient)",
      label: "Unique Visitors",
    },
    sessions: {
      stroke: "#FFAA3D",
      fill: "url(#amberGradient)",
      label: "Sessions",
    },
  };

  const values = data.map((d) => d[metric] || 0);
  const maxValue = Math.max(...values, 5);
  const total = values.reduce((a, b) => a + b, 0);
  const peak = Math.max(...values, 0);

  // SVG dimensions
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartW;
    const y = height - paddingY - ((d[metric] || 0) / maxValue) * chartH;
    return { x, y, data: d };
  });

  // Build SVG path
  let pathD = "";
  let areaD = "";

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Smooth cubic curve
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height - paddingY;
    areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
      {/* Chart Header & Metric Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#F3F0E8]">
            Traffic Evolution & Engagement
          </h3>
          <p className="text-xs text-[#A39E93]">
            Telemetry volume grouped by selected temporal interval
          </p>
        </div>

        {/* Metric Toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric("pageViews")}
            className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all ${
              metric === "pageViews"
                ? "bg-[rgba(232,75,44,0.15)] text-[#E84B2C] border border-[rgba(232,75,44,0.3)] shadow-[0_0_10px_rgba(232,75,44,0.1)]"
                : "text-[#A39E93] hover:text-[#F3F0E8]"
            }`}
          >
            Page Views
          </button>
          <button
            type="button"
            onClick={() => setMetric("uniqueVisitors")}
            className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all ${
              metric === "uniqueVisitors"
                ? "bg-[rgba(52,211,153,0.15)] text-[#34D399] border border-[rgba(52,211,153,0.3)]"
                : "text-[#A39E93] hover:text-[#F3F0E8]"
            }`}
          >
            Unique Visitors
          </button>
          <button
            type="button"
            onClick={() => setMetric("sessions")}
            className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all ${
              metric === "sessions"
                ? "bg-[rgba(255,170,61,0.15)] text-[#FFAA3D] border border-[rgba(255,170,61,0.3)]"
                : "text-[#A39E93] hover:text-[#F3F0E8]"
            }`}
          >
            Sessions
          </button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-3 gap-4 py-2 border-y border-[rgba(243,240,232,0.06)] text-xs">
        <div>
          <span className="text-[11px] text-[#A39E93] block">Period Total</span>
          <span className="font-technical text-lg font-bold text-[#F3F0E8]">
            {total.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#A39E93] block">Peak Interval</span>
          <span className="font-technical text-lg font-bold text-[#FFAA3D]">
            {peak.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#A39E93] block">Interval Average</span>
          <span className="font-technical text-lg font-bold text-[#34D399]">
            {data.length > 0 ? (total / data.length).toFixed(1) : "0"}
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="emberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E84B2C" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E84B2C" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFAA3D" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFAA3D" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="rgba(243, 240, 232, 0.06)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH / 2}
            x2={width - paddingX}
            y2={paddingY + chartH / 2}
            stroke="rgba(243, 240, 232, 0.06)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(243, 240, 232, 0.12)"
          />

          {/* Y Axis scale indicators */}
          <text
            x={paddingX - 8}
            y={paddingY + 4}
            textAnchor="end"
            className="text-[9px] fill-[#A39E93] font-technical"
          >
            {maxValue}
          </text>
          <text
            x={paddingX - 8}
            y={paddingY + chartH / 2 + 4}
            textAnchor="end"
            className="text-[9px] fill-[#A39E93] font-technical"
          >
            {Math.round(maxValue / 2)}
          </text>
          <text
            x={paddingX - 8}
            y={height - paddingY + 4}
            textAnchor="end"
            className="text-[9px] fill-[#A39E93] font-technical"
          >
            0
          </text>

          {/* Area fill */}
          {areaD && <path d={areaD} fill={metricColors[metric].fill} />}

          {/* Main stroke line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={metricColors[metric].stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Interactive invisible hover bars and dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              <rect
                x={p.x - chartW / (data.length * 2)}
                y={paddingY}
                width={chartW / Math.max(1, data.length)}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
              />
              {hoverIndex === idx && (
                <>
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="rgba(243, 240, 232, 0.25)"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill={metricColors[metric].stroke}
                    stroke="#080505"
                    strokeWidth="2"
                  />
                </>
              )}
            </g>
          ))}

          {/* X axis labels (sample every few points to avoid crowding) */}
          {points.map((p, idx) => {
            const step = Math.ceil(data.length / 7);
            const isLabelVisible = idx % step === 0 || idx === data.length - 1;
            if (!isLabelVisible) return null;

            return (
              <text
                key={idx}
                x={p.x}
                y={height - paddingY + 16}
                textAnchor="middle"
                className="text-[10px] fill-[#A39E93] font-technical"
              >
                {p.data.label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {activePoint && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full py-1.5 px-3 rounded-[6px] bg-[#161514] border border-[rgba(232,75,44,0.4)] shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-xs z-20 space-y-0.5"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100 - 6}%`,
            }}
          >
            <div className="text-[10px] text-[#A39E93] font-technical">
              {activePoint.data.label}
            </div>
            <div className="font-technical font-bold text-[#F3F0E8] flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: metricColors[metric].stroke }}
              />
              <span>
                {activePoint.data[metric]} {metricColors[metric].label}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
