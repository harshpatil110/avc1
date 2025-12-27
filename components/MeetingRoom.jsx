'use client';

import { useEffect, useState, useRef } from 'react';
import TranscriptPanel from '@/components/TranscriptPanel';

export default function MeetingRoom({ callId, onLeave }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const startMedia = async () => {
      try {
        setIsLoading(true);
        
        // Request camera and microphone permissions
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: true,
        });
        
        setStream(mediaStream);
        setIsCameraOn(true);
        setIsMicOn(true);
        setIsLoading(false);
        
        // Connect stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        console.log('✅ Camera and microphone started successfully');
      } catch (err) {
        console.error('Media error:', err);
        if (err.name === 'NotAllowedError') {
          setError('Please allow camera and microphone access to join the meeting.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found. Please connect a device.');
        } else {
          setError(`Failed to access media: ${err.message}`);
        }
        setIsLoading(false);
      }
    };

    startMedia();

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleMicrophone = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const newState = !isCameraOn;
      videoTracks.forEach(track => {
        track.enabled = newState;
      });
      setIsCameraOn(newState);
      
      // Reconnect video element when turning camera back on
      if (newState && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  };

  const handleLeaveCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (onLeave) {
      onLeave();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Starting camera...</p>
          <p className="text-gray-400 text-sm mt-2">Please allow camera and microphone access</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-700 text-white p-6 rounded-lg max-w-md text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Permission Required</h2>
          <p className="mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={onLeave}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Video Section */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 relative bg-black min-h-[400px]">
          {/* Always render video element, just hide it when camera is off */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${isCameraOn ? 'block' : 'hidden'}`}
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-lg font-medium">Camera Off</p>
            </div>
          )}
          
          {/* Status indicators */}
          <div className="absolute top-4 left-4 flex space-x-2">
            {!isMicOn && (
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
                <span>Muted</span>
              </div>
            )}
          </div>
          
          {/* Room info */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            Room: {callId}
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-gray-900 p-6 flex justify-center items-center space-x-4">
          <button
            onClick={toggleMicrophone}
            className={`${
              isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } text-white p-4 rounded-full transition duration-200 shadow-lg`}
            title={isMicOn ? 'Mute' : 'Unmute'}
          >
            {isMicOn ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleCamera}
            className={`${
              isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } text-white p-4 rounded-full transition duration-200 shadow-lg`}
            title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraOn ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 8v4c0 .025-.001.05-.003.075l-4.066-4.066A2 2 0 0010 6H6.343L3.707 2.293zM2 8a2 2 0 012-2h.343L2 8z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={handleLeaveCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold transition duration-200 flex items-center space-x-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <TranscriptPanel />
      </div>
    </div>
  );
}
