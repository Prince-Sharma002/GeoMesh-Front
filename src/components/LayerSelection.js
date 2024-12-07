import React, { useState } from 'react';

const LayerSelection = ({ layers = [], onSelectLayer, advanced = false }) => {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvanced, setIsAdvanced] = useState(advanced);

  // Information about each layer
  const layerInfo = {
    Openstreet: 'OpenStreetMap is a collaborative project to create a free, editable map of the world.',
    satellite: 'Satellite imagery provides detailed views of the Earth’s surface, captured from space.',
    terrain: 'Terrain layers show topographical features such as mountains, valleys, and elevation contours.',
    darkMode: 'Dark mode provides a dark theme, reducing eye strain in low-light conditions.',
  };

  const handleLayerClick = (layer) => {
    setSelectedLayer(layer);
    if (onSelectLayer) onSelectLayer(layer);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredLayers = layers.filter((layer) =>
    layer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAdvanced = () => {
    setIsAdvanced((prev) => !prev);
  };

  return (
    <div style={styles.layerSelection}>
      <h3 style={styles.header}>
        {isAdvanced ? 'Advanced Layer Selection' : 'Select a Layer'}
      </h3>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search layers..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={styles.searchBar}
      />

      {/* Advanced Mode Toggle */}
      <div style={styles.advancedToggle}>
        <label>
          <input
            type="checkbox"
            checked={isAdvanced}
            onChange={toggleAdvanced}
          />
          Enable Advanced Mode
        </label>
      </div>

      <ul style={styles.layerList}>
        {filteredLayers.length > 0 ? (
          filteredLayers.map((layer, index) => (
            <li
              key={index}
              style={{
                ...styles.layerItem,
                ...(selectedLayer === layer ? styles.selectedItem : {}),
              }}
              onClick={() => handleLayerClick(layer)}
            >
              {layer}
            </li>
          ))
        ) : (
          <li style={styles.noResults}>No layers found</li>
        )}
      </ul>

      {selectedLayer && (
        <>
          <p style={styles.selectedInfo}>You selected: {selectedLayer}</p>
          <p style={styles.layerDescription}>{layerInfo[selectedLayer]}</p>
        </>
      )}

      {/* Additional info in advanced mode */}
      {isAdvanced && (
        <div style={styles.advancedInfo}>
          <p style={styles.advancedText}>
            Advanced selection options enabled. You can choose from specific categories or customize layers.
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  layerSelection: {
    maxWidth: '400px',
    margin: '20px auto',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    fontSize: '1.5em',
    color: '#333',
    marginBottom: '10px',
  },
  searchBar: {
    width: '100%',
    padding: '8px 10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '14px',
  },
  advancedToggle: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  layerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  layerItem: {
    padding: '10px 15px',
    margin: '5px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    transition: 'background-color 0.3s, color 0.3s',
  },
  selectedItem: {
    backgroundColor: '#007acc',
    color: '#fff',
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
  selectedInfo: {
    marginTop: '15px',
    fontSize: '1em',
    color: '#007acc',
    textAlign: 'center',
  },
  layerDescription: {
    marginTop: '10px',
    fontSize: '0.9em',
    color: '#555',
    textAlign: 'center',
  },
  advancedInfo: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#e0f7fa',
    borderRadius: '5px',
    fontSize: '1em',
    color: '#007acc',
    textAlign: 'center',
  },
  advancedText: {
    fontStyle: 'italic',
  },
};

// Example usage
const App = () => {
  const layers = ['Openstreet', 'satellite', 'terrain', 'darkMode'];

  const handleSelectLayer = (layer) => {
    console.log(`Layer selected: ${layer}`);
  };

  return (
    <div>
      <LayerSelection layers={layers} onSelectLayer={handleSelectLayer} advanced={true} />
    </div>
  );
};

export default App;
