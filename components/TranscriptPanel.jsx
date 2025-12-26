'use client';

import { useEffect, useState, useRef } from 'react';

export default function TranscriptPanel({ call }) {
  const [transcripts, setTranscripts] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(true);

  useEffect(() => {
    if (!call) return;

    // Listen for closed caption events
    const handleClosedCaption = (event) => {
      const { closed_caption } = event;
      
      if (closed_caption && closed_caption.text) {
        setIsLive(true);
        
        const newTranscript = {
          speaker: closed_caption.user?.name || closed_caption.user?.id || 'Unknown',
          text: closed_caption.text,
          timestamp: new Date().toLocaleTimeString(),
        };

        setTranscripts((prev) => [...prev, newTranscript]);
      }
    };

    // Subscribe to closed caption events
    call.on('call.closed_caption', handleClosedCaption);

    // Cleanup
    return () => {
      call.off('call.closed_caption', handleClosedCaption);
    };
  }, [call]);

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-white font-semibold text-lg">Live Transcription</h2>
        {isLive && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 text-sm font-medium">LIVE</span>
          </div>
        )}
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
            <p className="text-sm">Waiting for speech...</p>
            <p className="text-xs mt-2">Start speaking to see transcriptions</p>
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
