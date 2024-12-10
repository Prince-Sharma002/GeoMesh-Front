import React, { useState } from 'react';

const GeoJSONConverter = () => {
  const [geojson, setGeojson] = useState(null);
  const [modifiedGeojson, setModifiedGeojson] = useState(null);

  // Function to swap latitude and longitude in the GeoJSON
  const swapLatLng = (data) => {
    if (!data || !data.features) return data;

    const swapCoordinates = (coordinates) => {
      return coordinates.map((point) => {
        if (Array.isArray(point[0])) {
          return swapCoordinates(point); // Recursively handle nested arrays
        }
        return [point[1], point[0], point[2]].filter((val) => val !== undefined); // Swap lat & lng
      });
    };

    return {
      ...data,
      features: data.features.map((feature) => ({
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: swapCoordinates(feature.geometry.coordinates),
        },
      })),
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          setGeojson(json);
        } catch (error) {
          alert('Invalid GeoJSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConvert = () => {
    if (geojson) {
      const swapped = swapLatLng(geojson);
      setModifiedGeojson(swapped);
    } else {
      alert('Please upload a GeoJSON file first.');
    }
  };

  const handleDownload = () => {
    if (!modifiedGeojson) return;

    const blob = new Blob([JSON.stringify(modifiedGeojson, null, 2)], {
      type: 'application/geo+json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modified-geojson.geojson';
    link.click();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>GeoJSON Lat-Lng Converter</h2>
      <input type="file" accept=".geojson,.json" onChange={handleFileChange} />
      <button onClick={handleConvert} style={{ marginLeft: '10px' }}>
        Convert
      </button>
      <button
        onClick={handleDownload}
        disabled={!modifiedGeojson}
        style={{ marginLeft: '10px' }}
      >
        Download Modified GeoJSON
      </button>
      {geojson && (
        <div>
          <h3>Original GeoJSON:</h3>
          <pre style={{ background: '#f4f4f4', padding: '10px', maxHeight: '300px', overflow: 'auto' }}>
            {JSON.stringify(geojson, null, 2)}
          </pre>
        </div>
      )}
      {modifiedGeojson && (
        <div>
          <h3>Modified GeoJSON:</h3>
          <pre style={{ background: '#e8f4e8', padding: '10px', maxHeight: '300px', overflow: 'auto' }}>
            {JSON.stringify(modifiedGeojson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GeoJSONConverter;