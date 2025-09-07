import React from "react";
import ProcessItem from "./ProcessItem";
import "./StateNodeComponent.css";

const StateNodeComponent = ({
  name,
  items,
  onTransition,
  controller,
  showTechnicalDetails,
}) => (
  <div className="state-node">
    <div className="state-node-title">{name}</div>
    <ul className="state-node-list">
      {items &&
        items.map((process) => (
          <ProcessItem
            key={process.pid}
            process={process}
            onTransition={onTransition}
            showTechnicalDetails={showTechnicalDetails}
          />
        ))}
    </ul>
  </div>
);

export default StateNodeComponent;
