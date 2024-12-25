import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Popup, LayersControl , useMapEvents  , useMap , WMSTileLayer } from 'react-leaflet';
import { SearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {Link} from "react-router-dom";
import { kml as toGeoJSONKml } from '@tmcw/togeojson';
import "../styles/map.css"
import MapboxClient from '@mapbox/mapbox-sdk/services/geocoding';
import ChatBot from 'react-simple-chatbot';

// icons
import { BsFiletypeJson } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { FaUnlock } from "react-icons/fa";
import { PiChatsTeardropFill } from "react-icons/pi";
import { CiChat1 } from "react-icons/ci";
import { AiFillLike } from "react-icons/ai";
import { FaLocationDot } from "react-icons/fa6";

const mapboxClient = MapboxClient({ accessToken: 'pk.eyJ1IjoiYWlzaGNoYW1hcnRoaSIsImEiOiJjbHB1Yjk2djcwajBlMmluenJvdGlucG54In0.1nBG1ilIoMJlD1xJ4mzIoA' });



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
  const [initialPosition, setInitialPosition] = useState([28.6334, 77.4455]);
  const [polygons, setPolygons] = useState([]);
  const [reviewInput, setReviewInput] = useState('');
  const [markers, setMarkers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState('satellite');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [coord, setCoord] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [name, setname] = useState("");
  const [searchQuery, setSearchQuery] = useState(''); // For storing search input
  const [suggestions, setSuggestions] = useState([]);
  const [searchResult, setSearchResult] = useState(null); // Store search result coordinates

  const [tags, setTags] = useState(['Farm', 'Rural', 'Urban' , 'Building' , 'Mountain' , 'Vehicle' , 'Road' , 'Water Body' , 'Forest' ,  'Flooding' , 'Earthquakes' , 'hurricanes' , 'Wildfires' , 'tsunamis' , 'Others' ]); // Define available tags
  const [selectedTag, setSelectedTag] = useState('none');
  const [tagpolygons, settagPolygons] = useState([]);
  const [userlike , setUserlike] = useState(false);

  
  // const mapLayers = {
  //   // openstreetmap: {
  //   //   url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  //   //   attribution: '© OpenStreetMap contributors'
  //   // },
  //   // satellite: {
  //   //   url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  //   //   attribution: '© Esri WorldImagery'
  //   // },
  //   // darkMode: {
  //   //   url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
  //   //   attribution: '© CartoDB'
  //   // },
  //   wmsExample: {
  //     url: 'https://ows.terrestris.de/osm/service', // Example WMS URL (replace with your WMS endpoint)
  //     layers: 'SRTM30-Colored', // WMS-specific layer
  //     format: 'image/png',
  //     transparent: true,
  //     attribution: '© GeoServer WMS Example'
  //   },
  //   topoOSMWMS : {
  //     url: 'http://ows.mundialis.de/services/service?',
  //     layers: 'TOPO-OSM-WMS',
  //     format: 'image/png',
  //     transparent: true,
  //     attribution: '�� OpenLayers'
  //   }
  // };


  const mapLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri WorldImagery'
    },
    openstreetmap: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    terrain: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
      attribution: '© Stamen Design, OpenStreetMap'
    },
    darkMode: {
      url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB'
    },
    wmsLayer: {
      url: 'http://ows.mundialis.de/services/service?',
      attribution: '© AHOCEVAR GeoServer',
      params: {
        layers: 'TOPO-OSM-WMS',
        format: 'image/png',
        transparent: true
      }
    },
    wmsLayer2: {
      url: 'http://ows.mundialis.de/services/service?',
      attribution: '© AHOCEVAR GeoServer',
      params: {
        layers: 'SRTM30-Colored-Hillshade',
        format: 'image/png',
        transparent: true
      }
    },
    wmsLayer3: {
      url: 'http://ows.mundialis.de/services/service?',
      attribution: '&copy; <a href="http://www.mundialis.de/">Mundialis</a>',
      params: {
        layers: 'TOPO-WMS,OSM-Overlay-WMS',
        format: 'image/png',
        transparent: true
      }
    }
  };
  
  
  useEffect(() => {
    settagPolygons([]);
    if (selectedTag) {
   
      axios
        .get(`https://geomesh-back-8gtx.onrender.com/api/polygons/tag?tag=${selectedTag}`)
        .then(response => {
          settagPolygons(response.data);
          
        })
        .catch(err => {
          console.error('Error fetching polygons:', err);
 
        });
    }
  }, [selectedTag]);

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

    const fetchUserDetails = async () => {
      const email = localStorage.getItem('email'); // Get email from local storage
      if (!email) {
        console.log('No email found in local storage');
        return;
      }

      try {
        const response = await axios.get(`https://geomesh-back-8gtx.onrender.com/api/user?email=${email}`);
        setUserDetails(response.data); // Set user details in state
        setname(response.data.name); // Set name in state
      } catch (err) {
        console.error('Error fetching user details:', err.response?.data?.message || err.message);
      }
    };

    fetchUserDetails();
    fetchPolygons();
    
  }, [userDetails , name , setname , setUserDetails]);


  // const handleSearch = async () => {
  //   if (!searchQuery) return;

  //   try {
  //     // Using OpenStreetMap's Nominatim API for geocoding
  //     const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
  //       params: {
  //         q: searchQuery,
  //         format: 'json',
  //       },
  //     });

  //     if (response.data.length > 0) {
  //       const result = response.data[0];
  //       setSearchResult([parseFloat(result.lat), parseFloat(result.lon)]);
  //     } else {
  //       alert('Location not found!');
  //     }
  //   } catch (err) {
  //     console.error('Error searching location:', err.message);
  //   }
  // };

  const handleInputChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await mapboxClient.forwardGeocode({
          query,
          autocomplete: true,
          limit: 5,
        }).send();

        if (response.body && response.body.features) {
          setSuggestions(response.body.features);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err.message);
      }
    } else {
      setSuggestions([]);
    }
  };

  const currentLocationFun = ()=>{
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
  }

  const handleSuggestionClick = (place) => {
    setSearchResult([place.center[1], place.center[0]]);
    setSearchQuery(place.place_name);
    setSuggestions([]);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const response = await mapboxClient.forwardGeocode({
        query: searchQuery,
        limit: 1,
      }).send();

      if (response.body.features.length > 0) {
        const result = response.body.features[0];
        setSearchResult([result.center[1], result.center[0]]);
      } else {
        alert('Location not found!');
      }
    } catch (err) {
      console.error('Error searching location:', err.message);
    }
  };

  const PanToSearchResult = () => {
    const map = useMap();

    useEffect(() => {
      if (searchResult) {
        map.setView(searchResult, 13); // Pan to the searched location with zoom level 13
      }
    }, [searchResult, map]);

    return null;
  };


  const fetchPolygons = async () => {
    try {
      const response = await axios.get('https://geomesh-back-8gtx.onrender.com/api/polygons');
      setPolygons(response.data);
    } catch (err) {
      console.error('Error fetching polygons:', err.message);
    }
  };

    // New delete polygon function
    const handleDeletePolygon = async (id) => {
      try {
        await axios.delete(`https://geomesh-back-8gtx.onrender.com/api/polygon/${id}`);
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
        const response = await axios.put(`https://geomesh-back-8gtx.onrender.com/api/polygon/${id}/like`);
        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon) =>
            polygon._id === id ? { ...polygon, likes: response.data.likes } : polygon
          )
        );

        setUserlike(true);

      } catch (err) {
        console.error('Error liking polygon:', err.message);
      }
    };
  
    const handleAddReview = async (id) => {
      try {
        const response = await axios.put(`https://geomesh-back-8gtx.onrender.com/api/polygon/${id}/review`, {
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

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
  
        if (file.name.endsWith('.geojson')) {
          try {
            const geojson = JSON.parse(content);
            const newPolygons = L.geoJSON(geojson).toGeoJSON().features.map((feature) => ({
              coordinates: feature.geometry.coordinates,
              description: feature.properties?.description || 'No description',
              color: feature.properties?.color || '#3388ff',
              tag: feature.properties?.tag || 'Uncategorized',
            }));
            setPolygons((prev) => [...prev, ...newPolygons]);
            alert('GeoJSON loaded successfully!');
          } catch (err) {
            alert('Invalid GeoJSON file!');
          }
        } else if (file.name.endsWith('.kml')) {
          const parser = new DOMParser();
          const kml = parser.parseFromString(content, 'application/xml');
          const geojson = toGeoJSONKml(kml); // Requires toGeoJSON library
          const newPolygons = geojson.features.map((feature) => ({
            coordinates: feature.geometry.coordinates,
            description: feature.properties?.description || 'No description',
            color: feature.properties?.color || '#3388ff',
            tag: feature.properties?.tag || 'Uncategorized',
          }));
          setPolygons((prev) => [...prev, ...newPolygons]);
          alert('KML loaded successfully!');
        } else {
          alert('Unsupported file type!');
        }
      };
      reader.readAsText(file);
    };



    const sendEmail = async(email , description , _id , name ,date )=>{
    
      try{
          const response = fetch('https://complain-backend.onrender.com/sendemail' , {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({to : email , subject : "Polygon Added" , text : `Polygon added ${description} , username : ${name},  Date : ${date} ` })
          }
      )
  
      
      if (!response.ok) {
          // Handle non-2xx HTTP responses
          return;
      }
      
      const data = await response.json();
      console.log("Response data:", data);
      alert( "sent successful" );
  
      }catch(e){
          console.log(e)
      }
      }

    const handleSavePolygon = (layer) => {
      // Display a selection prompt for segment tags
      const segmentOptions = [
        'Farm',
        'Building',
        'Urban',
        'Rural',
        'Mountain',
        'Vehicle',
        'Road',
        'Water Body',
        'Forest',
        'Flooding' , 'Earthquakes' , 'hurricanes' , 'Wildfires' , 'tsunamis' ,
        'Others'
      ];
      const segment = prompt(
        `Select a segment tag by entering the number:\n${segmentOptions
          .map((option, index) => `${index + 1}: ${option}`)
          .join('\n')}`
      );
      const segmentTag = segmentOptions[parseInt(segment, 10) - 1]; // Get the selected tag
      if (!segmentTag) {
        alert('Invalid segment selection. Operation canceled.');
        return;
      }
      // Get color input
      let color = prompt('Enter a color') || '#3388ff';

      if( color === 'red' ){
        color = '#ff0000'
      }
      else if( color === 'green' ){
        color = '#00ff00'
      }
      else if( color === 'blue' ){
        color = '#0000ff'
      }
      else if( color === 'yellow' ){
        color = '#ffff00'
      }
      else if( color === 'gray' ){
        color = '#808080'
      }
      else if( color === 'pink' ){
        color = '#FFC0CB'
      }
      else if( color === 'violet' ){
        color = '#7F00FF'
      }
      

      // Get description input
      const description = prompt('Enter a description for the polygon:');
      // Extract coordinates
      const coordinates = layer.getLatLngs()[0].map((point) => [point.lat, point.lng]); // Convert to GeoJSON format
      // Calculate polygon area
      const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      // Construct the polygon data object
      const newPolygon = {
        coordinates: [coordinates], // Wrap in an extra array for GeoJSON compliance
        description,
        color,
        tag : segmentTag, // Add the selected segment tag
        area,
        date: new Date(),
        name: localStorage.getItem('name'),
        email: localStorage.getItem('email'),
      };
      console.log('Saved Polygon:', newPolygon);
      alert(`Polygon saved with segment: ${segmentTag}`);

      layer.setStyle({ color });
      savePolygonToBackend(newPolygon);
      sendEmail("prince12845sharma@gmail.com" , description , "1234" , newPolygon.name , newPolygon.date );
      sendEmail("nikitasmcsnes@gmail.com" , description , "1234" , newPolygon.name , newPolygon.date );
      sendEmail("utkarshaggarwalcse@gmail.com" , description , "1234" , newPolygon.name , newPolygon.date );
      sendEmail("i5hreyaa30@gmail.com" , description , "1234" , newPolygon.name , newPolygon.date );

    };
    
  const savePolygonToBackend = async (polygon) => {
    try {
      const response = await axios.post('https://geomesh-back-8gtx.onrender.com/api/polygon', polygon);
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

    
// Password for encryption
const PASSWORD = '1234';

const encryptData = (data, password) => {
  console.log()
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

const exportToGeoJSON = (polygon) => {
  const geojson = {
    type: 'Feature',
    properties: {
      description: polygon.description,
      color: polygon.color,
      area: polygon.area,
      likes: polygon.likes,
      reviews: polygon.reviews,
      date: polygon.date,
    },
    geometry: {
      type: 'Polygon',
      coordinates: polygon.coordinates,
    },
  };
  const geojsonString = JSON.stringify(geojson);
  const encrypt = askForEncryption();
  downloadFile(geojsonString, 'segment.geojson', 'application/geo+json', encrypt);
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
  const encrypt = askForEncryption();
  downloadFile(kmlFile, 'segment.kml', 'application/vnd.google-earth.kml+xml', encrypt);
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
        date : polygon.date,
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


const exporttagToGeoJSON = () => {
  const geojson = {
    type: 'FeatureCollection',
    features: tagpolygons.map((polygon) => ({
      type: 'Feature',
      properties: {
        description: polygon.description,
        color: polygon.color,
        area: polygon.area,
        likes: polygon.likes,
        reviews: polygon.reviews,
        date:polygon.date,
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

const exporttagToKML = () => {
  const kmlFile = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
        ${tagpolygons
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


const handleUpdatePolygon = async (id, coordinates, tag, color) => {
  try {
    const updatedPolygon = {
      tag,
      color,
      coordinates: [coordinates], // GeoJSON format requires a nested array
    };

    const response = await axios.put(`https://geomesh-back-8gtx.onrender.com/api/polygon/${id}`, updatedPolygon);

    // Update state with the new polygon data from the response
    setPolygons((prevPolygons) =>
      prevPolygons.map((poly) =>
        poly._id === id ? { ...poly, ...response.data } : poly
      )
    );

    alert('Polygon updated successfully!');
  } catch (err) {
    console.error('Error updating polygon:', err.message);
    alert('Failed to update polygon. Check console for details.');
  }
};



  return (
    <div className="map-container">
{/* <input type="file" accept=".geojson,.kml" onChange={handleFileUpload} style={{ marginBottom: '10px' }} /> */}
<div className='tagpolygondiv' style={{ width: '20rem', padding: '20px', backgroundColor: '#f5f5f5', borderRight: '1px solid #ddd' }}>
      <h3>Data Export by Tag</h3>
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

      <button style={{marginBottom : "1rem"}} onClick={() => exporttagToGeoJSON()}>Export to GeoJSON</button>

      <button onClick={() => exporttagToKML()}>Export to KML</button>

      <h4>Polygons</h4>
      {tagpolygons.length > 0 ? (
        <ul>
          {tagpolygons.map(polygon => (
            <li key={polygon._id} className='popupDiv' style={{ marginBottom: '10px'  }}>
              <strong>{polygon.description}</strong>
                <p><strong>Username:</strong> {polygon.name}</p>
                <p  className="coordinates" style={{width : "100%"}} ><strong>Coordinates:</strong> {polygon.coordinates}</p>
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

    {/* <div className='searchdiv'  style={{ padding: '10px', zIndex: 1000 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a place..."
          style={{ width: '200px', padding: '5px', marginRight: '10px' }}
        />
        <button onClick={handleSearch} style={{ padding: '5px' }}>
          Search
          </button>
          </div> */}

<div className='searchdiv'  style={{ padding: '10px', zIndex: 1000 }}  >
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Search location..."
        style={{
          width: '15rem',
          padding: '10px 15px',
          marginBottom: '-10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          fontSize: '16px',
          outline: 'none',
          transition: 'box-shadow 0.3s ease',
        }}
        onFocus={(e) => (e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)')}
        onBlur={(e) => (e.target.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)')}
      />
        <button onClick={currentLocationFun} style={{backgroundColor:"red"  , marginLeft:"10px" }}> <FaLocationDot /> </button>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {suggestions.map((place, index) => (
          <li
            key={index}
            onClick={() => handleSuggestionClick(place)}
            style={{
              cursor: 'pointer',
              padding: '5px',
              borderBottom: '1px solid #ddd',
              background: '#f9f9f9',
            }}
          >
            {place.place_name}
          </li>
        ))}
      </ul>
      <button onClick={handleSearch} style={{ padding: '10px', backgroundColor : "#ff0000" }}>
        Search
      </button>
    </div>


    <div className="map-controls">      
          <button onClick={exportAllToGeoJSON}> <BsFiletypeJson className='side-icons json' /> Geojson </button>
          <button onClick={exportAllToKML}> <strong> KML </strong> </button>
          <Link to="/disaster-analysis">
            <button> <strong>  Disaster <br/> Analysis </strong>  </button>
          </Link>
          <Link to="/person-info">
            <button> <FaUser className='side-icons' /> </button>
          </Link>
          <Link to="/decrypt">
            <button> <FaUnlock className='side-icons' /> </button>
          </Link>
          <Link className='selectedpolygon' to={'https://chatroom-d9caf.web.app/'}>
            <button> <PiChatsTeardropFill className='side-icons' /> </button>
          </Link>
    </div>

      <MapContainer 
        center={initialPosition} 
        zoom={17} 
        style={{ height: '100vh', width: '100%' }}
      >
      
        
           <CursorCoordinates />
    
        <LayersControl>
        {Object.entries(mapLayers).map(([key, layer]) => {
    if (key === 'wmsLayer' || key === 'wmsLayer2' || key === 'wmsLayer3' ) {
      return (
        <LayersControl.BaseLayer
          key={key}
          checked={key === selectedLayer}
          name="WMS Layer"
        >
          <WMSTileLayer
            url={layer.url}
            attribution={layer.attribution}
            layers={layer.params.layers}
            format={layer.params.format}
            transparent={layer.params.transparent}
          />
        </LayersControl.BaseLayer>
      );
    } else {
      return (
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
      );
    }
  })}

          {/* <LayersControl.Overlay name="OpenStreetMap WMS">
            <TileLayer
              url="https://ows.terrestris.de/osm/service"
              layers="osm_auto:all"
              format="image/png"
              transparent={true}
              attribution="© terrestris"
            />
          </LayersControl.Overlay>


          <LayersControl.Overlay name="srtm">
            <TileLayer
              url="http://ows.mundialis.de/services/service?"
              layers="SRTM30-Colored-Hillshade"
              format="image/png"
              transparent={true}
              attribution="pdfsff"
            />
          </LayersControl.Overlay> */}

          <LayersControl.Overlay checked name="Polygons">
            <FeatureGroup>
            <EditControl
  position="topright"
  onCreated={(e) => {
    const layer = e.layer;
    handleSavePolygon(layer);
  }}
  
  onEdited={(e) => {
    
    const layers = e.layers;

    // Prompt for tag and color once
    const segmentOptions = [
      'Farm',
      'Building',
      'Urban',
      'Rural',
      'Mountain',
      'Vehicle',
      'Road',
      'Water Body',
      'Forest',
      'Flooding' , 'Earthquakes' , 'hurricanes' , 'Wildfires' , 'tsunamis' ,
      'Others'
    ];
    const segment = prompt(
      `Select a segment tag by entering the number:\n${segmentOptions
        .map((option, index) => `${index + 1}: ${option}`)
        .join('\n')}`
    );
    const segmentTag = segmentOptions[parseInt(segment, 10) - 1];
    if (!segmentTag) {
      alert('Invalid segment selection. Operation canceled.');
      return;
    }
  
    const color = prompt('Enter a color for the polygon (e.g., #FF0000):') || '#3388ff';
  

    layers.eachLayer((layer) => {
      const updatedCoordinates = layer.getLatLngs()[0].map((point) => [point.lat, point.lng]);
      console.log('Updated Coordinates:', updatedCoordinates);
  
      // Handle update logic as before
      if (layer.options._id) {
        handleUpdatePolygon(layer.options._id, updatedCoordinates, segmentTag, color);
      }

      layer.setStyle({ color });

    });
  }}
  

  draw={{
    rectangle: true,
    polygon: true,
    circle: true,
    marker: measurementMode,
    polyline: true
  }}
/>
              {/* Existing Polygons */}
              {polygons.map((polygon, index) => (
                
                 <Polygon
                 key={polygon._id}
                 positions={polygon.coordinates[0].map(([lat, lng]) => [lat, lng])}
                 pathOptions={{ color: polygon.color }}
                 eventHandlers={{
                   add: (e) => {
                     e.target.options._id = polygon._id; // Attach _id when the layer is added to the map
                   },
                 }}
               >

            <Popup>
              <div className='popupDiv'>

                <p style={{fontSize:"0.8rem"}}><strong>Description:</strong> {polygon.description}</p>
                
                <p style={{fontSize:"0.8rem"}}><strong>Username:</strong> {polygon.name}</p>
                <p style={{fontSize:"0.8rem"}}><strong>Email:</strong> {polygon.email}</p>
                <p style={{fontSize:"0.8rem"}}><strong>Tag:</strong> {polygon.tag}</p>
                <p style={{fontSize:"0.8rem"}}><strong>Color:</strong> {polygon.color}</p>
                <p style={{fontSize:"0.8rem"}}><strong>Date:</strong> {polygon.date}</p>
                <p style={{fontSize:"0.8rem"}}><strong>Area:</strong> {polygon.area.toFixed(2)} sq. meters</p>
                <p style={{fontSize:"0.8rem"}}><strong>Likes:</strong> {polygon.likes}</p>
                <p style={{fontSize:"0.8rem"}}><strong>Reviews:</strong></p>
                <p style={{display:"flex" , textAlign:"center" , alignContent:"center" , alignItems:"center"}}><strong> <Link style={{textDecoration:"none" }} to={'https://chatroom-d9caf.web.app/'}> Chat <CiChat1 style={{fontSize:"1.5rem"}} /> </Link> </strong></p>
                <ul>
                  {polygon.reviews.map((review, idx) => (
                    <li key={idx}>{review}</li>
                  ))}
                </ul>
                  <button style={{backgroundColor : "white"}} disabled={userlike} onClick={() => handleLike(polygon._id)}> <AiFillLike /> </button>
                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="Add a review"
                />
                <button style={{fontSize:"0.8rem"}} onClick={() => handleAddReview(polygon._id)}>Add Review</button>
                <button style={{fontSize:"0.8rem"}} onClick={() => exportToGeoJSON(polygon)}>Export to GeoJSON</button>
                <button style={{fontSize:"0.8rem"}} onClick={() => exportToKML(polygon)}>Export to KML</button>

              </div>
            </Popup>

                </Polygon>
              ))}
            </FeatureGroup>
          </LayersControl.Overlay>

        </LayersControl>
        {searchResult && <PanToSearchResult />}
      </MapContainer>

      {/* chatbot */}
      <ChatBot
  steps={[
    {
      id: '1',
      message: 'Welcome! What is your name?',
      trigger: '2',
    },
    {
      id: '2',
      user: true,
      trigger: '3',
    },
    {
      id: '3',
      message: 'Hi {previousValue}, how can I assist you today?',
      trigger: '4',
    },
    {
      id: '4',
      message: 'Select a topic to explore:',
      trigger: '5',
    },
    {
      id: '5',
      options: [
        { value: 1, label: 'Disaster Response', trigger: '6' },
        { value: 2, label: 'Resource Management', trigger: '7' },
        { value: 3, label: 'Segmentation Tools', trigger: '8' },
        { value: 4, label: 'Contact Experts', trigger: '9' },
      ],
    },
    {
      id: '6',
      message: `Effective disaster response is crucial. Explore our manual for step-by-step guidance on evacuation planning, emergency supply kits, and first responder coordination.`,
      trigger: '5',
    },
    {
      id: '7',
      message: `Learn how to efficiently manage resources during crises. Our platform provides real-time tracking, allocation strategies, and inventory management for disaster supplies.`,
      trigger: '5',
    },
    {
      id: '8',
      message: `Our segmentation tools assist in analyzing disaster-affected areas. Use satellite imagery and AI-powered mapping to prioritize rescue and relief operations.`,
      trigger: '5',
    },
    {
      id: '9',
      message: `Need expert advice? Contact our network of disaster management professionals for tailored solutions and real-time decision-making support.`,
      trigger: '5',
    },
  ]}
  floating={true}
/>


  </div>

  );
};



export default GeolocationMap;
