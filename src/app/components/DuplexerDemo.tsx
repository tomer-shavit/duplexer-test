'use client';

import { useEffect, useState, useRef } from 'react';
import { Duplexer } from '@wix/duplexer-js';

declare global {
  interface Window {
    __APP_INSTANCE__?: string;
  }
}



export default function DuplexerDemo() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [concatenatedContent, setConcatenatedContent] = useState<string>('');
  const duplexerRef = useRef<any>(null);
  const connectionRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  const extractAndLogContent = (data?: any) => {
    let content = '';
    if (data) {
      // Check for direct string content
      if (typeof data === 'string') {
        content = data;
      }
      // Check for payload with string content
      else if (data.payload && typeof data.payload === 'string') {
        content = data.payload;
      }
      // Check for payload with content property
      else if (data.payload?.content !== undefined) {
        content = data.payload.content;
      }
      // Check for any content property at root level
      else if (data.content !== undefined) {
        content = data.content;
      }
      // Check for message property (common in messaging)
      else if (data.payload?.message !== undefined) {
        content = data.payload.message;
      }
      else if (data.message !== undefined) {
        content = data.message;
      }
      // Check for text property
      else if (data.payload?.text !== undefined) {
        content = data.payload.text;
      }
      else if (data.text !== undefined) {
        content = data.text;
      }
      // Check for data property
      else if (data.payload?.data !== undefined) {
        if (typeof data.payload.data === 'string') {
          content = data.payload.data;
        } else if (data.payload.data?.content !== undefined) {
          content = data.payload.data.content;
        }
      }
      // Check for chunk content in the structure: dataChunk.chunk.content
      else if (data.dataChunk?.chunk?.content !== undefined) {
        content = data.dataChunk.chunk.content;
      }
      else if (data.payload?.dataChunk?.chunk?.content !== undefined) {
        content = data.payload.dataChunk.chunk.content;
      }
      // If payload is an object, try to serialize it as content
      else if (data.payload && typeof data.payload === 'object') {
        content = JSON.stringify(data.payload);
      }
      // Try to extract from any nested object as fallback
      else if (typeof data === 'object') {
        const searchForContent = (obj: any): string => {
          if (obj?.content !== undefined && typeof obj.content === 'string') {
            return obj.content;
          }
          if (obj?.message !== undefined && typeof obj.message === 'string') {
            return obj.message;
          }
          if (obj?.text !== undefined && typeof obj.text === 'string') {
            return obj.text;
          }
          if (obj?.data !== undefined && typeof obj.data === 'string') {
            return obj.data;
          }
          
          if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                const found = searchForContent(obj[key]);
                if (found !== '') return found;
              }
            }
          }
          return '';
        };
        content = searchForContent(data);
      }
    }

    if (content !== '') {
      setConcatenatedContent(prev => {
        const newContent = prev + content;
        return newContent;
      });
    }
  };


  const instanceUpdater = {
    getInstance() {
      return 'V7jyz1aegMtG58VjRQYyl_HtWb44s4KSZcFcOfrgHww.eyJpbnN0YW5jZUlkIjoiZmFjMWJkMGMtZTIyMS00ZTM5LTk4NTctOGYwOWM1ZWM0ODQ3IiwiYXBwRGVmSWQiOiIxM2VlOTRjMS1iNjM1LTg1MDUtMzM5MS05NzkxOTA1MmMxNmYiLCJtZXRhU2l0ZUlkIjoiZWQ2ZTBhMDctMzI2MS00NDZlLTk0ZWUtY2EyMzQ1MTNlZGRhIiwic2lnbkRhdGUiOiIyMDI1LTA4LTEyVDA4OjQ0OjIzLjY0N1oiLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiZGVtb01vZGUiOmZhbHNlLCJvcmlnaW5JbnN0YW5jZUlkIjoiOGE5ZmM3M2MtYmY3OS00NzJkLTk1YjMtODFhOTM4OWRiNWRiIiwiYmlUb2tlbiI6IjE3YWZiNzBiLWQwNDAtMGE1Ny0wY2I5LTQ1MmE4MGZmYTU5ZCIsInNpdGVPd25lcklkIjoiN2M1NzRjNDUtM2EwMi00OTQwLThhNDktMjlhMzRiZWZlOGY1Iiwic2NkIjoiMjAyNC0xMS0xMlQwODo1MTo1My4wOThaIn0';
    }
  };

  const connectToDuplexer = async () => {
    try {
      setConnectionStatus('connecting');

      duplexerRef.current = new Duplexer('duplexer.wix.com', {
        instanceUpdater,
        siteRevision: '1',
        autoConnect: true
      });

      const appDefId = 'd9f069ca-b22f-40d2-ab2c-0fcfc4b47f96';

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
        setConnectionStatus('disconnected');
      });

      connectionRef.current.on('@duplexer:connect_error', (error: any) => {
        
      });

    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const subscribeToChannel = () => {
    if (!connectionRef.current) {
      return;
    }

    const channelId = 'ed6e0a07-3261-446e-94ee-ca234513edda';

    try {
      channelRef.current = connectionRef.current.subscribe(channelId);
    } catch (subscribeError) {
      return;
    }

    channelRef.current.on('@duplexer:subscription_succeeded', (payload: any) => {
      
    });

    channelRef.current.on('@duplexer:subscription_failed', (payload: any) => {
      
    });

    channelRef.current.on('@duplexer:unsubscribe_succeeded', (payload: any) => {
      
    });

    // Listen specifically to the streaming events we need
    channelRef.current.on('stream-by-prompt-object-chunk-sent-event', (payload: any) => {
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
            <div><strong>App ID:</strong> d9f069ca-b22f-40d2-ab2c-0fcfc4b47f96</div>
            <div><strong>Channel:</strong> ed6e0a07-3261-446e-94ee-ca234513edda</div>
            <div><strong>Server:</strong> duplexer.wix.com (Sockets Server)</div>
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