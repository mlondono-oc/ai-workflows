# Draft: ImageLink CV Platform - Skills, Subagents, and MCPs

This draft outlines proposed skills, subagents, and MCPs based on the ImageLink CV Image Management and Smart Labeling Platform MVP brief.

## 1. Skills (LLM Callable Actions)

These are atomic functions or capabilities that the Large Language Model (LLM) can invoke using the available tools to perform specific tasks.

*   **`generate_reference_image(prompt: str, aspectRatio: str = "1:1")`**
    *   **Description:** Creates an image based on a detailed text description. This skill can be used to generate visual references, examples for labeling, or to visualize concepts related to the dataset.
    *   **Example Use Case:** "Generate an image of a cat wearing sunglasses on a tropical background, aspect ratio 16:9."

*   **`research_cv_term(query: str, maxResults: int = 5)`**
    *   **Description:** Conducts in-depth research on a Computer Vision-related concept, ML model, labeling technique, or any relevant topic. This helps users understand underlying principles or make informed decisions.
    *   **Example Use Case:** "Research 'DBSCAN clustering' and its applications in computer vision."

*   **`read_technical_document(storagePath: str, from_side: str = "top", lines: int = None)`**
    *   **Description:** Reads text content from a local file (e.g., technical document, specification, labeling guide). Useful for consulting internal documentation or standards.
    *   **Example Use Case:** "Read the first 20 lines of 'labeling_guide.pdf' to understand the standards."

*   **`fetch_web_content(url: str, maxLength: int = 10000)`**
    *   **Description:** Extracts text content from a specified URL. Can be used to gather information from online articles, research papers, or external documentation relevant to the project.
    *   **Example Use Case:** "Fetch the content from this article about convolutional neural networks: `https://example.com/cnn-article`."


## 2. MCP (MODEL CONTEXT PROTOCOL)

Standardized interfaces providing secure access to data sources and external services. These protocols enable the model to interact with specialized external systems, retrieving or storing information critical for the platform's operation.

*   **Vector DB Connector**
    *   **Description:** Provides high-speed indexing and retrieval for similarity searches. It enables agents to find related images or embeddings within vector databases such as Pinecone, Milvus, or FAISS. This MCP is crucial for the platform's ability to identify patterns, cluster images, and perform similarity searches based on image embeddings.
    *   **Key Capabilities:**
        *   `store_vectors(vectors: list[dict], metadata: list[dict])`: Stores image embeddings along with associated metadata.
        *   `query_similar_vectors(query_vector: list[float], top_k: int, filters: dict = None)`: Retrieves the `top_k` most similar vectors to a given query vector, optionally applying metadata filters.
        *   `delete_vectors(vector_ids: list[str])`: Removes specified vectors from the database.
        *   `create_index(index_name: str, dimensions: int, metric: str)`: Manages the creation of vector indexes.

*   **Supabase Connector**
    *   **Description:** Offers a secure and standardized interface for interacting with the Supabase backend. This MCP handles all CRUD (Create, Read, Update, Delete) operations for image metadata, labels, review statuses, and other structured data stored in Supabase PostgreeSQL tables. It also facilitates interaction with `pgvector` for vector management if chosen as the primary vector store.
    *   **Key Capabilities:**
        *   `insert_record(table_name: str, data: dict)`: Inserts a new record into a specified Supabase table.
        *   `fetch_records(table_name: str, filters: dict = None, order_by: str = None)`: Retrieves records from a table, with optional filtering and ordering.
        *   `update_record(table_name: str, record_id: str, updates: dict)`: Updates an existing record by its ID.
        *   `delete_record(table_name: str, record_id: str)`: Deletes a record by its ID.
        *   `execute_rpc(function_name: str, params: dict)`: Calls a Supabase Remote Procedure Call (RPC) function.

*   **Agent Browser Connector**
    *   **Description:** Provides an interface for the agent (LLM) to interact with the agent-browser.dev tool for debugging, visualization, and testing purposes. This MCP allows the agent to log its thought process, tool calls, and observations in a structured way that can be displayed and analyzed within the Agent Browser UI, aiding in the development and understanding of complex agent behaviors.
    *   **Key Capabilities:**
        * `log_thought(thought: str)`: Logs a thought or reasoning step of the agent.
        * `log_tool_call(tool_name:` str, args: dict): Logs a call to a specific tool with its arguments.
        * `log_observation(observation: str):` Logs the result or observation from a tool call or external event.
        * `send_message_to_user(message: str):` Sends a message to the user interface of the Agent Browser.
        * `display_data(data: dict, format: str = 'json'):` Displays structured data within the Agent Browser for inspection.
        

## 3. Subagents (LLM Roles and Orchestration)

Subagents are conceptual roles the LLM can adopt to orchestrate multiple skills and assist the user in achieving more complex goals. They represent higher-level reasoning and task management.

*   **`ResearchAssistant`**
    *   **Objective:** To help the user gather relevant information for their work with images and computer vision.
    *   **Skills Utilized:** `research_cv_term`, `read_technical_document`, `fetch_web_content`.
    *   **Example Interaction:** "I need to better understand how the K-Means algorithm works for image clustering. Can you find me some information on it?"

*   **`VisualGenerator`**
    *   **Objective:** To create or visualize graphical elements to aid in project communication or planning.
    *   **Skills Utilized:** `generate_reference_image`, `display_excalidraw_diagram`, `export_excalidraw_diagram`, `manage_excalidraw_checkpoint`.
    *   **Example Interaction:** "Design a simple client-server architecture diagram for our platform." or "Generate a sample image for a new type of label we are considering."

*   **`DocumentationHelper`**
    *   **Objective:** To assist in consulting and organizing textual information related to the project.
    *   **Skills Utilized:** `read_technical_document`, `fetch_web_content`.
    *   **Example Interaction:** "Remind me of the file system security constraints mentioned in the internal documentation."

---