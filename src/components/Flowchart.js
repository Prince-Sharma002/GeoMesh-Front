import React from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, Handle } from 'reactflow';
import 'reactflow/dist/style.css';

// Enhanced Custom Node Components
const CircleNode = ({ data }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #43C6AC, #F8FFAE)',
      borderRadius: '50%',
      padding: '20px',
      color: 'black',
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
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Access Website' }, type: 'circle' },
    { id: '2', position: { x: 100, y: 120 }, data: { label: 'Input WMS URL' }, type: 'diamond' },
    { id: '3', position: { x: 400, y: 120 }, data: { label: 'Validate URL' }, type: 'roundedRect' },
    { id: '4', position: { x: 100, y: 240 }, data: { label: 'Load WMS Layers' }, type: 'roundedRect' },
    { id: '5', position: { x: 400, y: 240 }, data: { label: 'Invalid URL' }, type: 'diamond' },
    { id: '6', position: { x: 250, y: 360 }, data: { label: 'Select Tool' }, type: 'circle' },
    { id: '7', position: { x: 250, y: 480 }, data: { label: 'Process Images' }, type: 'roundedRect' },
    { id: '8', position: { x: 100, y: 600 }, data: { label: 'Success' }, type: 'circle' },
    { id: '9', position: { x: 400, y: 600 }, data: { label: 'Failure' }, type: 'circle' },
    { id: '10', position: { x: 250, y: 720 }, data: { label: 'Refine & Export' }, type: 'diamond' },
    { id: '11', position: { x: 250, y: 840 }, data: { label: 'Export Data' }, type: 'circle' },
  ];

  const edges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#43C6AC', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#FF5722', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e3-4', source: '3', target: '4', label: 'Valid URL', style: { stroke: '#4CAF50', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e3-5', source: '3', target: '5', label: 'Invalid URL', style: { stroke: '#FF5722', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e4-6', source: '4', target: '6', animated: true, style: { curve: 'smoothstep' } },
    { id: 'e5-2', source: '5', target: '2', label: 'Retry', style: { stroke: '#FFC107', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e6-7', source: '6', target: '7', animated: true, style: { curve: 'smoothstep' } },
    { id: 'e7-8', source: '7', target: '8', label: 'Success', style: { stroke: '#4CAF50', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e7-9', source: '7', target: '9', label: 'Failure', style: { stroke: '#FF5722', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e8-10', source: '8', target: '10', animated: true, style: { curve: 'smoothstep' } },
    { id: 'e9-6', source: '9', target: '6', label: 'Retry Segmentation', style: { stroke: '#FFC107', strokeWidth: 2, curve: 'smoothstep' } },
    { id: 'e10-11', source: '10', target: '11', animated: true, style: { curve: 'smoothstep' } },
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