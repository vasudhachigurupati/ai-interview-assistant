

import React from 'react';

function Chatbot({ messages, userInput, onUserInputChange, onSendMessage, isWaitingForResponse }) {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !isWaitingForResponse) {
      onSendMessage();
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', maxWidth: '600px', margin: '20px auto' }}>
      <div style={{ height: '300px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
              background: msg.sender === 'bot' ? '#f1f1f1' : '#007bff',
              color: msg.sender === 'bot' ? '#000' : '#fff',
              borderRadius: '10px',
              padding: '8px 12px',
              maxWidth: '70%',
              marginBottom: '8px',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={userInput}
          onChange={onUserInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer..."
          disabled={isWaitingForResponse}
          style={{ flexGrow: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={onSendMessage}
          disabled={isWaitingForResponse}
          style={{ marginLeft: '8px', padding: '8px 12px', borderRadius: '5px', border: 'none', background: '#007bff', color: '#fff' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;