import os
import asyncio
from dotenv import load_dotenv
from google import genai
from stream_chat import StreamChat

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
        self.max_context_length = 50
        
        # Initialize components
        self.model = None
        self.stream_client = None
        
    async def initialize_agent(self):
        """Initialize Gemini AI"""
        try:
            client = genai.Client(api_key=self.gemini_api_key)
            self.model = client
            
            print("✅ Gemini AI initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize Gemini: {e}")
            raise
    
    async def join_call(self):
        """Setup the bot and start monitoring"""
        try:
            self.stream_client = StreamClient(self.api_key, self.api_secret)
            
            bot_user_id = "ai-assistant-bot"
            self.stream_client.upsert_users({
                bot_user_id: {
                    "id": bot_user_id,
                    "name": "AI Assistant",
                    "role": "admin"
                }
            })hat(api_key=self.api_key, api_secret=self.api_secret)
            
            bot_user_id = "ai-assistant-bot"
            self.stream_client.upsert_user({
                "id": bot_user_id,
                "name": "AI Assistant",
                "role": "admin"ception as e:
            print(f"❌ Failed to setup bot: {e}")
            raise
    
    async def simulate_meeting_loop(self):
        """Interactive console mode for demonstration"""
        print("\n⚠️  Note: This is a demonstration mode.")
        print("For full functionality, integrate Stream's WebSocket events.")
        print("\nType messages to simulate meeting transcription:")
        print("- Start with username: (e.g., 'John: Hello everyone')")
        print("- Say 'Hey Assistant' to trigger AI response")
        print("- Type 'exit' to quit\n")
        
        while True:
            try:
                user_input = await asyncio.get_event_loop().run_in_executor(
                    None, input, "Transcript > "
                )
                
                if user_input.lower() == 'exit':
                    print("👋 Shutting down...")
                    break
                
                if ':' in user_input:
                    speaker, text = user_input.split(':', 1)
                    speaker = speaker.strip()
                    text = text.strip()
                else:
                    speaker = "Unknown"
                    text = user_input
                
                event = {
                    'closed_caption': {
                        'text': text,
                        'user': {'name': speaker, 'id': speaker.lower()}
                    },
                    'created_at': 'now'
                }
                
                await self.handle_transcription(event)
                
            except EOFError:
                break
            except Exception as e:
                print(f"❌ Error: {e}")
    
    async def handle_transcription(self, event):
        """Process incoming transcription"""
        try:
            closed_caption = event.get('closed_caption', {})
            text = closed_caption.get('text', '')
            user = closed_caption.get('user', {})
            speaker_name = user.get('name', user.get('id', 'Unknown'))
            
            if not text:
                return
            
            self.meeting_context.append({
                'speaker': speaker_name,
                'text': text,
                'timestamp': event.get('created_at')
            })
            
            if len(self.meeting_context) > self.max_context_length:
                self.meeting_context = self.meeting_context[-self.max_context_length:]
            
            print(f"📝 {speaker_name}: {text}")
            
            if "hey assistant" in text.lower():
                await self.respond_to_query(text, speaker_name)
                
        except Exception as e:
            print(f"❌ Error handling transcription: {e}")
    
    async def respond_to_query(self, query, speaker_name):
        """Generate AI response"""
        try:
            print(f"\n🤖 AI Assistant activated by {speaker_name}")
            
            context = "\n".join([
                f"{msg['speaker']}: {msg['text']}" 
                for msg in self.meeting_context[-10:]
            ])
            
            system_context = """You are a helpful meeting assistant. 
Keep answers concise and relevant to the meeting context. 
Respond naturally as if you're a participant in the meeting."""
            
            full_prompt = f"""{system_context}

Meeting Context:
{context}

Current Query: {query}

Provide a helpful response:"""
            
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.model.generate_content(full_prompt).text
            )
            models.generate_content(
                    model='gemini-2.0-flash-exp',
                    contents=full_prompt,
                    config=genai.types.GenerateContentConfig(
                        temperature=0.7,
                        max_output_tokens=200
                    )
                
            print(f"💬 AI Response: {response}\n")
            
        except Exception as e:
            print(f"❌ Error generating response: {e}")

async def main():
    """Main entry point"""
    print("🚀 Starting AI Meeting Assistant...\n")
    
    required_vars = ['STREAM_API_KEY', 'STREAM_API_SECRET', 'GEMINI_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set them in the .env file")
        return
    
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
