import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, ChatSession, aiTutorService } from '../../services/aiTutorService';
import { ResponsiveContainer, ResponsiveText } from '../shared/ResponsiveContainer';

interface AITutorChatProps {
  userAge: number;
  subject?: string;
  onClose?: () => void;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  userAge,
  subject,
  onClose
}) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!aiTutorService.hasApiKey());
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session
  useEffect(() => {
    if (!session) {
      const newSession = aiTutorService.createChatSession('guest', subject);
      setSession(newSession);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Hi there! 👋 I'm your AI tutor, and I'm excited to help you learn${subject ? ` about ${subject}` : ''}! 
        
What would you like to explore today? You can ask me questions, request explanations, or even ask for fun examples to help you understand topics better! 🚀`,
        timestamp: new Date(),
        subject,
        userAge
      };
      
      setMessages([welcomeMessage]);
    }
  }, [session, subject, userAge]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (!showApiKeyInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showApiKeyInput]);

  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim()) {
      aiTutorService.setApiKey(apiKeyInput.trim());
      setShowApiKeyInput(false);
      setApiKeyInput('');
      setError(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !session) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      subject,
      userAge
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiTutorService.sendMessage(newMessages, userAge, subject);
      
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        subject,
        userAge
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Update and save session
      const updatedSession = {
        ...session,
        messages: updatedMessages,
        updatedAt: new Date()
      };
      setSession(updatedSession);
      aiTutorService.saveChatSession(updatedSession);

    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showApiKeyInput) {
        handleApiKeySubmit();
      } else {
        handleSendMessage();
      }
    }
  };

  const suggestedQuestions = aiTutorService.getSuggestedQuestions(userAge, subject);

  if (showApiKeyInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <ResponsiveContainer maxWidth="md" padding="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🤖</div>
              <ResponsiveText as="h2" size="2xl" weight="bold" className="text-white mb-2">
                AI Tutor Setup
              </ResponsiveText>
              <ResponsiveText size="lg" className="text-slate-300">
                To use the AI tutor, you'll need an OpenAI API key
              </ResponsiveText>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <ResponsiveText size="sm" className="text-slate-300 mb-2">
                  <strong>How to get an API key:</strong>
                </ResponsiveText>
                <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
                  <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">platform.openai.com/api-keys</a></li>
                  <li>Sign up or log in to your OpenAI account</li>
                  <li>Click "Create new secret key"</li>
                  <li>Copy the key and paste it above</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApiKeySubmit}
                  disabled={!apiKeyInput.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  Start Tutoring
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500 transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ResponsiveContainer maxWidth="4xl" padding="md" className="h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤖</div>
            <div>
              <ResponsiveText as="h1" size="xl" weight="bold" className="text-white">
                AI Tutor{subject ? ` - ${subject}` : ''}
              </ResponsiveText>
              <ResponsiveText size="sm" className="text-slate-400">
                Your personal learning assistant
              </ResponsiveText>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
              title="Change API Key"
            >
              🔑
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-slate-700/50 text-slate-100 border border-slate-600'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-xs text-slate-400">AI Tutor</span>
                      </div>
                    )}
                    <ResponsiveText size="sm" className="whitespace-pre-wrap">
                      {message.content}
                    </ResponsiveText>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
          >
            <ResponsiveText size="sm" className="text-red-300">
              {error}
            </ResponsiveText>
          </motion.div>
        )}

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <ResponsiveText size="sm" className="text-slate-400 mb-2">
              Try asking:
            </ResponsiveText>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm hover:bg-slate-600/50 transition-colors border border-slate-600"
                >
                  {question}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input */}
        <div className="mt-4 flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about learning..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </ResponsiveContainer>
    </div>
  );
};