import { STATES, canTransition } from "./stateMachine";
import { v4 as uuidv4 } from "uuid";

export class Process {
  constructor(priority = "High", controller = null) {
    this.pid = uuidv4().slice(0, 6);
    this.memorySize = Math.floor(Math.random() * 5) + 1; // 1-5 páginas
    this.allocatedPages = []; // Páginas que tiene en memoria
    this.currentState = STATES.NEW;
    this.priority = priority;
    this.programCounter = 0;
    this.registers = this.initRegisters();
    this.syscalls = [];
    this.history = [
      { state: STATES.NEW, timestamp: Date.now(), reason: "Process Created" },
    ];
    const logoIndex = Math.floor(Math.random() * 34) + 1;
    this.logo = `/logos/${logoIndex}.svg`;

    // referencia al controlador para saber si está en pausa
    this.controller = controller;
  }

  initRegisters() {
    return { AX: 0, BX: 0, CX: 0, DX: 0 };
  }

  updateCPUContext() {
    this.programCounter += 1;
    this.registers.AX = Math.floor(Math.random() * 100);
    this.registers.BX = Math.floor(Math.random() * 100);
    this.registers.CX = Math.floor(Math.random() * 100);
    this.registers.DX = Math.floor(Math.random() * 100);
  }

  transition(toState, reason = "") {
    if (canTransition(this.currentState, toState)) {
      const fromState = this.currentState;
      this.currentState = toState;
      this.updateCPUContext();
      this.history.push({
        state: toState,
        timestamp: Date.now(),
        reason,
      });
      return { status: true, message: `Transitioned from ${fromState} to ${toState} by ${reason}` };
    }
    return { status: false, message: `Failed to transition from ${this.currentState} to ${toState} by ${reason}` };
  }

  systemCall(syscall, toState, reason = "") {
    if (canTransition(this.currentState, toState)) {
      this.syscalls.push({ name: syscall, timestamp: Date.now(), success: true });
      this.updateCPUContext();
      const fromState = this.currentState;
      this.currentState = toState;
      this.history.push({
        state: toState,
        timestamp: Date.now(),
        reason,
      });
      return { status: true, message: `Syscall ${syscall} executed and transitioned to ${toState} by ${reason}` };
    } else {
      this.syscalls.push({ name: syscall, timestamp: Date.now(), success: false });
      return { status: false, message: `Failed to execute syscall ${syscall} and transition to ${toState} by ${reason}` };
    }
  }

  getHistory() {
    return this.history;
  }

  getMetrics() {
    const metrics = {
      pid: this.pid,
      priority: this.priority,
      programCounter: this.programCounter,
      registers: { ...this.registers },
      syscalls: [...this.syscalls],
      totalTransitions: this.history.length - 1,
      timeInStates: this.initStateTimes(),
      transitions: this.history.map((h) => ({
        state: h.state,
        timestamp: new Date(h.timestamp).toLocaleTimeString(),
        reason: h.reason,
      })),
    };

    for (let i = 0; i < this.history.length - 1; i++) {
      const current = this.history[i];
      const next = this.history[i + 1];
      const duration = next.timestamp - current.timestamp;
      metrics.timeInStates[current.state] += duration;
    }

    const last = this.history[this.history.length - 1];

    // ❌ Solo sumar tiempo si no está en pausa
    if (!this.controller?.getIsPaused?.()) {
      metrics.timeInStates[last.state] += Date.now() - last.timestamp;
    }

    return metrics;
  }

  exportMetricsJSON() {
    return JSON.stringify(this.getMetrics(), null, 2);
  }

  allocateMemory(memoryManager) {
    memoryManager.loadProcessMemory(this.pid, this.memorySize);
    this.allocatedPages = Array.from({ length: this.memorySize }, (_, i) => i);
  }

  accessMemory(memoryManager) {
    this.allocatedPages.forEach(pid => memoryManager.accessPage(this.pid));
  }


  exportMetricsCSV() {
    const metrics = this.getMetrics();
    const headers = "State,Time(ms)\n";
    const rows = Object.entries(metrics.timeInStates)
      .map(([state, time]) => `${state},${time}`)
      .join("\n");
    return headers + rows;
  }

  initStateTimes() {
    const times = {};
    this.history.forEach((x) => { times[x.state] = 0; });
    return times;
  }
}
