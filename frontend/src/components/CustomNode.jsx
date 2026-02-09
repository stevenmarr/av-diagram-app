// frontend/src/components/CustomNode.jsx
import { Handle, Position } from '@xyflow/react';

/**
 * Custom node component that renders any device with pins from JSON payload.
 * - Parses "pins" array and renders unique <Handle /> for each pin
 - Handles flush on edge (left for inputs, right for outputs)
 - Labels inside the node, aligned to edges
 - Dynamic height based on pin count
 - No overlap
 */

export default function CustomNode({ data }) {
  const {
    label = 'Unnamed Node',
    color = '#3366FF',
    pins = [],
    notes = '',
    manufacturer = '',
    model = ''
  } = data || {};

  // Split pins by type
  const inputs = pins.filter(p => p.type === 'input');
  const outputs = pins.filter(p => p.type === 'output');

  // Calculate height based on max pins per side
  const maxPins = Math.max(inputs.length, outputs.length);
  const nodeHeight = 80 + maxPins * 32;

  return (
    <div
      style={{
        background: color,
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '2px solid #444',
        width: '280px',
        minHeight: `${nodeHeight}px`,
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
      }}
      title={notes || undefined}
    >
      {/* Node label + manufacturer/model */}
      <div style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '14px' }}>
        {label}
        <br />
        <small style={{ opacity: 0.8 }}>
          {manufacturer} {model}
        </small>
      </div>

      {/* Pins container */}
      <div style={{ position: 'relative', flex: 1 }}>
        {/* INPUT pins – left edge */}
        {inputs.map((pin, index) => (
          <div
            key={pin.id}
            style={{
              position: 'absolute',
              left: 0,
              top: 50 + index * 32,
              display: 'flex',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={pin.id}
              style={{
                left: '0px', // flush on left edge
                background: '#fff',
                border: '2px solid #000',
                width: '12px',
                height: '12px'
              }}
            />
            <span
              style={{
                marginLeft: '16px',
                fontSize: '11px',
                color: '#eee'
              }}
            >
              {pin.label || pin.id}
            </span>
          </div>
        ))}

        {/* OUTPUT pins – right edge */}
        {outputs.map((pin, index) => (
          <div
            key={pin.id}
            style={{
              position: 'absolute',
              right: 0,
              top: 50 + index * 32,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'flex-end'
            }}
          >
            <span
              style={{
                marginRight: '16px',
                fontSize: '11px',
                color: '#eee'
              }}
            >
              {pin.label || pin.id}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={pin.id}
              style={{
                right: '0px', // flush on right edge
                background: '#fff',
                border: '2px solid #000',
                width: '12px',
                height: '12px'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}