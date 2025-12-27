import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { ChatProvider } from "../contexts/ChatContext";
import ChatComponent from "../components/Chat/ChatComponent";

export default function Root({ children }) {
  return (
    <ChatProvider>
      {children}
      <BrowserOnly fallback={<div>Loading Chat...</div>}>
        {() => <ChatComponent />}
      </BrowserOnly>
    </ChatProvider>
  );
}
