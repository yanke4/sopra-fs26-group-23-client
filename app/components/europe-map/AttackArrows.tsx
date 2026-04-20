import React from "react";
import { Line, Marker, createCoordinates } from "@vnedyalk0v/react19-simple-maps";
import { COUNTRY_CENTERS } from "./constants";

interface Props {
  selectedTerritory: string | null;
  validTargets: string[];
}

const AttackArrows: React.FC<Props> = ({ selectedTerritory, validTargets }) => {
  if (!selectedTerritory || !COUNTRY_CENTERS[selectedTerritory]) return null;

  return (
    <>
      {validTargets.map((target) => {
        const from = COUNTRY_CENTERS[selectedTerritory];
        const to = COUNTRY_CENTERS[target];
        if (!from || !to) return null;

        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const len = Math.sqrt(dx * dx + dy * dy);
        const shortenFrom = len > 0 ? Math.min(1.0 / len, 0.25) : 0;
        const shortenTo = len > 0 ? Math.min(1.4 / len, 0.35) : 0;
        const fromX = from[0] + dx * shortenFrom;
        const fromY = from[1] + dy * shortenFrom;
        const toX = to[0] - dx * shortenTo;
        const toY = to[1] - dy * shortenTo;
        const angle = (Math.atan2(-dy, dx) * 180) / Math.PI + 90;

        return (
          <React.Fragment key={`arrow-${selectedTerritory}-${target}`}>
            <Line
              from={createCoordinates(fromX, fromY)}
              to={createCoordinates(toX, toY)}
              stroke="#fbbf24"
              strokeWidth={6}
              strokeLinecap="round"
              strokeOpacity={0.08}
              style={{ pointerEvents: "none" }}
            />
            <Line
              from={createCoordinates(fromX, fromY)}
              to={createCoordinates(toX, toY)}
              stroke="#fbbf24"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="6 4"
              strokeOpacity={0.6}
              style={{ pointerEvents: "none" }}
            />
            <Marker coordinates={createCoordinates(toX, toY)}>
              <g
                style={{ pointerEvents: "none" }}
                transform={`rotate(${angle})`}
              >
                <polygon
                  points="0,-7 4.5,4 -4.5,4"
                  fill="#fbbf24"
                  opacity={0.75}
                  strokeLinejoin="round"
                />
              </g>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default AttackArrows;
