import React, { useState } from 'react';
import './ControlsPanel.css';

export default function ControlsPanel({
  processes,
  selectedProcess,
  setSelectedProcess,
  transitionActions,
  simulationSpeed,
  changeSimulationSpeed,
  isAutoMode,
  toggleAutoMode,
  autoTransitionTimes,
  updateAutoTransitionTime,
  createNewProcess,
  generateReport,
  resetSimulation,
  showTechnicalDetails,
}) {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showTimeConfig, setShowTimeConfig] = useState(false);

  const STATES = { NEW:'New', READY:'Ready', RUNNING:'Running', BLOCKED:'Blocked', TERMINATED:'Terminated' };
  const validMap = {
    [STATES.NEW]: ['admit'],
    [STATES.READY]: ['assignCPU'],
    [STATES.RUNNING]: ['requestIO','terminate','preempt'],
    [STATES.BLOCKED]: ['releaseIO'],
    [STATES.TERMINATED]: [],
  };
  const can = (state, t) => validMap[state]?.includes(t);
  const color = (s) => ({
    [STATES.NEW]:'#6c757d', [STATES.READY]:'#28a745', [STATES.RUNNING]:'#007bff', [STATES.BLOCKED]:'#ffc107', [STATES.TERMINATED]:'#dc3545'
  }[s] || '#6c757d');

  const pidNum = selectedProcess ? String(selectedProcess) : '';
  const selProcessObj = processes.find(p => String(p.pid) === pidNum);

  return (
    <div className="controls-panel">
      <div className="panel-header">
        <h3>🎮 Control de Simulación</h3>
        <div className="header-stats">
          <span className="process-count">Procesos: {processes.length}</span>
          <span className="speed-indicator">{simulationSpeed} {isAutoMode && '🤖'}</span>
        </div>
      </div>

      <div className="basic-controls">
        <h4>Controles Básicos</h4>
        <div className="control-group">
          <button className="btn btn-primary" onClick={createNewProcess}>➕ Crear Proceso</button>
        </div>

        <div className="control-group">
          <label>Proceso Seleccionado:</label>
          <select value={pidNum} onChange={(e) => setSelectedProcess(e.target.value || null)}>
            <option value="">Seleccionar proceso...</option>
            {processes.map(p => (
              <option key={p.pid} value={String(p.pid)}>PID {p.pid} - {p.state}</option>
            ))}
          </select>
        </div>

        {selProcessObj && (
          <div className="transition-buttons">
            <h5>Transiciones para PID {pidNum}:</h5>
            <div className="button-grid">
              <button className="btn btn-success" onClick={() => transitionActions.admit(pidNum)} disabled={!can(selProcessObj.state,'admit')}>✅ Admitir</button>
              <button className="btn btn-info" onClick={() => transitionActions.assignCPU(pidNum)} disabled={!can(selProcessObj.state,'assignCPU')}>🔄 Asignar CPU</button>
              <button className="btn btn-warning" onClick={() => transitionActions.requestIO(pidNum)} disabled={!can(selProcessObj.state,'requestIO')}>💾 Solicitar E/S</button>
              <button className="btn btn-secondary" onClick={() => transitionActions.releaseIO(pidNum)} disabled={!can(selProcessObj.state,'releaseIO')}>✔️ Completar E/S</button>
              <button className="btn btn-outline-info" onClick={() => transitionActions.preempt(pidNum)} disabled={!can(selProcessObj.state,'preempt')}>⏰ Fin Quantum</button>
              <button className="btn btn-danger" onClick={() => transitionActions.terminate(pidNum)} disabled={!can(selProcessObj.state,'terminate')}>❌ Terminar</button>
            </div>
          </div>
        )}
      </div>

      <div className="speed-controls">
        <h4>Velocidad de Simulación</h4>
        <div className="speed-buttons">
          {Object.entries({paused:'⏸️ Pausa', slow:'🐌 Lento', normal:'▶️ Normal', fast:'⚡ Rápido'}).map(([key,label]) => (
            <button key={key} className={`btn ${simulationSpeed===key? 'btn-active':'btn-outline'}`} onClick={() => changeSimulationSpeed(key)}>{label}</button>
          ))}
        </div>
      </div>

      <button className="btn btn-outline-secondary" onClick={() => setShowAdvancedControls(v=>!v)}>
        {showAdvancedControls ? '🔽' : '▶️'} Controles Avanzados
      </button>

      {showAdvancedControls && (
        <div className="advanced-controls">
          <div className="control-group">
            <label>
              <input type="checkbox" checked={isAutoMode} onChange={toggleAutoMode} /> 🤖 Modo Automático
            </label>
          </div>

          <button className="btn btn-outline" onClick={() => setShowTimeConfig(v=>!v)}>⚙️ Configurar Tiempos</button>
          {showTimeConfig && (
            <div className="time-config">
              {Object.entries({
                newToReady: 'New → Ready (ms)',
                readyToRunning: 'Ready → Running (ms)',
                runningToBlocked: 'Running → Blocked (ms)',
                blockedToReady: 'Blocked → Ready (ms)',
                runningToTerminated: 'Running → Terminated (ms)'
              }).map(([k,label]) => (
                <div key={k} className="time-input">
                  <label>{label}:</label>
                  <input type="number" min="200" max="20000" step="100" value={autoTransitionTimes[k]} onChange={e=>updateAutoTransitionTime(k, parseInt(e.target.value||'0',10))} />
                </div>
              ))}
            </div>
          )}

          <div className="utility-buttons">
            <button className="btn btn-info" onClick={generateReport}>📊 Generar Reporte</button>
            <button className="btn btn-warning" onClick={resetSimulation}>🔄 Reiniciar Simulación</button>
          </div>
        </div>
      )}

      <div className="process-status">
        <h4>Estado Actual de Procesos</h4>
        <div className="process-list">
          {processes.length === 0 ? (
            <div className="no-processes">Sin procesos activos</div>
          ) : (
            processes.map(p => (
              <div key={p.pid} className={`process-item ${pidNum===String(p.pid)?'selected':''}`} onClick={()=>setSelectedProcess(String(p.pid))} style={{ borderLeft: `4px solid ${color(p.state)}` }}>
                <div className="process-header">
                  <span className="pid">PID {p.pid}</span>
                  <span className="state-badge" style={{ backgroundColor: color(p.state) }}>{p.state}</span>
                </div>
                {showTechnicalDetails && p.technicalInfo ? (
                  <div className="technical-details">
                    <small>PC: {p.technicalInfo.programCounter} | Prioridad: {p.technicalInfo.priority} | Tiempo: {p.timeInCurrentState}ms</small>
                  </div>
                ) : (
                  <div className="basic-info">
                    <small>Tiempo en estado: {p.timeInCurrentState}ms</small>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min((p.timeInCurrentState/5000)*100,100)}%`, backgroundColor: color(p.state) }} /></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="quick-stats">
        <h4>📈 Estadísticas</h4>
        <div className="stats-grid">
          {Object.values(STATES).map(state => (
            <div key={state} className="stat-item">
              <span className="stat-dot" style={{ backgroundColor: color(state) }} />
              <span className="stat-label">{state}</span>
              <span className="stat-value">{processes.filter(p=>p.state===state).length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
