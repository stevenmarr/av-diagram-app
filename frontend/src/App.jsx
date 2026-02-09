// frontend/src/App.jsx
import { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './components/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Context menu state
  const [menu, setMenu] = useState(null); // { x, y, nodeId, nodeData }

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const isValidConnection = useCallback(
    (connection) => {
      const { source, sourceHandle, target, targetHandle } = connection;
      if (source === target) return false;

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return false;

      const sourcePin = sourceNode.data.pins?.find((p) => p.id === sourceHandle);
      const targetPin = targetNode.data.pins?.find((p) => p.id === targetHandle);
      if (!sourcePin || !targetPin) return false;

      if (sourcePin.type !== 'output' || targetPin.type !== 'input') return false;
      if (sourcePin.spec !== targetPin.spec) return false;

      const fromSource = edges.filter(
        (e) => e.source === source && e.sourceHandle === sourceHandle
      );
      const toTarget = edges.filter(
        (e) => e.target === target && e.targetHandle === targetHandle
      );

      return fromSource.length === 0 && toTarget.length === 0;
    },
    [nodes, edges]
  );

  // Right-click on node → show menu
  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    setMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
      nodeData: node.data,
    });
  };

  // Close menu when clicking elsewhere
  const closeMenu = () => setMenu(null);

  // Menu actions
  const handleDelete = () => {
    if (!menu) return;
    setNodes((nds) => nds.filter((n) => n.id !== menu.nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== menu.nodeId && e.target !== menu.nodeId)
    );
    closeMenu();
  };

  const handleEditLabel = () => {
    if (!menu) return;
    const newLabel = prompt('New label:', menu.nodeData.label || '');
    if (newLabel) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === menu.nodeId
            ? { ...n, data: { ...n.data, label: newLabel } }
            : n
        )
      );
    }
    closeMenu();
  };

  const handleInfo = () => {
    if (!menu) return;
    alert(
      `Node Info:\n` +
        `ID: ${menu.nodeId}\n` +
        `Label: ${menu.nodeData.label || '—'}\n` +
        `Pins: ${menu.nodeData.pins?.length || 0}`
    );
    closeMenu();
  };

  // Listen for nodes from Python/console
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'add-node') {
        const payloads = Array.isArray(event.data.payload)
          ? event.data.payload
          : [event.data.payload];

        const newNodes = payloads.map((p) => ({
          id: p.id || `node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'custom',
          position: p.position || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
          data: {
            label: p.label || p.model || p.device_type || 'Unnamed Node',
            color: p.color || '#3366FF',
            pins: p.pins || [],
            notes: p.notes || '',
            manufacturer: p.manufacturer || '',
            model: p.model || '',
          },
          draggable: true,
        }));

        setNodes((prev) => [...prev, ...newNodes]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh' }} onClick={closeMenu}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        minZoom={0.1}
        maxZoom={4}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Simple context menu */}
      {menu && (
        <div
          style={{
            position: 'fixed',
            left: menu.x,
            top: menu.y,
            background: '#1e2937',
            color: 'white',
            border: '1px solid #475569',
            borderRadius: '6px',
            padding: '6px 0',
            minWidth: '160px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={handleEditLabel}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            className="hover:bg-slate-700"
          >
            Edit Label
          </div>
          <div
            onClick={handleInfo}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            className="hover:bg-slate-700"
          >
            Node Info
          </div>
          <div
            onClick={handleDelete}
            style={{ padding: '8px 16px', cursor: 'pointer', color: '#ef4444' }}
            className="hover:bg-slate-700"
          >
            Delete Node
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with provider (required for React Flow v12+)
export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}