// frontend/src/App.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
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

  // Node context menu
  const [nodeMenu, setNodeMenu] = useState(null);

  // Canvas context menu
  const [canvasMenu, setCanvasMenu] = useState(null);

  // Add Device Type modal
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [addDeviceFormHtml, setAddDeviceFormHtml] = useState('');

  const rootRef = useRef(null);

  // Close menus and modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setNodeMenu(null);
        setCanvasMenu(null);
        setShowAddDeviceModal(false);
        setAddDeviceFormHtml('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenus = useCallback(() => {
    setNodeMenu(null);
    setCanvasMenu(null);
  }, []);

  const closeAddDeviceModal = useCallback(() => {
    setShowAddDeviceModal(false);
    setAddDeviceFormHtml('');
  }, []);

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

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setNodeMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
      nodeData: node.data,
    });
    setCanvasMenu(null);
  }, []);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    setCanvasMenu({
      x: event.clientX,
      y: event.clientY,
    });
    setNodeMenu(null);
  }, []);

  const handleNodeMenuAction = useCallback((action) => {
    if (!nodeMenu) return;
    const { nodeId, nodeData } = nodeMenu;

    if (action === 'edit-label') {
      const newLabel = prompt('New label:', nodeData.label || '');
      if (newLabel) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n
          )
        );
      }
    }

    if (action === 'delete') {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    }

    if (action === 'info') {
      alert(
        `Node Info:\nID: ${nodeId}\nLabel: ${nodeData.label || '—'}\nPins: ${nodeData.pins?.length || 0}`
      );
    }

    closeMenus();
  }, [nodeMenu, setNodes, setEdges, closeMenus]);

  const handleCanvasAction = useCallback((action) => {
    if (action === 'add-new-device-type') {
      fetch('/super_admin/')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        .then((html) => {
          setAddDeviceFormHtml(html);
          setShowAddDeviceModal(true);
        })
        .catch((err) => {
          console.error('Failed to load form:', err);
          alert('Could not load the add device type form.');
        });
    }

    if (action === 'save-graph') {
      alert('Save graph coming soon...');
    }

    if (action === 'clear-canvas') {
      if (window.confirm('Clear entire canvas? This cannot be undone.')) {
        setNodes([]);
        setEdges([]);
      }
    }

    closeMenus();
  }, [closeMenus]);

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
    <div ref={rootRef} style={{ width: '100vw', height: '100vh', position: 'relative' }}>
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

      {/* Node context menu */}
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
          <div
            onClick={() => handleNodeMenuAction('edit-label')}
            style={{ padding: '10px 16px', cursor: 'pointer' }}
            className="hover:bg-slate-700"
          >
            Edit Label
          </div>
          <div
            onClick={() => handleNodeMenuAction('info')}
            style={{ padding: '10px 16px', cursor: 'pointer' }}
            className="hover:bg-slate-700"
          >
            Node Info
          </div>
          <div
            onClick={() => handleNodeMenuAction('delete')}
            style={{ padding: '10px 16px', cursor: 'pointer', color: '#f87171' }}
            className="hover:bg-slate-700"
          >
            Delete Node
          </div>
        </div>
      )}

      {/* Canvas context menu */}
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
          <div
            onClick={() => handleCanvasAction('add-new-device-type')}
            style={{ padding: '10px 16px', cursor: 'pointer' }}
            className="hover:bg-slate-700"
          >
            Add New Device Type
          </div>
          <div
            onClick={() => handleCanvasAction('save-graph')}
            style={{ padding: '10px 16px', cursor: 'pointer' }}
            className="hover:bg-slate-700"
          >
            Save Graph / Export
          </div>
          <div
            onClick={() => handleCanvasAction('clear-canvas')}
            style={{ padding: '10px 16px', cursor: 'pointer', color: '#f87171' }}
            className="hover:bg-slate-700"
          >
            Clear Canvas
          </div>
        </div>
      )}

      {/* Add New Device Type Modal */}
      {showAddDeviceModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closeAddDeviceModal}
        >
          <div
            style={{
              background: '#1f2937',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
              border: '1px solid #4b5563',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAddDeviceModal}
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#f87171',
                fontSize: '28px',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '4px 10px',
                lineHeight: 1,
              }}
            >
              ×
            </button>

            <div
              dangerouslySetInnerHTML={{ __html: addDeviceFormHtml }}
              style={{ padding: '2rem 2rem 2.5rem' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;