# AI Meeting Assistant - Python Backend

This is the Python backend for the AI Meeting Assistant, powered by Vision Agents and Google Gemini.

## Setup

1. Install dependencies using uv:
```bash
cd backend
uv venv
uv pip install -e .
```

2. Activate the virtual environment:
```bash
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

3. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

4. Run the assistant:
```bash
uv run main.py
```

## Environment Variables

- `STREAM_API_KEY`: Your Stream API key
- `STREAM_API_SECRET`: Your Stream API secret
- `GEMINI_API_KEY`: Your Google Gemini API key
- `CALL_ID`: The call ID to join (default: demo-meeting)

## Features

- Joins video calls as an AI bot
- Listens to real-time transcriptions
- Responds when addressed as "Hey Assistant"
- Uses meeting context for intelligent responses
- Sends text messages to chat
- Generates audio responses

## Usage

The assistant will automatically join the specified call and listen for the activation phrase "Hey Assistant". When activated, it will use the meeting context to generate relevant responses using Google Gemini.
