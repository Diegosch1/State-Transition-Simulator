const PROCESS_STATES = {
  NEW: 'New',
  READY: 'Ready',
  RUNNING: 'Running',
  BLOCKED: 'Blocked',
  TERMINATED: 'Terminated',
};

let pidCounter = 1;

export class StateMachine {
  createProcess() {
    return {
      pid: pidCounter++,
      state: PROCESS_STATES.NEW,
      technicalInfo: {
        programCounter: 0,
        priority: Math.floor(Math.random() * 5) + 1
      },
      timeInCurrentState: 0
    };
  }

  executeTransition(process, transition) {
    const nextState = this.getNextState(process.state, transition);
    if (!nextState) {
      throw new Error(`Transición ${transition} inválida desde ${process.state}`);
    }
    return {
      ...process,
      state: nextState,
      timeInCurrentState: 0
    };
  }

  getNextState(current, transition) {
    const rules = {
      New: { ADMIT: PROCESS_STATES.READY },
      Ready: { DISPATCH: PROCESS_STATES.RUNNING },
      Running: {
        IO_WAIT: PROCESS_STATES.BLOCKED,
        TIMEOUT: PROCESS_STATES.READY,
        EXIT: PROCESS_STATES.TERMINATED
      },
      Blocked: { IO_COMPLETE: PROCESS_STATES.READY },
    };
    return rules[current]?.[transition] || null;
  }
}

export { PROCESS_STATES };
