import React from "react";
import StateNodeComponent from "../state_node/StateNodeComponent";
import "./StateDiagramComponent.css";

// Posiciones iniciales de cada estado (coordenadas X/Y en el canvas)
const NODE_POSITIONS = {
  New: { x: 100, y: 100 },
  Ready: { x: 350, y: 100 },
  Running: { x: 600, y: 100 },
  Waiting: { x: 600, y: 300 },
  Terminated: { x: 850, y: 100 },
};

// Definición de aristas (desde → hasta)
const EDGES = [
  { from: "New", to: "Ready" },
  { from: "Ready", to: "Running" },
  { from: "Running", to: "Ready" },
  { from: "Running", to: "Waiting" },
  { from: "Waiting", to: "Ready" },
  { from: "Running", to: "Terminated" },
];

const StateDiagramComponent = ({ nodesData }) => {
  return (
    <div className="state-diagram">
      {/* SVG para las aristas */}
      <svg className="edges">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
          </marker>
        </defs>

        {EDGES.map((edge, idx) => {
          const from = NODE_POSITIONS[edge.from];
          const to = NODE_POSITIONS[edge.to];
          return (
            <line
              key={idx}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#ca1212ff"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        })}
      </svg>

      {/* Nodos */}
      {Object.keys(NODE_POSITIONS).map((state) => {
        const pos = NODE_POSITIONS[state];
        return (
          <div
            key={state}
            className="node-wrapper"
            style={{ left: pos.x, top: pos.y }}
          >
            <StateNodeComponent
              name={state}
              items={nodesData[state] || []}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StateDiagramComponent;
