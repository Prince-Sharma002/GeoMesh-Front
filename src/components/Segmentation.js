import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Segmentation = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize the Leaflet map
    const map = L.map(mapRef.current).setView([28.7041, 77.1025], 10); // Centered on New Delhi

    // Add a base layer (e.g., OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Load the Google Earth Engine API script
    const loadEarthEngine = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ee/ee_api.js';
      script.onload = () => {
        if (window.ee) {
          initializeEarthEngine(window.ee, map);
        } else {
          console.error('Google Earth Engine API failed to load.');
        }
      };
      document.body.appendChild(script);
    };

    // Initialize Earth Engine
    const initializeEarthEngine = (ee, map) => {
      ee.data.authenticateViaOauth(
        'prince12841sharma', // Replace with your OAuth client ID
        () => {
          ee.initialize(null, null, () => {
            console.log('Earth Engine initialized successfully');
            runSegmentation(ee, map);
          });
        },
        (error) => {
          console.error('Error initializing Earth Engine:', error);
        }
      );
    };

    // Function to run the segmentation
    const runSegmentation = (ee, map) => {
      const imageCollection = ee.ImageCollection('COPERNICUS/S2')
        .filterBounds(ee.Geometry.Point([77.1025, 28.7041]))
        .filterDate('2023-01-01', '2023-02-01')
        .sort('CLOUD_COVER')
        .first();

      const image = imageCollection.select(['B8', 'B4']);
      const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
      const vegetationMask = ndvi.gt(0.3);
      const segmentedImage = ndvi.updateMask(vegetationMask);

      // Add the segmented image to the map
      segmentedImage.getMap({ min: 0, max: 1, palette: ['white', 'green'] }, (mapId, token) => {
        L.tileLayer(`https://earthengine.googleapis.com/v1alpha/${mapId}/tiles/{z}/{x}/{y}?token=${token}`, {
          attribution: 'Map data © Google Earth Engine',
        }).addTo(map);
      });
    };

    loadEarthEngine();

    const fetchSatelliteData = async () => {
      // Define the bounding box coordinates (longitude and latitude)
      const minLon = 77.0; // Minimum longitude (e.g., west boundary of your area)
      const minLat = 28.5; // Minimum latitude (e.g., south boundary of your area)
      const maxLon = 78.0; // Maximum longitude (e.g., east boundary of your area)
      const maxLat = 29.5; // Maximum latitude (e.g., north boundary of your area)
    
      try {
        const response = await fetch('https://services.sentinel-hub.com/api/v1/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer d37cde18-cda5-44eb-99ff-50db6eb057aa' // Replace with your API key
          },
          body: JSON.stringify({
            input: {
              bounds: {
                bbox: [minLon, minLat, maxLon, maxLat], // Use your defined bounding box
                properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" }
              },
              data: [{
                type: "Sentinel-2",
                dataFilter: { timeRange: { from: "2023-01-01T00:00:00Z", to: "2023-02-01T23:59:59Z" } }
              }]
            },
            evalscript: `// Your custom evalscript for segmentation
              return [B08 - B04]; // Example: Simple NDVI calculation
            `
          })
        });
    
        const data = await response.json();
        console.log('Segmentation result:', data);
      } catch (error) {
        console.error('Error fetching satellite data:', error);
      }
    };
    
    fetchSatelliteData();
    
    

    // Cleanup function to remove the map
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      <h1>Satellite Image Segmentation with Google Earth Engine</h1>
      <div ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
};

export default Segmentation;
