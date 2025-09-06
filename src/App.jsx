import React from 'react';
import SimulationController from './controllers/SimulationController';
import { StateMachine } from './core/stateMachine';

const stateMachine = new StateMachine();

function App() {
  return (
    <div className="App">
      <h1>Simulador de Estados de Procesos</h1>
      <SimulationController stateMachine={stateMachine} />
    </div>
  );
}

export default App;