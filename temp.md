# AI STACK: COMPONENTS AND CAPABILITIES
> **Scope:** High-level definition of Skills, MCPs, and Subagents for ML, AI, and CV projects.

---

## 1. SKILLS
*Atomic technical capabilities used by agents to perform specific actions.*

**Code Documenter**
Generates comprehensive technical documentation by cross-referencing the original Task Brief with the implemented source code. It ensures that the documentation reflects the actual system logic and intent.

**Code Analyzer**
Parses source code to identify core modules, functions, and classes. It generates architectural summaries and provides structured data to build flowcharts and dependency graphs.

**Model Evaluator**
Automates the inference process on test datasets. It calculates task-specific metrics (e.g., mAP for Computer Vision, F1-score for Classification) and formats results for performance tracking.

---

## 2. MCP (MODEL CONTEXT PROTOCOL)
*Standardized interfaces providing secure access to data sources and external services.*

**S3 Connector**
A specialized interface for AWS S3 to manage large-scale datasets, model weights (e.g., `.pth`, `.onnx`), and configuration files stored in JSON format.

**Experiment Registry**
A dedicated connector for MLflow that allows agents to read, compare, and update the state of previous training runs and hyperparameter logs.

**Vector DB Connector**
Provides high-speed indexing and retrieval for similarity searches. It enables agents to find related images or embeddings within vector databases such as Pinecone or FAISS.

---

## 3. SUBAGENTS
*Autonomous entities designed to achieve complex goals by orchestrating multiple skills.*

**Data Janitor**
Ensures dataset integrity by scanning for corrupted images, identifying missing labels, and reporting class imbalances before the training phase begins.

**Logic Auditor**
Responsible for code quality control. It executes the "Review Protocol" to detect logic flaws, AI-generated hallucinations, and potential security vulnerabilities.

**Code Tester**
Automatically generates and executes `pytest` suites. It performs static analysis using `mypy` to ensure strict type compliance and architectural consistency.

**Insights Reporter**
A visualization agent that consumes output from the Model Evaluator to generate comprehensive Jupyter Notebooks containing performance plots, confusion matrices, and metrics.

---