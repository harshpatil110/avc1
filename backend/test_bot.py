#!/usr/bin/env python3
"""
Test script to verify AI bot is working correctly
Sends test messages to the channel to trigger AI responses
"""

import os
import asyncio
from dotenv import load_dotenv
from stream_chat import StreamChat

load_dotenv()

async def test_ai_bot():
    """Send test messages to verify AI bot responses"""
    
    api_key = os.getenv('STREAM_API_KEY')
    api_secret = os.getenv('STREAM_API_SECRET')
    call_id = os.getenv('CALL_ID', 'demo-meeting')
    
    print("🧪 AI Bot Test Script")
    print("=" * 50)
    
    # Initialize client
    client = StreamChat(api_key=api_key, api_secret=api_secret)
    
    # Create test user
    test_user_id = 'test-user'
    client.upsert_users([{
        'id': test_user_id,
        'name': 'Test User',
        'role': 'admin',
    }])
    
    print(f"✅ Test user created: {test_user_id}")
    
    # Get channel
    channel_id = f"call-{call_id}"
    channel = client.channel('messaging', channel_id)
    channel.query(data={'created_by_id': test_user_id})
    
    print(f"✅ Connected to channel: {channel_id}")
    print()
    
    # Test messages
    test_messages = [
        "Hello everyone!",
        "How's the meeting going?",
        "Hey Assistant, can you help me with a quick summary?",
        "Hey Assistant, what are we discussing today?",
    ]
    
    print("📤 Sending test messages...")
    print()
    
    for i, message in enumerate(test_messages, 1):
        print(f"[{i}/{len(test_messages)}] Sending: {message}")
        
        channel.send_message(
            {'text': message, 'user_id': test_user_id},
            test_user_id
        )
        
        # Wait for bot to respond
        await asyncio.sleep(3)
        
        # Check for AI response
        response = channel.query(messages={'limit': 2})
        messages = response.get('messages', [])
        
        if len(messages) >= 2:
            last_msg = messages[-1]
            if last_msg.get('user', {}).get('id') == 'ai-assistant-bot':
                print(f"   ✅ AI responded: {last_msg.get('text', '')[:80]}...")
            else:
                print("   ⏳ Waiting for AI response...")
        
        print()
        await asyncio.sleep(2)
    
    print("=" * 50)
    print("✅ Test completed!")
    print()
    print("💡 Check the AI bot terminal to see it processing messages")
    print("💡 Or check Stream Dashboard: https://dashboard.getstream.io/")

if __name__ == "__main__":
    print()
    asyncio.run(test_ai_bot())
