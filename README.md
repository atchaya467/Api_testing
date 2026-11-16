#  API Testing - LLM-Powered API Testing & Security Scanner

> **Next-Gen AI & LLM-Powered API Testing, Fuzzing & OWASP Top 10 Security Scanning Platform with Cyberpunk Modern Animated UI/UX.**

---

##  Key Features

### 1.  Modern API Testing Client (Postman + Insomnia Reimagined)
- **All HTTP Methods Supported**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD` with color-coded badges.
- **Dynamic Variable Interpolation**: Use `{{baseUrl}}`, `{{token}}`, `{{userId}}` seamlessly in URLs, headers, and request bodies.
- **Interactive Response Inspector**:
  - Formatted JSON syntax highlighter with search filter.
  - Telemetry badges: Latency (`ms`), Payload Size (`KB`), Status code (`200 OK`, `401 Unauthorized`, `500 Error`).
  - Response headers viewer.
  - Copy to clipboard & raw text modes.
- **Contract Test Assertions**: Status code checks, SLA latency limits (<500ms), header presence, and JSON schema property validation.

### 2.  LLM Automated Security Scanner (OWASP API Top 10)
- **Active Vulnerability Fuzzing**:
  - **API1: BOLA / IDOR**: Automatic resource ID swapping and tenant isolation testing.
  - **API2: Broken Authentication**: Token tampering, header stripping, and expired JWT probes.
  - **API3: Broken Object Property Authorization**: Mass assignment injection (`role: "admin"`, `isAdmin: true`, `balance: 999999`) and Excessive Data Exposure (PII / passwords / SSN leaks).
  - **API4: Unrestricted Resource Consumption**: Burst rate-limit probe testing.
  - **API5: Broken Function Level Authorization (BFLA)**: Unauthorized administrative endpoint testing.
  - **API8: Security Misconfiguration**: Missing defensive headers (`X-Content-Type-Options`, `Content-Security-Policy`, `X-Frame-Options`) and server banner leakage.
  - **API10: Injection & Fuzzing**: SQL injection probes (`' OR '1'='1`), NoSQL injection, and unhandled database syntax error reflection.
- **Security Health Posture**:
  - Letter grade rating (`A+`, `A`, `B`, `C`, `D`, `F`) and numerical score (`0-100`).
  - Severity breakdown: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
  - Exploit Proof of Concept (PoC).
  - Actionable AI Remediation Code Snippets (Express / Node.js).
  - 1-Click Reproduction `curl` command.

### 3.  AI Intelligence Engines
- **Zero-Config Built-in Heuristic Engine**: Works offline immediately without needing any API key!
- **Google Gemini API**: Full integration with `gemini-2.0-flash`, `gemini-1.5-flash`, and `gemini-1.5-pro`.
- **OpenAI & Ollama**: Seamless integration with GPT-4o or local LLMs (e.g. `llama3.2`).
- **AI Natural Language to Request**: Type plain English (e.g. *"Test user login with admin account"*) to auto-generate requests.
- **AI Automated Test Suite Generator**: Click **"AI Tests"** to synthesize 5-10 automated contract assertion checks.

### 4. Preconfigured Interactive Sandbox & Mock Targets
- Built-in realistic mock target server:
  - `GET /api/mock/users` (Excessive Data & PII Exposure)
  - `GET /api/mock/users/:id` (IDOR / BOLA Target)
  - `GET /api/mock/search?q=...` (SQL Injection Vulnerable Parameter)
  - `POST /api/mock/orders` (Mass Assignment Privilege Escalation)
  - `POST /api/mock/admin/export` (Broken Function Level Auth / BFLA)
  - `GET /api/mock/rate-limited` (Rate-limiting Quota Probe)
  - `GET /api/mock/secure/profile` (Hardened, fully compliant endpoint)

---

##  Quick Start

### 1. Start the Platform
```bash
npm start
```
The unified platform will start on **`http://localhost:5000`** serving both the backend proxy, scanner, mock sandbox, and the animated frontend UI.

### 2. Run in Development Mode (with Live Reload)
```bash
npm run dev
```
Runs the Express backend on `http://localhost:5000` and Vite client on `http://localhost:5173`.

### 3. Run Automated Integration Verification Test Suite
```bash
npm test
```

---

## 💻 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Cyber Glassmorphism.
- **Backend**: Node.js, Express, Axios, CORS.
- **AI & Security**: Gemini API, OpenAI / Ollama compatible client, AST Heuristic Fuzzer, OWASP API Top 10 rule engine.
