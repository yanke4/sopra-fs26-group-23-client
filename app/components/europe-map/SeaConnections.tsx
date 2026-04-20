import React from "react";
import { Line, createCoordinates } from "@vnedyalk0v/react19-simple-maps";

const SEA_LINK_STYLE = {
  stroke: "#fbbf24",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeDasharray: "4 3",
  strokeOpacity: 0.35,
  style: { pointerEvents: "none" as const },
};

const CONNECTIONS: Array<[[number, number], [number, number]]> = [
  [[-8.2, 53.4], [-19.0, 65.0]],
  [[-19.0, 65.0], [8.5, 60.5]],
  [[26.0, 64.0], [25.0, 58.6]],
  [[15.6, 60.1], [9.5, 56.3]],
  [[-8.2, 53.4], [-3.4, 55.4]],
  [[-3.4, 55.4], [2.2, 46.2]],
];

const SeaConnections: React.FC = () => (
  <>
    {CONNECTIONS.map(([from, to], idx) => (
      <Line
        key={`sea-${idx}`}
        from={createCoordinates(from[0], from[1])}
        to={createCoordinates(to[0], to[1])}
        {...SEA_LINK_STYLE}
      />
    ))}
  </>
);

export default SeaConnections;
