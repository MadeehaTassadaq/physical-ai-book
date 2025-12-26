import React, { createContext, useContext, useReducer } from 'react';

// Initial state for the chat context
const initialState = {
  sessionId: null,
  messages: [],
  isLoading: false,
  error: null,
};

// Reducer to handle chat state changes
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SESSION_ID':
      return {
        ...state,
        sessionId: action.payload,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET_CHAT':
      return {
        ...initialState,
        sessionId: state.sessionId, // Keep session ID when resetting
      };
    default:
      return state;
  }
};

// Create the context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Function to add a message
  const addMessage = (message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  // Function to set loading state
  const setLoading = (isLoading) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  };

  // Function to set error
  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // Function to clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Function to reset chat
  const resetChat = () => {
    dispatch({ type: 'RESET_CHAT' });
  };

  // Function to set session ID
  const setSessionId = (sessionId) => {
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
  };

  const value = {
    ...state,
    addMessage,
    setLoading,
    setError,
    clearError,
    resetChat,
    setSessionId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};