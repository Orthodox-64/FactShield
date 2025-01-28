import { useState, useRef, useEffect } from 'react';
import './App.css';

function Voice() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const [speaking, setSpeaking] = useState(false);

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
        body: JSON.stringify({ inputValue: inputText }),
        "inputType": "chat",
        "outputType": "chat",
        "stream": false,
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

      // Speak the bot's response
      speakText(botMessage.text);
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

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('SpeechRecognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setInputText(speechText);
    };

    recognition.onerror = (event) => {
      console.error('Voice input error:', event.error);
    };

    recognition.onend = () => {
      console.log('Voice input ended.');
    };

    recognition.start();
  };

  const speakText = (text) => {
    if (synthRef.current.speaking) {
      console.error("Already speaking...");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => console.error("Speech synthesis error:", event.error);

    setSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const stopVoice = () => {
    synthRef.current.cancel();
    setSpeaking(false);
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
        <button onClick={startVoiceInput} className="voice-button">
          🎤 Voice Input
        </button>
        <button onClick={stopVoice} className="stop-button" disabled={!speaking}>
          🛑 Stop
        </button>
      </div>
    </div>
  );
}

export default Voice;