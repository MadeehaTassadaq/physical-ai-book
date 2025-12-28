import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { sendMessage as apiSendMessage } from '../../services/chat-api';
import { getSelectionContext } from '../../utils/text-selection';
import useSelectionAI from '../../hooks/useSelectionAI';
import ChatModal from './ChatModal';
import './Chat.css';

const ChatComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, addMessage, isLoading, setLoading, sessionId, setSessionId, error, clearError } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [hasActiveSelection, setHasActiveSelection] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Use the selection hook
  const {
    selectedText,
    sendSelectionToBackend,
    clearSelection,
  } = useSelectionAI('https://rag-chatbot-4-1bvx.onrender.com/api', sessionId);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor selected text changes
  useEffect(() => {
    if (selectedText && selectedText.length > 0) {
      setHasActiveSelection(true);
    } else {
      setHasActiveSelection(false);
    }
  }, [selectedText]);

  // Function to send message to backend
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat
    addMessage(userMessage);

    // If there's selected text, show it in the UI
    if (hasActiveSelection && selectedText) {
      const selectionIndicator = {
        id: Date.now() - 1,
        text: `📖 Context: "${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}"`,
        sender: 'system',
        timestamp: new Date().toISOString(),
      };
      addMessage(selectionIndicator);
    }

    setInputValue('');
    setLoading(true);
    clearError(); // Clear any previous errors

    try {
      // Send selected text to backend first if available
      if (hasActiveSelection && selectedText) {
        const selectionResult = await sendSelectionToBackend(selectedText);
        // Update session ID if returned from selection endpoint
        if (selectionResult.success && selectionResult.data?.session_id) {
          setSessionId(selectionResult.data.session_id);
        }
      }

      // Get the current selection context
      const context = getSelectionContext();

      const response = await apiSendMessage(inputValue, sessionId, context);

      // Store session ID for future requests
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: 'bot',
        citations: response.citations || [],
        timestamp: new Date().toISOString(),
      };

      addMessage(botMessage);

      // Clear the selection after successful response
      if (hasActiveSelection) {
        clearSelection();
        setHasActiveSelection(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Floating "Ask AI" button */}
      <button
        className={`chat-fab ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
        aria-label="Open AI Chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>Physical AI Robotics Assistant</h3>
            <button
              className="chat-close"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <p>Hello! I'm your Physical AI Robotics Assistant.</p>
                <p>Ask me anything about the book, or select text on the page to get context-aware answers.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.sender}`}
                >
                  <div className="message-content">
                    <p>{message.text}</p>
                    {message.citations && message.citations.length > 0 && (
                      <div className="message-citations">
                        <strong>Citations:</strong>
                        <ul>
                          {message.citations.map((citation, index) => (
                            <li key={index}>{citation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {message.sender !== 'system' && (
                    <span className="message-timestamp">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="chat-message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Selection indicator */}
          {hasActiveSelection && selectedText && (
            <div className="selection-indicator">
              <div className="selection-content">
                <span className="selection-icon">📖</span>
                <span className="selection-text">
                  Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
                </span>
              </div>
              <button
                className="clear-selection"
                onClick={() => {
                  clearSelection();
                  setHasActiveSelection(false);
                }}
                title="Clear selection"
              >
                ×
              </button>
            </div>
          )}

          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasActiveSelection ? "Ask about the selected text..." : "Ask about the book content..."}
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatComponent;