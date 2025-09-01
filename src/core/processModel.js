import { STATES, canTransition } from "./stateMachine";
import { v4 as uuidv4 } from "uuid";

export class Process {
  constructor() {
    // Usamos uuid en lugar del contador
    this.pid = uuidv4();
    this.currentState = STATES.NEW;
    this.history = [
      { state: STATES.NEW, timestamp: Date.now(), reason: "Process Created" }
    ];
  }
  // Cambiar de estado con validación
  transition(toState, reason = "Manual") {
    if (canTransition(this.currentState, toState)) {
      this.currentState = toState;
      this.history.push({ state: toState, timestamp: Date.now(), reason });
      return true;
    } else {
      return false;
    }
  }

  // Obtener historial de transiciones
  getHistory() {
    return this.history;
  }

  // --- Nuevo: Calcular métricas directamente desde el proceso ---
  getMetrics() {
    const metrics = {
      pid: this.pid,
      totalTransitions: this.history.length - 1,
      timeInStates: this.initStateTimes(),
      transitions: this.history.map(h => ({
        state: h.state,
        timestamp: new Date(h.timestamp).toLocaleTimeString(),
        reason: h.reason
      }))
    };

    // Calcular duración en cada estado
    for (let i = 0; i < this.history.length - 1; i++) {
      const current = this.history[i];
      const next = this.history[i + 1];
      const duration = next.timestamp - current.timestamp;

      metrics.timeInStates[current.state] += duration;
    }

    // Último estado hasta ahora
    const last = this.history[this.history.length - 1];
    metrics.timeInStates[last.state] += Date.now() - last.timestamp;

    return metrics;
  }

  // Exportar a JSON
  exportMetricsJSON() {
    return JSON.stringify(this.getMetrics(), null, 2);
  }

  // Exportar a CSV
  exportMetricsCSV() {
    const metrics = this.getMetrics();
    const headers = "State,Time(ms)\n";
    const rows = Object.entries(metrics.timeInStates)
      .map(([state, time]) => `${state},${time}`)
      .join("\n");
    return headers + rows;
  }

  // Inicializa tiempos en 0
  initStateTimes() {
    const times = {};
    Object.values(STATES).forEach(state => {
      times[state] = 0;
    });
    return times;
  }
}
