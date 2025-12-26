'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import StreamProvider from '@/components/StreamProvider';
import MeetingRoom from '@/components/MeetingRoom';

export default function MeetingPage({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = searchParams.get('name') || 'Anonymous';
  const callId = params.id;

  const handleLeave = () => {
    router.push('/');
  };

  return (
    <StreamProvider userId={username}>
      <MeetingRoom callId={callId} onLeave={handleLeave} />
    </StreamProvider>
  );
}
