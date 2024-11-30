import React, { useState } from 'react';

const SatelliteSegment = () => {
  const [image, setImage] = useState(null);
  const [geoJson, setGeoJson] = useState(null);

  // Handle image file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // Perform segmentation
  const performSegmentation = async () => {
    if (!image) {
      alert('Please select an image first.');
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', image);

    try {
      // Replace 'YOUR_API_URL' with the URL of your free segmentation API
      const response = await fetch('YOUR_API_URL', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Segmentation API request failed.');
      }

      const result = await response.json();

      // Assuming the API response contains segmented data in a suitable format
      const geoJsonData = convertToGeoJson(result);
      setGeoJson(geoJsonData);
    } catch (error) {
      console.error('Error during segmentation:', error);
    }
  };

  // Function to convert API response to GeoJSON format
  const convertToGeoJson = (segmentationResult) => {
    // Example conversion logic (adjust based on your API response structure)
    const features = segmentationResult.segments.map((segment) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: segment.coordinates, // Ensure coordinates are in the correct GeoJSON format
      },
      properties: {
        label: segment.label,
        confidence: segment.confidence,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  };

  // Function to download GeoJSON file
  const downloadGeoJson = () => {
    if (!geoJson) {
      alert('No GeoJSON data to download.');
      return;
    }

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'segmentation.geojson';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Satellite Image Segmentation</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={performSegmentation}>Segment Image</button>
      <button onClick={downloadGeoJson}>Download GeoJSON</button>
      {geoJson && <pre>{JSON.stringify(geoJson, null, 2)}</pre>}
    </div>
  );
};

export default SatelliteSegment;
