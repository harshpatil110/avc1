"""
AI Meeting Assistant Bot - Production Implementation
Connects to Stream Video calls and responds to "Hey Assistant" trigger
Uses Gemini AI for intelligent responses
"""

import os
import asyncio
import json
from dotenv import load_dotenv
from stream_chat import StreamChat
from google import genai
import aiohttp
from datetime import datetime

load_dotenv()

class AIAssistantBot:
    """
    AI Bot that joins Stream video calls and provides AI assistance
    """
    
    def __init__(self):
        # Stream Configuration
        self.api_key = os.getenv('STREAM_API_KEY')
        self.api_secret = os.getenv('STREAM_API_SECRET')
        self.call_id = os.getenv('CALL_ID', 'demo-meeting')
        self.user_id = os.getenv('USER_ID', 'ai-assistant-bot')
        self.bot_name = os.getenv('BOT_NAME', 'AI Assistant')
        
        # AI Configuration
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.trigger_phrase = os.getenv('AI_TRIGGER_PHRASE', 'hey assistant').lower()
        self.max_context = int(os.getenv('MAX_CONTEXT_MESSAGES', '50'))
        
        # State
        self.chat_client = None
        self.channel = None
        self.meeting_context = []
        self.gemini_client = None
        self.is_running = False
        
        self._validate_config()
    
    def _validate_config(self):
        """Validate required environment variables"""
        required = {
            'STREAM_API_KEY': self.api_key,
            'STREAM_API_SECRET': self.api_secret,
            'GEMINI_API_KEY': self.gemini_api_key,
        }
        
        missing = [key for key, value in required.items() if not value]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    async def initialize(self):
        """
        Initialize Stream Chat client and Gemini AI
        """
        try:
            print("🤖 Initializing AI Assistant Bot...")
            
            # Initialize Stream Chat client
            self.chat_client = StreamChat(
                api_key=self.api_key,
                api_secret=self.api_secret
            )
            
            # Create bot user
            bot_user = {
                'id': self.user_id,
                'name': self.bot_name,
                'role': 'admin',
                'image': 'https://getstream.io/random_svg/?name=AI+Assistant',
            }
            
            self.chat_client.upsert_users([bot_user])
            print(f"✅ Bot user created: {self.bot_name}")
            
            # Initialize Gemini AI
            self.gemini_client = genai.Client(api_key=self.gemini_api_key)
            print("✅ Gemini AI initialized")
            
            # Get or create channel for the call
            channel_id = f"call-{self.call_id}"
            self.channel = self.chat_client.channel(
                'messaging',
                channel_id,
            )
            
            # Create or query channel with proper data
            self.channel.query(data={
                'name': f"Meeting: {self.call_id}",
                'created_by_id': self.user_id,
            })
            print(f"✅ Connected to channel: {channel_id}")
            
            return True
            
        except Exception as e:
            print(f"❌ Initialization failed: {e}")
            raise
    
    async def listen_to_messages(self):
        """
        Listen to chat messages and respond when trigger phrase is detected
        This simulates listening to transcription in a real implementation
        """
        print(f"👂 Listening for '{self.trigger_phrase}'...")
        print("📝 Messages will appear here as users chat\n")
        
        self.is_running = True
        last_message_id = None
        
        try:
            while self.is_running:
                # Watch for new messages
                try:
                    # Get recent messages
                    response = self.channel.query(
                        messages={'limit': 10}
                    )
                    
                    messages = response.get('messages', [])
                    
                    # Process new messages
                    for msg in messages:
                        msg_id = msg.get('id')
                        
                        # Skip if already processed or from bot
                        if msg_id == last_message_id or msg.get('user', {}).get('id') == self.user_id:
                            continue
                        
                        last_message_id = msg_id
                        
                        text = msg.get('text', '').strip()
                        sender = msg.get('user', {}).get('name', 'User')
                        
                        if not text:
                            continue
                        
                        # Add to context
                        self._add_to_context(f"{sender}: {text}")
                        
                        print(f"💬 {sender}: {text}")
                        
                        # Check for trigger phrase
                        if self.trigger_phrase in text.lower():
                            print(f"🎯 Trigger detected! Generating AI response...")
                            await self._respond_with_ai(text, sender)
                    
                    # Poll every 2 seconds
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    print(f"⚠️  Error checking messages: {e}")
                    await asyncio.sleep(5)
                    
        except KeyboardInterrupt:
            print("\n👋 Shutting down bot...")
            self.is_running = False
    
    def _add_to_context(self, message):
        """Add message to rolling context window"""
        self.meeting_context.append(message)
        
        # Keep only last N messages
        if len(self.meeting_context) > self.max_context:
            self.meeting_context = self.meeting_context[-self.max_context:]
    
    async def _respond_with_ai(self, user_message, sender_name):
        """
        Generate AI response using Gemini and send to chat
        """
        try:
            # Build prompt with context
            context_str = "\n".join(self.meeting_context[-10:])  # Last 10 messages
            
            prompt = f"""You are an AI meeting assistant named "{self.bot_name}".
You were just addressed in a video call meeting.

Meeting context (last few messages):
{context_str}

Current message from {sender_name}: {user_message}

Provide a helpful, concise response (2-3 sentences). Be friendly and professional."""

            # Generate response with Gemini
            response = self.gemini_client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
            
            ai_response = response.text.strip()
            
            # Send response to chat
            self.channel.send_message(
                {
                    'text': ai_response,
                    'user_id': self.user_id,
                },
                self.user_id
            )
            
            # Add AI response to context
            self._add_to_context(f"{self.bot_name}: {ai_response}")
            
            print(f"🤖 {self.bot_name}: {ai_response}\n")
            
        except Exception as e:
            error_msg = "I'm having trouble processing that request right now."
            print(f"❌ AI response error: {e}")
            
            # Send error message
            self.channel.send_message(
                {
                    'text': error_msg,
                    'user_id': self.user_id,
                },
                self.user_id
            )
    
    async def generate_meeting_summary(self):
        """
        Generate AI summary of the meeting
        """
        if not self.meeting_context:
            return "No meeting content to summarize."
        
        try:
            context_str = "\n".join(self.meeting_context)
            
            prompt = f"""Summarize this meeting conversation concisely:

{context_str}

Provide:
1. Key discussion points (2-3 bullets)
2. Important decisions (if any)
3. Action items (if any)

Keep it brief and actionable."""

            response = self.gemini_client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
            
            summary = response.text.strip()
            
            # Send summary to chat
            self.channel.send_message(
                {
                    'text': f"📋 **Meeting Summary**\n\n{summary}",
                    'user_id': self.user_id,
                },
                self.user_id
            )
            
            print(f"\n📋 Meeting Summary Generated:\n{summary}\n")
            
            return summary
            
        except Exception as e:
            print(f"❌ Summary generation error: {e}")
            return f"Error generating summary: {e}"
    
    async def start(self):
        """Start the bot"""
        await self.initialize()
        
        print("\n" + "="*60)
        print(f"🚀 {self.bot_name} is now active!")
        print(f"📞 Call ID: {self.call_id}")
        print(f"💬 Watching chat channel: call-{self.call_id}")
        print(f"🎯 Trigger phrase: '{self.trigger_phrase}'")
        print("="*60 + "\n")
        
        # Start listening
        await self.listen_to_messages()
    
    async def stop(self):
        """Cleanup and stop the bot"""
        self.is_running = False
        
        # Generate final summary
        if self.meeting_context:
            print("\n📋 Generating final meeting summary...")
            await self.generate_meeting_summary()
        
        print("👋 Bot stopped")


async def main():
    """Main entry point"""
    bot = AIAssistantBot()
    
    try:
        await bot.start()
    except KeyboardInterrupt:
        print("\n\n⏹️  Stopping bot...")
        await bot.stop()
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("\n╔══════════════════════════════════════╗")
    print("║   AI Meeting Assistant Bot v1.0      ║")
    print("║   Powered by Stream + Gemini AI      ║")
    print("╚══════════════════════════════════════╝\n")
    
    asyncio.run(main())
