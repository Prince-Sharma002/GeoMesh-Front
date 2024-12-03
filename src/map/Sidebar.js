import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import "../styles/sidebar.css"

const Sidebar = () => {
  const [tags, setTags] = useState(['Farm', 'Rural', 'Urban' , 'Building' , 'Mountain' , 'Vehicle' , 'Road' , 'Water Body' , 'Forest' , 'Others' ]); // Define available tags
  const [selectedTag, setSelectedTag] = useState('none');
  const [polygons, setPolygons] = useState([]);

  const [loading, setLoading] = useState(false);

useEffect(() => {
  setPolygons([]);
  if (selectedTag) {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/polygons/tag?tag=${selectedTag}`)
      .then(response => {
        setPolygons(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching polygons:', err);
        setLoading(false);
      });
  }
}, [selectedTag]);

  // Password for encryption
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


  return (
    <div className='sidebar' style={{ width: '250px', padding: '20px', backgroundColor: '#f5f5f5', borderRight: '1px solid #ddd' }}>
      <h3>Filter by Tag</h3>
      <button onClick={exportAllToGeoJSON}>Export All to GeoJSON</button>
      <button onClick={exportAllToKML}>Export All to KML</button>
      <select
        value={selectedTag}
        onChange={e => setSelectedTag(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '20px' }}
      >
        {tags.map(tag => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <h4>Polygons</h4>
      {polygons.length > 0 ? (
        <ul>
          {polygons.map(polygon => (
            <li key={polygon._id} style={{ marginBottom: '10px' }}>
                <p><strong>Description:</strong> {polygon.description}</p>
                <p><strong>Username:</strong> {polygon.name}</p>
                <p><strong>Email:</strong> {polygon.email}</p>
                <p><strong>Tag:</strong> {polygon.tag}</p>
                <p><strong>Color:</strong> {polygon.color}</p>
                <p><strong>Date:</strong> {polygon.date}</p>
                <p><strong>Area:</strong> {polygon.area.toFixed(2)} sq. meters</p>
                <p><strong>Likes:</strong> {polygon.likes}</p>
                <p><strong>Reviews:</strong></p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No polygons found for the selected tag.</p>
      )}
    </div>
  );
};

export default Sidebar;
