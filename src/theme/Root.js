import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { ChatProvider } from "../contexts/ChatContext";
import ChatComponent from "../components/Chat/ChatComponent";

export default function Root({ children }) {
  return (
    <ChatProvider>
      {children}
      {/* This ensures the Chat UI only renders in the browser */}
      <BrowserOnly>{() => <ChatComponent />}</BrowserOnly>
    </ChatProvider>
  );
}
