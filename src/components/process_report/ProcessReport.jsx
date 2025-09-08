import React, { useState } from "react";
import "./ProcessReport.css";
export default function ProcessReports({ reportsData, onClose }) {
  const [selectedPid, setSelectedPid] = useState(
    reportsData.length > 0 ? reportsData[0].pid : null
  );

  const selectedReport = reportsData.find((r) => r.pid === selectedPid);

  return (
    <div className="report-sidebar">
      <div className="report-header">
        <h2>Process Reports</h2>
        <button onClick={onClose}>X</button>
      </div>

      {/* Selector de procesos */}
      <div style={{ margin: "10px 0" }}>
        <label htmlFor="process-select">Select Process: </label>
        <select
          id="process-select"
          value={selectedPid}
          onChange={(e) => setSelectedPid(e.target.value)}
        >
          {reportsData.map((report) => (
            <option key={report.pid} value={report.pid}>
              {report.pid}
            </option>
          ))}
        </select>
      </div>

      {selectedReport && (
        <>
          <table>
            <thead>
              <tr>
                <th>PID</th>
                <th>Priority</th>
                <th>PC</th>
                <th>Registers</th>
                <th>Syscalls</th>
                <th>Total Transitions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedReport.pid}</td>
                <td>{selectedReport.priority}</td>
                <td>{selectedReport.programCounter}</td>
                <td>
                  AX: {selectedReport.registers.AX}, BX:{" "}
                  {selectedReport.registers.BX}, CX:{" "}
                  {selectedReport.registers.CX}, DX:{" "}
                  {selectedReport.registers.DX}
                </td>
                <td>{selectedReport.syscalls.map((s) => s.name).join(", ")}</td>
                <td>{selectedReport.totalTransitions}</td>
              </tr>
            </tbody>
          </table>

          <h3>Transition History</h3>
          <table>
            <thead>
              <tr>
                <th>State</th>
                <th>Timestamp</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {selectedReport.transitions.map((t, i) => (
                <tr key={i}>
                  <td>{t.state}</td>
                  <td>{t.timestamp}</td>
                  <td>{t.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
