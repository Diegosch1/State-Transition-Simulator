import React from 'react';
import { STATES } from '../../core/stateMachine';
import './StateNodeComponent.css';

const StateNodeComponent = ({ name, items, onTransition, controller }) => (
  <div className="state-node">
    <div className="state-node-title">{name}</div>
    <ul className="state-node-list">
      {items && items.map((process) => {
        if (!process) return null;

        const key = process.pid || `${name}-${Math.random()}`;

        return (
          <li className="state-node-item" key={process.pid}>
            <div className="process-info">
              <img
                src={process.logo}
                alt={`Logo ${process.pid}`}
                className="process-logo"
                width={32}
                height={32}
              />
              {process.pid}
            </div>

            {/* Botones según el estado */}
            {process.currentState === STATES.NEW && (
              <button onClick={() => onTransition(process)}>
                Admitir
              </button>
            )}
            {process.currentState === STATES.READY && (
              <button onClick={() => onTransition(process)}>
                Asignar CPU
              </button>
            )}
            {process.currentState === STATES.RUNNING && (
              <>
                <button onClick={() => onTransition(process)}>
                  Solicitar E/S
                </button>
                <button onClick={() => onTransition(process)}>
                  Desalojar
                </button>
                <button onClick={() => onTransition(process)}>
                  Terminar
                </button>
              </>
            )}
            {process.currentState === STATES.WAITING && (
              <button onClick={() => onTransition(process)}>
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
