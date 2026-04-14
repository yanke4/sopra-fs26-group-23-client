"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";

const COUNTRY_CENTERS: Record<string, [number, number]> = {
  Spain: [-3.7, 40.4],
  Ukraine: [31.2, 48.4],
  Portugal: [-8.2, 39.4],
  Netherlands: [5.3, 52.1],
  Germany: [10.4, 51.2],
  Austria: [14.6, 47.5],
  Belgium: [4.5, 50.5],
  Lithuania: [23.9, 55.2],
  Slovakia: [19.7, 48.7],
  Belarus: [27.9, 53.7],
  Latvia: [24.6, 56.9],
  Ireland: [-8.2, 53.4],
  Hungary: [19.5, 47.2],
  Moldova: [28.8, 47.0],
  "Czech Republic": [15.5, 49.8],
  Switzerland: [8.2, 46.8],
  Romania: [25.0, 45.9],
  Bulgaria: [25.5, 42.7],
  Finland: [26.0, 64.0],
  Iceland: [-19.0, 65.0],
  Poland: [19.1, 51.9],
  Balkan: [20.5, 43.5],
  Italy: [12.6, 42.5],
  France: [2.2, 46.2],
  Greece: [22.0, 39.0],
  Turkey: [35.2, 39.9],
  "Great Britain": [-3.4, 55.4],
  Denmark: [9.5, 56.3],
  Sweden: [15.6, 60.1],
  Estonia: [25.0, 58.6],
  Norway: [8.5, 60.5],
};

export interface TerritoryState {
  owner: number;
  troops: number;
}

interface EuropeMapProps {
  territories: Record<string, TerritoryState>;
  playerColors: string[];
  selectedTerritory: string | null;
  targetTerritory: string | null;
  onTerritoryClick: (name: string) => void;
  validTargets?: string[];
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const EuropeMap: React.FC<EuropeMapProps> = ({
  territories,
  playerColors,
  selectedTerritory,
  targetTerritory,
  onTerritoryClick,
  validTargets = [],
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/maps/europe-names.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setGeoData)
      .catch((err) => console.error("Error loading map:", err));
  }, []);

  const getTerritoryFill = useCallback(
    (name: string) => {
      const territory = territories[name];
      if (!territory) return "#2a2a2a";
      const baseColor = playerColors[territory.owner] || "#2a2a2a";
      if (name === selectedTerritory) return darkenColor(baseColor, 12);
      return baseColor;
    },
    [territories, playerColors, selectedTerritory],
  );

  const getStroke = useCallback(() => "#0d0d0d", []);

  const getStrokeWidth = useCallback(() => 0.5, []);

  if (!geoData)
    return (
      <div className="flex-1 flex items-center justify-center text-amber-400/60">
        Loading map...
      </div>
    );

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, #111010 0%, #0a0908 50%, #050404 100%)",
      }}
    >
      <style>{`
        .risk-map path {
          outline: none !important;
          -webkit-tap-highlight-color: transparent;
        }
        .risk-map path:focus,
        .risk-map path:focus-visible {
          outline: none !important;
        }
      `}</style>
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
        <defs>
          <pattern
            id="map-grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#d4a04a"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="map-grid-lg"
            x="0"
            y="0"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <rect width="200" height="200" fill="url(#map-grid)" />
            <path
              d="M 200 0 L 0 0 0 200"
              fill="none"
              stroke="#d4a04a"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid-lg)" />
      </svg>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4a04a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "12px 12px",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: createCoordinates(15, 54),
          scale: 580,
        }}
        className="risk-map w-full h-full relative z-1 mt-5 ml-15"
        style={{ transform: "scaleX(1.15)", transformOrigin: "center center" }}
      >
        <Line
          from={createCoordinates(-8.2, 53.4)}
          to={createCoordinates(-19.0, 65.0)}
          stroke="#fbbf24"
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="4 3"
          strokeOpacity={0.35}
          style={{ pointerEvents: "none" }}
        />

        <Line
          from={createCoordinates(-19.0, 65.0)}
          to={createCoordinates(8.5, 60.5)}
          stroke="#fbbf24"
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="4 3"
          strokeOpacity={0.35}
          style={{ pointerEvents: "none" }}
        />

        <Line
          from={createCoordinates(26.0, 64.0)}
          to={createCoordinates(25.0, 58.6)}
          stroke="#fbbf24"
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="4 3"
          strokeOpacity={0.35}
          style={{ pointerEvents: "none" }}
        />

        <Line
          from={createCoordinates(15.6, 60.1)}
          to={createCoordinates(9.5, 56.3)}
          stroke="#fbbf24"
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="4 3"
          strokeOpacity={0.35}
          style={{ pointerEvents: "none" }}
        />

        <Line
          from={createCoordinates(-8.2, 53.4)}
          to={createCoordinates(-3.4, 55.4)}
          stroke="#fbbf24"
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="4 3"
          strokeOpacity={0.35}
          style={{ pointerEvents: "none" }}
        />

        <Line
          from={createCoordinates(-3.4, 55.4)}
          to={createCoordinates(2.2, 46.2)}
          stroke="#fbbf24"
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="4 3"
          strokeOpacity={0.35}
          style={{ pointerEvents: "none" }}
        />

        <Geographies geography={geoData}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {({ geographies }: { geographies: any[] }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            geographies.map((geo: any, index: number) => {
              const name = geo.properties?.COUNTRY_NAME;
              if (!name) return null;

              const fill = getTerritoryFill(name);
              const stroke = getStroke();
              const strokeWidth = getStrokeWidth();

              return (
                <Geography
                  key={geo.id || index}
                  geography={geo}
                  onClick={(e: React.MouseEvent) => {
                    (e.target as SVGElement).blur();
                    onTerritoryClick(name);
                  }}
                  tabIndex={-1}
                  style={{
                    default: {
                      fill,
                      stroke,
                      strokeWidth,
                      outline: "none",
                      cursor: "pointer",
                    },
                    hover: {
                      fill,
                      stroke,
                      strokeWidth,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: darkenColor(fill, 8),
                      stroke,
                      strokeWidth,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>

        {Object.entries(territories).map(([name, territory]) => {
          const center = COUNTRY_CENTERS[name];
          if (!center) return null;

          const isSelected = name === selectedTerritory;
          const isTarget = name === targetTerritory;
          const r = isSelected || isTarget ? 11 : 9;

          return (
            <Marker
              key={`marker-${name}`}
              coordinates={createCoordinates(center[0], center[1])}
            >
              <g style={{ pointerEvents: "none" }}>
                <circle
                  r={r + 1}
                  fill="none"
                  stroke={
                    isSelected
                      ? "#fbbf24"
                      : isTarget
                        ? "#ef4444"
                        : playerColors[territory.owner]
                  }
                  strokeWidth={isSelected || isTarget ? 2.5 : 1.5}
                  opacity={0.8}
                />
                <circle r={r} fill="rgba(0,0,0,0.75)" />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fill: isSelected
                      ? "#fbbf24"
                      : isTarget
                        ? "#ef4444"
                        : "#fff",
                    fontSize: isSelected || isTarget ? "12px" : "10px",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                    userSelect: "none",
                  }}
                >
                  {territory.troops}
                </text>
              </g>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
};

export default EuropeMap;
