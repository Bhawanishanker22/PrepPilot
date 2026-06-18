# PrepPilot – AI Mock Interview Platform

A full-stack AI-powered mock interview platform that generates role-specific interview questions using Gemini AI, evaluates your answers, and provides structured feedback with scoring.

## Problem It Solves

Most interview preparation is passive — reading answers, watching videos. PrepPilot makes it active. You describe the role, get tailored questions, answer them (by voice or text), and receive AI feedback on each answer instantly.

## Tech Stack

**Backend**
- Java 21 + Spring Boot 3.5
- Spring Security + JWT Authentication
- Spring Data JPA + Hibernate
- PostgreSQL
- Gemini AI API (google-generativelanguage)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Axios
- React Router DOM

## Features

- User registration and login with JWT-based authentication
- Create mock interviews by specifying job position, description, and experience level
- AI-generated interview questions tailored to the role
- Answer via voice (Web Speech API) or text
- Per-answer AI feedback with rating out of 10
- Dashboard showing all past interviews
- Feedback page with average score across all answers

## Project Structure
```text
PrepPilot/

├── backend/# Spring Boot REST API
│   └── src/main/java/com/preppilot/backend/
│       ├── controller/
│       ├── service/
│       ├── model/
│       ├── repository/
│       ├── security/
│       ├── dto/
│       └── exception/
└── frontend/# React + Vite
└── src/
├── pages/
└── api/
```
## Local Setup

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL
- Gemini API key (aistudio.google.com)

### Backend

1. Clone the repo
2. Create PostgreSQL database:
```sql
CREATE DATABASE preppilot;
```
3. Run the schema:
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mock_interviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    job_position VARCHAR(100) NOT NULL,
    job_description TEXT NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    questions_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_answers (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES mock_interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    user_answer TEXT,
    ai_feedback TEXT,
    ai_rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
4. Copy `backend/src/main/resources/application.properties.example` to `application.properties` and fill in your values
5. Run:
```bash
cd backend
./mvnw spring-boot:run
```

Backend starts on `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login and get JWT |
| POST | /api/interviews | Yes | Create interview + generate questions |
| GET | /api/interviews | Yes | Get all user interviews |
| GET | /api/interviews/{id} | Yes | Get single interview |
| POST | /api/interviews/answer | Yes | Submit answer + get AI feedback |
| GET | /api/interviews/{id}/answers | Yes | Get all answers for interview |

## Environment Variables

See `backend/src/main/resources/application.properties.example` for all required configuration values.

## Author

Bhawani Shanker Sharma
[LinkedIn](https://www.linkedin.com/in/bhawanishankersharma/) | [GitHub](https://github.com/Bhawanishanker22)
