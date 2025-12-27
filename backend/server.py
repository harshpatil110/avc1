"""
Flask server for AI Meeting Assistant with audio transcription
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from google import genai
import base64
import io

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Initialize Gemini AI
gemini_client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
meeting_context = []

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "AI Meeting Assistant"})

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribe audio using Gemini's audio capabilities
    Expects: { "audio": "base64-encoded-audio-data", "format": "webm" }
    """
    try:
        data = request.json
        
        if not data or 'audio' not in data:
            return jsonify({"error": "No audio data provided"}), 400
        
        # Decode base64 audio
        audio_base64 = data['audio'].split(',')[1] if ',' in data['audio'] else data['audio']
        audio_bytes = base64.b64decode(audio_base64)
        
        # Use Gemini to transcribe (simplified - you can enhance this)
        # For now, return a mock response since Gemini's audio API may require specific setup
        
        return jsonify({
            "success": True,
            "transcript": "Audio received successfully. Backend transcription ready.",
            "note": "Integrate with speech-to-text service (Google Cloud Speech-to-Text, AssemblyAI, etc.)"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/assistant', methods=['POST'])
def ask_assistant():
    """
    Ask AI Assistant a question
    Expects: { "message": "user message", "context": ["previous", "messages"] }
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        context = data.get('context', [])
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Build prompt with context
        prompt = "You are an AI meeting assistant. Help with meeting-related tasks.\n\n"
        
        if context:
            prompt += "Previous conversation:\n"
            for msg in context[-5:]:  # Last 5 messages for context
                prompt += f"{msg}\n"
            prompt += "\n"
        
        prompt += f"User: {user_message}\n\nAssistant:"
        
        # Generate response using Gemini
        response = gemini_client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=prompt
        )
        
        ai_response = response.text
        
        # Store in meeting context
        meeting_context.append(f"User: {user_message}")
        meeting_context.append(f"Assistant: {ai_response}")
        
        return jsonify({
            "success": True,
            "response": ai_response
        })
        
    except Exception as e:
        print(f"Error in assistant: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/meeting/summary', methods=['GET'])
def get_meeting_summary():
    """Get AI-generated summary of the meeting"""
    try:
        if not meeting_context:
            return jsonify({
                "success": True,
                "summary": "No conversation yet to summarize."
            })
        
        # Generate summary using Gemini
        prompt = f"""Summarize this meeting conversation concisely:

{chr(10).join(meeting_context)}

Provide:
1. Key discussion points
2. Important decisions
3. Action items (if any)
"""
        
        response = gemini_client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=prompt
        )
        
        return jsonify({
            "success": True,
            "summary": response.text
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting AI Meeting Assistant Backend...")
    print(f"📡 Gemini API Key: {'✅ Set' if os.getenv('GEMINI_API_KEY') else '❌ Missing'}")
    print("🌐 Server running on http://localhost:5000")
    print("💡 Endpoints:")
    print("   - POST /api/assistant - Ask AI assistant")
    print("   - GET  /api/meeting/summary - Get meeting summary")
    print("   - POST /api/transcribe - Transcribe audio")
    app.run(debug=True, port=5000, host='0.0.0.0')
