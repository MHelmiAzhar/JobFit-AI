# Backend Service for CV and Project Evaluation

Backend service yang mengevaluasi CV kandidat dan Portofolio menggunakan AI-driven analysis dengan LLM chaining dan RAG (Retrieval Augmented Generation).

## Fitur Utama

- Upload CV dan project reports (PDF, DOCX, TXT)
- Pipeline evaluasi asinkron menggunakan AI/LLM
- RAG (Retrieval Augmented Generation) untuk scoring kontekstual
- Structured evaluation reports dengan match rates dan feedback
- Queue-based processing dengan Redis/BullMQ
- Integrase vector database dengan ChromaDB

## Tech Stack

- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (supabase)
- **ORM**: Prisma
- **Vector DB**: ChromaDB Cloud
- **Queue**: BullMQ + Redis
- **AI/LLM**: Gemini API
- **File Processing**: Multer, PDF-Parse, Mammoth (DOCX)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- Redis instance (local atau cloud)
- PostgreSQL (local atau cloud)
- ChromaDB (local atau cloude)
- Gemini API Key

### 2. Installation

```bash
git clone <repository-url>
cd backend-evaluation-service
npm install
```

### 3. Environment Setup

Buat file `.env` dengan konfigurasi berikut:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL Configuration
DATABASE_URL=your_postgresql_url

# ChromaDB Configuration
CHROMADB_TENANT=your_chromadb_url
CHROMADB_API_KEY=your_chromadb_api_key
CHROMADB_DATABASE=your_chromadb_database

# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 4. Prisma Setup

1. Jalankan migrasi awal:

```bash
npx prisma migrate dev --name init
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Pastikan `DATABASE_URL` di `.env` sudah sesuai dengan konfigurasi PostgreSQL/Supabase Anda.

### 5. Seeding data to ChromaDB

1. Buat project baru di [Supabase](https://supabase.com/)
2. Copy URL dan API keys ke file `.env`
3. Jalankan SQL script di `database/schema.sql` di Supabase SQL Editor

### 5. Running the Application

**Development mode (recommended):**

```bash
# Run both API server and BullMQ worker
npm run dev:all

# Or run separately in different terminals:
npm run dev          # API server only
npm run dev:worker   # BullMQ worker only
```

**Production mode:**

```bash
npm run build
npm start  # Starts both API server and worker
```

**Separate processes (production):**

```bash
npm run build

# Terminal 1: API Server
npm run start:api

# Terminal 2: BullMQ Worker
npm run start:worker
```

## API Endpoints

### 1. Upload Files

```http
POST /api/upload
Content-Type: multipart/form-data

Form fields:
- cv: file (PDF/DOCX/TXT)
- project: file (PDF/DOCX/TXT)
```

**Response:**

```json
{
  "message": "Files uploaded successfully",
  "upload_id": "uuid",
  "files": {
    "cv": {
      "filename": "unique-cv-name.pdf",
      "originalName": "resume.pdf",
      "size": 1024000
    },
    "project": {
      "filename": "unique-project-name.pdf",
      "originalName": "project-report.pdf",
      "size": 2048000
    }
  }
}
```

### 2. Start Evaluation

```http
POST /api/evaluate
Content-Type: application/json

{
  "upload_id": "uuid"
}
```

**Response:**

```json
{
  "id": "job-uuid",
  "status": "queued"
}
```

### 3. Get Evaluation Results

```http
GET /api/result/{jobId}
```

**Response (Processing):**

```json
{
  "id": "job-uuid",
  "status": "processing"
}
```

**Response (Completed):**

```json
{
  "id": "job-uuid",
  "status": "completed",
  "result": {
    "cv_match_rate": 0.82,
    "cv_feedback": "Strong in backend and cloud, limited AI integration experience.",
    "project_score": 7.5,
    "project_feedback": "Meets prompt chaining requirements, lacks error handling robustness.",
    "overall_summary": "Good candidate fit, would benefit from deeper RAG knowledge."
  }
}
```

### 5. BullMQ Queue Monitoring

Monitor dan kelola queue jobs:

```http
# Get queue statistics
GET /api/queue/stats

# Get specific job info
GET /api/queue/job/{jobId}

# Clean completed/failed jobs
POST /api/queue/clean
Content-Type: application/json
{
  "type": "completed",  // completed, failed, active, waiting
  "limit": 100
}

# Retry all failed jobs
POST /api/queue/retry-failed
```

## Architecture & Design Choices

### 1. Asynchronous Processing

- Menggunakan BullMQ untuk queue management
- Menghindari API timeouts untuk proses evaluasi yang panjang
- Mendukung retry mechanisms untuk failed jobs
- Background processing dengan worker threads

### 2. RAG Implementation

- ChromaDB menyimpan job descriptions dan scoring rubrics sebagai vectors
- Context retrieval meng-inject informasi relevan ke LLM prompts
- Memungkinkan evaluasi yang lebih akurat dan kontekstual

### 3. LLM Chaining Pipeline

Multi-step evaluation process:

1. **Extract** structured data dari CV menggunakan LLM
2. **Compare** dengan job requirements menggunakan retrieved context
3. **Generate** match rate dan detailed feedback
4. **Evaluate** project report berdasarkan scoring rubric
5. **Refine** hasil dengan secondary LLM call untuk overall summary

### 4. Error Handling & Resilience

- Exponential backoff untuk LLM API failures
- Graceful degradation dengan fallback responses
- Comprehensive logging untuk debugging
- Retry mechanisms pada queue level
- Timeout handling untuk long-running processes

### 5. File Processing

- Support multiple format: PDF, DOCX, TXT
- File validation dan size limits
- Secure file storage dengan unique naming
- Text extraction dengan specialized parsers

## Testing

Untuk testing manual API endpoints:

```bash
# Upload files
curl -X POST http://localhost:3000/api/upload \
  -F "cv=@sample-cv.pdf" \
  -F "project=@sample-project.pdf"

# Start evaluation
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"upload_id":"your-upload-id"}'

# Check results
curl http://localhost:3000/api/result/your-job-id
```

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes dengan proper testing
4. Submit pull request dengan clear description

## License

MIT License
