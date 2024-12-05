import React, { useState } from 'react';

const MessageParser = ({ children, actions }) => {
  const [isListening, setIsListening] = useState(false);

  const handleSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('User said:', transcript);
      actions.handleUserQuestion(transcript); // Pass the voice input as a question
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const parse = (message) => {
    if (message) {
      actions.handleUserQuestion(message); // Handle typed input
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          parse,
          actions,
        })
      )}
      <button
        onClick={handleSpeechRecognition}
        style={{
          margin: '10px',
          padding: '10px 15px',
          backgroundColor: isListening ? '#ff6961' : '#77dd77',
          border: 'none',
          borderRadius: '5px',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        {isListening ? 'Listening...' : 'Speak'}
      </button>
    </div>
  );
};

export default MessageParser;
