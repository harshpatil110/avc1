'use client';

import { useStreamClients } from '@/hooks/useStreamClients';
import { StreamVideo } from '@stream-io/video-react-sdk';
import { Chat } from 'stream-chat-react';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'stream-chat-react/dist/css/v2/index.css';

export default function StreamProvider({ children, userId }) {
  const { videoClient, chatClient, isLoading, error } = useStreamClients(userId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Connecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-red-900 text-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!videoClient || !chatClient) {
    return null;
  }

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient}>
        {children}
      </Chat>
    </StreamVideo>
  );
}
