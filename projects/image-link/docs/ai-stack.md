# AI STACK: COMPONENTS AND CAPABILITIES
> **Scope:** High-level definition of Skills, MCPs, and Subagents for ML, AI, and CV projects.

---

## 1. SKILLS
*Atomic technical capabilities used by agents to perform specific actions.*

**Generate Reference Image**
Creates an image based on a detailed text description. This skill can be used to generate visual references, examples for labeling, or to visualize concepts related to the dataset.

**Research CV Term**
Conducts in-depth research on a Computer Vision-related concept, ML model, labeling technique, or any relevant topic from various sources. This helps users understand underlying principles or make informed decisions.

**Read Technical Document**
Reads text content from a local file (e.g., technical specifications, labeling guides, or project documentation). Useful for consulting internal documentation or standards.

**Fetch Web Content**
Extracts text content from a specified URL. Can be used to gather information from online articles, research papers, or external documentation relevant to the project.

---

## 2. MCP (MODEL CONTEXT PROTOCOL)
*Standardized interfaces providing secure access to data sources and external services.*

**Vector DB Connector**
Provides high-speed indexing and retrieval for similarity searches. It enables agents to find related images or embeddings within vector databases such as Pinecone, Milvus, or FAISS. This MCP is crucial for the platform's ability to identify patterns, cluster images, and perform similarity searches based on image embeddings.

**Supabase Connector**
Offers a secure and standardized interface for interacting with the Supabase backend. This MCP handles all CRUD (Create, Read, Update, Delete) operations for image metadata, labels, review statuses, and other structured data stored in Supabase PostgreeSQL tables. It also facilitates interaction with `pgvector` for vector management if chosen as the primary vector store.

**Agent Browser Connector**
Provides an interface for the agent (LLM) to interact with the `agent-browser.dev` tool for debugging, visualization, and testing purposes. This MCP allows the agent to log its thought process, tool calls, and observations in a structured way, aiding in the development and understanding of complex agent behaviors.

---

## 3. SUBAGENTS
*Autonomous entities designed to achieve complex goals by orchestrating multiple skills.*

**Research Assistant**
Helps the user gather relevant information by orchestrating research skills. It can search for definitions, best practices, or technical details related to computer vision, ML models, and labeling techniques from various sources (web, local documents).

**Visual Generator**
Assists in creating and visualizing graphical elements. This subagent can generate reference images based on descriptions or construct and manage Excalidraw diagrams to visualize workflows, architectures, or data relationships for better understanding and communication.

**Documentation Helper**
Aids in consulting and organizing textual information. This subagent can fetch and summarize content from web articles or read specific sections of local technical documents, providing quick access to project-relevant information and standards.

---