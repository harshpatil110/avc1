import os
import asyncio
from dotenv import load_dotenv
from vision_agents.agent import Agent
from vision_agents.tools import Tool

# Load environment variables
load_dotenv()

class MeetingAssistant:
    def __init__(self):
        self.api_key = os.getenv('STREAM_API_KEY')
        self.api_secret = os.getenv('STREAM_API_SECRET')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.call_id = os.getenv('CALL_ID', 'demo-meeting')
        
        # Meeting context storage
        self.meeting_context = []
        self.max_context_length = 50  # Store last 50 messages
        
        # Initialize Vision Agent
        self.agent = None
        self.call = None
        
    async def initialize_agent(self):
        """Initialize the Vision Agent with Gemini LLM"""
        try:
            # Configure Vision Agent with Gemini
            system_prompt = """You are a helpful meeting assistant. 
            Only speak when addressed as 'Hey Assistant'. 
            Keep answers concise and relevant to the meeting context.
            Use the meeting history to provide contextual responses."""
            
            self.agent = Agent(
                llm_provider='gemini',
                api_key=self.gemini_api_key,
                system_prompt=system_prompt,
                model='gemini-pro'
            )
            
            print("✅ Vision Agent initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize agent: {e}")
            raise
    
    async def join_call(self):
        """Join the Stream video call"""
        try:
            # Import Stream SDK
            from stream_py import StreamClient
            
            # Initialize Stream client
            client = StreamClient(self.api_key, self.api_secret)
            
            # Create bot user
            bot_user_id = "ai-assistant-bot"
            client.upsert_users([{
                "id": bot_user_id,
                "name": "AI Assistant",
                "role": "admin"
            }])
            
            # Generate token for bot
            token = client.create_token(bot_user_id)
            
            # Join the call
            self.call = client.video.call('default', self.call_id)
            await self.call.join(create=False, data={
                "members": [{"user_id": bot_user_id}]
            })
            
            print(f"✅ Bot joined call: {self.call_id}")
            
            # Start listening to events
            await self.listen_to_transcriptions()
            
        except Exception as e:
            print(f"❌ Failed to join call: {e}")
            raise
    
    async def listen_to_transcriptions(self):
        """Listen to real-time transcription events"""
        try:
            # Subscribe to transcription events
            async for event in self.call.subscribe(['call.closed_caption']):
                if event['type'] == 'call.closed_caption':
                    await self.handle_transcription(event)
        except Exception as e:
            print(f"❌ Error listening to transcriptions: {e}")
    
    async def handle_transcription(self, event):
        """Process incoming transcription events"""
        try:
            closed_caption = event.get('closed_caption', {})
            text = closed_caption.get('text', '')
            user = closed_caption.get('user', {})
            speaker_name = user.get('name', user.get('id', 'Unknown'))
            
            if not text:
                return
            
            # Store in meeting context
            self.meeting_context.append({
                'speaker': speaker_name,
                'text': text,
                'timestamp': event.get('created_at')
            })
            
            # Trim context if too long
            if len(self.meeting_context) > self.max_context_length:
                self.meeting_context = self.meeting_context[-self.max_context_length:]
            
            print(f"📝 {speaker_name}: {text}")
            
            # Check for activation phrase (case-insensitive)
            if "hey assistant" in text.lower():
                await self.respond_to_query(text, speaker_name)
                
        except Exception as e:
            print(f"❌ Error handling transcription: {e}")
    
    async def respond_to_query(self, query, speaker_name):
        """Generate and deliver AI response"""
        try:
            print(f"🤖 AI Assistant activated by {speaker_name}")
            
            # Build context from meeting history
            context = "\n".join([
                f"{msg['speaker']}: {msg['text']}" 
                for msg in self.meeting_context[-10:]  # Last 10 messages
            ])
            
            # Create prompt with context
            full_prompt = f"""Meeting Context:
{context}

Current Query: {query}

Please provide a helpful, concise response based on the meeting context."""
            
            # Get response from Gemini via Vision Agent
            response = await self.agent.generate_text(full_prompt)
            
            print(f"💬 Response: {response}")
            
            # Send text response to chat
            await self.send_chat_message(response)
            
            # Generate and send audio response
            await self.speak_response(response)
            
        except Exception as e:
            print(f"❌ Error generating response: {e}")
    
    async def send_chat_message(self, message):
        """Send text message to Stream Chat"""
        try:
            # Send message to the chat channel
            from stream_py import StreamClient
            
            client = StreamClient(self.api_key, self.api_secret)
            channel = client.channel('messaging', self.call_id)
            
            await channel.send_message({
                'text': f"🤖 AI Assistant: {message}",
                'user_id': 'ai-assistant-bot'
            })
            
            print("✅ Chat message sent")
        except Exception as e:
            print(f"❌ Error sending chat message: {e}")
    
    async def speak_response(self, text):
        """Convert text to speech and speak in the call"""
        try:
            # Use Vision Agent's audio capabilities to speak
            audio_data = await self.agent.text_to_speech(text)
            
            # Publish audio to the call
            if self.call and audio_data:
                await self.call.send_audio(audio_data)
                print("🔊 Audio response sent to call")
        except Exception as e:
            print(f"❌ Error speaking response: {e}")
            # Fallback: just send text if audio fails
            print(f"💬 Fallback text response: {text}")

async def main():
    """Main entry point"""
    print("🚀 Starting AI Meeting Assistant...")
    
    # Validate environment variables
    required_vars = ['STREAM_API_KEY', 'STREAM_API_SECRET', 'GEMINI_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set them in the .env file")
        return
    
    # Initialize and start assistant
    assistant = MeetingAssistant()
    
    try:
        await assistant.initialize_agent()
        await assistant.join_call()
    except KeyboardInterrupt:
        print("\n👋 Shutting down AI Assistant...")
    except Exception as e:
        print(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
