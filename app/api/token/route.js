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
      console.error('Missing Stream credentials:', { apiKey: !!apiKey, secret: !!secret });
      return NextResponse.json(
        { error: 'Stream credentials not configured' },
        { status: 500 }
      );
    }

    const client = new StreamClient(apiKey, secret);

    // Generate token without user creation first - simpler approach
    const issuedAt = Math.floor(Date.now() / 1000) - 60;
    const exp = issuedAt + 24 * 60 * 60; // 24 hours validity

    const token = client.createToken(userId, exp, issuedAt);

    // Try to create user but don't fail if it errors
    try {
      await client.upsertUsers([
        {
          id: userId,
          role: 'admin',
          name: userId,
        },
      ]);
    } catch (userError) {
      console.warn('User creation warning (non-fatal):', userError.message);
    }

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
