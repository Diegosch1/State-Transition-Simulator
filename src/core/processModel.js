import { STATES, canTransition } from "./stateMachine";
import { v4 as uuidv4 } from "uuid";

export class Process {
  constructor(priority = "Low") {
    // Unique process ID (6 characters)
    this.pid = uuidv4().slice(0, 6);
    this.currentState = STATES.NEW;
    this.priority = priority;
    this.programCounter = 0;
    this.registers = this.initRegisters();
    this.syscalls = [];
    this.history = [
      { state: STATES.NEW, timestamp: Date.now(), reason: "Process Created" },
    ];
  }
  // Initialize CPU registers
  initRegisters() {
    return {
      AX: 0,
      BX: 0,
      CX: 0,
      DX: 0,
    };
  }

  // Simulate CPU context update
  updateCPUContext() {
    this.programCounter += 1;
    this.registers.AX = Math.floor(Math.random() * 100);
    this.registers.BX = Math.floor(Math.random() * 100);
    this.registers.CX = Math.floor(Math.random() * 100);
    this.registers.DX = Math.floor(Math.random() * 100);
  }

  // Log a syscall
  addSyscall(name) {
    this.syscalls.push({
      name,
      timestamp: new Date().toISOString(),
    });
  }

  // Change process transition, update history and CPU context
  transition(toState, reason = "") {
    if (canTransition(this.currentState, toState)) {
      this.currentState = toState;
      this.updateCPUContext();
      this.history.push({
        state: toState,
        timestamp: Date.now(),
        reason: reason,
      });
      return true;
    } else {
      return false;
    }
  }

  getHistory() {
    return this.history;
  }

  // Calculate process metrics
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
    metrics.timeInStates[last.state] += Date.now() - last.timestamp;

    return metrics;
  }

  exportMetricsJSON() {
    return JSON.stringify(this.getMetrics(), null, 2);
  }

  exportMetricsCSV() {
    const metrics = this.getMetrics();
    const headers = "State,Time(ms)\n";
    const rows = Object.entries(metrics.timeInStates)
      .map(([state, time]) => `${state},${time}`)
      .join("\n");
    return headers + rows;
  }

  // Initialize metrics states to zero
  initStateTimes() {
    const times = {};
    this.history.forEach((x) => {
      times[x.state] = 0;
    });
    return times;
  }
}
