# Wix Duplexer Demo

A Next.js app that connects to Wix Duplexer service to receive real-time messages via WebSocket.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure connection** in `src/app/components/DuplexerDemo.tsx`:
```javascript
const JWT_TOKEN = 'your-valid-jwt-token';
const CHANNEL_ID = 'your-channel-id';
const EVENT_TYPE = 'your-event-type';
const APP_DEF_ID = 'your-app-def-id';
```

3. **Run the app:**
```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Getting a Wix JWT Token

**Network Tab:**
1. Visit your relevant Wix site as owner
2. Open DevTools → Network tab
3. Refresh the site and interact with it
4. Look for network requests with `Authorization` headers or `instance` parameters
5. Extract the JWT_TOKEN from these network calls

## Usage

1. Click **Connect** to establish WebSocket connection
2. Messages will appear in the bottom stream area
3. Check browser console for connection errors if needed

That's it! Update your configuration constants and you're ready to receive real-time Wix events.