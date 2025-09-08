import React from "react";
import { STATES } from "../../core/stateMachine";
import ProcessInfo from "../process_info/ProcessInfo";
import "./StateNodeComponent.css";

export default function ProcessItem({ process, onTransition, showTechnicalDetails }) {
  const [hover, setHover] = React.useState(false);

  return (
    <li
      className="state-node-item"
      key={process.pid}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <ProcessInfo
        process={process}
        showTechnicalDetails={showTechnicalDetails}
        hover={hover}
      />
      <div className="process-info">
        <img
          src={process.logo}
          alt={`Logo ${process.pid}`}
          className="process-logo"
          width={32}
          height={32}
        />
        {process.pid}
      </div>

      {/* Botones según el estado */}
      {process.currentState === STATES.NEW && (
        <button onClick={() => onTransition(process)}>Admitir</button>
      )}
      {process.currentState === STATES.READY && (
        <button onClick={() => onTransition(process)}>Asignar CPU</button>
      )}
      {process.currentState === STATES.RUNNING && (
        <>
          <button onClick={() => onTransition(process)}>Solicitar E/S</button>
          <button onClick={() => onTransition(process)}>Desalojar</button>
          <button onClick={() => onTransition(process)}>Terminar</button>
        </>
      )}
      {process.currentState === STATES.WAITING && (
        <button onClick={() => onTransition(process)}>Liberar E/S</button>
      )}
    </li>
  );
};
