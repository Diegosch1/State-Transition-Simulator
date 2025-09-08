import React from "react";
import { STATES } from "../../core/stateMachine";
import ProcessInfo from "../process_info/ProcessInfo";
import "./StateNodeComponent.css";

export default function ProcessItem({ process, onTransition, controller, showTechnicalDetails }) {
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
        controller={controller}
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

      {process.currentState === STATES.NEW && (
        <button onClick={() => onTransition(process.pid, controller.admitProcess.bind(controller))}>
          ▶
        </button>
      )}
      {process.currentState === STATES.READY && (
        <button onClick={() => onTransition(process.pid, controller.assignCPU.bind(controller))}>
          ▶
        </button>
      )}
      {process.currentState === STATES.RUNNING && (
        <>
          <button onClick={() => onTransition(process.pid, controller.requestIO.bind(controller))}>
            ⌛
          </button>
          <button onClick={() => onTransition(process.pid, controller.preemptProcess.bind(controller))}>
            ⛔
          </button>
          <button onClick={() => onTransition(process.pid, controller.terminateProcess.bind(controller))}>
            ✅
          </button>
        </>
      )}
      {process.currentState === STATES.WAITING && (
        <button onClick={() => onTransition(process.pid, controller.completeIO.bind(controller))}>
          Liberar E/S
        </button>
      )}

    </li>
  );
};
