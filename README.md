# AI Chatbox

Simple AI chat application using Google Gemini API with a clean web interface.

## Features

- 💬 Chat with AI using Google Gemini 2.0 Flash
- 🎨 Clean and responsive web interface
- ⚡ Fast Node.js/TypeScript server
- 🔒 Secure API key via environment variables
- 📱 Keyboard shortcuts (Cmd/Ctrl + Enter)

## Requirements

- Node.js 18+
- pnpm
- Google Gemini API key

## Setup

1. **Install dependencies**
```bash
pnpm install
```

2. **Configure API key**
Create `.env` file:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5174
```

Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Run the app**
```bash
pnpm start
```

Open `http://localhost:5174` in your browser.

## Project Structure

```
ai-chatbox/
├── public/
│   ├── index.html    # Main UI
│   └── app.js       # Frontend logic
├── server.ts        # Backend server
├── package.json     # Dependencies
└── .env            # Environment variables
```

## API

**Chat endpoint:**
```bash
POST /api/health
POST /api/chat
```

## Tech Stack

- **Backend:** Node.js, TypeScript, HTTP Module
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **AI:** Google Gemini API

## License

ISC
