import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import ChatComponent from '../components/Chat/ChatComponent';

// Root component that wraps the entire Docusaurus application
// This ensures the chatbot is available on all pages
export default function Root({ children }) {
  return (
    <ChatProvider>
      {children}
      <ChatComponent />
    </ChatProvider>
  );
}