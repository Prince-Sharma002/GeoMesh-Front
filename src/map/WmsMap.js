import React, { useState } from 'react';
import { MapContainer, TileLayer, LayersControl, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WmsMap = () => {
  const [initialPosition, setInitialPosition] = useState([50.85, 4.35]); // Adjusted to a region covered by WMS

  const mapLayers = {
    openstreetmap: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
    },
    wms: {
      url: 'https://ows.terrestris.de/osm/service',
      layers: 'OSM-WMS',
      attribution: '© OpenStreetMap contributors via terrestris',
    },
  };

  return (
    <MapContainer
      center={initialPosition}
      zoom={13}
      style={{ height: '80vh', width: '100%' }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url={mapLayers.openstreetmap.url}
            attribution={mapLayers.openstreetmap.attribution}
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay name="OpenStreetMap WMS">
          <WMSTileLayer
            url={mapLayers.wms.url}
            layers={mapLayers.wms.layers}
            format="image/png"
            transparent={true}
            attribution={mapLayers.wms.attribution}
          />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default WmsMap;
