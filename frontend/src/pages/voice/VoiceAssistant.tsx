import React, { useState, useRef, useEffect } from 'react';
import {
  MicrophoneIcon,
  StopIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useVoice } from '../../contexts/VoiceContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import clsx from 'clsx';

const VoiceAssistant: React.FC = () => {
  const {
    isListening,
    isProcessing,
    isConnected,
    transcript,
    response,
    conversationHistory,
    error,
    startListening,
    stopListening,
    sendTextMessage,
    clearConversation,
    clearError,
  } = useVoice();

  const [textInput, setTextInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleVoiceToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      try {
        await startListening();
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      await sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  const playResponse = async (text: string) => {
    try {
      setIsPlaying(true);
      // TODO: Implement text-to-speech playback
      // const audioBlob = await voiceService.synthesizeSpeech(text);
      // const audioUrl = URL.createObjectURL(audioBlob);
      // if (audioRef.current) {
      //   audioRef.current.src = audioUrl;
      //   await audioRef.current.play();
      // }
      
      // For now, just simulate playing
      setTimeout(() => setIsPlaying(false), 2000);
    } catch (error) {
      console.error('Failed to play response:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Voice Assistant</h1>
        <p className="mt-2 text-gray-600">
          Speak naturally or type your message to interact with Nia AI
        </p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center space-x-2">
        <div className={clsx(
          'w-3 h-3 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        )} />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Voice Controls */}
      <div className="card">
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={handleVoiceToggle}
            variant={isListening ? 'danger' : 'primary'}
            size="lg"
            className="flex items-center space-x-2"
            disabled={!isConnected}
          >
            {isListening ? (
              <>
                <StopIcon className="h-6 w-6" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <MicrophoneIcon className="h-6 w-6" />
                <span>Start Listening</span>
              </>
            )}
          </Button>

          {conversationHistory.length > 0 && (
            <Button
              onClick={clearConversation}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <TrashIcon className="h-5 w-5" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        {/* Live Transcript */}
        {(isListening || transcript) && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className={clsx(
                'w-2 h-2 rounded-full',
                isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
              )} />
              <span className="text-sm font-medium text-blue-700">
                {isListening ? 'Listening...' : 'Last Input:'}
              </span>
            </div>
            <p className="text-blue-900">
              {transcript || 'Speak now...'}
            </p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <LoadingSpinner size="small" />
            <span className="text-sm text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Text Input */}
      <div className="card">
        <form onSubmit={handleTextSubmit} className="flex space-x-4">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 input-field"
            disabled={isProcessing}
          />
          <Button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="flex items-center space-x-2"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span>Send</span>
          </Button>
        </form>
      </div>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversationHistory.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={clsx(
                      'text-xs',
                      message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.type === 'assistant' && (
                      <button
                        onClick={() => playResponse(message.content)}
                        disabled={isPlaying}
                        className={clsx(
                          'ml-2 p-1 rounded hover:bg-gray-200',
                          isPlaying && 'animate-pulse'
                        )}
                      >
                        <SpeakerWaveIcon className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Audio Element for TTS */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => sendTextMessage("Show me my leads")}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Show my leads</div>
            <div className="text-sm text-gray-500">View current lead status</div>
          </button>
          <button
            onClick={() => sendTextMessage("What meetings do I have today?")}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Today's meetings</div>
            <div className="text-sm text-gray-500">Check your schedule</div>
          </button>
          <button
            onClick={() => sendTextMessage("Create a new task")}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Create task</div>
            <div className="text-sm text-gray-500">Add a new task</div>
          </button>
          <button
            onClick={() => sendTextMessage("Read my emails")}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Read emails</div>
            <div className="text-sm text-gray-500">Get email summaries</div>
          </button>
          <button
            onClick={() => sendTextMessage("Schedule a meeting")}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Schedule meeting</div>
            <div className="text-sm text-gray-500">Book a new meeting</div>
          </button>
          <button
            onClick={() => sendTextMessage("Show CRM statistics")}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">CRM stats</div>
            <div className="text-sm text-gray-500">View performance metrics</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;