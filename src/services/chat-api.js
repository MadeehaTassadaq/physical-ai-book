// API service to communicate with the RAG backend
const API_BASE_URL = 'https://rag-chatbot-3-jotu.onrender.com';

/**
 * Send a message to the chat API
 * @param {string} message - The user's message
 * @param {string} sessionId - Optional session identifier
 * @param {Object} context - Context information including selected text and page metadata
 * @returns {Promise<Object>} The API response
 */
export const sendMessage = async (message, sessionId, context = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Check the health of the chat API
 * @returns {Promise<Object>} The health check response
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return await response.json();
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};