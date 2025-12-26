---
id: 2
title: rag-agent-backend-spec
stage: spec
date_iso: 2025-12-25
surface: agent
model: Claude Sonnet 4.5
feature: rag-agent-backend
branch: main
user: madeeha
command: /sp.specify
labels:
  - rag
  - agent
  - backend
  - ai
  - qdrant
  - postgres
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - specs/2-rag-agent-backend/spec.md
  - specs/2-rag-agent-backend/plan.md
  - specs/2-rag-agent-backend/tasks.md
  - specs/2-rag-agent-backend/checklists/requirements.md
  - Backend/main.py
  - Backend/agent.py
  - Backend/requirements.txt
  - Backend/README.md
tests_yaml:
  - Unit tests for agent functionality
  - Integration tests for API endpoints
  - End-to-end tests for RAG flow
  - Database connection tests
prompt_text: "Component: RAG-Agent-Backend\nTech Stack: FastAPI, openai (Assistant SDK), psycopg2 (Neon Postgres), qdrant-client.\nFeatures:\nRetriever Tool: Search Qdrant based on user query vector.\nMemory: Session-based chat history stored in Neon Serverless Postgres.\nSelection Logic: Endpoint /chat/selection to accept user-highlighted text as primary context.\nSystem Prompt: \"You are the Physical AI Humanoid Assistant. Answer strictly using provided book context or highlighted text. Cite chapters.\"\nOutput: /Backend/main.py, /Backend/agent.py."
response_text: "Created a complete specification, plan, and implementation for the RAG agent backend. The system includes a FastAPI application with endpoints for chat and text selection, a Qdrant-based retriever, session-based memory in Neon Postgres, and OpenAI Assistant integration for response generation with proper citations."
outcome: "Specification created successfully with complete implementation"
evaluation: "The specification is complete and the implementation follows all requirements"
---

# RAG Agent Backend Specification

## Feature Overview
A RAG (Retrieval-Augmented Generation) agent backend that provides a conversational interface with the Physical AI Humanoid Assistant. The system includes a retriever tool that searches vector content, memory management for session-based chat history, and selection logic for user-highlighted text.

## User Scenarios & Testing

### Primary User Scenario
As a user, I want to chat with the Physical AI Humanoid Assistant that can answer questions based on the book content and any text I highlight, so that I can get accurate answers with proper citations to relevant chapters.

### Secondary User Scenario
As a user, I want my chat session to maintain context across multiple interactions, so that I can have a coherent conversation without repeating previous questions or information.

### Acceptance Scenarios
1. The system successfully retrieves relevant information from Qdrant based on user queries
2. The system maintains session-based chat history in Neon Postgres database
3. The system accepts user-highlighted text through the /chat/selection endpoint and uses it as primary context
4. The assistant responds strictly using provided book context or highlighted text and cites relevant chapters
5. The system handles multiple concurrent sessions without data leakage between users

### Testing Approach
- Unit tests for the retriever tool functionality
- Integration tests for database operations
- End-to-end tests for the conversation flow
- Load testing to validate concurrent session handling
- Accuracy testing to ensure responses are based on provided context

## Functional Requirements

### FR-1: Retriever Tool
The system SHALL provide a tool that searches Qdrant based on user query vector to retrieve relevant book content.

### FR-2: Session Memory
The system SHALL store session-based chat history in Neon Serverless Postgres database to maintain conversation context.

### FR-3: Selection Endpoint
The system SHALL provide an endpoint at /chat/selection that accepts user-highlighted text as primary context for the conversation.

### FR-4: Response Generation
The system SHALL generate responses using OpenAI's Assistant SDK that strictly adhere to the provided book context or highlighted text.

### FR-5: Citation Requirement
The system SHALL cite relevant chapters in all responses when providing information from the book content.

### FR-6: System Personality
The system SHALL respond as "Physical AI Humanoid Assistant" with responses based on the provided system prompt.

### FR-7: Output Files
The system SHALL produce two main files: /Backend/main.py (API endpoints) and /Backend/agent.py (agent logic).

## Success Criteria

### Quantitative Measures
- 95% of user queries return relevant results from the book content
- Response time under 3 seconds for typical queries
- Support for 100+ concurrent chat sessions
- 99% uptime for the API endpoints
- 98% accuracy in citing relevant chapters when providing book-based information

### Qualitative Measures
- Users report high satisfaction with the accuracy of responses
- Responses consistently cite relevant chapters when referencing book content
- Conversation context is maintained appropriately across multiple exchanges
- User-highlighted text is properly incorporated as primary context
- The assistant personality is consistent with "Physical AI Humanoid Assistant"

## Key Entities

### Chat Session
- Session ID: Unique identifier for each user session
- History: List of previous messages in the conversation
- Context: Current context including highlighted text
- User ID: Identifier for the user (if applicable)

### Retrieved Content
- Content ID: Unique identifier for retrieved content
- Text: The actual content retrieved from Qdrant
- Source: Reference to the original book location
- Relevance Score: Score indicating how relevant the content is to the query

### User Selection
- Selection ID: Unique identifier for the highlighted text
- Text: The user-highlighted text content
- Session ID: Associated chat session
- Timestamp: When the selection was made

### Assistant Response
- Response ID: Unique identifier for the response
- Content: The generated response text
- Citations: List of cited chapters/references
- Session ID: Associated chat session
- Timestamp: When the response was generated

## Assumptions
- Qdrant contains properly embedded book content from the previous ingestion pipeline
- OpenAI Assistant SDK is properly configured with appropriate API keys
- Neon Postgres database is accessible and properly configured
- Users have a way to highlight text in their client application
- The system has internet connectivity for API calls to OpenAI and Qdrant
- The book content is in English and suitable for the OpenAI models

## Dependencies
- OpenAI API access for Assistant functionality
- Qdrant vector database with embedded book content
- Neon Postgres database for session storage
- FastAPI for web framework
- Proper authentication and rate limiting mechanisms