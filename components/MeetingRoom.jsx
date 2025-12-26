'use client';

import { useEffect, useState, useRef } from 'react';
import { useStreamVideoClient, useCall } from '@stream-io/video-react-sdk';
import TranscriptPanel from '@/components/TranscriptPanel';

export default function MeetingRoom({ callId, onLeave }) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const callInitialized = useRef(false);

  useEffect(() => {
    if (!client || !callId || callInitialized.current) return;

    const setupCall = async () => {
      try {
        setIsLoading(true);
        
        // Create or get the call
        const newCall = client.call('default', callId);
        
        // Join the call
        await newCall.join({
          create: true,
          data: {
            members: [],
          },
        });

        // Start closed captions for transcription
        try {
          await newCall.startClosedCaptions();
        } catch (captionError) {
          console.warn('Could not start closed captions:', captionError);
        }

        setCall(newCall);
        callInitialized.current = true;
        setIsLoading(false);
      } catch (err) {
        console.error('Error setting up call:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    setupCall();

    // Cleanup
    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
    };
  }, [client, callId]);

  const handleLeaveCall = async () => {
    if (call) {
      try {
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
        <div className="flex-1 relative">
          {call && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xl mb-2">Video Call Active</p>
                <p className="text-gray-400 text-sm">Camera and microphone controls below</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Call Controls */}
        <div className="bg-gray-900 p-4 flex justify-center space-x-4">
          <button
            onClick={handleLeaveCall}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            Leave Call
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
