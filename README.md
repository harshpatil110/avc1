# 🎥 AI Video Calling Application with Smart Meeting Assistant

Production-ready video calling app with AI assistant powered by **Stream**, **Next.js**, and **Google Gemini AI**.

## ✨ Features

- 🎥 Real-time video calling with camera/mic controls
- 💬 Live chat and transcription panel
- 🤖 AI meeting assistant - responds to "Hey Assistant"
- 📝 AI-generated meeting summaries  
- 🎨 Modern dark-themed UI
- 🔐 Secure token-based authentication

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend (Python)
pip install stream-chat google-genai python-dotenv websockets aiohttp
```

### 2. Configure Environment

#### `.env.local` (Frontend)
```env
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
NEXT_PUBLIC_CALL_ID=demo-meeting
GEMINI_API_KEY=your_gemini_api_key
```

#### `backend/.env` (Backend)
```env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
GEMINI_API_KEY=your_gemini_api_key
CALL_ID=demo-meeting
USER_ID=ai-assistant-bot
BOT_NAME=AI Assistant
```

### 3. Run the Application

#### Terminal 1 - Frontend
```bash
npm run dev
```
✅ Open http://localhost:3002

#### Terminal 2 - AI Bot
```bash
python backend/ai_bot.py
```
✅ Bot listens for "Hey Assistant"

## 📖 How to Use

1. **Join Meeting**: Enter your name → Click "Join Meeting"
2. **Controls**: Toggle camera/microphone as needed
3. **Chat**: Type messages in the transcript panel
4. **AI Assistant**: Type "**Hey Assistant, [question]**"
5. **AI Responds**: Get intelligent answers automatically

### Example Commands
- "Hey Assistant, summarize our discussion"
- "Hey Assistant, what are the key points?"
- "Hey Assistant, help me with..."

## 🏗️ Architecture

```
┌──────────────────┐
│  Next.js Frontend│
│  (localhost:3002)│
│  • Video UI      │
│  • Chat Panel    │
└────────┬─────────┘
         │
         │ REST API + Stream SDK
         ▼
┌──────────────────┐
│  Python AI Bot   │
│  • Stream Chat   │
│  • Gemini AI     │
│  • Auto Response │
└──────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- Next.js 15 + React 18
- Tailwind CSS 3
- Stream Video React SDK
- Stream Chat SDK

### Backend
- Python 3.12
- Stream Chat Python SDK
- Google Gemini AI (gemini-2.0-flash-exp)
- AsyncIO for real-time processing

## 📂 Project Structure

```
avc/
├── app/
│   ├── page.js                      # Home page
│   ├── meeting/[id]/page.jsx        # Meeting room
│   └── api/token/route.js           # Auth API
├── components/
│   ├── MeetingRoom.jsx              # Meeting interface
│   └── TranscriptPanel.jsx          # Chat & transcription
├── backend/
│   ├── ai_bot.py                    # AI Assistant ⭐
│   └── server.py                    # Optional REST API
├── .env.local                       # Frontend config
└── backend/.env                     # Backend config
```

## ⭐ Key Components

### `backend/ai_bot.py` - Production AI Bot
- Connects to Stream Chat channels
- Monitors messages for "Hey Assistant" trigger
- Generates contextual responses with Gemini AI
- Maintains meeting context (last 50 messages)
- Creates AI-powered meeting summaries

### `app/api/token/route.js` - Authentication
- Generates secure Stream tokens
- Proper IAT offset (60 seconds)
- User creation/management
- 24-hour token validity

### `components/MeetingRoom.jsx` - Meeting Interface
- Camera/microphone controls
- Video display
- Integrated chat panel
- Leave call functionality

## ✅ Current Implementation Status

### Working Features
- ✅ Next.js frontend with responsive UI
- ✅ Token generation API
- ✅ Home page with dark theme
- ✅ Meeting room with video controls
- ✅ Chat panel with text input
- ✅ Python AI bot connected to Stream
- ✅ Gemini AI integration
- ✅ "Hey Assistant" trigger detection
- ✅ Meeting summary generation
- ✅ Rolling context window

### Implementation Notes
- Uses native browser APIs for camera/mic (simple & reliable)
- Stream Chat for messaging and AI communication
- Text input for transcription (speech recognition optional)
- Gemini AI for intelligent, context-aware responses

## 🔧 Troubleshooting

### Speech Recognition Issues
**Problem**: "Network error" in speech recognition  
**Solution**: Use Chrome or Edge browser (not Brave). Brave blocks Google's speech servers.  
**Alternative**: Use text input at bottom of chat panel.

### AI Bot Not Responding
**Problem**: Bot doesn't reply to "Hey Assistant"  
**Solutions**:
1. Ensure `python backend/ai_bot.py` is running
2. Check terminal shows "✅ AI Assistant is now active!"
3. Verify `GEMINI_API_KEY` in `backend/.env`
4. Check for error messages in Python terminal

### Stream Connection Issues
**Problem**: "Failed to generate token"  
**Solutions**:
1. Verify Stream API credentials in `.env.local`
2. Get keys from https://dashboard.getstream.io/
3. Ensure both `STREAM_API_KEY` and `STREAM_API_SECRET` are set
4. Check IAT offset in token route (already configured correctly)

### Python Dependencies
If imports fail:
```bash
pip install --upgrade stream-chat google-genai python-dotenv
```

## 🎯 Future Enhancements

To upgrade to full Stream Video integration:

1. **Stream Video SDK Integration**
   ```javascript
   import { StreamVideo, StreamCall } from '@stream-io/video-react-sdk';
   ```

2. **Enable Closed Captions** (Enterprise feature)
   ```javascript
   await call.startClosedCaptions();
   ```

3. **Bot Voice Responses**
   - Text-to-Speech for AI responses
   - Bot joins as video participant
   - Real-time audio streaming

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Docker)
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/ .
RUN pip install stream-chat google-genai python-dotenv
CMD ["python", "ai_bot.py"]
```

Deploy to:
- Google Cloud Run
- AWS Lambda
- Azure Container Instances

## 📚 Resources

- [Stream Video Documentation](https://getstream.io/video/docs/)
- [Gemini AI Documentation](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stream Chat Python SDK](https://getstream.io/chat/docs/python/)

## 🆘 Getting Help

### Common Commands
```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm start            # Run production

# Backend
python backend/ai_bot.py      # Start AI bot
python backend/server.py      # Start REST API (optional)

# Environment
cp .env.local.example .env.local
```

### Support Channels
- Stream SDK: https://github.com/GetStream/stream-video-js
- Gemini API: https://ai.google.dev/support
- Next.js: https://nextjs.org/docs

## 📄 License

MIT License - Free for personal and commercial use

---

**Built with ❤️ using Stream, Gemini AI, and Next.js**

🎉 **Ready to start!** Run `npm run dev` and `python backend/ai_bot.py`
