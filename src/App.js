import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import SmartAI from './components/SmartAI';
// import FeatureSelection from './components/FeatureSelection';
// import DataExport from './components/DataExport';
// import WmsIntegration from './components/WmsIntegration';
// import Segmentation from './components/Segmentation';
// import SentinelHubImage from './components/SentinelHubImage';
import GeolocationMap from './map/GeolocationMap';
import GeolocationMapwithchatbot from './map/GeolocationMapwithchatbot';
import Signup from './auth/Signup';
import Signin from './auth/sign';
import PersonInfo from './info/PersonInfo';
import DecryptFile from './map/DecryptFile';
import Sidebar from './map/Sidebar';
import MapComponent from './map/MapComponent';
import AdminDashboard from './admin/AdminDashboard';
import WmsMap from './map/WmsMap';
import LeafletMap from './map/LeafletMap';
import GeoJSONConverter from './map/GeoJSONConverter';
import Parentmap from './map/Parentmap';
import DisasterAnalysis from './map/DisasterAnalysis';
import Usermap from './map/Usermap';

function App() {
  return (
    <Router>
    <Routes>
        <Route path="/" element={ <Signup /> } />
        <Route path="/signin" element={ <Signin /> } />
        <Route path="/person-info" element={ <PersonInfo /> } />
        <Route path="/map" element={ <GeolocationMap /> } />
        <Route path="/user" element={ <Usermap /> } />

        <Route path="/map3" element={ <Parentmap /> } />


        <Route path="/decrypt" element={ <DecryptFile /> } />
        <Route path="/sidebar" element={ <Sidebar /> } />
        <Route path="/map2" element={ <MapComponent /> } />
        <Route path="/admin" element={ <AdminDashboard /> } />
        <Route path="/convert" element={ <GeoJSONConverter /> } />
      
        <Route path="/map4" element={ <GeolocationMapwithchatbot /> } />
        <Route path="/map5" element={ <Parentmap /> } />
        <Route path="/disaster-analysis" element={ <DisasterAnalysis /> } />

    </Routes>
  </Router>
    // <div>
    //   {/* <h1>Interactive Semantic Segmentation</h1>
    //    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "500px", width: "100%" }}>
    //     <TileLayer
    //       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //       attribution='&copy; OpenStreetMap contributors'
    //     />
    //   </MapContainer> 
    //   <SmartAI />

    //   <Segmentation />
    //   <WmsIntegration />
    //   <SentinelHubImage />
      
    //   <FeatureSelection /> 
    //   <DataExport /> */}
    //   <GeolocationMap />
    // </div>
  );
}

export default App;
