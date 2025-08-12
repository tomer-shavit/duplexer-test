'use client';

import { useEffect, useState, useRef } from 'react';
import { Duplexer } from '@wix/duplexer-js';

declare global {
  interface Window {
    __APP_INSTANCE__?: string;
  }
}

interface LogEntry {
  timestamp: string;
  type: 'connection' | 'subscription' | 'event' | 'error' | 'internal';
  message: string;
  data?: any;
  content?: string;
}

export default function DuplexerDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [concatenatedContent, setConcatenatedContent] = useState<string>('');
  const duplexerRef = useRef<any>(null);
  const connectionRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    // Extract content from data for concatenation - specifically looking for chunk content
    let content = '';
    if (data) {
      // Check for chunk content in the structure: dataChunk.chunk.content
      if (data.dataChunk?.chunk?.content !== undefined) {
        content = data.dataChunk.chunk.content;
      }
      // Check for direct payload content
      else if (data.payload?.dataChunk?.chunk?.content !== undefined) {
        content = data.payload.dataChunk.chunk.content;
      }
      // Check if args array contains chunk data
      else if (data.args && Array.isArray(data.args)) {
        for (const arg of data.args) {
          if (arg?.dataChunk?.chunk?.content !== undefined) {
            content = arg.dataChunk.chunk.content;
            break;
          }
        }
      }
      // Parse JSON string to find chunk content
      else if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.dataChunk?.chunk?.content !== undefined) {
            content = parsed.dataChunk.chunk.content;
          }
        } catch (e) {
          // If not JSON, use the string as is only if it looks like content
          if (data.length > 0 && !data.startsWith('{') && !data.startsWith('[')) {
            content = data;
          }
        }
      }
      // Try to extract from any nested object
      else if (typeof data === 'object') {
        const searchForContent = (obj: any): string => {
          if (obj?.dataChunk?.chunk?.content !== undefined) {
            return obj.dataChunk.chunk.content;
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

    const logEntry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data,
      content
    };

    setLogs(prev => [...prev, logEntry]);
    
    // Add content to concatenated stream (only for events that have actual content)
    if (content !== '' && type === 'event') {
      setConcatenatedContent(prev => prev + content);
    }
    
    console.log(`[${type.toUpperCase()}] ${message}`, data || '');
  };


  const instanceUpdater = {
    getInstance() {
      return 'KN_xj8Zcs_zBDYe7BACkX6axMB3ErSnkFzJaJ6ggsFs.eyJpbnN0YW5jZUlkIjoiZmFjMWJkMGMtZTIyMS00ZTM5LTk4NTctOGYwOWM1ZWM0ODQ3IiwiYXBwRGVmSWQiOiIxM2VlOTRjMS1iNjM1LTg1MDUtMzM5MS05NzkxOTA1MmMxNmYiLCJtZXRhU2l0ZUlkIjoiZWQ2ZTBhMDctMzI2MS00NDZlLTk0ZWUtY2EyMzQ1MTNlZGRhIiwic2lnbkRhdGUiOiIyMDI1LTA4LTExVDA4OjM0OjM4Ljk5M1oiLCJ1aWQiOiI3YzU3NGM0NS0zYTAyLTQ5NDAtOGE0OS0yOWEzNGJlZmU4ZjUiLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiZGVtb01vZGUiOmZhbHNlLCJvcmlnaW5JbnN0YW5jZUlkIjoiOGE5ZmM3M2MtYmY3OS00NzJkLTk1YjMtODFhOTM4OWRiNWRiIiwiYmlUb2tlbiI6IjE3YWZiNzBiLWQwNDAtMGE1Ny0wY2I5LTQ1MmE4MGZmYTU5ZCIsInNpdGVPd25lcklkIjoiN2M1NzRjNDUtM2EwMi00OTQwLThhNDktMjlhMzRiZWZlOGY1Iiwic2l0ZU1lbWJlcklkIjoiN2M1NzRjNDUtM2EwMi00OTQwLThhNDktMjlhMzRiZWZlOGY1IiwiZXhwaXJhdGlvbkRhdGUiOiIyMDI1LTA4LTExVDEyOjM0OjM4Ljk5M1oiLCJsb2dpbkFjY291bnRJZCI6IjdjNTc0YzQ1LTNhMDItNDk0MC04YTQ5LTI5YTM0YmVmZThmNSIsInBhaSI6bnVsbCwibHBhaSI6bnVsbCwiYW9yIjp0cnVlLCJzY2QiOiIyMDI0LTExLTEyVDA4OjUxOjUzLjA5OFoifQ';
    }
  };

  const connectToDuplexer = async () => {
    try {
      setConnectionStatus('connecting');
      addLog('connection', 'Initializing Duplexer...');
      


      addLog('connection', 'Creating Duplexer instance', {
        server: 'duplexer.wix.com',
        siteRevision: '1',
        autoConnect: true,
        hasInstanceUpdater: !!instanceUpdater
      });

      duplexerRef.current = new Duplexer('duplexer.wix.com', {
        instanceUpdater,
        siteRevision: '1',
        autoConnect: true
      });

      addLog('connection', 'Duplexer instance created successfully', {
        duplexerExists: !!duplexerRef.current,
        duplexerType: typeof duplexerRef.current
      });

      const appDefId = 'd9f069ca-b22f-40d2-ab2c-0fcfc4b47f96';
      addLog('connection', 'Starting virtual socket connection', {
        appDefId,
        duplexerReady: !!duplexerRef.current,
        timestamp: new Date().toISOString()
      });

      try {
        connectionRef.current = duplexerRef.current.connect({
          appDefId
        });

        addLog('connection', 'Virtual socket connection initiated', {
          connectionExists: !!connectionRef.current,
          connectionType: typeof connectionRef.current
        });
      } catch (connectError) {
        addLog('error', 'Failed to create virtual socket connection', {
          error: connectError,
          errorMessage: connectError instanceof Error ? connectError.message : 'Unknown error',
          errorStack: connectError instanceof Error ? connectError.stack : undefined
        });
        throw connectError;
      }

      // Enhanced event listeners with detailed logging
      addLog('connection', 'Setting up duplexer event listeners');

      connectionRef.current.on('@duplexer:connected', () => {
        setConnectionStatus('connected');
        addLog('connection', 'Successfully connected to duplexer!', {
          timestamp: new Date().toISOString(),
          readyState: connectionRef.current?.readyState || 'unknown'
        });
        subscribeToChannel();
      });

      connectionRef.current.on('@duplexer:disconnected', (error: any) => {
        setConnectionStatus('disconnected');
        if (error) {
          addLog('error', 'Disconnected with error', {
            error,
            errorType: typeof error,
            errorMessage: error?.message || 'No message',
            recoverable: error?.recoverable,
            status: error?.status,
            timestamp: new Date().toISOString()
          });
        } else {
          addLog('connection', 'Disconnected cleanly', {
            timestamp: new Date().toISOString()
          });
        }
      });

      connectionRef.current.on('@duplexer:connect_error', (error: any) => {
        addLog('error', 'Connection error occurred', {
          error,
          errorType: typeof error,
          errorMessage: error?.message || 'No message',
          status: error?.status,
          recoverable: error?.recoverable,
          timestamp: new Date().toISOString()
        });
      });

      // Monitor ALL connection events to catch packets
      const originalConnectionEmit = connectionRef.current.emit;
      connectionRef.current.emit = function(eventName: string, ...args: any[]) {
        addLog('internal', `🌐 CONNECTION EMIT: ${eventName}`, {
          eventName,
          args,
          argsCount: args.length,
          timestamp: new Date().toISOString()
        });
        return originalConnectionEmit.apply(this, [eventName, ...args]);
      };

    } catch (error) {
      addLog('error', 'Failed to initialize duplexer', error);
      setConnectionStatus('disconnected');
    }
  };

  const subscribeToChannel = () => {
    if (!connectionRef.current) {
      addLog('error', 'Cannot subscribe: connection not available');
      return;
    }

    const channelId = 'ed6e0a07-3261-446e-94ee-ca234513edda';
    addLog('subscription', `Starting subscription process for channel: ${channelId}`, {
      connectionExists: !!connectionRef.current,
      connectionType: typeof connectionRef.current,
      timestamp: new Date().toISOString()
    });

    try {
      // Log connection server time if available
      addLog('subscription', 'Attempting to get server connection time');
      duplexerRef.current.getConnectionServerTime().then((serverTime: number) => {
        addLog('subscription', 'Server connection time retrieved', { 
          serverTime, 
          timestamp: new Date(serverTime),
          timeDiff: Date.now() - serverTime
        });
      }).catch((error: any) => {
        addLog('error', 'Could not get server time', {
          error,
          errorMessage: error?.message || 'Unknown error',
          errorType: typeof error
        });
      });
    } catch (error) {
      addLog('error', 'Server time method not available', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Log any available connection metadata
    if (connectionRef.current._socket) {
      addLog('subscription', 'Socket connection details available', {
        url: connectionRef.current._socket.url,
        protocol: connectionRef.current._socket.protocol,
        readyState: connectionRef.current._socket.readyState,
        extensions: connectionRef.current._socket.extensions
      });
    } else {
      addLog('subscription', 'No socket details available on connection object');
    }

    addLog('subscription', 'Calling connection.subscribe() - will trigger server-to-server auth', {
      channelId,
      authFlow: 'Server will validate JWT and authorize subscription',
      siteIsolation: 'Events will be isolated by metaSiteId from JWT',
      timestamp: new Date().toISOString()
    });

    try {
      channelRef.current = connectionRef.current.subscribe(channelId);
      
      addLog('subscription', 'Subscribe call completed', {
        channelExists: !!channelRef.current,
        channelType: typeof channelRef.current,
        timestamp: new Date().toISOString()
      });
    } catch (subscribeError) {
      addLog('error', 'Subscribe call failed', {
        error: subscribeError,
        errorMessage: subscribeError instanceof Error ? subscribeError.message : 'Unknown error',
        errorStack: subscribeError instanceof Error ? subscribeError.stack : undefined,
        timestamp: new Date().toISOString()
      });
      return;
    }

    addLog('subscription', 'Setting up channel event listeners');

    channelRef.current.on('@duplexer:subscription_succeeded', (payload: any) => {
      addLog('subscription', 'Channel subscription succeeded!', {
        payload,
        payloadType: typeof payload,
        isSynced: payload?.isSynced,
        headers: payload?.headers || 'No headers available',
        metadata: payload?.metadata || 'No metadata available',
        timestamp: new Date().toISOString()
      });
    });

    channelRef.current.on('@duplexer:subscription_failed', (payload: any) => {
      addLog('error', 'Channel subscription failed', {
        payload,
        payloadType: typeof payload,
        headers: payload?.headers || 'No headers in error response',
        status: payload?.status,
        statusText: payload?.statusText,
        message: payload?.message,
        response: payload?.response,
        request: payload?.request,
        config: payload?.config,
        timestamp: new Date().toISOString()
      });
    });

    channelRef.current.on('@duplexer:unsubscribe_succeeded', (payload: any) => {
      addLog('subscription', 'Channel unsubscribe succeeded', {
        payload,
        payloadType: typeof payload,
        timestamp: new Date().toISOString()
      });
    });

    // Enhanced packet logging - shows ALL data received
    channelRef.current.on('*', (event: string, payload: any, attachments: any) => {
      addLog('event', `📦 PACKET RECEIVED: ${event}`, { 
        event,
        payload,
        payloadType: typeof payload,
        payloadLength: payload ? (typeof payload === 'string' ? payload.length : JSON.stringify(payload).length) : 0,
        attachments,
        attachmentsType: typeof attachments,
        headers: attachments?.headers || 'No headers',
        user: attachments?.user || 'No user info',
        metadata: attachments?.metadata || 'No metadata',
        rawAttachments: attachments,
        timestamp: new Date().toISOString(),
        fullPacket: { event, payload, attachments }
      });
    });

    // Raw packet interceptor - catches EVERYTHING
    const originalEmit = channelRef.current.emit;
    channelRef.current.emit = function(eventName: string, ...args: any[]) {
      addLog('event', `🔍 RAW EMIT: ${eventName}`, {
        eventName,
        args,
        argsCount: args.length,
        argsTypes: args.map(arg => typeof arg),
        rawData: args,
        timestamp: new Date().toISOString()
      });
      return originalEmit.apply(this, [eventName, ...args]);
    };

    // Listen to specific common events with detailed logging
    const commonEvents = ['message', 'update', 'notification', 'data', 'change', 'ping', 'pong'];
    commonEvents.forEach(eventName => {
      channelRef.current.on(eventName, (payload: any, attachments: any) => {
        addLog('event', `🎯 SPECIFIC EVENT: ${eventName}`, { 
          eventName,
          payload, 
          payloadStructure: payload ? Object.keys(payload) : 'No payload',
          attachments,
          attachmentsStructure: attachments ? Object.keys(attachments) : 'No attachments',
          headers: attachments?.headers || 'No headers available',
          timestamp: new Date().toISOString()
        });
      });
    });
  };

  const disconnect = () => {
    if (connectionRef.current) {
      addLog('connection', 'Initiating manual disconnect', {
        connectionExists: !!connectionRef.current,
        timestamp: new Date().toISOString()
      });
      
      try {
        connectionRef.current.disconnect();
        addLog('connection', 'Disconnect call completed');
      } catch (disconnectError) {
        addLog('error', 'Error during disconnect', {
          error: disconnectError,
          errorMessage: disconnectError instanceof Error ? disconnectError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      addLog('connection', 'Cannot disconnect: no active connection');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setConcatenatedContent('');
  };

  useEffect(() => {
    addLog('internal', 'Component mounted');
    
    return () => {
      addLog('internal', 'Component unmounting, cleaning up connections');
      if (connectionRef.current) {
        try {
          connectionRef.current.disconnect();
          addLog('internal', 'Connection cleaned up successfully');
        } catch (cleanupError) {
          addLog('error', 'Error during cleanup', {
            error: cleanupError,
            errorMessage: cleanupError instanceof Error ? cleanupError.message : 'Unknown error'
          });
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

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'connection': return 'text-blue-600';
      case 'subscription': return 'text-purple-600';
      case 'event': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'internal': return 'text-orange-600';
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
              Clear Logs
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Live Logs ({logs.length}):</h2>
            <div className="bg-black text-white p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-300">No logs yet. Click "Connect" to start...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-2">
                    <span className="text-gray-300">[{log.timestamp}]</span>
                    <span className={`ml-2 font-bold ${getTypeColor(log.type)}`}>
                      {log.type.toUpperCase()}:
                    </span>
                    <span className="ml-2 text-white">{log.message}</span>
                    {log.data && (
                      <pre className="mt-1 ml-8 text-yellow-300">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 