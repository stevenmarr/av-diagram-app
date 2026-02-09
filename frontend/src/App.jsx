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

  const [nodeMenu, setNodeMenu] = useState(null);
  const [canvasMenu, setCanvasMenu] = useState(null);

  const closeMenus = useCallback(() => {
    setNodeMenu(null);
    setCanvasMenu(null);
  }, []);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const isValidConnection = useCallback((connection) => {
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
  }, [nodes, edges]);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setNodeMenu({ x: event.clientX, y: event.clientY, nodeId: node.id, nodeData: node.data });
    setCanvasMenu(null);
  }, []);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    setCanvasMenu({ x: event.clientX, y: event.clientY });
    setNodeMenu(null);
  }, []);

  const handleNodeAction = useCallback((action) => {
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
  }, [nodeMenu, setNodes, setEdges, closeMenus]);

  // Canvas menu actions
  const handleCanvasAction = useCallback((action) => {
    if (action === 'add-device') {
      alert('Add new device coming soon...');
    }
    if (action === 'add-new-device-type') {
      // ← This is the new entry
      window.open('http://192.168.64.3:5000/super_admin/', '_blank');   // ← Change this URL to your actual endpoint
    }
    if (action === 'save-graph') {
      alert('Save graph coming soon...');
    }
    if (action === 'clear-canvas') {
      if (window.confirm('Clear entire canvas?')) {
        setNodes([]);
        setEdges([]);
      }
    }
    closeMenus();
  }, [closeMenus]);

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

      {/* Node Menu */}
      {nodeMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${nodeMenu.x}px`,
            top: `${nodeMenu.y}px`,
            zIndex: 99999,
            background: '#1f2937',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '6px 0',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
            minWidth: '180px',
            color: '#e5e7eb',
            fontSize: '14px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div onClick={() => handleNodeAction('edit-label')} style={{ padding: '10px 16px', cursor: 'pointer' }} className="hover:bg-slate-700">
            Edit Label
          </div>
          <div onClick={() => handleNodeAction('info')} style={{ padding: '10px 16px', cursor: 'pointer' }} className="hover:bg-slate-700">
            Node Info
          </div>
          <div onClick={() => handleNodeAction('delete')} style={{ padding: '10px 16px', cursor: 'pointer', color: '#f87171' }} className="hover:bg-slate-700">
            Delete Node
          </div>
        </div>
      )}

      {/* Canvas Menu - Now includes "Add New Device Type" */}
      {canvasMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${canvasMenu.x}px`,
            top: `${canvasMenu.y}px`,
            zIndex: 99999,
            background: '#1f2937',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '6px 0',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
            minWidth: '200px',
            color: '#e5e7eb',
            fontSize: '14px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div onClick={() => handleCanvasAction('add-new-device-type')} style={{ padding: '10px 16px', cursor: 'pointer' }} className="hover:bg-slate-700">
            Add New Device Type
          </div>
          <div onClick={() => handleCanvasAction('add-device')} style={{ padding: '10px 16px', cursor: 'pointer' }} className="hover:bg-slate-700">
            Add Existing Device…
          </div>
          <div onClick={() => handleCanvasAction('save-graph')} style={{ padding: '10px 16px', cursor: 'pointer' }} className="hover:bg-slate-700">
            Save Graph / Export
          </div>
          <div onClick={() => handleCanvasAction('clear-canvas')} style={{ padding: '10px 16px', cursor: 'pointer', color: '#f87171' }} className="hover:bg-slate-700">
            Clear Canvas
          </div>
        </div>
      )}
    </div>
  );
}

export default App;