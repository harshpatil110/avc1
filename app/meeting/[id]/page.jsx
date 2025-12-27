'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import MeetingRoom from '@/components/MeetingRoom';

export default function MeetingPage({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resolvedParams = use(params);
  const username = searchParams.get('name') || 'Anonymous';
  const callId = resolvedParams.id;

  const handleLeave = () => {
    router.push('/');
  };

  return (
    <MeetingRoom callId={callId} onLeave={handleLeave} />
  );
}
