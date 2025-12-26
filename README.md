# AI Video Calling Application with Smart AI Meeting Assistant

A full-stack real-time video calling application with AI-powered meeting assistance, built with Next.js, Stream SDK, Python, Vision Agents, and Google Gemini.

## Features

- 🎥 **Real-time Video Calling** - High-quality video calls using Stream Video SDK
- 🗣️ **Live Transcription** - Automatic speech-to-text transcription in real-time
- 🤖 **AI Meeting Assistant** - Smart AI bot that responds when addressed
- 💬 **Chat Integration** - Text chat alongside video calls
- 🎨 **Modern UI** - Dark-themed, responsive interface with Tailwind CSS

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Stream Video React SDK
- Stream Chat React SDK

### Backend
- Python 3.13
- Vision Agents (Open Source)
- Google Gemini API
- uv (Package Manager)

## Project Structure

```
avc/
├── app/                    # Next.js app directory
│   ├── api/
│   │   └── token/         # Token generation endpoint
│   ├── meeting/[id]/      # Dynamic meeting routes
│   ├── page.js            # Home page
│   ├── layout.js          # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── StreamProvider.jsx # Stream SDK provider
│   ├── MeetingRoom.jsx    # Main meeting UI
│   └── TranscriptPanel.jsx # Live transcription panel
├── hooks/                 # Custom React hooks
│   └── useStreamClients.js # Stream client initialization
├── backend/               # Python AI backend
│   ├── main.py           # AI agent implementation
│   ├── pyproject.toml    # Python dependencies
│   └── .env.example      # Environment template
└── package.json          # Node.js dependencies
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- Python 3.13+
- uv (Python package manager): `pip install uv`
- Stream account (get API keys from [getstream.io](https://getstream.io))
- Google Gemini API key (get from [ai.google.dev](https://ai.google.dev))

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Add your Stream API credentials to `.env.local`:
```env
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
NEXT_PUBLIC_CALL_ID=demo-meeting
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
uv venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

3. Install dependencies:
```bash
uv pip install -e .
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your credentials to `.env`:
```env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
GEMINI_API_KEY=your_gemini_api_key
CALL_ID=demo-meeting
```

6. Run the AI assistant:
```bash
uv run main.py
```

## Usage

1. **Start Frontend**: Run `npm run dev` in the root directory
2. **Start Backend**: Run `uv run main.py` in the backend directory
3. **Join Meeting**: 
   - Open http://localhost:3000
   - Enter your name
   - Click "Join Meeting"
4. **Activate AI Assistant**: Say "Hey Assistant" during the call
5. **View Transcriptions**: See live transcriptions in the right panel

## How It Works

### Video Call Flow

1. User enters name on home page
2. Frontend generates a secure token using Stream API
3. User joins the video call with their credentials
4. Closed captions are automatically enabled for transcription

### AI Assistant Flow

1. Python backend joins the same call as a bot user
2. Bot listens to real-time transcription events
3. When "Hey Assistant" is detected (case-insensitive):
   - AI captures meeting context (last 10 messages)
   - Sends context + query to Google Gemini
   - Generates intelligent response
   - Sends text response to chat
   - Converts response to speech and speaks in call

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_STREAM_API_KEY` - Stream API key (public)
- `STREAM_API_SECRET` - Stream API secret (private)
- `NEXT_PUBLIC_CALL_ID` - Default call ID

### Backend (.env)
- `STREAM_API_KEY` - Stream API key
- `STREAM_API_SECRET` - Stream API secret
- `GEMINI_API_KEY` - Google Gemini API key
- `CALL_ID` - Call ID to join

## Key Features Explained

### Live Transcription
- Uses Stream's closed captions API
- Real-time speech-to-text conversion
- Displays speaker name and timestamp
- Auto-scrolls to latest message

### AI Assistant
- Context-aware responses using meeting history
- Natural language understanding via Gemini
- Text-to-speech audio responses
- Chat integration for text summaries

### Security
- Secure token generation with IAT offset (-60s)
- Server-side secret management
- User authentication per call
- 24-hour token validity

## Troubleshooting

### Token Issues
If you see authentication errors, ensure:
- API keys are correctly set in environment files
- IAT (issued at) time offset is configured (-60 seconds)
- Tokens are regenerated for new sessions

### Transcription Not Working
- Ensure microphone permissions are granted
- Check that closed captions are started
- Verify Stream API has transcription enabled

### AI Not Responding
- Confirm backend is running
- Check Gemini API key is valid
- Ensure "Hey Assistant" is spoken clearly
- Verify call ID matches between frontend and backend

## Development Notes

- Frontend runs on port 3000 by default
- Backend connects to the same call ID
- Use the same CALL_ID in both .env files
- Stream Dashboard shows active calls and users

## Production Deployment

### Frontend (Vercel/Netlify)
1. Deploy Next.js app
2. Set environment variables in platform
3. Ensure NEXT_PUBLIC_ prefix for client-side vars

### Backend (Cloud VM/Container)
1. Deploy Python app to cloud service
2. Keep running as background service
3. Use process manager (PM2, systemd)
4. Monitor logs for errors

## License

MIT

## Support

For issues or questions:
- Stream SDK: [getstream.io/docs](https://getstream.io/docs)
- Vision Agents: [github.com/landing-ai/vision-agent](https://github.com/landing-ai/vision-agent)
- Gemini API: [ai.google.dev/docs](https://ai.google.dev/docs)

---

Built with ❤️ using Next.js, Stream, Vision Agents, and Google Gemini
