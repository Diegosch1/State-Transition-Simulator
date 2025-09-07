import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "../state_node/CustomNode";

const nodeTypes = {
  custom: CustomNode,
};

const EDGES = [
  { id: "new-ready", source: "New", target: "Ready" , targetHandle: "left"},
  { id: "ready-running", source: "Ready", target: "Running" },
  { id: "running-ready", source: "Running", target: "Ready", targetHandle: "right", sourceHandle: "left" },
  { id: "running-waiting", source: "Running", target: "Waiting", sourceHandle: "bottom" , targetHandle: "top"},
  { id: "waiting-ready", source: "Waiting", target: "Ready" , targetHandle: "bottom", sourceHandle: "left"},
  { id: "running-terminated", source: "Running", target: "Terminated" },
].map((edge) => ({
  ...edge,
  type: "default",
  style: { stroke: "#ca1212", strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#ca1212",
  },
}));

const StateDiagramComponent = ({
  nodesData,
  onTransition,
  controller,
  nodePositions,
}) => {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const initialNodes = Object.keys(nodePositions).map((state) => ({
      id: state,
      type: "custom",
      draggable: true,
      position: nodePositions[state],
      data: {
        name: state,
        items: nodesData[state] || [],
        onTransition,
        controller,
      },
    }));
    setNodes(initialNodes);
  }, [nodePositions, nodesData, onTransition, controller]);

  // Manejar cambio de posición al arrastrar
  const onNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlow
        nodes={nodes}
        edges={EDGES}
        nodeTypes={nodeTypes}
        fitView
        onNodesChange={onNodesChange} // <- importante
      >
        <Background gap={20} color="#aaa" />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default StateDiagramComponent;
