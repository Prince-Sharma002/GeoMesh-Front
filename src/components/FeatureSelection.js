import React, { useEffect } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import img from '../assets/boy.jpg';
import family_image from '../assets/family_image.jpeg';

const FeatureSelection = () => {
  useEffect(() => {
    const loadBodyPixModel = async () => {
      try {
        // Load the BodyPix model
        const model = await bodyPix.load();
        console.log('BodyPix model loaded', model);

        // Get the image element
        const image = document.getElementById('satelliteImage');
        const canvas = document.getElementById('canvas');

        // Perform segmentation on the loaded image
        if (image) {
          await segmentImage(model, image, canvas);
        }
      } catch (error) {
        console.error('Error loading BodyPix model:', error);
      }
    };

    const segmentImage = async (model, image, canvas) => {
      // Perform segmentation on the image
      const segmentation = await model.segmentPerson(image);
      console.log('Segmentation result:', segmentation);

      // Create a mask using the segmentation result
      const maskBackground = { r: 0, g: 0, b: 0, a: 0 }; // Transparent background
      const maskForeground = { r: 0, g: 255, b: 0, a: 255 }; // Green mask
      const mask = bodyPix.toMask(segmentation, maskForeground, maskBackground);

      // Draw the segmentation mask onto the canvas
      bodyPix.drawMask(canvas, image, mask, 1, 0, false); // Parameters: canvas, image, mask, opacity, maskBlurAmount, flipHorizontal
    };

    loadBodyPixModel();
  }, []);

  const handleSelection = () => {
    console.log('Feature selected');
  };

  return (
    <div>
      <h1>Feature Selection on Satellite Map</h1>
      <button onClick={handleSelection}>Select Feature</button>
      {/* Satellite image element */}
      <img
        id="satelliteImage"
        src={family_image}
        alt="Satellite Map"
        crossOrigin="anonymous"
        style={{ display: 'none' }} // Hide the image if you only want to show the canvas
      />
      {/* Canvas element for displaying the segmentation */}
      <canvas id="canvas" width="800" height="600"></canvas>
    </div>
  );
};

export default FeatureSelection;
