'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleJoinMeeting = () => {
    const finalUsername = username.trim() || 'Anonymous';
    const meetingId = process.env.NEXT_PUBLIC_CALL_ID || 'demo-meeting';
    router.push(`/meeting/${meetingId}?name=${encodeURIComponent(finalUsername)}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinMeeting();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Meeting Assistant</h1>
          <p className="text-gray-400">Join your video call with AI-powered transcription</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Enter your name</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={handleJoinMeeting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Join Meeting
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Say "Hey Assistant" during the call to activate AI help</p>
        </div>
      </div>
    </div>
  );
}
