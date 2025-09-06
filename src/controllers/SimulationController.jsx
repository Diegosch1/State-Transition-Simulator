import React, { useEffect, useRef, useState } from 'react';
import ControlsPanel from './ControlsPanel';
import EventLogger from './EventLogger';

const PROCESS_STATES = {
  NEW: 'New',
  READY: 'Ready',
  RUNNING: 'Running',
  BLOCKED: 'Blocked',
  TERMINATED: 'Terminated',
};

const SPEED_FACTORS = {
  paused: Infinity,
  slow: 2,
  normal: 1,
  fast: 0.35,
};

export default function SimulationController({
  stateMachine,
  onProcessUpdate,
  onTransitionEvent,
  showTechnicalDetails = false,
}) {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState('normal');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoTransitionTimes, setAutoTransitionTimes] = useState({
    newToReady: 2000,
    readyToRunning: 3000,
    runningToBlocked: 4000,
    blockedToReady: 2500,
    runningToTerminated: 5000,
  });

  const loggerRef = useRef(new EventLogger());
  const logger = loggerRef.current;
  const timersRef = useRef(new Map());
  const runningDecisionRef = useRef(new Map());

  const pushProcessesUpdate = (next) => {
    setProcesses(next);
    onProcessUpdate?.(next);
  };

  const createNewProcess = () => {
    try {
      const p = stateMachine.createProcess();
      logger.logEvent(p.pid, 'CREATE', 'Proceso creado manualmente', null, PROCESS_STATES.NEW);
      pushProcessesUpdate([...processes, p]);
      return p;
    } catch (e) {
      alert(`Error al crear proceso: ${e.message}`);
      return null;
    }
  };

  const executeTransition = (processId, transition, reason = 'Acción manual') => {
    try {
      const idx = processes.findIndex(p => String(p.pid) === String(processId));
      if (idx === -1) throw new Error(`Proceso ${processId} no encontrado`);
      const before = processes[idx];
      const after = stateMachine.executeTransition(before, transition);
      const next = [...processes];
      next[idx] = after;
      logger.logEvent(processId, transition, reason, before.state, after.state);
      onTransitionEvent?.({ processId, fromState: before.state, toState: after.state, timestamp: new Date(), reason });
      pushProcessesUpdate(next);
      return after;
    } catch (e) {
      alert(`Transición inválida: ${e.message}`);
      return null;
    }
  };

  const transitionActions = {
    admit: (pid) => executeTransition(pid, 'ADMIT', 'Proceso admitido al sistema'),
    assignCPU: (pid) => {
      const running = processes.find(p => p.state === PROCESS_STATES.RUNNING);
      if (running && String(running.pid) !== String(pid)) {
        alert(`CPU ocupada por PID ${running.pid}`);
        return null;
      }
      return executeTransition(pid, 'DISPATCH', 'CPU asignada por planificador');
    },
    requestIO: (pid) => executeTransition(pid, 'IO_WAIT', 'Solicitud de E/S'),
    releaseIO: (pid) => executeTransition(pid, 'IO_COMPLETE', 'E/S completada'),
    preempt:   (pid) => executeTransition(pid, 'TIMEOUT', 'Fin de quantum'),
    terminate: (pid) => executeTransition(pid, 'EXIT', 'Proceso finalizado'),
  };

  const clearAllTimers = () => {
    for (const id of timersRef.current.values()) clearTimeout(id);
    timersRef.current.clear();
  };

  const scheduleForProcess = (process) => {
    const pid = String(process.pid);
    if (!isAutoMode || simulationSpeed === 'paused' || process.state === PROCESS_STATES.TERMINATED) return;
    const factor = SPEED_FACTORS[simulationSpeed] ?? 1;

    const prev = timersRef.current.get(pid);
    if (prev) clearTimeout(prev);

    let delay = 1000;
    let action = null;

    switch (process.state) {
      case PROCESS_STATES.NEW:
        delay = autoTransitionTimes.newToReady * factor;
        action = () => transitionActions.admit(pid);
        break;
      case PROCESS_STATES.READY:
        delay = autoTransitionTimes.readyToRunning * factor;
        action = () => {
          const running = processes.find(p => p.state === PROCESS_STATES.RUNNING);
          if (!running) transitionActions.assignCPU(pid);
          else scheduleForProcess(process);
        };
        break;
      case PROCESS_STATES.RUNNING: {
        const step = (runningDecisionRef.current.get(pid) || 0) % 3;
        runningDecisionRef.current.set(pid, step + 1);
        if (step === 0) { delay = autoTransitionTimes.runningToBlocked * factor; action = () => transitionActions.requestIO(pid); }
        else if (step === 1) { delay = Math.max(800, autoTransitionTimes.readyToRunning * 0.7 * factor); action = () => transitionActions.preempt(pid); }
        else { delay = autoTransitionTimes.runningToTerminated * factor; action = () => transitionActions.terminate(pid); }
        break; }
      case PROCESS_STATES.BLOCKED:
        delay = autoTransitionTimes.blockedToReady * factor;
        action = () => transitionActions.releaseIO(pid);
        break;
      default:
        return;
    }

    const id = setTimeout(action, Math.max(50, delay));
    timersRef.current.set(pid, id);
  };

  useEffect(() => {
    clearAllTimers();
    if (!isAutoMode || simulationSpeed === 'paused') return;
    processes.forEach(scheduleForProcess);
    return () => clearAllTimers();
  }, [processes, simulationSpeed, isAutoMode, autoTransitionTimes]);

  const resetSimulation = () => {
    clearAllTimers();
    runningDecisionRef.current.clear();
    setProcesses([]);
    setSelectedProcess(null);
    logger.clearEvents();
    onProcessUpdate?.([]);
  };

  const generateReport = () => {
    const rep = logger.generateReport();
    logger.exportReportFiles(rep);
    return rep;
  };

  const controlsProps = {
    processes,
    selectedProcess,
    setSelectedProcess: (v) => setSelectedProcess(v ? String(v) : null),
    transitionActions,
    simulationSpeed,
    changeSimulationSpeed: setSimulationSpeed,
    isAutoMode,
    toggleAutoMode: () => setIsAutoMode(v => !v),
    autoTransitionTimes,
    updateAutoTransitionTime: (k, ms) => setAutoTransitionTimes(prev => ({ ...prev, [k]: ms })),
    createNewProcess,
    generateReport,
    resetSimulation,
    showTechnicalDetails,
  };

  return (
    <div className="simulation-controller">
      <ControlsPanel {...controlsProps} />
      {process.env.NODE_ENV === 'development' && (
        <div style={{position:'fixed',top:10,right:10,background:'rgba(0,0,0,.8)',color:'#fff',padding:10,borderRadius:6,fontSize:12}}>
          <div>Procesos: {processes.length}</div>
          <div>Velocidad: {simulationSpeed} {isAutoMode ? '🤖' : ''}</div>
        </div>
      )}
    </div>
  );
}
