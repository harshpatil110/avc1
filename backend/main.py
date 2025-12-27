"""
AI Meeting Assistant - Demonstration Mode
This version demonstrates the AI assistant logic with console input.
For production, integrate with Stream's WebSocket API for real-time transcription.
"""

import os
import asyncio
from dotenv import load_dotenv
from google import genai

load_dotenv()

class MeetingAssistant:
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.call_id = os.getenv('CALL_ID', 'demo-meeting')
        self.meeting_context = []
        self.model = None
        
    async def initialize(self):
        """Initialize Gemini AI"""
        try:
            self.model = genai.Client(api_key=self.gemini_api_key)
            print("✅ Gemini AI initialized successfully\n")
        except Exception as e:
            print(f"❌ Failed to initialize Gemini: {e}")
            raise
    
    async def start(self):
        """Start the assistant"""
        print(f"🎥 Monitoring call: {self.call_id}")
        print("💬 Listening for 'Hey Assistant' activation phrase...\n")
        print("⚠️  DEMO MODE: Type messages to simulate meeting transcription")
        print("   Format: 'Name: Message' (e.g., 'John: Hello everyone')")
        print("   Say 'Hey Assistant' in any message to trigger AI")
        print("   Type 'exit' to quit\n")
        
        while True:
            try:
                user_input = await asyncio.get_event_loop().run_in_executor(
                    None, input, "Transcript > "
                )
                
                if user_input.lower() == 'exit':
                    print("\n👋 Shutting down...")
                    break
                
                # Parse input
                if ':' in user_input:
                    speaker, text = user_input.split(':', 1)
                    speaker = speaker.strip()
                    text = text.strip()
                else:
                    speaker = "Unknown"
                    text = user_input
                
                # Store context
                self.meeting_context.append({
                    'speaker': speaker,
                    'text': text
                })
                
                # Keep only last 50 messages
                if len(self.meeting_context) > 50:
                    self.meeting_context = self.meeting_context[-50:]
                
                print(f"📝 {speaker}: {text}")
                
                # Check for activation
                if "hey assistant" in text.lower():
                    await self.respond(text, speaker)
                    
            except EOFError:
                break
            except Exception as e:
                print(f"❌ Error: {e}")
    
    async def respond(self, query, speaker):
        """Generate AI response"""
        try:
            print(f"\n🤖 AI Assistant activated by {speaker}")
            
            # Build context
            context = "\n".join([
                f"{msg['speaker']}: {msg['text']}" 
                for msg in self.meeting_context[-10:]
            ])
            
            prompt = f"""You are a helpful meeting assistant. Keep answers concise.

Meeting Context:
{context}

Query: {query}

Response:"""
            
            # Get response
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.model.models.generate_content(
                    model='gemini-2.0-flash-exp',
                    contents=prompt
                ).text
            )
            
            print(f"💬 AI Response: {response}\n")
            
        except Exception as e:
            print(f"❌ Error generating response: {e}\n")

async def main():
    print("🚀 Starting AI Meeting Assistant...\n")
    
    if not os.getenv('GEMINI_API_KEY'):
        print("❌ GEMINI_API_KEY not found in .env file")
        print("Please add your Gemini API key to backend/.env")
        return
    
    assistant = MeetingAssistant()
    
    try:
        await assistant.initialize()
        await assistant.start()
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down...")
    except Exception as e:
        print(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
