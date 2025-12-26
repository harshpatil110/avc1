'use client';

import { useEffect, useState, useRef } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';

export function useStreamClients(userId) {
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientsInitialized = useRef(false);

  useEffect(() => {
    if (!userId || clientsInitialized.current) return;

    const initializeClients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch token from API
        const response = await fetch('/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch token');
        }

        const { token, apiKey } = await response.json();

        // Initialize Video Client
        const newVideoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: userId,
            name: userId,
          },
          token,
        });

        // Initialize Chat Client
        const newChatClient = StreamChat.getInstance(apiKey);
        await newChatClient.connectUser(
          {
            id: userId,
            name: userId,
          },
          token
        );

        setVideoClient(newVideoClient);
        setChatClient(newChatClient);
        clientsInitialized.current = true;
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Stream clients:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeClients();

    // Cleanup function
    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [userId]);

  return { videoClient, chatClient, isLoading, error };
}
