"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ComposableMap,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";

import { REGION_COLORS } from "./constants";
import { darkenColor } from "./color-utils";
import type { EuropeMapProps } from "./types";
import MapBackground from "./MapBackground";
import SeaConnections from "./SeaConnections";
import TerritoryGeographies from "./TerritoryGeographies";
import AttackArrows from "./AttackArrows";
import AttackAnimation from "./AttackAnimation";
import FortifyAnimation from "./FortifyAnimation";
import DeployAnimation from "./DeployAnimation";
import TerritoryMarkers from "./TerritoryMarkers";
import RegionTooltip from "./RegionTooltip";

export type { TerritoryState } from "./types";
export type { AttackAnimationData } from "./AttackAnimation";
export type { FortifyAnimationData } from "./FortifyAnimation";
export type { DeployAnimationData } from "./DeployAnimation";

const EuropeMap: React.FC<EuropeMapProps> = ({
  territories,
  playerColors,
  selectedTerritory,
  targetTerritory,
  onTerritoryClick,
  validTargets = [],
  attackAnimation = null,
  fortifyAnimation = null,
  deployAnimation = null,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredTerritory, setHoveredTerritory] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const getStroke = useCallback(
    (name: string) => REGION_COLORS[name] ?? "#0d0d0d",
    [],
  );

  const getStrokeWidth = useCallback(() => 0.8, []);

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
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      <MapBackground />

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: createCoordinates(15, 54),
          scale: 580,
        }}
        className="risk-map w-full h-full relative z-1 mt-5 ml-15"
        style={{ transform: "scaleX(1.15)", transformOrigin: "center center" }}
      >
        <SeaConnections />

        <TerritoryGeographies
          geoData={geoData}
          getTerritoryFill={getTerritoryFill}
          getStroke={getStroke}
          getStrokeWidth={getStrokeWidth}
          onTerritoryClick={onTerritoryClick}
          onTerritoryHover={setHoveredTerritory}
        />

        <AttackArrows
          selectedTerritory={selectedTerritory}
          validTargets={validTargets}
        />

        <TerritoryMarkers
          territories={territories}
          playerColors={playerColors}
          selectedTerritory={selectedTerritory}
          targetTerritory={targetTerritory}
        />

        <AttackAnimation animation={attackAnimation} />

        <FortifyAnimation animation={fortifyAnimation} />

        <DeployAnimation animation={deployAnimation} />
      </ComposableMap>

      <RegionTooltip
        hoveredTerritory={hoveredTerritory}
        mousePos={mousePos}
      />
    </div>
  );
};

export default EuropeMap;
