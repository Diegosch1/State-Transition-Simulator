// simulationController.js
import { ProcessManager } from './processManager';
import { STATES } from '../core/stateMachine';

export class SimulationController {
  constructor() {
    this.processManager = new ProcessManager();
    this.simulationSpeed = 1000;
    this.isPaused = true;
    this.autoTransitionInterval = null;
  }

  // --- Métodos de gestión de procesos ---
  createProcess() {
    return this.processManager.createProcess().pid;
  }

  getProcesses() {
    return this.processManager.getAllProcesses();
  }
    
  // --- Métodos de transición manual (ahora con manejo de respuesta) ---
  admitProcess(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.transition(STATES.READY, "Admitido al sistema");
  }

  assignCPU(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.transition(STATES.RUNNING, "Asignación de CPU");
  }

  // Ahora, para la solicitud de E/S, usamos el método 'systemCall'
  requestIO(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.systemCall('I/O Request', STATES.WAITING, "Solicitud de E/S");
  }

  completeIO(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.transition(STATES.READY, "E/S completada");
  }

  // --- NUEVO MÉTODO AÑADIDO: Desalojo (Preemption) ---
  preemptProcess(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    // El 'reason' es crucial para documentar la transición
    return process.transition(STATES.READY, "Expulsión por fin de quantum");
  }

  terminateProcess(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    const result = process.transition(STATES.TERMINATED, "Proceso finalizado");
    if (result.status) {
      // this.processManager.deleteProcess(pid);
    }
    return result;
  }

  // --- Controles de simulación ---
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
    this.processManager.getAllProcesses().forEach(process => {
      // Regla 1: Admisión automática
      if (process.currentState === STATES.NEW) {
        this.admitProcess(process.pid); 
      }
      
      // Regla 2: Desalojo automático (simulación simple)
      // Aquí podrías añadir una lógica más compleja, como un temporizador
      // para cada proceso, o una prioridad.
      if (process.currentState === STATES.RUNNING) {
        this.preemptProcess(process.pid);
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