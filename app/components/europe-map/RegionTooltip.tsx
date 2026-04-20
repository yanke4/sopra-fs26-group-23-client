import React from "react";
import { REGION_COLORS, REGION_INFO } from "./constants";

interface Props {
  hoveredTerritory: string | null;
  mousePos: { x: number; y: number };
}

const RegionTooltip: React.FC<Props> = ({ hoveredTerritory, mousePos }) => {
  if (!hoveredTerritory || !REGION_INFO[hoveredTerritory]) return null;

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{ left: mousePos.x + 14, top: mousePos.y + 14 }}
    >
      <div
        className="px-3 py-2 rounded text-xs border shadow-lg shadow-black/60"
        style={{
          background: "rgba(10,9,8,0.92)",
          borderColor: REGION_COLORS[hoveredTerritory] + "66",
          color: "#e5d5b0",
        }}
      >
        <div
          className="font-bold text-sm mb-1"
          style={{ color: REGION_COLORS[hoveredTerritory] }}
        >
          {REGION_INFO[hoveredTerritory].name}
        </div>
        <div className="flex items-center gap-1 text-amber-300/80">
          <span>+{REGION_INFO[hoveredTerritory].bonus} troops / round</span>
        </div>
      </div>
    </div>
  );
};

export default RegionTooltip;
