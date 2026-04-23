import React from "react";
import { Line, Marker, createCoordinates } from "@vnedyalk0v/react19-simple-maps";
import { COUNTRY_CENTERS } from "./constants";

export interface FortifyAnimationData {
  id: number;
  from: string;
  to: string;
  troops: number;
}

interface Props {
  animation: FortifyAnimationData | null;
}

const GOLD = "#FFD900";
const GOLD_DEEP = "#b38f00";
const PANEL_BG = "rgba(14, 12, 6, 0.92)";

const FortifyAnimation: React.FC<Props> = ({ animation }) => {
  if (!animation) return null;

  const fromCenter = COUNTRY_CENTERS[animation.from];
  const toCenter = COUNTRY_CENTERS[animation.to];
  if (!fromCenter || !toCenter) return null;

  const dx = toCenter[0] - fromCenter[0];
  const dy = toCenter[1] - fromCenter[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  const shortenFrom = len > 0 ? Math.min(1.0 / len, 0.22) : 0;
  const shortenTo = len > 0 ? Math.min(1.4 / len, 0.32) : 0;
  const fromX = fromCenter[0] + dx * shortenFrom;
  const fromY = fromCenter[1] + dy * shortenFrom;
  const toX = toCenter[0] - dx * shortenTo;
  const toY = toCenter[1] - dy * shortenTo;
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const angle = (Math.atan2(-dy, dx) * 180) / Math.PI + 90;

  return (
    <g
      key={`fortify-anim-${animation.id}`}
      className="fortify-arrow-group"
      style={{ pointerEvents: "none" }}
    >
      {/* Glow halo under the arrow path */}
      <Line
        from={createCoordinates(fromX, fromY)}
        to={createCoordinates(toX, toY)}
        stroke={GOLD}
        strokeWidth={7}
        strokeLinecap="round"
        strokeOpacity={0.12}
      />

      {/* Animated traveling dashes */}
      <Line
        className="fortify-arrow-flow"
        from={createCoordinates(fromX, fromY)}
        to={createCoordinates(toX, toY)}
        stroke={GOLD}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="5 3"
        strokeOpacity={0.95}
      />

      {/* Source pulse */}
      <Marker coordinates={createCoordinates(fromCenter[0], fromCenter[1])}>
        <circle
          className="fortify-endpoint"
          r={8}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.2}
          opacity={0.9}
        />
      </Marker>

      {/* Destination pulse */}
      <Marker coordinates={createCoordinates(toCenter[0], toCenter[1])}>
        <circle
          className="fortify-endpoint"
          r={8}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.2}
          opacity={0.9}
        />
      </Marker>

      {/* Arrowhead at destination */}
      <Marker coordinates={createCoordinates(toX, toY)}>
        <g className="fortify-arrow-head" transform={`rotate(${angle})`}>
          <polygon
            points="0,-8 5,5 -5,5"
            fill={GOLD}
            style={{ filter: `drop-shadow(0 0 4px ${GOLD})` }}
          />
        </g>
      </Marker>

      {/* Troop count badge at midpoint */}
      <Marker coordinates={createCoordinates(midX, midY)}>
        <g className="fortify-badge">
          <rect
            x={-18}
            y={-10}
            width={36}
            height={20}
            rx={10}
            fill={PANEL_BG}
            stroke={GOLD}
            strokeWidth={1}
            style={{
              filter: `drop-shadow(0 0 6px ${GOLD}) drop-shadow(0 0 14px ${GOLD_DEEP})`,
            }}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            y={0.5}
            style={{
              fill: GOLD,
              fontSize: "11px",
              fontWeight: 700,
              fontFamily:
                "Audiowide, var(--font-audiowide), ui-sans-serif, system-ui",
              letterSpacing: "1px",
            }}
          >
            +{animation.troops}
          </text>
        </g>
      </Marker>
    </g>
  );
};

export default FortifyAnimation;
