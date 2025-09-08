import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "../state_node/CustomNode";
import AnimatedLogo from "../AnimatedLogo";

const nodeTypes = {
  custom: CustomNode,
};

const EDGES = [
  { id: "new-ready", source: "New", target: "Ready", targetHandle: "left" },
  { id: "ready-running", source: "Ready", target: "Running" },
  { id: "running-ready", source: "Running", target: "Ready", targetHandle: "right", sourceHandle: "left" },
  { id: "running-waiting", source: "Running", target: "Waiting", sourceHandle: "bottom", targetHandle: "top" },
  { id: "waiting-ready", source: "Waiting", target: "Ready", targetHandle: "bottom", sourceHandle: "left" },
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

const StateDiagramComponent = ({ nodesData, onTransition, controller, nodePositions, showTechnicalDetails }) => {
  const [nodes, setNodes] = useState([]);
  const [animatedLogos, setAnimatedLogos] = useState([]);

  // Función para actualizar nodos con datos actuales
  const updateNodesData = () => {
    const allProcesses = controller.getProcesses();
    
    setNodes(currentNodes => 
      currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          items: allProcesses.filter(p => p.currentState === node.id)
        }
      }))
    );
  };

  // Inicializar nodos
  useEffect(() => {
    const initialNodes = Object.keys(nodePositions).map((state) => ({
      id: state,
      type: "custom",
      draggable: true,
      position: nodePositions[state],
      data: {
        name: state,
        items: [],
        onTransition,
        controller,
        showTechnicalDetails,
      },
    }));
    setNodes(initialNodes);
  }, [nodePositions, onTransition, controller]);

  // Actualizar nodos cuando cambian los datos externos
  useEffect(() => {
    if (nodes.length > 0 && controller) {
      updateNodesData();
    }
  }, [nodesData, controller]);

  const onNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  // Animación al ocurrir transición
  useEffect(() => {
    if (!controller) return;

    controller.onTransition = ({ process, fromState, toState, reason }) => {
      console.log(`Transition: ${process?.pid} from ${fromState} to ${toState} - ${reason}`);
      
      if (!process) return;

      // Si es creación de proceso (fromState es null), solo actualizar nodos
      if (fromState === null && toState === 'New') {
        console.log(`New process created: ${process.pid}`);
        updateNodesData();
        return;
      }

      // Para transiciones normales, hacer animación
      const fromPos = nodes.find(n => n.id === fromState)?.position;
      const toPos = nodes.find(n => n.id === toState)?.position;
      
      if (!fromPos || !toPos) {
        // Si no hay posiciones para animar, solo actualizar datos
        updateNodesData();
        return;
      }

      // Agregar logo animado
      setAnimatedLogos(prev => [
        ...prev.filter(l => l.pid !== process.pid), // Remove existing animation for this process
        {
          pid: process.pid,
          logo: process.logo,
          start: { x: fromPos.x + 60, y: fromPos.y + 40 }, // Offset para centrar mejor
          end: { x: toPos.x + 60, y: toPos.y + 40 },
        }
      ]);

      // Actualizar nodos después de la animación
      setTimeout(() => {
        updateNodesData();
        setAnimatedLogos(prev => prev.filter(l => l.pid !== process.pid));
      }, 800);
    };

    // Cleanup function
    return () => {
      if (controller) {
        controller.onTransition = null;
      }
    };
  }, [controller, nodes]);

  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={EDGES}
        nodeTypes={nodeTypes}
        fitView
        onNodesChange={onNodesChange}
      >
        <Background gap={20} color="#aaa" />
        <Controls />
      </ReactFlow>

      {animatedLogos.map(({ pid, logo, start, end }) => (
        <AnimatedLogo
          key={`${pid}-${Date.now()}`} // Unique key to avoid conflicts
          logo={logo}
          start={start}
          end={end}
          duration={0.8}
          onComplete={() => setAnimatedLogos(prev => prev.filter(l => l.pid !== pid))}
        />
      ))}
    </div>
  );
};

export default StateDiagramComponent;