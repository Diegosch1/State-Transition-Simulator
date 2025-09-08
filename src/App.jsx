import React, { useState } from "react";
import StateDiagramComponent from "./components/state_diagram/StateDiagramComponent";
import { SimulationController } from "./controllers/SimulationController";
import ProcessReports from "./components/process_report/ProcessReport";
import { FaPlay, FaPause, FaStepForward } from "react-icons/fa";
import "./App.css";
import { STATES } from "./core/stateMachine";

const simulationController = new SimulationController();

const initialNodePositions = {
  New: { x: 10, y: 100 },
  Ready: { x: 300, y: 100 },
  Running: { x: 600, y: 100 },
  Waiting: { x: 600, y: 450 },
  Terminated: { x: 950, y: 100 },
};

function App() {
  const [processes, setProcesses] = useState([]);
  const [nodePositions] = useState(initialNodePositions);

  const updateProcesses = () => {
  const updated = simulationController.getProcesses().map((p) => ({ ...p }));
  setProcesses(updated);
};

  const handleTransition = (pid, controllerMethod) => {
    const processesBefore = simulationController.getProcesses();
    const fromState = processesBefore.find(p => p.pid === pid)?.currentState;

    const result = controllerMethod(pid);
    if (result && result.status === false) {
      console.error(result.message);
    }

    const processesAfter = simulationController.getProcesses();
    const process = processesAfter.find(p => p.pid === pid);
    const toState = process?.currentState;

    if (fromState && toState && fromState !== toState && typeof simulationController.onTransition === "function") {
      simulationController.onTransition({
        process,
        fromState,
        toState,
        reason: "Manual transition",
      });
    }

    updateProcesses();
  };

  const handleClearSimulation = () => {
    simulationController.pauseSimulation();
    simulationController.clearProcesses();

    console.log(simulationController.getProcesses()); // Debería estar vacío


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
  // App.jsx
  // const [isPaused, setIsPaused] = useState(simulationController.getIsPaused()); // ✅ bien inicializado


  const toggleTechnicalDetails = () => {
    setShowTechnicalDetails((prev) => !prev);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Controls</h2>
        <div className="player-controls">
          <button onClick={handleStartSimulation} title="Start">
            <FaPlay />
          </button>
          <button onClick={handlePauseSimulation} title="Pause">
            <FaPause />
          </button>
          <button onClick={handleResumeSimulation} title="Resume">
            <FaStepForward />
          </button>
        </div>
        <div className="operation-buttons">
          <button onClick={handleCreateProcess}>New Process</button>
          <button onClick={handleViewReports}>View Reports</button>
          <button onClick={toggleTechnicalDetails}>
            {showTechnicalDetails ? "Hide Technical Details" : "Show Technical Details"}
          </button>
          <button onClick={handleClearSimulation}>Clear Simulation</button>
        </div>
      </div>

      <div className="main-content">
        <h1>Really Cool Process States Simulator</h1>
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
    </div>
  );

}

export default App;
