'use client';

import { useEffect, useState, useRef } from 'react';

export default function TranscriptPanel({ call }) {
  const [transcripts, setTranscripts] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!call) return;

    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsLive(true);
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        const isFinal = event.results[last].isFinal;

        if (isFinal) {
          const newTranscript = {
            speaker: 'You',
            text: transcript,
            timestamp: new Date().toLocaleTimeString(),
          };
          setTranscripts((prev) => [...prev, newTranscript]);

          // Check for "Hey Assistant" trigger
          if (transcript.toLowerCase().includes('hey assistant')) {
            const aiResponse = {
              speaker: 'AI Assistant',
              text: 'Hello! How can I help you with this meeting?',
              timestamp: new Date().toLocaleTimeString(),
            };
            setTimeout(() => {
              setTranscripts((prev) => [...prev, aiResponse]);
            }, 500);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle different error types
        if (event.error === 'network') {
          setError('Network error - Speech recognition requires internet connection');
          setIsListening(false);
          setIsLive(false);
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied - Please allow microphone permissions');
          setIsListening(false);
          setIsLive(false);
        } else if (event.error === 'aborted') {
          // Recognition was aborted - usually due to stop being called
          // Don't show error, just update state
          setIsListening(false);
          setIsLive(false);
        } else if (event.error === 'no-speech') {
          // Don't show error for no-speech, just restart
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.log('Could not restart recognition');
              }
            }
          }, 1000);
        } else {
          // For other errors, show message but don't display to user
          console.warn(`Speech recognition error: ${event.error}`);
          setIsListening(false);
          setIsLive(false);
        }
      };

      recognition.onend = () => {
        if (isListening && recognitionRef.current) {
          // Restart recognition if it stops unexpectedly
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.log('Recognition already started or stopped');
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      
      // Start recognition
      try {
        recognition.start();
        setError(null);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start speech recognition');
      }
    } else {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        setIsListening(false);
        recognitionRef.current.stop();
      }
    };
  }, [call, isListening]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    autoScrollRef.current = isAtBottom;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsLive(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        setError('Failed to start - Recognition may already be running');
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-white font-semibold text-lg">Live Transcription</h2>
          {isLive && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 text-sm font-medium">LIVE</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-3 bg-red-900/50 border border-red-700 text-red-200 text-xs p-2 rounded">
            {error}
          </div>
        )}
        
        <button
          onClick={toggleListening}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isListening ? 'Stop Transcription' : 'Start Transcription'}
        </button>
      </div>

      {/* Transcript List */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {transcripts.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <p className="text-sm font-medium">No transcripts yet</p>
            <p className="text-xs mt-2 text-gray-600">
              Click "Start Transcription" to begin
            </p>
            <p className="text-xs mt-1 text-gray-600">
              Speech recognition uses your browser's built-in capabilities
            </p>
          </div>
        ) : (
          transcripts.map((transcript, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-3 hover:bg-gray-650 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-blue-400 font-medium text-sm">
                  {transcript.speaker}
                </span>
                <span className="text-gray-500 text-xs">
                  {transcript.timestamp}
                </span>
              </div>
              <p className="text-white text-sm leading-relaxed">
                {transcript.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 p-3 border-t border-gray-700">
        <p className="text-gray-400 text-xs text-center">
          Say "Hey Assistant" to get AI help
        </p>
      </div>
    </div>
  );
}
