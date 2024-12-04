import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletMap = () => {
    useEffect(() => {
        // Initialize the map with EPSG:4326 CRS
        const map = L.map('map', {
            crs: L.CRS.EPSG4326,
            center: [0, 0], // Default center (latitude, longitude)
            zoom: 2,        // Default zoom level
        });

        // WMS Layers
        const topoOSMWMS = L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
            layers: 'TOPO-OSM-WMS',
            format: 'image/png',
            transparent: true,
            attribution: '&copy; <a href="http://www.mundialis.de/">Mundialis</a>',
        }).addTo(map);

        const srtm30Hillshade = L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
            layers: 'SRTM30-Colored-Hillshade',
            format: 'image/png',
            transparent: true,
            attribution: '&copy; <a href="http://www.mundialis.de/">Mundialis</a>',
        });

        const topoAndPlaces = L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
            layers: 'TOPO-WMS,OSM-Overlay-WMS',
            format: 'image/png',
            transparent: true,
            attribution: '&copy; <a href="http://www.mundialis.de/">Mundialis</a>',
        });

        // TMS Example Layers
        const tmsExample = L.tileLayer('http://base_url/tms/1.0.0/example_layer@png/{z}/{x}/{y}.png', {
            tms: true,
            attribution: 'TMS Example Layer',
        });

        const tmsTileset = L.tileLayer('http://base_url/tms/1.0.0/tileset/{z}/{x}/{-y}.png', {
            tms: true,
            attribution: 'TMS Tileset Example',
        });

        // Add layer control
        const basemaps = {
            'Topo-OSM WMS': topoOSMWMS,
            'SRTM30 Hillshade': srtm30Hillshade,
            'Topography and Places': topoAndPlaces,
        };

        const overlays = {
            'TMS Example': tmsExample,
            'TMS Tileset': tmsTileset,
        };

        L.control.layers(basemaps, overlays).addTo(map);

        // Cleanup map instance on component unmount
        return () => {
            map.remove();
        };
    }, []);

    return (
        <div
            id="map"
            style={{
                height: '100vh', // Full height for the map
                width: '100vh',  // Full width
            }}
        > kjcskjkj </div>
    );
};

export default LeafletMap;
