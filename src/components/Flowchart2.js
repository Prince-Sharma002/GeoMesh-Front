import React from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, Handle } from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node Components
const CircleNode = ({ data }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #43C6AC, #F8FFAE)',
      borderRadius: '50%',
      padding: '20px',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
      width: '75px',
      height: '35px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '2px solid #388E3C',
    }}
  >
    {data.label}
    <Handle type="source" position="bottom" style={{ background: '#388E3C' }} />
    <Handle type="target" position="top" style={{ background: '#388E3C' }} />
  </div>
);

const DiamondNode = ({ data }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #FF5722, #FF8A65)',
      width: '65px',
      height: '65px',
      color: 'black',
      transform: 'rotate(45deg)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
      border: '2px solid #D84315',
    }}
  >
    <div style={{ transform: 'rotate(-45deg)' }}>{data.label}</div>
    <Handle type="source" position="right" style={{ background: '#D84315' }} />
    <Handle type="target" position="left" style={{ background: '#D84315' }} />
  </div>
);

const RoundedRectNode = ({ data }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #2196F3, #64B5F6)',
      borderRadius: '10px',
      padding: '15px 20px',
      color: 'black',
      textAlign: 'center',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
      width: '120px',
      height: '50px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '2px solid #1976D2',
    }}
  >
    {data.label}
    <Handle type="source" position="right" style={{ background: '#1976D2' }} />
    <Handle type="target" position="left" style={{ background: '#1976D2' }} />
  </div>
);

const nodeTypes = {
  circle: CircleNode,
  diamond: DiamondNode,
  roundedRect: RoundedRectNode,
};

const Flowchart = () => {
  const nodes = [
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Start' }, type: 'circle' },
    { id: '2', position: { x: 250, y: 150 }, data: { label: 'Segment Map Area' }, type: 'diamond' },
    { id: '3', position: { x: 50, y: 300 }, data: { label: 'Edit Segmented Area' }, type: 'roundedRect' },
    { id: '4', position: { x: 450, y: 300 }, data: { label: 'Download as GeoJSON' }, type: 'roundedRect' },
    { id: '5', position: { x: 450, y: 450 }, data: { label: 'Download as KML' }, type: 'roundedRect' },
    { id: '6', position: { x: 250, y: 600 }, data: { label: 'Use Chatbot for Commands' }, type: 'diamond' },
    { id: '7', position: { x: 50, y: 730 }, data: { label: 'Review & Validate Data' }, type: 'roundedRect' },
    { id: '8', position: { x: 450, y: 750 }, data: { label: 'Export Final Data' }, type: 'roundedRect' },
    { id: '9', position: { x: 250, y: 900 }, data: { label: 'End' }, type: 'circle' },
  ];

  const edges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#43C6AC', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#FF5722', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#FF5722', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#FF5722', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e3-6', source: '3', target: '6', animated: true, style: { stroke: '#2196F3', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#2196F3', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e6-7', source: '6', target: '7', animated: true, style: { stroke: '#2196F3', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e6-8', source: '6', target: '8', animated: true, style: { stroke: '#2196F3', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e7-9', source: '7', target: '9', animated: true, style: { stroke: '#43C6AC', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e8-9', source: '8', target: '9', animated: true, style: { stroke: '#43C6AC', strokeWidth: 2, curve: 'smoothstep' } },
  ];

  return (
    <ReactFlowProvider>
      <div style={{ height: '100vh', width: '100%' }}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background variant="dots" gap={16} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default Flowchart;