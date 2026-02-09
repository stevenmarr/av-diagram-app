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

const nodeTypes = { custom: CustomNode };

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [nodeMenu, setNodeMenu] = useState(null);   // right-click on node
  const [canvasMenu, setCanvasMenu] = useState(null); // right-click on empty space

  const closeMenus = () => {
    setNodeMenu(null);
    setCanvasMenu(null);
  };

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  const isValidConnection = (connection) => {
    const { source, sourceHandle, target, targetHandle } = connection;
    if (source === target) return false;

    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode) return false;

    const sourcePin = sourceNode.data.pins?.find(p => p.id === sourceHandle);
    const targetPin = targetNode.data.pins?.find(p => p.id === targetHandle);
    if (!sourcePin || !targetPin) return false;

    if (sourcePin.type !== 'output' || targetPin.type !== 'input') return false;
    if (sourcePin.spec !== targetPin.spec) return false;

    const fromSource = edges.filter(e => e.source === source && e.sourceHandle === sourceHandle);
    const toTarget = edges.filter(e => e.target === target && e.targetHandle === targetHandle);

    return fromSource.length === 0 && toTarget.length === 0;
  };

  // Right-click on NODE
  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    console.log('Node right-click →', node.id);
    setNodeMenu({ x: event.clientX, y: event.clientY, nodeId: node.id, nodeData: node.data });
    setCanvasMenu(null);
  };

  // Right-click on EMPTY CANVAS
  const onPaneContextMenu = (event) => {
    event.preventDefault();
    console.log('Canvas right-click');
    setCanvasMenu({ x: event.clientX, y: event.clientY });
    setNodeMenu(null);
  };

  // Node menu actions
  const handleNodeAction = (action) => {
    if (!nodeMenu) return;
    const { nodeId, nodeData } = nodeMenu;

    if (action === 'edit-label') {
      const newLabel = prompt('New label:', nodeData.label || '');
      if (newLabel) {
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n));
      }
    }
    if (action === 'delete') {
      setNodes(nds => nds.filter(n => n.id !== nodeId));
      setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    }
    if (action === 'info') {
      alert(`Node Info:\nID: ${nodeId}\nLabel: ${nodeData.label || '—'}\nPins: ${nodeData.pins?.length || 0}`);
    }
    closeMenus();
  };

  // Canvas menu actions (blank for now)
  const handleCanvasAction = (action) => {
    if (action === 'add-device') alert('Add new device coming soon...');
    if (action === 'save-graph') alert('Save graph coming soon...');
    if (action === 'clear-canvas') {
      if (window.confirm('Clear entire canvas?')) {
        setNodes([]);
        setEdges([]);
      }
    }
    closeMenus();
  };

  // Listen for nodes from Python
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'add-node') {
        const payloads = Array.isArray(event.data.payload) ? event.data.payload : [event.data.payload];

        const newNodes = payloads.map(p => ({
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

        setNodes(prev => [...prev, ...newNodes]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }} onClick={closeMenus}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        fitView
        minZoom={0.1}
        maxZoom={4}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* NODE MENU - bright yellow, impossible to miss */}
      {nodeMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${nodeMenu.x}px`,
            top: `${nodeMenu.y}px`,
            zIndex: 99999,
            background: '#ffeb3b',
            border: '4px solid red',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 0 30px rgba(0,0,0,0.6)',
            minWidth: '200px',
            color: '#000',
            fontWeight: 'bold',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <strong>Node Menu</strong><br /><br />
          <div onClick={() => handleNodeAction('edit-label')} style={{ padding: '8px', cursor: 'pointer' }}>Edit Label</div>
          <div onClick={() => handleNodeAction('info')} style={{ padding: '8px', cursor: 'pointer' }}>Node Info</div>
          <div onClick={() => handleNodeAction('delete')} style={{ padding: '8px', cursor: 'pointer', color: 'red' }}>Delete Node</div>
        </div>
      )}

      {/* CANVAS MENU - bright green */}
      {canvasMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${canvasMenu.x}px`,
            top: `${canvasMenu.y}px`,
            zIndex: 99999,
            background: '#4caf50',
            border: '4px solid blue',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 0 30px rgba(0,0,0,0.6)',
            minWidth: '220px',
            color: '#000',
            fontWeight: 'bold',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <strong>Canvas Menu</strong><br /><br />
          <div onClick={() => handleCanvasAction('add-device')} style={{ padding: '8px', cursor: 'pointer' }}>Add New Device…</div>
          <div onClick={() => handleCanvasAction('save-graph')} style={{ padding: '8px', cursor: 'pointer' }}>Save Graph / Export</div>
          <div onClick={() => handleCanvasAction('clear-canvas')} style={{ padding: '8px', cursor: 'pointer', color: 'red' }}>Clear Canvas</div>
        </div>
      )}
    </div>
  );
}

export default App;