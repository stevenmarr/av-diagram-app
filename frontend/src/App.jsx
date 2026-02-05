// frontend/src/App.jsx
import React from 'react';
import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        defaultNodes={[]}          // No nodes yet — we'll add them later
        defaultEdges={[]}          // No edges yet
        fitView                    // Auto-zoom to fit content
        minZoom={0.2}              // Allow zooming out quite far
        maxZoom={4}                // Reasonable max zoom
        attributionPosition="bottom-right"
      >
        {/* Controls: zoom, fit view, lock viewport */}
        <Controls position="bottom-right" />

        {/* MiniMap: small overview in corner */}
        <MiniMap position="bottom-left" />

        {/* Background grid */}
        <Background 
          variant="dots" 
          gap={12} 
          size={1} 
          color="#aaa" 
        />
      </ReactFlow>
    </div>
  );
}

export default App;