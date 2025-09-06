
import React from "react";
import StateDiagramComponent from "./components/state_diagram/StateDiagramComponent";



function App() {
  const processes = {
    New: [{ pid: 1 }, { pid: 2 }],
    Ready: [{ pid: 3 }],
    Running: [{ pid: 4 }],
    Waiting: [],
    Terminated: [],
  };

  return (
    <div>
      <h1>Simulador de Estados</h1>
      <StateDiagramComponent nodesData={processes} />
    </div>
  );}

export default App;