import React, { useState, useEffect } from "react";

import axios from 'axios';
import data from './data';
import Fuse from 'fuse.js';
import { exportToGeoJSON, exportToKML, exportAllToKML } from '../../map/GeolocationMapwithchatbot';
import Count from '../../map/Count';

const ActionProvider = ({ exporttagToGeoJSON,exporttagToKML,createChatBotMessage, setState, children ,initialPosition,setcoordinates,exportAllToKML,exportAllToGeoJSON, polygons, setPolygons}) => {
  const apiKey = '5d157c620d9c4089b66b6d74a66d4beb'; // Geocoding API key

  // Text-to-speech function
  const speakResponse = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  // Fetch coordinates for a city
  const fetchCoordinates = async (cityName) => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: cityName,
            key: apiKey,
          },
        }
      );
      
      const results = response.data.results;
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  // Fetch answer based on the user question
  const fetchAnswer = async (question) => {
    const normalizedQuestion = question.trim().toLowerCase();
  
    // Handle specific keywords for flowchart
    if (normalizedQuestion.includes('flowchart')) {
      return { type: 'flowchart' }; // Signal to display a flowchart
    }
    if (normalizedQuestion.includes('use')) {
      return { type: 'use' }; // Signal to display a specific flowchart
    }
    if (normalizedQuestion.includes('chatbot')) {
      return { type: 'chatbot' }; // Signal to display a specific flowchart
    }
    

    // Check if the question is about coordinates
    if (normalizedQuestion.startsWith('where is')) {
      const cityName = question.replace(/where is/i, '').trim();
      const coordinates = await fetchCoordinates(cityName);
  
      if (coordinates && coordinates.lat && coordinates.lng) {
        // Update coordinates in Parentmap
        setcoordinates(parseFloat(coordinates.lat), parseFloat(coordinates.lng)); // Use parseFloat instead of parseInt for lat/lng
  
        console.log("Updated Coordinates:", coordinates.lat, coordinates.lng); // Debugging log to ensure it's updating
        return {
          type: 'text',
          content: `The coordinates of ${cityName} are Latitude: ${coordinates.lat}, Longitude: ${coordinates.lng}.`,
        };
      } else {
        return {
          type: 'text',
          content: `I couldn't find the coordinates for ${cityName}. Please try another city.`,
        };
      }
    }
  
  

    // Prepare fuzzy search for matching answers in local data
    const keys = Object.keys(data);
    const fuse = new Fuse(keys, {
      includeScore: true,
      threshold: 0.3, // Adjust threshold for fuzziness
    });

    const results = fuse.search(normalizedQuestion);

    if (results.length > 0) {
      const matchedKey = results[0].item; // Best match
      return { type: 'text', content: data[matchedKey] };
    }

    // Fall back to DuckDuckGo API if no local match is found
    try {
      const response = await axios.get('https://api.duckduckgo.com/', {
        params: {
          q: question,
          format: 'json',
          no_html: 1,
        },
      });

      const answer = response.data.Abstract || response.data.Answer;
      if (answer) return { type: 'text', content: answer };

      if (response.data.RelatedTopics.length > 0) {
        return { type: 'text', content: response.data.RelatedTopics[0].Text || "No specific answer found." };
      }

      return { type: 'text', content: "I couldn't find an answer to your question." };
    } catch (error) {
      console.error('Error fetching answer:', error);
      return { type: 'text', content: "An error occurred while searching for an answer." };
    }
  };

  // Handle user question and perform specific actions
  const handleUserQuestion = async (userQuestion) => {
    const answer = await fetchAnswer(userQuestion);
    const normalizedQuestion = userQuestion.trim().toLowerCase();

    if (normalizedQuestion.startsWith('export to geojson of')) {
      const tag = normalizedQuestion.substring('export to geojson of'.length).trim(); // Extract the tag
      try {
        // Ensure polygon data is defined or fetched
        exporttagToGeoJSON();
        const message = createChatBotMessage(`Export to GeoJSON for tag "${tag}" triggered successfully.`);
        updateState(message);
      } catch (error) {
        const errorMessage = createChatBotMessage(`Failed to export to GeoJSON for tag "${tag}". Please try again.`);
        updateState(errorMessage);
      }
      return;
    }
    if (normalizedQuestion.startsWith('export to kml of')) {
      const tag = normalizedQuestion.substring('export to kml of'.length).trim(); // Extract the tag
      try {
        // Ensure polygon data is defined or fetched
        exporttagToKML();
        const message = createChatBotMessage(`Export to kml for tag "${tag}" triggered successfully.`);
        updateState(message);
      } catch (error) {
        const errorMessage = createChatBotMessage(`Failed to export to kml for tag "${tag}". Please try again.`);
        updateState(errorMessage);
      }
      return;
    }
    if (normalizedQuestion === 'export to geojson') {
      try {
         // Ensure polygon data is defined or fetched
         exportAllToGeoJSON({polygons});
        const message = createChatBotMessage("Export to GeoJSON triggered successfully.");
        updateState(message);
      } catch (error) {
        const errorMessage = createChatBotMessage("Failed to export to GeoJSON. Please try again.");
        updateState(errorMessage);
      }
      return;
    }

    if (normalizedQuestion === 'export to kml') {
      try {
       
        exportAllToKML({polygons});
        const message = createChatBotMessage("Export to KML triggered successfully.");
        updateState(message);
      } catch (error) {
        const errorMessage = createChatBotMessage("Failed to export to KML. Please try again.");
        updateState(errorMessage);
      }
      return;
    }

    if (normalizedQuestion === 'select layer') {
      try {
        const message = createChatBotMessage("Advanced layer selection activated. Please choose a layer:", {
          widget: 'layerSelection',
        });
        updateState(message);
      } catch (error) {
        const errorMessage = createChatBotMessage("Failed to activate layer selection. Please try again.");
        updateState(errorMessage);
      }
      return;
    }

    if (answer.type === 'flowchart') {
      const flowchartMessage = createChatBotMessage("Here is your flowchart:", {
        widget: 'flowchart',
      });
      updateState(flowchartMessage);
    } else if (answer.type === 'use') {
      const flowchartMessage = createChatBotMessage("Here is your flowchart:", {
        widget: 'flowchart2',
      });
      updateState(flowchartMessage);
    } else if (answer.type === 'chatbot') {
      const flowchartMessage = createChatBotMessage("Here is your flowchart:", {
        widget: 'flowchartchatbot',
      });
      updateState(flowchartMessage);
    } 
    else if (answer.type === 'text') {
      const message = createChatBotMessage(answer.content);
      speakResponse(answer.content);
      updateState(message);
    }
  };

  // Update chatbot state with new message
  const updateState = (message) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          actions: { handleUserQuestion },
        })
      )}
    </div>
  );
};

export default ActionProvider;
