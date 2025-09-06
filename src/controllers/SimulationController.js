import { ProcessManager } from './processManager';
import { STATES } from './processModel';

export class SimulationController {
  constructor() {
    this.processManager = new ProcessManager();
    this.simulationSpeed = 1000;
    this.isPaused = true;
    this.autoTransitionInterval = null;
  }
  
  createProcess() {
    return this.processManager.createProcess().pid;
  }

  getProcesses() {
    return this.processManager.getAllProcesses();
  }
  
  getProcess(pid) {
    return this.processes.get(pid);
  }

  admitProcess(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return false;
    return process.transition(STATES.READY, "Admitido al sistema");
  }

  assignCPU(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return false;
    return process.transition(STATES.RUNNING, "Asignación de CPU");
  }

  requestIO(pid) {
    const process = this.getProcess(pid);
    if (!process) return false;
    return process.transition(STATES.BLOCKED, "Solicitud de E/S");
  }

  completeIO(pid) {
    const process = this.getProcess(pid);
    if (!process) return false;
    return process.transition(STATES.READY, "E/S completada");
  }

  terminateProcess(pid) {
    const process = this.getProcess(pid);
    if (!process) return false;
    const success = process.transition(STATES.TERMINATED, "Proceso finalizado");
    if (success) {
      // Opcional: remover el proceso terminado del mapa si ya no es necesario
      // this.processes.delete(pid);
    }
    return success;
  }

  startSimulation() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.autoTransitionInterval = setInterval(() => {
      this.performAutoTransitions();
    }, this.simulationSpeed);
  }

  pauseSimulation() {
    this.isPaused = true;
    if (this.autoTransitionInterval) {
      clearInterval(this.autoTransitionInterval);
    }
  }

  setSpeed(speed) {
    this.simulationSpeed = speed;
    if (!this.isPaused) {
      this.pauseSimulation();
      this.startSimulation();
    }
  }

  performAutoTransitions() {
    this.processes.forEach(process => {
      if (process.currentState === STATES.NEW) {
        process.transition(STATES.READY, "Admitido automáticamente");
      }
    });
  }

  generateReport() {
    const reports = {};
    this.processManager.getAllProcesses().forEach(process => {
      reports[process.pid] = process.getMetrics();
    });
    return reports;
  }
}