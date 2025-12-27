# AI Meeting Assistant - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.12+
- Stream.io account ([Get API keys](https://dashboard.getstream.io/))
- Google Gemini API key ([Get API key](https://makersuite.google.com/app/apikey))

### 1. Install Dependencies

#### Frontend
```bash
cd avc
npm install
```

####Python Backend
```bash
cd backend
pip install stream-chat google-genai google-cloud-speech websockets aiohttp python-dotenv
```

### 2. Configure Environment Variables

#### Frontend: `.env.local`
```env
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_secret
NEXT_PUBLIC_CALL_ID=demo-meeting
GEMINI_API_KEY=your_gemini_key
```

#### Backend: `backend/.env`
```env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_secret
GEMINI_API_KEY=your_gemini_key
CALL_ID=demo-meeting
USER_ID=ai-assistant-bot
BOT_NAME=AI Assistant
```

### 3. Run the Application

#### Terminal 1 - Frontend
```bash
npm run dev
```
Open http://localhost:3002

#### Terminal 2 - Backend (AI Bot)
```bash
python backend/ai_bot.py
```

## 📋 Current Implementation Status

### ✅ Completed
- Next.js frontend with Stream Video SDK
- Token generation API with proper IAT offset
- Home page with dark theme
- Camera/microphone controls using native browser APIs
- Basic transcription panel
- Python backend server with Gemini AI integration

### 🔄 What You Need to Complete

#### For Full Stream Video Integration:
1. **Update MeetingRoom.jsx** to use Stream Video SDK instead of native APIs:
   ```javascript
   import { StreamVideo, StreamCall, useCall } from '@stream-io/video-react-sdk';
   ```

2. **Enable Closed Captions** in Stream dashboard and implement:
   ```javascript
   call.startClosedCaptions();
   ```

3. **Create AI Bot** that joins the call as a participant:
   - Use Stream Python SDK to join calls
   - Listen to real-time transcription events
   - Respond when "Hey Assistant" is detected

#### Current Workaround:
The application currently works with:
- Native browser APIs for video/audio
- Manual text input for transcription
- Backend AI responses via REST API

## 🎯 Architecture

```
┌─────────────────┐
│  Next.js App    │
│  (Port 3002)    │
│  - Video UI     │
│  - Transcript   │
└────────┬────────┘
         │
         │ REST API
         ▼
┌─────────────────┐
│ Python Backend  │
│  (Port 5000)    │
│  - Gemini AI    │
│  - Responses    │
└─────────────────┘
```

## 🔧 Troubleshooting

### Speech Recognition Network Error
- Use Chrome or Edge (not Brave)
- Web Speech API requires Google's servers
- Alternative: Use text input at bottom of chat

### Stream SDK Issues
- Verify API keys in `.env.local`
- Check IAT offset in token generation (60 seconds past)
- Closed captions require Enterprise plan or special access

### Python Backend Issues
- Ensure `.venv` is activated
- Check GEMINI_API_KEY is set
- Run: `python backend/server.py` for Flask API

## 📚 Next Steps

1. **Get Stream Enterprise Access** for closed captions
2. **Implement Stream Python Bot** to join calls
3. **Connect Real-Time Transcription** from Stream to backend
4. **Deploy** to production (Vercel + Cloud Run)

## 📝 Notes

- Current implementation uses simplified approach
- For production, use Stream's official bot framework
- Consider AssemblyAI or Deepgram for better transcription
- Gemini AI is ready and working via REST API

## 🆘 Support

- Stream Docs: https://getstream.io/video/docs/
- Gemini API: https://ai.google.dev/docs
