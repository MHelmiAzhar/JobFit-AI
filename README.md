# JobFit-AI: AI-Powered Evaluation Service

This is the backend service for JobFit-AI, an application designed to automate the evaluation of candidate CVs and project portfolios using Artificial Intelligence. The service analyzes uploaded documents, scores them against job descriptions, and provides detailed feedback.

## Design Choices

The architecture of this service was carefully chosen to ensure scalability, maintainability, and efficient processing of long-running tasks.

1.  **Separated API and Worker Processes**:

    - The system is divided into two main components: a synchronous **API Server** (`src/app.ts`) and an asynchronous **Worker** (`src/worker.ts`).
    - **Reasoning**: AI-based document analysis can be time-consuming. To avoid blocking HTTP requests and potential timeouts, the API's role is simply to accept requests, validate input, and enqueue a job. The Worker process listens for these jobs on a queue and handles the heavy lifting of parsing files, calling the AI model, and storing results. This pattern ensures the API remains responsive and the system can handle multiple evaluations concurrently.

2.  **Queueing System (BullMQ & Redis)**:

    - We use **BullMQ**, backed by **Redis**, to manage the job queue between the API and the Worker.
    - **Reasoning**: BullMQ provides a robust, reliable, and performant queueing solution. It offers features like job prioritization, retries, and detailed monitoring, which are essential for a production-grade background processing system.

3.  **Database and ORM (PostgreSQL & Prisma)**:

    - The primary database is managed by **Prisma**, a modern, type-safe ORM. While the database is not specified, Prisma is well-suited for relational databases like PostgreSQL.
    - **Reasoning**: Prisma's auto-generated client ensures that all database queries are fully type-safe, which catches errors at compile time and improves developer productivity. Its migration system (`prisma migrate`) provides a straightforward, version-controlled way to evolve the database schema.

4.  **AI and Vector Database (Google Gemini & ChromaDB)**:

    - The core evaluation logic is powered by **Google's Gemini Pro** model. A **ChromaDB** vector database is used for Retrieval-Augmented Generation (RAG).
    - **Reasoning**:
      - The `db:seed` script likely populates ChromaDB with embeddings of ideal skills or criteria for different job roles.
      - When a CV is evaluated, it is compared against these stored vectors (semantic search) to find the most relevant criteria. This context is then passed to the Gemini model along with the CV content.
      - This RAG approach makes the AI's evaluation more accurate, consistent, and grounded in the specific requirements of a job role, reducing hallucinations and improving the quality of the feedback.

5.  **Configuration and Validation**:
    - Environment variables are managed with `dotenv`.
    - Input validation is handled by **Zod**, ensuring that all data entering the system (e.g., API request bodies) conforms to a defined schema. This prevents bad data from propagating through the application.

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- A running Redis instance
- A running PostgreSQL instance (or other SQL database compatible with Prisma)

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/MHelmiAzhar/JobFit-AI.git
    cd JobFit-AI
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Now, fill in the `.env` file with your database URL, Redis connection details, and Google AI API key. Refer to `.env.example` for a complete list of required variables.

    ```env
    # .env
    DATABASE_URL="postgresql://user:password@host:port/database"
    REDIS_HOST="127.0.0.1"
    REDIS_PORT="6379"
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Run database migrations:**
    Apply the existing database schema to your database.

    ```bash
    npx prisma migrate dev
    ```

5.  **(Optional) Seed the Vector Database:**
    To populate the ChromaDB vector store with initial data, run the seeder script.
    ```bash
    npm run db:seed
    ```

### Running the Application

To run the full application, you need to start both the API server and the background worker.

- **Run in Development Mode:**
  This command uses `concurrently` to start both the API and the worker with hot-reloading.

  ```bash
  npm run dev
  ```
