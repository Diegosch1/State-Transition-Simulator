import React, { useState } from "react";
import "./ProcessInfo.css";

export default function ProcessInfo({ process, showTechnicalDetails, hover }) {
  // Extract time in current state for progress bar
  const timeInCurrentState = process.timeInStates?.[process.currentState] || 0;
  const processMetrics = process.getMetrics();

  // Only show details on hover
  if (!hover) return null;

  return (
    <div className="process-node">
      {/* Simplified mode */}
      {!showTechnicalDetails ? (
        <div className="process-basic">
          <div className="process-info">
            <img
              src={process.logo}
              alt={`Logo ${process.pid}`}
              className="process-logo"
              width={32}
              height={32}
            />
            <span>{process.pid}</span>
          </div>
          <div className="process-state">
            <span>{process.currentState}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(timeInCurrentState, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        // Technical details
        <div className="process-technical">
          <p>
            <strong>PID:</strong> {process.pid}
          </p>
          <p>
            <strong>Program Counter:</strong> {process.programCounter}
          </p>
          <p>
            <strong>Registers:</strong> AX: {process.registers.AX}, BX:{" "}
            {process.registers.BX}, CX: {process.registers.CX}, DX:{" "}
            {process.registers.DX}
          </p>
          {process.syscalls.length > 0 && (
            <p>
              <strong>Syscalls:</strong>{" "}
              {process.syscalls.map((s) => s.name).join(", ")}
            </p>
          )}
          <p>
            <strong>State Times (ms):</strong>
          </p>
          <ul>
            {Object.entries(processMetrics.timeInStates || {}).map(([state, time]) => (
              <li key={state}>
                {state}: {time} ms
              </li>
            ))}
          </ul>
          <p>
            <strong>Total Transitions:</strong> {processMetrics.totalTransitions}
          </p>
          <p>
            <strong>Transition Events:</strong>
          </p>
          <ul>
            {processMetrics.transitions?.map((t, i) => (
              <li key={i}>
                {t.state} - {t.reason} - {t.timestamp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
