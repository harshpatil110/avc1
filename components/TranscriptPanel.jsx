'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function TranscriptPanel() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [speechError, setSpeechError] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  // Check for browser support
  const isSpeechSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Add message helper
  const addMessage = useCallback((text, sender = 'You') => {
    if (!text.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: text.trim(),
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);

    // Check for AI assistant trigger
    if (text.toLowerCase().includes('hey assistant')) {
      // Call backend AI assistant
      callAIAssistant(text);
    }
  }, []);

  // Call backend AI assistant
  const callAIAssistant = async (userMessage) => {
    try {
      const response = await fetch('http://localhost:5000/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: messages.map(m => `${m.sender}: ${m.text}`)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const aiResponse = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'AI Assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        console.error('AI Assistant error:', data.error);
        // Fallback response
        const aiResponse = {
          id: Date.now() + 1,
          text: "I'm having trouble connecting. Please make sure the backend server is running on http://localhost:5000",
          sender: 'AI Assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Failed to call AI assistant:', error);
      const aiResponse = {
        id: Date.now() + 1,
        text: "Backend server not available. Start it with: python backend/server.py",
        sender: 'AI Assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setSpeechError(null);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimText(interim);
      
      if (final) {
        addMessage(final);
        setInterimText('');
      }
    };

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      
      // Handle different error types
      if (event.error === 'not-allowed') {
        setSpeechError('Microphone access denied. Please allow microphone permissions.');
        setIsListening(false);
      } else if (event.error === 'network') {
        setSpeechError('Network error. Speech recognition requires internet connection.');
        // Don't stop listening, it may recover
      } else if (event.error === 'aborted') {
        // This is normal when stopping, ignore
        console.log('Recognition aborted (normal when stopping)');
      } else if (event.error === 'no-speech') {
        // No speech detected, will auto-restart
        console.log('No speech detected');
      } else {
        setSpeechError(`Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended, isListening:', isListening);
      
      // Auto-restart if we're still supposed to be listening
      if (isListening && !speechError) {
        // Clear any existing restart timeout
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
            console.log('Speech recognition restarted');
          } catch (e) {
            console.log('Could not restart recognition:', e.message);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [isSpeechSupported, isListening, speechError, addMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  const toggleListening = () => {
    if (!isSpeechSupported) {
      setSpeechError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      setSpeechError(null);
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
    } else {
      setSpeechError(null);
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.log('Error starting recognition:', e);
        setSpeechError('Could not start speech recognition. Please try again.');
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      addMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="w-80 bg-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold text-lg">Live Transcript</h2>
        <p className="text-gray-400 text-sm">Say "Hey Assistant" for AI help</p>
      </div>

      {/* Speech Recognition Controls */}
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={toggleListening}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isListening ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Stop Recording
            </span>
          ) : (
            'Start Recording'
          )}
        </button>
        
        {speechError && (
          <p className="text-red-400 text-xs mt-2 text-center">{speechError}</p>
        )}
        
        {!isSpeechSupported && (
          <p className="text-yellow-400 text-xs mt-2 text-center">
            Speech recognition not supported. Use text input below.
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !interimText && (
          <div className="text-gray-500 text-center py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start recording or type a message</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.sender === 'AI Assistant'
                ? 'bg-purple-900/50 border border-purple-700'
                : 'bg-gray-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${
                msg.sender === 'AI Assistant' ? 'text-purple-300' : 'text-blue-400'
              }`}>
                {msg.sender}
              </span>
              <span className="text-gray-500 text-xs">{msg.timestamp}</span>
            </div>
            <p className="text-white text-sm">{msg.text}</p>
          </div>
        ))}
        
        {/* Interim (live) transcription */}
        {interimText && (
          <div className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 border-dashed">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-400">Listening...</span>
            </div>
            <p className="text-gray-300 text-sm italic">{interimText}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Text Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
