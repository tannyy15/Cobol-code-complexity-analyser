# COBOL Code Analyzer Backend

This is the Python FastAPI backend for the COBOL Code Analyzer application.

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key to the `.env` file

### Running the Server

```bash
uvicorn main:app --reload
```

The server will start on http://localhost:8000

## API Endpoints

- `GET /`: Health check endpoint
- `POST /analyze`: Analyze code content
  - Request body: `{"code": "your code here"}`
- `POST /upload`: Upload and analyze a file
  - Multipart form with a file field

## Docker Support

You can also run the backend using Docker:

```bash
docker build -t cobol-analyzer-backend .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key_here cobol-analyzer-backend
```
