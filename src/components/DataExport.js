import React from 'react';

const DataExport = () => {
  const selectedFeatures = []; // Array to store selected features

  const handleSelection = () => {
    // Add logic to select features from the segmentation result
    // Example: selectedFeatures.push({ type: 'Feature', properties: {}, geometry: {} });
    console.log('Feature selected');
  };
  
  // Update exportData function to use selectedFeatures
  const exportData = () => {
    const geojson = {
      type: "FeatureCollection",
      features: selectedFeatures,
    };
    const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'export.geojson';
    link.click();
  };
  

  return (
    <div>
      <h2>Data Export</h2>
      <button onClick={exportData}>Export to GeoJSON</button>
    </div>
  );
};

export default DataExport;
