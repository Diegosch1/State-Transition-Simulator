import { ProcessManager } from './processManager';
import { STATES } from '../core/stateMachine';

export class SimulationController {
  constructor() {
    this.processManager = new ProcessManager();
    this.simulationSpeed = 3000; // ms delay para animación
    this.isPaused = true;
    this.processGeneratorTimeout = null;
    this.onTransition = null; // función callback para UI
    this.logoCount = 34; // cantidad de logos en la carpeta
    this.newProcessQueue = new Set(); // procesos en NEW que esperan render
  }

  // --- Métodos de gestión de procesos ---
  createProcess() {
    const process = this.processManager.createProcess();

    // Asignar un logo aleatorio al proceso
    const logoIndex = Math.floor(Math.random() * this.logoCount) + 1;
    process.logo = `/logos/${logoIndex}.svg`;

    return process.pid;
  }

  getProcesses() {
    return this.processManager.getAllProcesses();
  }

  admitProcess(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.transition(STATES.READY, "Admitted to system");
  }

  assignCPU(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.transition(STATES.RUNNING, "CPU assigned");
  }

  requestIO(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.systemCall('I/O Request', STATES.WAITING, "I/O requested");
  }

  completeIO(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.transition(STATES.READY, "I/O completed");
  }

  preemptProcess(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.transition(STATES.READY, "Quantum expired");
  }

  terminateProcess(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return { status: false, message: "Process not found." };
    return process.transition(STATES.TERMINATED, "Process finished");
  }

  // --- Control de simulación ---
  async startSimulation() {
    if (!this.isPaused) return;
    this.isPaused = false;

    if (this.processManager.getAllProcesses().length === 0) {
      const pid = this.createProcess();
      this.notifyNewProcess(pid);
    }

    this.scheduleRandomProcess();

    while (!this.isPaused) {
      await this.autoStep();
    }
  }

  async resumeSimulation() {
    if (!this.isPaused) return;
    this.isPaused = false;

    while (!this.isPaused) {
      await this.autoStep();
    }
  }

  pauseSimulation() {
    this.isPaused = true;
    if (this.processGeneratorTimeout) {
      clearTimeout(this.processGeneratorTimeout);
      this.processGeneratorTimeout = null;
    }
  }

  setSpeed(speed) {
    this.simulationSpeed = speed;
    if (!this.isPaused) {
      this.pauseSimulation();
      this.startSimulation();
    }
  }

  // --- Generación de procesos aleatorios ---
  scheduleRandomProcess() {
    if (this.isPaused) return;

    const delay = Math.floor(Math.random() * 5000) + 5000; // 5-10s
    this.processGeneratorTimeout = setTimeout(() => {
      if (!this.isPaused) {
        const pid = this.createProcess();
        this.notifyNewProcess(pid);
        console.log(`Generated new process ${pid} in state NEW`);
        this.scheduleRandomProcess();
      }
    }, delay);
  }

  // --- Paso automático por procesos activos ---
  async autoStep() {
    const processes = this.processManager.getAllProcesses();
    const activeProcesses = processes.filter(p => p.currentState !== STATES.TERMINATED);

    if (this.isPaused) return;
    if (activeProcesses.length === 0) {
      console.log("All processes are TERMINATED. Pausing simulation.");
      this.pauseSimulation();
      return;
    }

    for (const process of activeProcesses) {
      if (process.currentState === STATES.NEW && !this.newProcessQueue.has(process.pid)) {
        this.newProcessQueue.add(process.pid);
        this.notifyNewProcess(process.pid);

        // esperar a que la UI renderice antes de pasar a READY
        await new Promise(resolve => requestAnimationFrame(() => {
          requestAnimationFrame(resolve); // doble requestAnimationFrame asegura render completo
        }));

        this.newProcessQueue.delete(process.pid);
      }

      await this.transitionProcessOnce(process);
    }
  }

  // --- Transición de un proceso ---
  async transitionProcessOnce(process) {
    const fromState = process.currentState;
    let result;
    let reason;

    if (this.isPaused) return;

    switch (fromState) {
      case STATES.NEW:        
        reason = "Automatic: Admission";        
        result = this.admitProcess(process.pid);
        break;
      case STATES.READY:
        reason = "Automatic: CPU Assignment";
        result = this.assignCPU(process.pid);
        break;
      case STATES.RUNNING:
        const rand = Math.random();
        if (rand < 0.15) {
          reason = "Automatic: I/O Request";
          result = this.requestIO(process.pid);
        } else if (rand < 0.85) {
          reason = "Automatic: Process Finished";
          result = this.terminateProcess(process.pid);
        } else {
          reason = "Automatic: Quantum Expired";
          result = this.preemptProcess(process.pid);
        }
        break;
      case STATES.WAITING:
        reason = "Automatic: I/O Completed";
        result = this.completeIO(process.pid);
        break;
      default:
        result = { status: false };
    }

    if (result?.status && typeof this.onTransition === "function") {
      const fullProcess = { ...this.getProcesses().find(p => p.pid === process.pid) };
      if (fullProcess.currentState !== STATES.NEW || fromState !== STATES.NEW) {
        this.onTransition({        
          process: fullProcess,
          fromState,
          toState: fullProcess.currentState,
          reason,
          timestamp: new Date()
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, this.simulationSpeed));
  }

  notifyNewProcess(pid) {
    const process = this.processManager.getProcess(pid);
    if (!process) return;

    if (typeof this.onTransition === "function") {
      this.onTransition({
        pid: process.pid,
        process: { ...process },
        fromState: null,
        toState: STATES.NEW,
        reason: "Process created",
        timestamp: new Date(),
      });
    }
  }

  generateReport() {
    const reports = {};
    this.processManager.getAllProcesses().forEach(process => {
      reports[process.pid] = process.getMetrics();
    });
    return reports;
  }
}
