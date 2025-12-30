import React, { useState, useEffect, useRef } from 'react';
import { getSelectionContext } from '../../utils/text-selection';
import { sendMessage as apiSendMessage } from '../../services/chat-api';
import Avatar from './Avatar';
import MarkdownRenderer from './MarkdownRenderer';
import './Chat.css';

const ChatModal = ({ isOpen, onClose, sessionId, setSessionId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Get the current selection context
    const context = getSelectionContext();

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
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

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        isError: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="chat-container">
      {/* Premium Chat Header */}
      <div className="chat-header">
        <div className="chat-header__brand">
          <div className="chat-header__avatar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="chat-header__info">
            <h3 className="chat-header__title">
              Physical AI Assistant
            </h3>
            <span className="chat-header__status">Online</span>
          </div>
        </div>
        <button
          className="chat-close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="chat-welcome__icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h4>Welcome to Physical AI Robotics</h4>
            <p>
              I can answer questions about the book, explain robotics concepts,
              or help you understand Physical AI fundamentals.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.sender} ${message.isError ? 'error' : ''}`}
            >
              {message.sender !== 'system' && (
                <div className="chat-message__avatar-row">
                  <Avatar sender={message.sender} size={28} />
                  <span className="chat-message__sender-name">
                    {message.sender === 'user' ? 'You' : 'Assistant'}
                  </span>
                </div>
              )}
              <div className="message-content">
                {message.sender === 'system' ? (
                  <p>{message.text}</p>
                ) : (
                  <MarkdownRenderer content={message.text} />
                )}
                {message.citations && message.citations.length > 0 && (
                  <div className="message-citations">
                    <div className="message-citations__header">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Sources
                    </div>
                    <ul className="message-citations__list">
                      {message.citations.map((citation, index) => (
                        <li key={index} className="message-citations__item">
                          <span className="message-citations__icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </span>
                          <span className="message-citations__source">{citation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {message.isError && (
                  <div className="chat-error-actions">
                    <button onClick={() => sendMessage()}>Retry</button>
                  </div>
                )}
              </div>
              {message.sender !== 'system' && (
                <span className="message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </span>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="chat-message bot typing">
            <div className="chat-message__avatar-row">
              <Avatar sender="bot" size={28} />
              <span className="chat-message__sender-name">Assistant</span>
            </div>
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

      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the book content..."
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
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatModal;
