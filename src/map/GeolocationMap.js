import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Popup, LayersControl , useMapEvents  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';

// Fix for default marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


const CursorCoordinates = () => {
  const [coord, setCoord] = useState(null);
  
  // Use MapEvents to track mouse movement
  const map = useMapEvents({
    mousemove: (e) => {
      setCoord({
        lat: e.latlng.lat.toFixed(4),
        lng: e.latlng.lng.toFixed(4)
      });
    }
  });

  return coord ? (
    <div 
      style={{
        position: 'absolute', 
        bottom: '10px', 
        left: '10px', 
        backgroundColor: 'white',
        padding: '5px',
        zIndex: 1000,
        border: '1px solid black'
      }}
    >
 
        Lat: {coord.lat}, Lon: {coord.lng}
        
    </div>
  ) : null;
};

const GeolocationMap = () => {
  const [initialPosition, setInitialPosition] = useState([23.1059, 72.5937]);
  const [polygons, setPolygons] = useState([]);
  const [reviewInput, setReviewInput] = useState('');
  const [markers, setMarkers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState('openstreetmap');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [coord, setCoord] = useState(null);

  const mapLayers = {
    openstreetmap: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri WorldImagery'
    },
    terrain: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
      attribution: '© Stamen Design, OpenStreetMap'
    },
    darkMode: {
      url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB'
    }
  };


  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialPosition([position.coords.latitude, position.coords.longitude]);
        },
        () => setInitialPosition([40.7128, -74.0060]) // Fallback to default location
      );
    } else {
      setInitialPosition([40.7128, -74.0060]);
    }

    fetchPolygons();
 
  }, []);

  const fetchPolygons = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/polygons');
      setPolygons(response.data);
    } catch (err) {
      console.error('Error fetching polygons:', err.message);
    }
  };

    // New delete polygon function
    const handleDeletePolygon = async (id) => {
      try {
        await axios.delete(`http://localhost:5000/api/polygon/${id}`);
        // Remove the deleted polygon from the state
        setPolygons((prevPolygons) => 
          prevPolygons.filter((polygon) => polygon._id !== id)
        );
      } catch (err) {
        console.error('Error deleting polygon:', err.message);
      }
    };

    const handleLike = async (id) => {
      try {
        const response = await axios.put(`http://localhost:5000/api/polygon/${id}/like`);
        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon) =>
            polygon._id === id ? { ...polygon, likes: response.data.likes } : polygon
          )
        );
      } catch (err) {
        console.error('Error liking polygon:', err.message);
      }
    };
  
    const handleAddReview = async (id) => {
      try {
        const response = await axios.put(`http://localhost:5000/api/polygon/${id}/review`, {
          review: reviewInput,
        });
        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon) =>
            polygon._id === id ? { ...polygon, reviews: response.data.reviews } : polygon
          )
        );
        setReviewInput('');
      } catch (err) {
        console.error('Error adding review:', err.message);
      }
    };  

  const handleSavePolygon = (layer) => {
    const color = prompt('Enter a color for the polygon (e.g., #FF0000):') || '#3388ff';
    const description = prompt('Enter a description for the polygon:');
    const coordinates = layer.getLatLngs()[0].map((point) => [point.lat, point.lng]); // Convert to GeoJSON format
    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]); // Calculate polygon area
    const newPolygon = {
      coordinates: [coordinates], // Wrap in an extra array for GeoJSON compliance
      description,
      color,
      area,
      date: new Date(),
    };

    layer.setStyle({ color });
    savePolygonToBackend(newPolygon);
  };

  const savePolygonToBackend = async (polygon) => {
    try {
      const response = await axios.post('http://localhost:5000/api/polygon', polygon);
      setPolygons((prev) => [...prev, response.data]);
    } catch (err) {
      console.error('Error saving polygon:', err.message);
    }
  };

   // Measurement and Distance Calculation
   const [measurements, setMeasurements] = useState([]);
   const calculateDistance = (latlngs) => {
     let totalDistance = 0;
     for (let i = 0; i < latlngs.length - 1; i++) {
       totalDistance += L.latLng(latlngs[i]).distanceTo(L.latLng(latlngs[i + 1]));
     }
     return totalDistance; // in meters
   };

  // Export Functions
  const exportToGeoJSON = (polygon) => {
    const geojson = {
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
    };
    downloadFile(JSON.stringify(geojson), 'segment.geojson', 'application/geo+json');
  };

  const exportToKML = (polygon) => {
    const kml = `
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
      </Placemark>`;
    const kmlFile = `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>${kml}</Document>
      </kml>`;
    downloadFile(kmlFile, 'segment.kml', 'application/vnd.google-earth.kml+xml');
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
    downloadFile(JSON.stringify(geojson), 'all_segments.geojson', 'application/geo+json');
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
    downloadFile(kmlFile, 'all_segments.kml', 'application/vnd.google-earth.kml+xml');
  };


  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="map-container">
    <div className="map-controls">      
        <button onClick={exportAllToGeoJSON}>Export All to GeoJSON</button>
        <button onClick={exportAllToKML}>Export All to KML</button>
    </div>

      <MapContainer 
        center={initialPosition} 
        zoom={13} 
        style={{ height: '80vh', width: '100%' }}
      >
      
        
           <CursorCoordinates />
    
        <LayersControl>
          {Object.entries(mapLayers).map(([key, layer]) => (
            <LayersControl.BaseLayer 
              key={key} 
              checked={key === selectedLayer} 
              name={key.charAt(0).toUpperCase() + key.slice(1)}
            >
              <TileLayer 
                url={layer.url} 
                attribution={layer.attribution} 
              />
            </LayersControl.BaseLayer>
          ))}

          <LayersControl.Overlay checked name="Polygons">
            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={(e) => {
                  const layer = e.layer;
                  handleSavePolygon(layer);
                }}
                draw={{
                  rectangle: true,
                  polygon: true,
                  circle: false,
                  marker: measurementMode, // Enable marker only in measurement mode
                  polyline: measurementMode // Enable polyline for measurements
                }}
              />
              {/* Existing Polygons */}
              {polygons.map((polygon, index) => (
                <Polygon
                  key={index}
                  positions={polygon.coordinates[0].map(([lat, lng]) => [lat, lng])}
                  pathOptions={{ color: polygon.color }}
                >

<Popup>
              <div>
                <p><strong>Description:</strong> {polygon.description}</p>
                <p><strong>Color:</strong> {polygon.color}</p>
                <p><strong>Area:</strong> {polygon.area.toFixed(2)} sq. meters</p>
                <p><strong>Likes:</strong> {polygon.likes}</p>
                <p><strong>Reviews:</strong></p>
                <ul>
                  {polygon.reviews.map((review, idx) => (
                    <li key={idx}>{review}</li>
                  ))}
                </ul>
                <button onClick={() => handleLike(polygon._id)}>Like</button>
                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="Add a review"
                />
                <button onClick={() => handleAddReview(polygon._id)}>Add Review</button>
                <button onClick={() => exportToGeoJSON(polygon)}>Export to GeoJSON</button>
                <button onClick={() => exportToKML(polygon)}>Export to KML</button>

                <button 
                  onClick={() => handleDeletePolygon(polygon._id)}
                  style={{ backgroundColor: 'red', color: 'white' }}
                >
                  Delete Polygon
                </button>


              </div>
            </Popup>


                </Polygon>
              ))}
            </FeatureGroup>
          </LayersControl.Overlay>

        </LayersControl>
      </MapContainer>

  </div>
  );
};



export default GeolocationMap;
