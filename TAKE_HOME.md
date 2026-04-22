# API Reliability Dashboard – Take Home Assignment

## Objective

Develop a small internal dashboard to monitor the health and reliability of public APIs using **Next.js (App Router)**.

---

## Functional Requirements

### 1. Dashboard Page

- Display a list of monitored services.
- Show the following for each service:
  - Service name
  - Status (**UP / SLOW / DOWN**)
  - Response latency (ms)
  - Last checked timestamp
  - Health score

---

### 2. Service Management

- Add a service (name + URL)
- Delete a service
- Manually refresh a service’s health status
- Storage may use:
  - In-memory
  - JSON file
  - Lightweight local persistence

---

### 3. Health Check Logic

- Perform an HTTP request to the service
- Measure response time (latency)
- Classify status based on rules below
- Return a structured response object

---

## Status Classification Rules

- **UP**
  - HTTP 2xx
  - Response time < 500ms

- **SLOW**
  - HTTP 2xx
  - Response time ≥ 500ms and < 2000ms

- **DOWN**
  - Non-2xx response
  - Network failure
  - Timeout
  - OR latency ≥ 2000ms

---

## Expected Response Format

```json
{
  "id": "string",
  "name": "string",
  "status": "UP | SLOW | DOWN",
  "latencyMs": 123,
  "lastCheckedAt": "ISO timestamp",
  "healthScore": 85
}
```

## Public APIs (No Authentication Required)

- **Hacker News Search API**
  https://hn.algolia.com/api/v1/search?query=ai

- **Open-Meteo Weather API**
  https://api.open-meteo.com/v1/forecast?latitude=1.29&longitude=103.85&current_weather=true

- **GitHub Public API**
  https://api.github.com/repos/vercel/next.js

- **Public Countries API**
  https://restcountries.com/v3.1/name/singapore
