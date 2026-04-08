"use client";

import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";

const MapChart = () => {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/maps/europe-names.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("loaded geo data", data);
        console.log("features", data.features?.length);
        setGeoData(data);
      })
      .catch((err) => {
        console.error("Error loading map:", err);
      });
  }, []);

  if (!geoData) return <div>Loading map...</div>;

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{
        center: createCoordinates(15, 54),
        scale: 450,
      }}
      className="w-full h-238 mt-5"
    >
      <Geographies geography={geoData}>
        {({ geographies }) =>
          geographies.map((geo, index) => {
            const name = geo.properties?.COUNTRY_NAME;
            const countryColors: Record<string, string> = {
              Italy: "#E63946",
              Spain: "#FFD60A",
              Germany: "#2D6A4F",
            };
            const fillColor = countryColors[name] || "#D6D6DA";
            return (
              <Geography
                key={geo.id || index}
                geography={geo}
                style={{
                  default: { fill: fillColor, stroke: "#FFF", outline: "none" },
                  hover: { fill: "#F53", stroke: "#FFF", outline: "none" },
                  pressed: { fill: "#E42", stroke: "#FFF", outline: "none" },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
};

export default MapChart;
