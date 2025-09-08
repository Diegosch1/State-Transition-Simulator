import React, { useState, useEffect } from "react";
import "./ProcessInfo.css";

export default function ProcessInfo({ process, showTechnicalDetails, hover, controller }) {
  const processMetrics = typeof process.getMetrics === "function" ? process.getMetrics() : {};
  const currentState = process.currentState;
  const [timeInCurrentState, setTimeInCurrentState] = useState(
    processMetrics.timeInStates?.[currentState] || 0
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (controller?.getIsPaused?.()) return;

      const updatedMetrics =
        typeof process.getMetrics === "function" ? process.getMetrics() : {};
      setTimeInCurrentState(updatedMetrics.timeInStates?.[currentState] || 0);
    }, 500);    
    
    return () => clearInterval(interval);
  }, [currentState, process, controller]);


  if (!hover) return null;

  if (!showTechnicalDetails) {
    return (
      <div className="process-node">
        <div className="process-basic-simple">
          <span>
            {currentState} for {timeInCurrentState} ms
          </span>
        </div>
      </div>
    );
  }

  // --- VISTA TÉCNICA ---
  return (
    <div className="process-node">
      <div className="process-technical">
        <p><strong>PID:</strong> {process.pid}</p>
        <p><strong>Program Counter:</strong> {process.programCounter}</p>
        <p>
          <strong>Registers:</strong> AX: {process.registers.AX}, BX: {process.registers.BX}, CX: {process.registers.CX}, DX: {process.registers.DX}
        </p>
        {process.syscalls?.length > 0 && (
          <p><strong>Syscalls:</strong> {process.syscalls.map((s) => s.name).join(", ")}</p>
        )}
        <p><strong>State Times (ms):</strong></p>
        <ul>
          {Object.entries(processMetrics.timeInStates || {}).map(([state, time]) => (
            <li key={state}>{state}: {time} ms</li>
          ))}
        </ul>
        <p><strong>Total Transitions:</strong> {processMetrics.totalTransitions}</p>
        <p><strong>Transition Events:</strong></p>
        <ul>
          {processMetrics.transitions?.map((t, i) => (
            <li key={i}>{t.state} - {t.reason} - {t.timestamp}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
