# ImageLink: CV Image Management and Smart Labeling Platform MVP
> Construction of a minimalist web platform to help researchers organize, label, and explore image datasets using embedding-based similarity search and automated clustering.

---

## 1. CONTEXT
> The objective is to build an image management platform that allows researchers to assign labels, group, visualize, and filter images based on collected metadata (tags and researcher reviews). The system must include a reorganization feature to move images into specific local directories (e.g., train, test, val). Additionally, the platform must identify patterns through image clustering using vectorization/embeddings.

### Current System / Environment
* Preparing Computer Vision (CV) datasets often lacks comprehensive, minimalist tools that combine visual exploration with smart local labeling and file system management.

### The Problem
* Manually organizing and labeling large volumes of images is tedious. Researchers lack tools to relate similar images, find visual patterns (clusters), or quickly reorganize physical files into training splits without manual error.

### Concrete Goal
* Develop a web application MVP that allows users to load image directories, visualize them in a grid, manage labels/metadata, identify visual clusters, and physically reorganize files into specific sub-directories.

---

## 2. TECHNICAL REQUIREMENTS
> Delimit exactly how the solution must be built to ensure compatibility with the current stack.

### Language / Stack
* **Frontend:** React, Vue.js, or Svelte.
* **Backend:** Python using FastAPI, Flask, or Django.
* **Database:** Supabase (for metadata storage and vector management).
* **Image Processing / ML:** OpenCV, Pillow, and TensorFlow or PyTorch.
* **Vector & Pattern Search:** Faiss (for high-performance clustering) and/or pgvector (via Supabase).

### Patterns or Architecture
* **Client-Server Architecture:** Separation of the web frontend from the processing backend.
* **Service/Strategy Pattern:** Decoupling of business logic (labeling/reorganization), database connectors (Supabase), and the embedding generation engine (e.g., ResNet50).
* **File System Handler:** A dedicated service to manage safe local file movement (reorganization).

### Input Structure
* **Local Paths:** System directory paths to load image batches. Supports JPG and PNG formats. Image directories are expected as a root folder that may contain subfolders, and all images within this hierarchy will be processed.
* **User Metadata:** Free-text labels and review status (e.g., “Reviewed”, “To Check”). When loading the dataset, the user defines a list of tags/labels (one or more words separated by underscores), and keyboard shortcuts are assigned to each tag to streamline image labeling.
* **Target Schema:** Definition of sub-directories for reorganization (e.g., /train, /test, /val).

### Output Structure
* **Grid View UI:** High-performance grid with filtering by metadata and clustering results.
* **Reorganized Directory:** Physical movement of files into target folders based on user selection.
* **Export File:** .csv or .json format linking image paths, labels, and cluster IDs.

### Integrations
* Integration with pre-trained Computer Vision models (such as ResNet or EfficientNet without the final classifier) for feature extraction and vector generation. A ResNet50 model pre-trained on ImageNet will be used to generate embeddings.
* Supabase Client: For real-time metadata updates and vector similarity queries.

### Background Processing
> Goal: Clearly define the strategy for handling long-running, computationally intensive tasks.

* Strategy: Heavy computational tasks (vectorization, clustering, file movement) should run asynchronously in the backend and must not block the user interface.
* Implementation Suggestion (for MVP): For the MVP, these tasks can be managed using a lightweight task queue system (e.g., Celery with Redis as the broker) or a simpler approach based on threading.Thread or multiprocessing.Process, with basic backend status monitoring if infrastructure allows. Providing task status feedback to the user (e.g., “Processing images...”, “Clustering completed”) is essential.

---

## 3. CONSTRAINTS
> Indicate the mandatory rules, guardrails, and standards to follow during the project's development.

### Architectural Standards
* **Logic Decoupling:** Business logic must remain independent of Supabase implementation details.
* **I/O Safety:** Directory reorganization must implement "dry-run" or validation logic to prevent data loss during file movement.
* **Modular Design:** Clustering logic should be interchangeable (e.g., switching between K-Means or DBSCAN).
* **On-Demand Processing:** Heavy computational tasks (clustering, vectorization, file movement) must only execute upon explicit user request.
* **Frontend Performance:** The grid view UI must efficiently render and filter at least 5,000 images without significant performance degradation.
* **Local File System Security:** The File System Handler must operate within a sandbox or with strictly limited permissions to user-specified directories for loading and reorganizing files, preventing unauthorized access to other parts of the host file system.
* **ML Parameter Configurability:** Key parameters for vectorization (e.g., CV model) and clustering (e.g., number of clusters, algorithm) must be configurable via the UI or configuration files, enabling experimentation without code changes.
* **CV Model Versioning Strategy:** Computer Vision models used for feature extraction must be versioned and loaded in a controlled manner to ensure reproducibility of embeddings and clustering results.
* **Auditability of Critical Actions:** All critical operations, such as file reorganization or bulk label deletion, must be logged and auditable, including at least a timestamp and the action performed.
* **Operation Idempotency:** Processing (vectorization, clustering) and file reorganization operations must be idempotent, ensuring that repeated executions with the same parameters produce the same results without unintended side effects.
* **Image Storage:** The platform will only handle references to local image paths. This implies that image integrity depends on users not moving or deleting the original files outside the platform. At this stage, the platform will not store image copies or thumbnails in Supabase Storage.



### Development Rules
* **Best Practices:** Follow the idiomatic conventions and best practices of the chosen language or framework.
* **Type Safety:** Use strict typing mechanisms (type hints, interfaces, schemas) in all functions, methods, and data structures where the language supports it.
* **Linter and Formatting:** The code must comply with the project's established formatting and linting standards.
* **Tests:** Mandatory inclusion of automated tests for all core logic.
* **Library Limits:** Restrict external dependencies to those explicitly approved or listed in the technical requirements.
* **Scope Limits:** Strictly forbidden to implement user authentication, multi-project management, or advanced bounding-box annotation in this MVP phase.
* **Resource Usage Limits (MVP):** For the MVP, the platform is designed to run on a single server instance (backend) and will not be optimized for large-scale horizontal scalability at this stage.

---

## 4. DEFINITION OF DONE (DoD)
> Establish the verifiable, measurable criteria that define the work as complete and successful.

* [ ] **Metadata Management:** Platform successfully persists labels and review statuses in Supabase.
* [ ] **Advanced Filtering:** Users can filter the image grid based on specific tags or review flags upon user command.
* [ ] **Clustering Feature:** The system groups similar images into visual clusters to explore patterns upon user command.
* [ ] **Reorganization Logic:** Files are correctly moved to physically separate folders (train/test/val) upon user command.
* [ ] **Similarity Search:** Selecting an image identifies the "N" most similar items via vector distance upon user command.
* [ ] **Data Export:** SSuccessful generation of a manifest file containing paths, labels, and other relevant information upon user command.
* [ ] **Quality Assurance:** Code passes Ruff/Black linting and mypy strict type checking.
* [ ] **Error Handling and Feedback:** The platform provides clear user feedback on operation status and errors, both in the UI and through logs.

---