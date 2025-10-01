import React, { useState, useEffect, useRef } from "react";
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

const BASE_EDGES = [
  { id: "new-ready", source: "New", target: "Ready", targetHandle: "left" },
  { id: "ready-running", source: "Ready", target: "Running" },
  { id: "running-ready", source: "Running", target: "Ready", targetHandle: "top", sourceHandle: "top" },
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
  const [edges, setEdges] = useState(BASE_EDGES);
  const [animatedLogos, setAnimatedLogos] = useState([]);
  const containerRef = useRef(null);

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

  // Helper robusto para localizar el nodo en pantalla
  const getNodeViewportCenter = (state) => {
    const elById = document.getElementById(`node-${state}`);
    const el = elById || document.querySelector(`[data-id='${state}']`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  // Animación al ocurrir transición
  useEffect(() => {
    if (!controller) return;

    controller.onTransition = ({ process, fromState, toState, reason }) => {      

      if (!process) return;

      // Si es creación de proceso (fromState es null), solo actualizar nodos
      if (fromState === null && toState === "New") {
        updateNodesData();
        return;
      }

      // Colorear temporalmente la arista activa
      setEdges((eds) =>
        eds.map((edge) =>
          edge.source === fromState && edge.target === toState
            ? {
                ...edge,
                style: { stroke: "#16a34a", strokeWidth: 3 },
                markerEnd: { ...edge.markerEnd, color: "#16a34a" },
              }
            : edge
        )
      );
      // Revertir a rojo después de 1s
      setTimeout(() => {
        setEdges((eds) =>
          eds.map((edge) =>
            edge.source === fromState && edge.target === toState
              ? {
                  ...edge,
                  style: { stroke: "#ca1212", strokeWidth: 2 },
                  markerEnd: { ...edge.markerEnd, color: "#ca1212" },
                }
              : edge
          )
        );
      }, 1000);

      // Esperar dos frames para animación de logo
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const fromViewport = getNodeViewportCenter(fromState);
          const toViewport = getNodeViewportCenter(toState);

          if (!fromViewport || !toViewport || !containerRef.current) {
            updateNodesData();
            return;
          }

          const containerRect = containerRef.current.getBoundingClientRect();
          const start = {
            x: fromViewport.x - containerRect.left,
            y: fromViewport.y - containerRect.top,
          };
          const end = {
            x: toViewport.x - containerRect.left,
            y: toViewport.y - containerRect.top,
          };

          setAnimatedLogos((prev) => [
            ...prev.filter((l) => l.pid !== process.pid),
            {
              pid: process.pid,
              logo: process.logo,
              start,
              end,
            },
          ]);

          setTimeout(() => {
            updateNodesData();
            setAnimatedLogos((prev) => prev.filter((l) => l.pid !== process.pid));
          }, 800);
        });
      });
    };

    return () => {
      if (controller) controller.onTransition = null;
    };
  }, [controller, nodes]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "600px", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}        
        onNodesChange={onNodesChange}
      >
        <Background gap={25} color="#aaa" />
        <Controls />
      </ReactFlow>

      {animatedLogos.map(({ pid, logo, start, end }) => (
        <AnimatedLogo
          key={pid}
          logo={logo}
          start={start}
          end={end}
          duration={0.8}
          onComplete={() => setAnimatedLogos((prev) => prev.filter((l) => l.pid !== pid))}
        />
      ))}
    </div>
  );
};

export default StateDiagramComponent;
