import React, { useState, useEffect } from "react"; 
import Geomap from "./Geomap";
import CryptoJS from 'crypto-js';
import axios from 'axios';



import Chatbot from "react-chatbot-kit";
import config from "../components/Chatbot/config";
import ActionProvider from "../components/Chatbot/ActionProvider";
import MessageParser from "../components/Chatbot/MessageParser";

import "./Parentmap.css"; // Link the CSS file

const Parentmap = () => {

  const [initialPosition, setInitialPosition] = React.useState([23.1059, 72.5937]);
  const [polygons, setPolygons] = useState([]);
  const [reviewInput, setReviewInput] = useState('');
  const [markers, setMarkers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState('openstreetmap');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [coord, setCoord] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [name, setname] = useState("");

  const [tags, setTags] = useState(['Farm', 'Rural', 'Urban', 'Building', 'Mountain', 'Vehicle', 'Road', 'Water Body', 'Forest', 'Others']); // Define available tags
  const [selectedTag, setSelectedTag] = useState('none');
  const [tagpolygons, settagPolygons] = useState([]);



  const [showChatbot, setShowChatbot] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  
  
  
  


    const fetchPolygons = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/polygons');
        setPolygons(response.data);
      } catch (err) {
        console.error('Error fetching polygons:', err.message);
      }
    };
  

  

const PASSWORD = '1234';

const encryptData = (data, password) => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

const downloadFile = (data, filename, type, encrypted = false) => {
  let fileContent = data;

  if (encrypted) {
    fileContent = encryptData(data, PASSWORD);
  }

  const blob = new Blob([fileContent], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
const askForEncryption = () => {
  return window.confirm('Do you want to encrypt the export file?');
};



  function setcoordinates(x, y) {
    setInitialPosition([x, y]);
  }
  const toggleChatbot = () => {

    setShowChatbot(!showChatbot);
  };
  const exportAllToKML = () => {
    const kmlFile = `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          ${polygons
            .map((polygon) => `
              <Placemark>
                <name>${polygon.description}</name>
                <Style><LineStyle><color>${polygon.color}</color></LineStyle></Style>
                <Polygon>
                  <outerBoundaryIs>
                    <LinearRing>
                      <coordinates>
                        ${polygon.coordinates[0]
                          .map(([lng, lat]) => `${lng},${lat},0`)
                          .join(' ')}
                      </coordinates>
                    </LinearRing>
                  </outerBoundaryIs>
                </Polygon>
              </Placemark>`)
            .join('\n')}
        </Document>
      </kml>`;
    const encrypt = askForEncryption();
    downloadFile(kmlFile, 'all_segments.kml', 'application/vnd.google-earth.kml+xml', encrypt);
  };
  const exportAllToGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: polygons.map((polygon) => ({
        type: 'Feature',
        properties: {
          description: polygon.description,
          color: polygon.color,
          area: polygon.area,
          likes: polygon.likes,
          reviews: polygon.reviews,
        },
        geometry: {
          type: 'Polygon',
          coordinates: polygon.coordinates,
        },
      })),
    };
    const geojsonString = JSON.stringify(geojson);
    const encrypt = askForEncryption();
    downloadFile(geojsonString, 'all_segments.geojson', 'application/geo+json', encrypt);
  };
  
  return (

    <>
      <Geomap initialPosition={initialPosition} exportAllToKML={exportAllToKML} 
      exportAllToGeoJSON={exportAllToGeoJSON}
      polygons={polygons} setPolygons={setPolygons} fetchPolygons={fetchPolygons}
      userDetails={userDetails} setUserDetails={setUserDetails} name={name} 
      setname={setname}
      />
      <button
        className="chatbot-toggle-button"
        onClick={toggleChatbot}
      >
        {showChatbot ? "Close Chat" : "Open Chat"}
      </button>
      {showChatbot && (
        <div className="chatbot-container">
          <Chatbot
            config={config}
            actionProvider={(props) => (
              <ActionProvider
                {...props}
                initialPosition={initialPosition}
                setcoordinates={setcoordinates}
                exportAllToKML={exportAllToKML}
                exportAllToGeoJSON={exportAllToGeoJSON}
                polygons={polygons} 
                setPolygons={setPolygons}
              />
            )}
            messageParser={MessageParser}
            initialPosition={initialPosition} // Pass the initial position as well
          />
        </div>
      )}
    </>
  );
};

export default Parentmap;
