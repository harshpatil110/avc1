import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const secret = process.env.STREAM_API_SECRET;

    if (!apiKey || !secret) {
      return NextResponse.json(
        { error: 'Stream credentials not configured' },
        { status: 500 }
      );
    }

    const client = new StreamClient(apiKey, secret);

    // Create/upsert user with admin role
    await client.upsertUsers([
      {
        id: userId,
        role: 'admin',
        name: userId,
      },
    ]);

    // Generate token with iat set to 60 seconds in the past to prevent clock sync issues
    const issuedAt = Math.floor(Date.now() / 1000) - 60;
    const exp = issuedAt + 24 * 60 * 60; // 24 hours validity

    const token = client.createToken(userId, exp, issuedAt);

    return NextResponse.json({
      token,
      userId,
      apiKey,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token', details: error.message },
      { status: 500 }
    );
  }
}
