import React from "react";
import { Geographies, Geography } from "@vnedyalk0v/react19-simple-maps";
import { darkenColor } from "./color-utils";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geoData: any;
  getTerritoryFill: (name: string) => string;
  getStroke: (name: string) => string;
  getStrokeWidth: () => number;
  onTerritoryClick: (name: string) => void;
  onTerritoryHover: (name: string | null) => void;
}

const TerritoryGeographies: React.FC<Props> = ({
  geoData,
  getTerritoryFill,
  getStroke,
  getStrokeWidth,
  onTerritoryClick,
  onTerritoryHover,
}) => (
  <Geographies geography={geoData}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    {({ geographies }: { geographies: any[] }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      geographies.map((geo: any, index: number) => {
        const name = geo.properties?.COUNTRY_NAME;
        if (!name) return null;

        const fill = getTerritoryFill(name);
        const stroke = getStroke(name);
        const strokeWidth = getStrokeWidth();

        return (
          <Geography
            key={geo.id || index}
            geography={geo}
            onClick={(e: React.MouseEvent) => {
              (e.target as SVGElement).blur();
              onTerritoryClick(name);
            }}
            onMouseEnter={() => onTerritoryHover(name)}
            onMouseLeave={() => onTerritoryHover(null)}
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
);

export default TerritoryGeographies;
