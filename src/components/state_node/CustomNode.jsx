import React from "react";
import StateNodeComponent from "./StateNodeComponent";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data }) => {
    const { name, items, onTransition, controller, showTechnicalDetails } = data;

    const handleStyle = {
        width: 1,
        height: 1,
        background: 'transparent',
        border: 'none',
    };


    return (
        <div style={{ minWidth: 120, minHeight: 80 }}>
            <StateNodeComponent
                name={name}
                items={items.filter(p => p.currentState === name)} // solo los que están en este nodo
                onTransition={onTransition}
                controller={controller}
                showTechnicalDetails={showTechnicalDetails}
            />

            <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
            <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
            <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
            <Handle type="source" position={Position.Top} id="top" style={handleStyle} />

            <Handle type="target" position={Position.Left} id="left" style={handleStyle} />
            <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
            <Handle type="target" position={Position.Right} id="right" style={handleStyle} />
            <Handle type="target" position={Position.Bottom} id="bottom" style={handleStyle} />

        </div>
    );
};

export default CustomNode;
