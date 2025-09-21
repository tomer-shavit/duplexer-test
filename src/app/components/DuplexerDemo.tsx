'use client';

import { useEffect, useState, useRef } from 'react';
import { Duplexer } from '@wix/duplexer-js';

declare global {
  interface Window {
    __APP_INSTANCE__?: string;
  }
}



export default function DuplexerDemo() {
  // Configuration constants
  const SERVER_URL = 'duplexer.wix.com';
  const APP_DEF_ID = 'd9f069ca-b22f-40d2-ab2c-0fcfc4b47f96';
  const CHANNEL_ID = '4c39c4f8-f90a-4a28-a19e-b1d538e4b7ff';
  const SITE_REVISION = '1';
  const JWT_TOKEN = 'WUYU16fE2LtBvdnqqVW0MjIyg-OhEgTNxuuPlQQCV80.eyJpbnN0YW5jZUlkIjoiNGMzOWM0ZjgtZjkwYS00YTI4LWExOWUtYjFkNTM4ZTRiN2ZmIiwiYXBwRGVmSWQiOiIyMmJlZjM0NS0zYzViLTRjMTgtYjc4Mi03NGQ0MDg1MTEyZmYiLCJtZXRhU2l0ZUlkIjoiNGMzOWM0ZjgtZjkwYS00YTI4LWExOWUtYjFkNTM4ZTRiN2ZmIiwic2lnbkRhdGUiOiIyMDI1LTA5LTIxVDAyOjE5OjEzLjY3MVoiLCJ1aWQiOiI2ZTE5NTQ1NC02NDk2LTQ1NmItYTE3NC01YTcwZGRjN2JjYzIiLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiZGVtb01vZGUiOmZhbHNlLCJzaXRlT3duZXJJZCI6IjZlMTk1NDU0LTY0OTYtNDU2Yi1hMTc0LTVhNzBkZGM3YmNjMiIsInNpdGVNZW1iZXJJZCI6IjZlMTk1NDU0LTY0OTYtNDU2Yi1hMTc0LTVhNzBkZGM3YmNjMiIsImV4cGlyYXRpb25EYXRlIjoiMjAyNS0wOS0yMVQwNjoxOToxMy42NzFaIiwibG9naW5BY2NvdW50SWQiOiI2ZTE5NTQ1NC02NDk2LTQ1NmItYTE3NC01YTcwZGRjN2JjYzIiLCJhb3IiOnRydWUsInNjZCI6IjIwMjUtMDktMDFUMDg6NTQ6MDguNTQxWiIsImFjZCI6IjIwMjQtMDktMDFUMDk6NTU6MTZaIiwic3MiOmZhbHNlfQ';
  const EVENT_TYPE = 'picasso-github-push-notification-event';
  
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [concatenatedContent, setConcatenatedContent] = useState<string>('');
  const duplexerRef = useRef<any>(null);
  const connectionRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  const extractAndLogContent = (data?: any) => {
    if (data) {
      // Convert the entire payload to a formatted JSON string
      const jsonContent = JSON.stringify(data, null, 2);
      const timestamp = new Date().toLocaleTimeString();
      const contentWithTimestamp = `\n[${timestamp}]\n${jsonContent}\n${'='.repeat(50)}\n`;
      
      setConcatenatedContent(prev => prev + contentWithTimestamp);
    }
  };


  const instanceUpdater = {
    getInstance() {
      return JWT_TOKEN;
    }
  };

  const connectToDuplexer = async () => {
    try {
      setConnectionStatus('connecting');

      duplexerRef.current = new Duplexer(SERVER_URL, {
        instanceUpdater,
        siteRevision: SITE_REVISION,
        autoConnect: true
      });

      const appDefId = APP_DEF_ID;

      try {
        connectionRef.current = duplexerRef.current.connect({
          appDefId
        });
      } catch (connectError) {
        throw connectError;
      }

      connectionRef.current.on('@duplexer:connected', () => {
        setConnectionStatus('connected');
        subscribeToChannel();
      });

      connectionRef.current.on('@duplexer:disconnected', (error: any) => {
        console.error('Duplexer disconnected:', error);
        setConnectionStatus('disconnected');
      });

      connectionRef.current.on('@duplexer:connect_error', (error: any) => {
        console.error('Duplexer connection error:', error);
        setConnectionStatus('disconnected');
      });

    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  const subscribeToChannel = () => {
    if (!connectionRef.current) {
      return;
    }

    const channelId = CHANNEL_ID;

    try {
      channelRef.current = connectionRef.current.subscribe(channelId);
    } catch (subscribeError) {
      console.error('Subscription failed:', subscribeError);
      return;
    }

    channelRef.current.on('@duplexer:subscription_succeeded', (payload: any) => {
      console.log('Channel subscription succeeded:', payload);
    });

    channelRef.current.on('@duplexer:subscription_failed', (payload: any) => {
      console.error('Channel subscription failed:', payload);
    });

    channelRef.current.on('@duplexer:unsubscribe_succeeded', (payload: any) => {
      
    });

    // Listen specifically to the streaming events we need
    channelRef.current.on(EVENT_TYPE, (payload: any) => {
      extractAndLogContent(payload);
    });
  };

  const disconnect = () => {
    if (connectionRef.current) {
      try {
        connectionRef.current.disconnect();
      } catch (disconnectError) {
        
      }
    }
  };

  const clearLogs = () => {
    setConcatenatedContent('');
  };

  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        try {
          connectionRef.current.disconnect();
        } catch (cleanupError) {
          
        }
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Wix Duplexer Demo</h1>
        
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-800">Status:</span>
            <span className={`font-semibold ${getStatusColor()}`}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={connectToDuplexer}
              disabled={connectionStatus === 'connecting'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={connectionStatus === 'disconnected'}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              Disconnect
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Content
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Configuration:</h2>
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-800">
            <div><strong>App ID:</strong> {APP_DEF_ID}</div>
            <div><strong>Channel:</strong> {CHANNEL_ID}</div>
            <div><strong>Event Type:</strong> {EVENT_TYPE}</div>
            <div><strong>Server:</strong> {SERVER_URL} (Sockets Server)</div>
            <div><strong>Site Revision:</strong> {SITE_REVISION}</div>
            <div><strong>Instance:</strong> Wix Signed Instance</div>
            <div><strong>Transport:</strong> WebSocket (primary) with XHR fallback</div>
            <div><strong>Auth Flow:</strong> Server-to-server authorization required</div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Concatenated Content Stream:</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {concatenatedContent.length === 0 ? (
              <div className="text-gray-500">No content received yet. Connect and subscribe to see messages...</div>
            ) : (
              <pre className="whitespace-pre-wrap">{concatenatedContent}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 