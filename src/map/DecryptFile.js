import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import {Link} from "react-router-dom";

const PASSWORD = '1234'; // The password used for encryption and decryption

const decryptData = (encryptedData, password) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) throw new Error('Invalid password or corrupted data');
    return JSON.parse(decryptedData); // Parse as JSON if it was originally a JSON string
  } catch (err) {
    throw new Error('Failed to decrypt data. ' + err.message);
  }
};

const downloadFile = (data, filename, type) => {
  const blob = new Blob([data], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const DecryptFile = () => {
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name); // Store the uploaded file name
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result;
      try {
        const decrypted = decryptData(fileContent, PASSWORD);
        setDecryptedContent(decrypted);
        setError(''); // Clear any previous error
      } catch (err) {
        setError(err.message);
        setDecryptedContent(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveDecryptedFile = () => {
    if (!decryptedContent) return;

    // Use the original file name with a suffix to indicate it's decrypted
    const newFileName = fileName.replace(/\.(geojson|kml)$/, '_decrypted.$1');
    const fileType = fileName.endsWith('.kml')
      ? 'application/vnd.google-earth.kml+xml'
      : 'application/geo+json';

    // Download the decrypted content
    downloadFile(JSON.stringify(decryptedContent, null, 2), newFileName, fileType);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h3>Decrypt GeoJSON/KML File</h3>
      <Link to="/map" style={{position : "absolute" , right : "2rem" , top : "3rem"}} >
        <button>Map</button>
      </Link>
      <input type="file" accept=".geojson,.kml" onChange={handleFileUpload} />
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {decryptedContent && (
        <div style={{ marginTop: '20px' }}>
          <h4>Decrypted Content:</h4>
          <pre
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: '#f5f5f5',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          >
            {JSON.stringify(decryptedContent, null, 2)}
          </pre>
          <button
            onClick={handleSaveDecryptedFile}
            style={{
              marginTop: '10px',
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Save Decrypted File
          </button>
        </div>
      )}
    </div>
  );
};

export default DecryptFile;
