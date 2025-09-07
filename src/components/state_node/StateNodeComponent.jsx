// StateNodeComponent.jsx (Modificado)
import React from 'react';
import { STATES } from '../../core/stateMachine'; // Importa los estados
import './StateNodeComponent.css';

const StateNodeComponent = ({ name, items, onTransition, controller }) => (
    <div className="state-node">
        <div className="state-node-title">
            {name}
        </div>
        <ul className="state-node-list">
            {items && items.map((process) => (
                <li className="state-node-item" key={process.pid}>
                    <div className="process-info">
                        PID: {process.pid}
                    </div>
                    {process.currentState === STATES.NEW && (
                        <button
                            onClick={() => {
                                const result = onTransition(process.pid, controller.admitProcess.bind(controller));
                            }}
                        >
                            Admitir
                        </button>

                    )}                    

                    {/* Botones de transición manual */}
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
            ))}
        </ul>
    </div >
);

export default StateNodeComponent;