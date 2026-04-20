import React from "react";
import { Marker, createCoordinates } from "@vnedyalk0v/react19-simple-maps";
import { COUNTRY_CENTERS } from "./constants";
import type { TerritoryState } from "./types";

interface Props {
  territories: Record<string, TerritoryState>;
  playerColors: string[];
  selectedTerritory: string | null;
  targetTerritory: string | null;
}

const TerritoryMarkers: React.FC<Props> = ({
  territories,
  playerColors,
  selectedTerritory,
  targetTerritory,
}) => (
  <>
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
  </>
);

export default TerritoryMarkers;
