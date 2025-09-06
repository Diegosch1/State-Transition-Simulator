
export default class EventLogger {
  constructor() {
    this.events = [];
    this.startTime = Date.now();
  }

  /** Registrar un evento de transición */
  logEvent(processId, eventType, reason, fromState = null, toState = null) {
    const event = {
      id: this.#generateEventId(),
      processId: String(processId),
      eventType,
      reason,
      fromState,
      toState,
      timestamp: new Date(),
      relativeTime: Date.now() - this.startTime,
    };
    this.events.push(event);
    if (process.env.NODE_ENV === 'development') console.log('📝 Event logged', event);
    return event;
  }

  getAllEvents() { return [...this.events]; }
  getEventsForProcess(processId) { return this.events.filter(e => e.processId === String(processId)); }
  getEventsByType(eventType) { return this.events.filter(e => e.eventType === eventType); }
  getEventsInTimeRange(startTime, endTime) {
    return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  clearEvents() { this.events = []; this.startTime = Date.now(); }

  /** Estadísticas de transiciones y procesos */
  calculateTransitionStats() {
    const transitionCounts = {};
    const processStats = {};

    for (const e of this.events) {
      transitionCounts[e.eventType] = (transitionCounts[e.eventType] || 0) + 1;

      if (!processStats[e.processId]) {
        processStats[e.processId] = {
          totalTransitions: 0,
          statesVisited: new Set(),
          totalLifetime: 0,
          createdAt: null,
          terminatedAt: null,
        };
      }
      const s = processStats[e.processId];
      s.totalTransitions++;
      if (e.eventType === 'CREATE') s.createdAt = e.timestamp;
      if (e.eventType === 'EXIT') {
        s.terminatedAt = e.timestamp;
        if (s.createdAt) s.totalLifetime = s.terminatedAt - s.createdAt;
      }
      if (e.toState) s.statesVisited.add(e.toState);
    }

    for (const pid of Object.keys(processStats)) {
      processStats[pid].statesVisited = Array.from(processStats[pid].statesVisited);
    }

    return {
      transitionCounts,
      processStats,
      totalEvents: this.events.length,
      simulationDuration: Date.now() - this.startTime,
    };
  }

  /** Calcula tiempos por estado recorriendo cronológicamente los eventos */
  calculateAverageTimeInStates() {
    const byPid = new Map();
    const sorted = [...this.events].sort((a, b) => a.timestamp - b.timestamp);

    for (const e of sorted) {
      if (!byPid.has(e.processId)) {
        byPid.set(e.processId, { currentState: null, enteredAt: null, times: {} });
      }
      const rec = byPid.get(e.processId);

      if (e.eventType === 'CREATE' && e.toState) {
        rec.currentState = e.toState;
        rec.enteredAt = e.timestamp.getTime();
        continue;
      }

      if (e.fromState && rec.enteredAt != null) {
        const now = e.timestamp.getTime();
        const prev = e.fromState;
        rec.times[prev] = (rec.times[prev] || 0) + (now - rec.enteredAt);
      }

      if (e.toState) {
        rec.currentState = e.toState;
        rec.enteredAt = e.timestamp.getTime();
      }

      if (e.eventType === 'EXIT' && rec.enteredAt != null) {
        const now = e.timestamp.getTime();
        const prev = e.fromState || rec.currentState;
        if (prev) rec.times[prev] = (rec.times[prev] || 0) + (now - rec.enteredAt);
        rec.enteredAt = null;
      }
    }

    const totals = {};
    const counts = {};
    for (const { times } of byPid.values()) {
      for (const [state, ms] of Object.entries(times)) {
        totals[state] = (totals[state] || 0) + ms;
        counts[state] = (counts[state] || 0) + 1;
      }
    }

    const averages = {};
    for (const state of Object.keys(totals)) {
      averages[state] = Math.round(totals[state] / counts[state]);
    }
    for (const s of ['New','Ready','Running','Blocked','Terminated']) {
      if (!(s in averages)) averages[s] = 0;
    }
    return averages;
  }

  /** Reporte completo */
  generateReport() {
    const stats = this.calculateTransitionStats();
    const averageTimes = this.calculateAverageTimeInStates();
    return {
      metadata: {
        reportGeneratedAt: new Date().toISOString(),
        simulationStartTime: new Date(this.startTime).toISOString(),
        totalSimulationTime: Date.now() - this.startTime,
        version: '1.0.0',
      },
      summary: {
        totalEvents: stats.totalEvents,
        totalProcesses: Object.keys(stats.processStats).length,
        mostCommonTransition: this.#getMostCommonTransition(stats.transitionCounts),
        averageProcessLifetime: this.#calculateAverageProcessLifetime(stats.processStats),
      },
      statistics: {
        transitionCounts: stats.transitionCounts,
        averageTimeInStates: averageTimes,
        processStats: stats.processStats,
      },
      events: this.events,
      timeline: this.#generateTimeline(),
    };
  }

  /** Exportar JSON y CSV */
  exportReportFiles(reportObj) {
    const json = JSON.stringify(reportObj, null, 2);
    this.#triggerDownload(new Blob([json], { type: 'application/json' }), `report_${Date.now()}.json`);

    const header = 'id,processId,eventType,fromState,toState,timestamp';
    const rows = this.events.map(e => [
      e.id, e.processId, e.eventType, e.fromState ?? '', e.toState ?? '', e.timestamp.toISOString()
    ].map(v => String(v).replaceAll(',', ';')).join(','));
    const csv = [header, ...rows].join('\n');
    this.#triggerDownload(new Blob([csv], { type: 'text/csv' }), `events_${Date.now()}.csv`);
  }

  // ---------- privados ----------
  #generateEventId() { return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`; }

  #getMostCommonTransition(map) {
    let best = null; let max = -1;
    for (const [k, v] of Object.entries(map)) { if (v > max) { max = v; best = k; } }
    return best;
  }

  #calculateAverageProcessLifetime(processStats) {
    const lifetimes = Object.values(processStats).map(s => s.totalLifetime).filter(Boolean);
    if (!lifetimes.length) return 0;
    return Math.round(lifetimes.reduce((a, b) => a + b, 0) / lifetimes.length);
  }

  #generateTimeline() {
    return [...this.events]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(e => ({ t: e.timestamp.toISOString(), pid: e.processId, type: e.eventType, from: e.fromState, to: e.toState }));
  }

  #triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}
