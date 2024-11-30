// import React, { useEffect } from 'react';
// import * as bodyPix from '@tensorflow-models/body-pix';
// import axios from 'axios';
// import family_image from '../assets/family_image.jpeg';

// const WmsIntegration = () => {
//   useEffect(() => {
//     // Load the BodyPix model and WMS integration
//     const initialize = async () => {
//       await loadBodyPixModel();
//       startWMSIntegration();
//     };

//     // Load the BodyPix model for segmentation
//     const loadBodyPixModel = async () => {
//       try {
//         const model = await bodyPix.load();
//         console.log('BodyPix model loaded', model);

//         const image = document.getElementById('satelliteImage');
//         const canvas = document.getElementById('canvas');

//         if (image) {
//           await segmentImage(model, image, canvas);
//         }
//       } catch (error) {
//         console.error('Error loading BodyPix model:', error);
//       }
//     };

//     const segmentImage = async (model, image, canvas) => {
//       const segmentation = await model.segmentPerson(image);
//       console.log('Segmentation result:', segmentation);

//       const maskBackground = { r: 0, g: 0, b: 0, a: 0 };
//       const maskForeground = { r: 0, g: 255, b: 0, a: 255 };
//       const mask = bodyPix.toMask(segmentation, maskForeground, maskBackground);

//       bodyPix.drawMask(canvas, image, mask, 1, 0, false);
//     };

//     // WMS integration function
//     const startWMSIntegration = async () => {
//       try {
//         // Using a free WMS service URL from OpenStreetMap
//         const wmsUrl = "https://ows.terrestris.de/osm/service"; // Free OpenStreetMap WMS service
//         const layerName = "OSM-WMS"; // Layer name for OpenStreetMap WMS
//         const capabilities = await fetchWMSCapabilities(wmsUrl);

//         if (isValidOGCWMS(capabilities)) {
//           setupWMSLayer(wmsUrl, layerName);
//         } else {
//           console.error("Invalid OGC WMS");
//         }
//       } catch (error) {
//         console.error("Error during WMS integration:", error);
//       }
//     };

//     const fetchWMSCapabilities = async (url) => {
//       try {
//         const response = await axios.get(`${url}?service=WMS&request=GetCapabilities`);
//         return response.data;
//       } catch (error) {
//         throw new Error("Failed to fetch WMS capabilities");
//       }
//     };

//     const isValidOGCWMS = (capabilities) => {
//       return capabilities.includes("OGC:WMS");
//     };

//     const setupWMSLayer = (url, layerName) => {
//       console.log(`WMS Layer configured for ${layerName} from ${url}`);
//       // Implement WMS layer rendering logic using a mapping library if needed
//     };

//     initialize();
//   }, []);

//   const handleSelection = () => {
//     console.log('Feature selected');
//   };

//   return (
//     <div>
//       <h1>Feature Selection on Satellite Map</h1>
//       <button onClick={handleSelection}>Select Feature</button>
//       <img
//         id="satelliteImage"
//         src={family_image}
//         alt="Satellite Map"
//         crossOrigin="anonymous"
//         style={{ display: 'none' }}
//       />
//       <canvas id="canvas" width="800" height="600"></canvas>
//     </div>
//   );
// };

// export default WmsIntegration;


import React, { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
import axios from 'axios';
import family_image from '../assets/family_image.jpeg';

const WmsIntegration = () => {
  useEffect(() => {
    // Load the DeepLab v3+ model and WMS integration
    const initialize = async () => {
      await loadDeepLabModel();
      startWMSIntegration();
    };

    // Load the DeepLab v3+ model for segmentation
    const loadDeepLabModel = async () => {
      try {
        // Load the DeepLab model from TensorFlow Hub
        const modelUrl = 'https://tfhub.dev/tensorflow/lite-model/deeplabv3/1/default/1'; // Example URL
        const model = await loadGraphModel(modelUrl);
        console.log('DeepLab v3+ model loaded', model);

        const image = document.getElementById('satelliteImage');
        const canvas = document.getElementById('canvas');

        if (image) {
          await segmentImage(model, image, canvas);
        }
      } catch (error) {
        console.error('Error loading DeepLab v3+ model:', error);
      }
    };

    const segmentImage = async (model, image, canvas) => {
        try {
          // Preprocess the image: convert to tensor and resize
          const imgTensor = tf.browser.fromPixels(image).expandDims(0).toFloat().div(255); // Normalize image
          const result = await model.predict(imgTensor);
      
          // Process the segmentation result
          const [height, width] = [image.height, image.width];
          const segmentationData = result.dataSync(); // Get raw data
          const segmentationMap = new Uint8ClampedArray(segmentationData.length * 4);
      
          // Create an RGBA image from segmentation data
          for (let i = 0; i < segmentationData.length; i++) {
            const offset = i * 4;
            const segmentValue = segmentationData[i] > 0.5 ? 255 : 0; // Threshold to binary mask
            segmentationMap[offset] = segmentValue; // R
            segmentationMap[offset + 1] = segmentValue; // G
            segmentationMap[offset + 2] = segmentValue; // B
            segmentationMap[offset + 3] = 255; // Alpha
          }
      
          // Draw the segmentation map on the canvas
          const ctx = canvas.getContext('2d');
          const imageData = new ImageData(segmentationMap, width, height);
          ctx.putImageData(imageData, 0, 0);
        } catch (error) {
          console.error('Error during image segmentation:', error);
        }
      };
      

    // WMS integration function
    const startWMSIntegration = async () => {
      try {
        const wmsUrl = 'https://ows.terrestris.de/osm/service'; // Free OpenStreetMap WMS service
        const layerName = 'OSM-WMS'; // Layer name for OpenStreetMap WMS
        const capabilities = await fetchWMSCapabilities(wmsUrl);

        if (isValidOGCWMS(capabilities)) {
          setupWMSLayer(wmsUrl, layerName);
        } else {
          console.error('Invalid OGC WMS');
        }
      } catch (error) {
        console.error('Error during WMS integration:', error);
      }
    };

    const fetchWMSCapabilities = async (url) => {
      try {
        const response = await axios.get(`${url}?service=WMS&request=GetCapabilities`);
        return response.data;
      } catch (error) {
        throw new Error('Failed to fetch WMS capabilities');
      }
    };

    const isValidOGCWMS = (capabilities) => {
      return capabilities.includes('OGC:WMS');
    };

    const setupWMSLayer = (url, layerName) => {
      console.log(`WMS Layer configured for ${layerName} from ${url}`);
      // Implement WMS layer rendering logic using a mapping library if needed
    };

    initialize();
  }, []);

  const handleSelection = () => {
    console.log('Feature selected');
  };

  return (
    <div>
      <h1>Feature Selection on Satellite Map</h1>
      <button onClick={handleSelection}>Select Feature</button>
      <img
        id="satelliteImage"
        src={family_image}
        alt="Satellite Map"
        crossOrigin="anonymous"
      />
      <canvas id="canvas" width="800" height="600"></canvas>
    </div>
  );
};

export default WmsIntegration;
