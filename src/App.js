import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import SmartAI from './components/SmartAI';
// import FeatureSelection from './components/FeatureSelection';
// import DataExport from './components/DataExport';
// import WmsIntegration from './components/WmsIntegration';
// import Segmentation from './components/Segmentation';
// import SentinelHubImage from './components/SentinelHubImage';
import GeolocationMap from './map/GeolocationMap';

function App() {
  return (
    <div>
      {/* <h1>Interactive Semantic Segmentation</h1>
       <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
      </MapContainer> 
      <SmartAI />

      <Segmentation />
      <WmsIntegration />
      <SentinelHubImage />
      
      <FeatureSelection /> 
      <DataExport /> */}
      <GeolocationMap />
    </div>
  );
}

export default App;
