import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const MapComponent = () => {
  const mapContainerRef = useRef(null);

  // Function to fetch polygons from the server
  const fetchPolygons = async (map, drawnItems) => {
    try {
      const response = await fetch('http://localhost:5000/api/polygons');
      const polygons = await response.json();

      polygons.forEach((polygon) => {
        const leafletPolygon = L.polygon(polygon.coordinates, {
          color: polygon.color,
        });
        leafletPolygon.properties = {
          _id: polygon._id,
          description: polygon.description,
        };
        leafletPolygon.addTo(drawnItems);
      });
    } catch (err) {
      console.error('Error fetching polygons:', err);
    }
  };

  useEffect(() => {
    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current).setView([0, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Initialize FeatureGroup to store drawn layers
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Add Leaflet Draw Control
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
    });
    map.addControl(drawControl);

    // Load existing polygons
    fetchPolygons(map, drawnItems);

    // Event: Polygon updated
    map.on(L.Draw.Event.EDITED, async (e) => {
      const layers = e.layers;
      layers.eachLayer(async (layer) => {
        const updatedPolygon = layer.toGeoJSON();
        try {
          const response = await fetch(`http://localhost:5000/api/polygon/${layer.properties._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coordinates: updatedPolygon.geometry.coordinates,
              description: layer.properties.description,
              color: layer.options.color,
            }),
          });

          if (response.ok) {
            alert('Polygon updated successfully!');
          } else {
            console.error('Failed to update polygon');
          }
        } catch (err) {
          console.error('Error updating polygon:', err);
        }
      });
    });

    // Cleanup on component unmount
    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default MapComponent;
