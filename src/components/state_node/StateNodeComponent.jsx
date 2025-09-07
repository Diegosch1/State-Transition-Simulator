import React from 'react';
import { STATES } from '../../core/stateMachine';
import './StateNodeComponent.css';

const StateNodeComponent = ({ name, items, onTransition, controller }) => (
    <div className="state-node">
        <div className="state-node-title">{name}</div>
        <ul className="state-node-list">
            {items && items.map((pid) => {
                const process = controller.getProcesses().find(p => p.pid === pid);
                if (!process) return null; // Si el PID no existe

                return (
                    <li className="state-node-item" key={process.pid}>
                        <div className="process-info">
                            {process.logo ? (
                                <img src={process.logo} alt={`Logo ${process.pid}`} width={32} height={32} />
                            ) : null}
                            {process.pid}
                        </div>

                        {/* Botones según el estado */}
                        {process.currentState === STATES.NEW && (
                            <button onClick={() => onTransition(process.pid, controller.admitProcess.bind(controller))}>
                                Admitir
                            </button>
                        )}
                        {process.currentState === STATES.READY && (
                            <button onClick={() => onTransition(process.pid, controller.assignCPU.bind(controller))}>
                                Asignar CPU
                            </button>
                        )}
                        {process.currentState === STATES.RUNNING && (
                            <>
                                <button onClick={() => onTransition(process.pid, controller.requestIO.bind(controller))}>
                                    Solicitar E/S
                                </button>
                                <button onClick={() => onTransition(process.pid, controller.preemptProcess.bind(controller))}>
                                    Desalojar
                                </button>
                                <button onClick={() => onTransition(process.pid, controller.terminateProcess.bind(controller))}>
                                    Terminar
                                </button>
                            </>
                        )}
                        {process.currentState === STATES.WAITING && (
                            <button onClick={() => onTransition(process.pid, controller.completeIO.bind(controller))}>
                                Liberar E/S
                            </button>
                        )}
                    </li>
                );
            })}

        </ul>
    </div>
);

export default StateNodeComponent;
