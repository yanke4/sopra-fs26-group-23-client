import React from "react";

const MapBackground: React.FC = () => (
  <>
    <style>{`
      .risk-map path {
        outline: none !important;
        -webkit-tap-highlight-color: transparent;
      }
      .risk-map path:focus,
      .risk-map path:focus-visible {
        outline: none !important;
      }
    `}</style>
    <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
      <defs>
        <pattern
          id="map-grid"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#d4a04a"
            strokeWidth="0.5"
          />
        </pattern>
        <pattern
          id="map-grid-lg"
          x="0"
          y="0"
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          <rect width="200" height="200" fill="url(#map-grid)" />
          <path
            d="M 200 0 L 0 0 0 200"
            fill="none"
            stroke="#d4a04a"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#map-grid-lg)" />
    </svg>

    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d4a04a 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundPosition: "12px 12px",
      }}
    />

    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,0,0,0.5) 100%)",
      }}
    />
  </>
);

export default MapBackground;
