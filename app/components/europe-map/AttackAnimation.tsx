import React from "react";
import { Marker, createCoordinates } from "@vnedyalk0v/react19-simple-maps";
import { COUNTRY_CENTERS } from "./constants";

export interface AttackAnimationData {
  id: number;
  attacker: string;
  defender: string;
  attackerLosses: number;
  defenderLosses: number;
  conquered: boolean;
}

interface Props {
  animation: AttackAnimationData | null;
}

const GOLD = "#FFD900";
const RED = "#ef4444";
const RED_DEEP = "#b91c1c";

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const AttackAnimation: React.FC<Props> = ({ animation }) => {
  if (!animation) return null;

  const attackerCenter = COUNTRY_CENTERS[animation.attacker];
  const defenderCenter = COUNTRY_CENTERS[animation.defender];
  if (!attackerCenter || !defenderCenter) return null;

  const midpoint: [number, number] = [
    (attackerCenter[0] + defenderCenter[0]) / 2,
    (attackerCenter[1] + defenderCenter[1]) / 2,
  ];

  const verdictLabel = animation.conquered ? "CONQUERED" : "REPELLED";
  const accent = animation.conquered ? GOLD : RED;
  const accentDeep = animation.conquered ? "#b38f00" : RED_DEEP;

  return (
    <g key={`attack-anim-${animation.id}`} style={{ pointerEvents: "none" }}>
      {/* Burst at clash midpoint */}
      <Marker coordinates={createCoordinates(midpoint[0], midpoint[1])}>
        <g className="attack-burst">
          <circle
            r={4}
            fill={GOLD}
            opacity={0.95}
            style={{ filter: `drop-shadow(0 0 6px ${GOLD})` }}
          />
          <circle r={7} fill="none" stroke={GOLD} strokeWidth={0.8} />
        </g>

        {SPARK_ANGLES.map((angle) => (
          <g
            key={`spark-${angle}`}
            className="attack-spark"
            transform={`rotate(${angle})`}
          >
            <line
              x1={0}
              y1={-3}
              x2={0}
              y2={-11}
              stroke={GOLD}
              strokeWidth={1.3}
              strokeLinecap="round"
              opacity={0.95}
            />
          </g>
        ))}
      </Marker>

      {/* Losses above each territory */}
      {animation.attackerLosses > 0 && (
        <Marker
          coordinates={createCoordinates(attackerCenter[0], attackerCenter[1])}
        >
          <g className="attack-loss-float" transform="translate(0, -22)">
            <text
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: RED,
                fontSize: "15px",
                fontWeight: 800,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                letterSpacing: "0.5px",
                paintOrder: "stroke",
                stroke: "#000",
                strokeWidth: 2.5,
                strokeLinejoin: "round",
                filter: `drop-shadow(0 0 5px ${RED_DEEP})`,
              }}
            >
              −{animation.attackerLosses}
            </text>
          </g>
        </Marker>
      )}

      {animation.defenderLosses > 0 && (
        <Marker
          coordinates={createCoordinates(defenderCenter[0], defenderCenter[1])}
        >
          <g className="attack-loss-float" transform="translate(0, -22)">
            <text
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: RED,
                fontSize: "15px",
                fontWeight: 800,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                letterSpacing: "0.5px",
                paintOrder: "stroke",
                stroke: "#000",
                strokeWidth: 2.5,
                strokeLinejoin: "round",
                filter: `drop-shadow(0 0 5px ${RED_DEEP})`,
              }}
            >
              −{animation.defenderLosses}
            </text>
          </g>
        </Marker>
      )}

      {/* Big impact verdict - no box, just outlined text */}
      <Marker coordinates={createCoordinates(midpoint[0], midpoint[1])}>
        <g className="attack-impact-shadow" transform="translate(0, 18)">
          <ellipse
            cx={0}
            cy={0}
            rx={32}
            ry={4}
            fill={accent}
            opacity={0.35}
            style={{ filter: `blur(4px)` }}
          />
        </g>

        <g className="attack-impact" transform="translate(0, 18)">
          <text
            textAnchor="middle"
            dominantBaseline="central"
            y={0}
            style={{
              fill: accent,
              fontSize: "11px",
              fontWeight: 700,
              fontFamily:
                "Audiowide, var(--font-audiowide), ui-sans-serif, system-ui",
              letterSpacing: "3px",
              textTransform: "uppercase",
              paintOrder: "stroke",
              stroke: "#0a0908",
              strokeWidth: 3.2,
              strokeLinejoin: "round",
              filter: `drop-shadow(0 0 4px ${accent}) drop-shadow(0 0 10px ${accentDeep})`,
            }}
          >
            {verdictLabel}
          </text>
        </g>
      </Marker>
    </g>
  );
};

export default AttackAnimation;
