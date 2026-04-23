import React from "react";
import { Marker, createCoordinates } from "@vnedyalk0v/react19-simple-maps";
import { COUNTRY_CENTERS } from "./constants";

export interface DeployAnimationData {
  id: number;
  field: string;
  troops: number;
}

interface Props {
  animation: DeployAnimationData | null;
}

const GREEN = "#22c55e";
const GREEN_BRIGHT = "#4ade80";
const GREEN_DEEP = "#16a34a";
const PANEL_BG = "rgba(14, 12, 6, 0.92)";

const CHEVRON_OFFSETS = [
  { dx: -5, cls: "deploy-chevron-1" },
  { dx: 0, cls: "deploy-chevron-2" },
  { dx: 5, cls: "deploy-chevron-3" },
];

const DeployAnimation: React.FC<Props> = ({ animation }) => {
  if (!animation) return null;

  const center = COUNTRY_CENTERS[animation.field];
  if (!center) return null;

  return (
    <g
      key={`deploy-anim-${animation.id}`}
      className="deploy-group"
      style={{ pointerEvents: "none" }}
    >
      <Marker coordinates={createCoordinates(center[0], center[1])}>
        {/* Ground pulse ring */}
        <circle
          className="deploy-ground-pulse"
          r={10}
          fill="none"
          stroke={GREEN_BRIGHT}
          strokeWidth={1.3}
          opacity={0.85}
        />

        {/* Three descending chevrons (paratroopers) */}
        {CHEVRON_OFFSETS.map(({ dx, cls }, i) => (
          <g
            key={`chev-${i}`}
            className={`deploy-chevron ${cls}`}
            transform={`translate(${dx}, -16)`}
          >
            <polyline
              points="-3,-2 0,2 3,-2"
              fill="none"
              stroke={GREEN_BRIGHT}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 3px ${GREEN})` }}
            />
          </g>
        ))}

        {/* "+N" badge above the territory */}
        <g className="deploy-badge" transform="translate(0, -24)">
          <rect
            x={-18}
            y={-10}
            width={36}
            height={20}
            rx={10}
            fill={PANEL_BG}
            stroke={GREEN}
            strokeWidth={1}
            style={{
              filter: `drop-shadow(0 0 6px ${GREEN}) drop-shadow(0 0 14px ${GREEN_DEEP})`,
            }}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            y={0.5}
            style={{
              fill: GREEN_BRIGHT,
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

export default DeployAnimation;
