import React, { useState } from "react";
import StateDiagramComponent from "./components/state_diagram/StateDiagramComponent";
import { SimulationController } from "./controllers/SimulationController";
import ProcessReports from "./components/process_report/ProcessReport";
import "./App.css";

const simulationController = new SimulationController();

const initialNodePositions = {
  New: { x: 10, y: 100 },
  Ready: { x: 300, y: 100 },
  Running: { x: 600, y: 100 },
  Waiting: { x: 600, y: 300 },
  Terminated: { x: 950, y: 100 },
};

function App() {
  const [processes, setProcesses] = useState([]);
  const [nodePositions] = useState(initialNodePositions);

  const updateProcesses = () => {
    setProcesses(simulationController.getProcesses().map((p) => ({ ...p })));
  };

  const handleTransition = (pid, controllerMethod) => {
    const result = controllerMethod(pid);
    if (result && result.status === false) {
      console.error(result.message);
    }
    updateProcesses();
  };

  const handleCreateProcess = () => {
    simulationController.createProcess();
    updateProcesses();
  };

  const handleStartSimulation = () => {
    simulationController.startSimulation();
    updateProcesses();
  };

  const handlePauseSimulation = () => {
    simulationController.pauseSimulation();
    updateProcesses();
  };

  const handleResumeSimulation = () => {
    simulationController.resumeSimulation();
    updateProcesses();
  };

  const processesByState = processes.reduce((acc, process) => {
    const state = process.currentState;
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(process);
    return acc;
  }, {});

  const [showReports, setShowReports] = useState(false);
  const [reportsData, setReportsData] = useState([]);

  const handleViewReports = () => {
    const reports = simulationController.generateReport();
    setReportsData(Object.values(reports));
    setShowReports(true);
  };

  const handleCloseReports = () => setShowReports(false);

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const toggleTechnicalDetails = () => {
    setShowTechnicalDetails((prev) => !prev);
  };

  return (
    <div>
      <h1>Simulador de Estados</h1>
      <div className="controls">
        <button onClick={handleCreateProcess}>New Process</button>
        <button onClick={handleStartSimulation}>Start Simulation</button>
        <button onClick={handlePauseSimulation}>Pause Simulation</button>
        <button onClick={handleResumeSimulation}>Resume Simulation</button>
        <button onClick={handleViewReports}>View Reports</button>
        <button onClick={toggleTechnicalDetails}>
          {showTechnicalDetails
            ? "Hide Technical Details"
            : "Show Technical Details"}
        </button>
      </div>

      <StateDiagramComponent
        className="StateDiagram"
        nodesData={processesByState}
        nodePositions={nodePositions}
        onTransition={handleTransition}
        controller={simulationController}
        showTechnicalDetails={showTechnicalDetails}
      />
      {showReports && (
        <ProcessReports
          reportsData={reportsData}
          onClose={handleCloseReports}
        />
      )}
    </div>
  );
}

export default App;
