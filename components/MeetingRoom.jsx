'use client';

import { useEffect, useState, useRef } from 'react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import TranscriptPanel from '@/components/TranscriptPanel';

export default function MeetingRoom({ callId, onLeave }) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const callInitialized = useRef(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!client || !callId || callInitialized.current) return;

    const setupCall = async () => {
      try {
        setIsLoading(true);
        
        const newCall = client.call('default', callId);
        
        await newCall.join({
          create: true,
          data: {
            members: [],
          },
        });

        await newCall.camera.enable();
        await newCall.microphone.enable();

        setCall(newCall);
        callInitialized.current = true;
        setIsLoading(false);
        
        console.log('✅ Successfully joined the call');
        
        if (videoRef.current && newCall.camera.state.mediaStream) {
          videoRef.current.srcObject = newCall.camera.state.mediaStream;
        }
      } catch (err) {
        console.error('Error setting up call:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    setupCall();

    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
    };
  }, [client, callId]);

  const toggleMicrophone = async () => {
    if (call) {
      if (isMicOn) {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = async () => {
    if (call) {
      if (isCameraOn) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
      setIsCameraOn(!isCameraOn);
    }
  };

  const handleLeaveCall = async () => {
    if (call) {
      try {
        await call.camera.disable();
        await call.microphone.disable();
        await call.leave();
      } catch (err) {
        console.error('Error leaving call:', err);
      }
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
          <p className="text-white text-xl">Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 text-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={onLeave}
            className="mt-4 bg-white text-red-900 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Video Section */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 relative bg-gray-900 min-h-[500px]">
          {call && (
            <div className="absolute inset-0 w-full h-full">
              <div className="relative w-full h-full flex items-center justify-center">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white">
                    <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xl font-medium">Camera Off</p>
                    <p className="text-sm text-gray-400 mt-2">Click camera icon to turn on</p>
                  </div>
                )}
                
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
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-900 p-6 flex justify-center items-center space-x-4">
          <button
            onClick={toggleMicrophone}
            className={`${
              isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } text-white p-4 rounded-full transition duration-200 shadow-lg`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
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
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13.657V6.343a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 7.343v.657l-4-4a2 2 0 00-2-2H6.343L3.707 2.293zM2 6a2 2 0 012-2h.879L2 6.879V6z" clipRule="evenodd" />
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
            <span>Leave Call</span>
          </button>
        </div>
      </div>

      {/* Transcription Panel */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {call && <TranscriptPanel call={call} />}
      </div>
    </div>
  );
}
