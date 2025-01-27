import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;


    const userMessage = {
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString(),

    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch('https://cmr-1.onrender.com/run-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        "inputType": "chat",
        "outputType": "chat",
        "stream": false,
        body: JSON.stringify({ inputValue: inputText }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

     
      const botMessage = {
        text: data.output || 'Unable to analyze the news at this time.',
        sender: 'bot',
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching bot response:', error);
      const botErrorMessage = {
        text: 'An error occurred while analyzing the news. Please try again later.',
        sender: 'bot',
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, botErrorMessage]);
    }

    setInputText('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Fake News Detective</h1>
        <p>Share any news and I'll help you verify its authenticity</p>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className={`avatar ${message.sender === 'user' ? 'user-avatar' : 'bot-avatar'}`}>
              {message.sender === 'user' ? 'U' : 'B'}
            </div>
            <div className="message-content">
              <p className="message-text">{message.text}</p>
              <div className="message-time">{message.time}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <form onSubmit={handleSubmit} className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="input-field"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;