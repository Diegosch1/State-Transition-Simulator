import React from "react";
import ProcessItem from "./ProcessItem";
import "./StateNodeComponent.css";

const stateColors = {
  New: "#2196f3",        // Azul
  Ready: "#4caf50",      // Verde
  Running: "#ff9800",    // Naranja
  Waiting: "#9c27b0",    // Morado
  Terminated: "#f44336", // Rojo
};

const StateNodeComponent = ({
  name,
  items,
  onTransition,
  controller,
  showTechnicalDetails,
}) => (
  <div className="state-node"
  style={{
    border: `5px solid ${stateColors[name] || "#000"}`,
    borderRadius: "10px",
    padding: "8px",
  }}>
    <div className="state-node-title">
      {name} ({items?.length || 0})
    </div>
    <ul className="state-node-list">
      {items &&
        items.map((process) => (
          <ProcessItem
            key={process.pid}
            process={process}
            onTransition={onTransition}
            controller={controller}
            showTechnicalDetails={showTechnicalDetails}
          
          />
        ))}
    </ul>
  </div>
);

export default StateNodeComponent;
