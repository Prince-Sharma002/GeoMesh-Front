import React, { useEffect } from 'react';
import '@tensorflow/tfjs-backend-webgl';

import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

const SmartAI = () => {
    useEffect(() => {
        const loadBodyPixModel = async () => {
          const model = await bodyPix.load();
          console.log('BodyPix model loaded', model);
          // Example segmentation code here
        };
        loadBodyPixModel();
      }, []);

  return (
    <div>
      <h2>AI Segmentation Assistant</h2>
      <p>Using TensorFlow.js for on-device computation</p>
    </div>
  );
};

export default SmartAI;
