import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SentinelHubSatellite = () => {
  const [imageUrl, setImageUrl] = useState('../assets/img.png');

  // Set up your API credentials (ensure not to expose them in production)
  const clientId = '3e6822eb-3833-4860-9b59-d4e5c2c2b95f';
  const clientSecret = 'AdmIvqnS1MSzIeCLNvLQrwrdCOUpT3UP';
  const instanceId = '6858fab8-a243-4b16-b488-cd96adbe5368';

  useEffect(() => {
    const fetchSatelliteImage = async () => {
      try {
        const response = await axios.post(
          `https://services.sentinel-hub.com/ogc/wms/${instanceId}`,
          {
            headers: {
              'Authorization': `Bearer ${clientId}:${clientSecret}`
            },
            params: {
              service: 'WMS',
              request: 'GetMap',
              version: '1.3.0',
              layer: 'TRUE_COLOR',
              width: '512',
              height: '512',
              bbox: '-5.57,40.51,10.26,49.15',  // Example bounding box
              format: 'image/png',
              transparent: true
            }
          }
        );
        setImageUrl(response.data);
      } catch (error) {
        console.error('Error fetching satellite image:', error);
      }
    };

    fetchSatelliteImage();
  }, []);

  return (
    <div>
      <h1>Satellite Image</h1>
      <img src={imageUrl} alt="Satellite" />
    </div>
  );
};

export default SentinelHubSatellite;
