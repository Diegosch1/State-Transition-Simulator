import React from 'react';
import './StateNodeComponent.css';

const StateNodeComponent = ({ name, items }) => (
    <div className="state-node">
        <div className="state-node-title">
            {name}
        </div>
        <ul className="state-node-list">
            {items && items.map((obj, idx) => (
                <li className="state-node-item" key={idx}>
                    {typeof obj === 'object' ? JSON.stringify(obj) : String(obj)}
                </li>
            ))}
        </ul>
    </div>
);

export default StateNodeComponent;
