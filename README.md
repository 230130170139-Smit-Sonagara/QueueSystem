# 🎫 Smart Queue System
### Full-Stack Web Application | Token & Queue Management Platform

> A production-ready queue management system built for hospitals, banks, clinics, and government offices — featuring real-time token tracking, role-based access, email notifications, and a live TV display board.

---

## 📌 Project Summary

Smart Queue System is a full-stack enterprise web application that digitizes the physical queue experience. Instead of standing in line, customers book tokens online, track their position in real time, and receive email alerts when their turn arrives.

The system supports multi-branch organizations, role-based staff access, VIP priority routing, and a live TV display board — all connected through a RESTful API backend with JWT security.

This project demonstrates end-to-end software engineering including system design, database modeling, REST API development, JWT authentication, real-time UI updates, and email integration.

---

## 🎯 Problem Statement

In hospitals, banks, and government offices, customers waste hours standing in physical queues with no visibility into their waiting time. Staff have no digital tools to manage service flow efficiently.

Smart Queue System solves this by:
- Eliminating physical queues with online token booking
- Giving customers real-time visibility into their position
- Giving agents a digital workspace to manage service flow
- Giving admins a live dashboard to monitor the entire network

---

## ✨ Key Features

- 🎟️ Online Token Booking — Customers book tokens from any device without visiting the location
- 📲 Live Token Tracking — Real-time status page showing position, people ahead, and estimated wait
- 📺 TV Queue Display — Waiting area screen showing now-serving and upcoming tokens
- 🧑‍💼 Agent Workspace — Counter staff manage their queue — call next, complete, or no-show
- 📊 Admin Dashboard — Full network overview with live metrics, branch status, and serving snapshot
- 📧 Email Notifications — Automated booking confirmation and turn-called alerts via Gmail SMTP
- 🔐 JWT Authentication — Stateless token-based security with role-based access control
- 🏢 Multi-Branch Architecture — Multiple branches under one organization, each with independent queues
- ⭐ VIP Priority Routing — Intelligent serving order: VIP → Online Appointment → Walk-in
- 📱 QR Code Tracking — Each token generates a QR code linking to its live tracking page
- 🚀 Auto Data Seeding — System boots with complete demo data on first run
- 🔄 Real-Time Polling — Frontend auto-refreshes every 4 seconds for live queue updates

---

## 🛠️ Tech Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL 14+
- Java Mail Sender (Gmail SMTP)
- Maven

### Frontend
- React 19
- Vite 8
- React Router v7
- Axios 1.7
- Tailwind CSS 3.4
- Lucide React (icons)
- Recharts (admin charts)
- Framer Motion (animations)
- qrcode.react (QR generation)

---

## 🏗️ System Architecture

Client Layer
React + Vite running at http://localhost:5173
Pages: Home, Kiosk, TV Board, Login, Agent, Admin, Live Status
|
| HTTP REST via Axios
| JWT sent in Authorization Header
|
API Layer
Spring Boot running at http://localhost:8080
Routes: /api/public  /api/auth  /api/agent  /api/admin
|
| Spring Data JPA
|
Database Layer
PostgreSQL — Queue_System database
Tables: app_users, tokens, service_queues, branches,
counters, departments, organizations
|
External Services
Gmail SMTP for email notifications

---

## 🗄️ Database Design

### Entity Relationship

Organization
└── Branch (many)
├── Department (many)
│     ├── ServiceQueue (many)
│     │     └── Token (many)
│     └── Counter (many)
│           └── Agent / AppUser (one)
└── Admin / AppUser (many)

### Key Tables

- app_users       → Admin and agent accounts with BCrypt hashed passwords
- tokens          → Customer booking records with full lifecycle tracking
- service_queues  → Queue definitions with prefix, timing, and token sequence
- branches        → Branch locations under an organization
- counters        → Physical or virtual service desks
- departments     → Service categories within a branch
- organizations   → Top-level enterprise entity

---

## 🔄 Token Lifecycle

Customer books token
|
v
[ WAITING ]   Token is queued and waiting to be called
|
|  Agent clicks Call Next
v
[ SERVING ]   Customer is at the counter being served
|
-----+-----
|         |
v         v
[COMPLETED] [NO_SHOW]

Business Rules:
- One token served per counter at a time
- Next token only called after current token is closed
- Each counter only serves its own department queue
- Priority order: VIP first, then Online Appointment, then Walk-in

---

## 🔐 Authentication and Security

- JWT-based stateless authentication — no server-side sessions
- BCrypt password hashing — passwords never stored in plain text
- Role-based access control — 3 roles with different permissions
- Protected API routes — agent and admin endpoints require valid JWT
- JWT stored in localStorage and sent as Bearer token on every request

### Roles

- SUPER_ADMIN — Full system monitoring and overview — redirects to /admin
- AGENT — Counter operations only — redirects to /agent
- CUSTOMER — No login required — uses /kiosk and /status/:tokenId

---

## 📡 REST API Endpoints

### Public — /api/public
GET    /branches
GET    /branches/{id}/queues
POST   /queues/{id}/tokens
GET    /tokens/{id}/tracking
GET    /branches/{id}/board

### Auth — /api/auth
POST   /login

### Agent — /api/agent (JWT Required)
GET    /workspace
POST   /counters/{id}/next
POST   /tokens/{id}/complete
POST   /tokens/{id}/no-show

### Admin — /api/admin (JWT Required)
GET    /dashboard
GET    /setup

---

## 📁 Project Structure

QueueSystem/
├── backend/
│   └── src/main/
│       ├── java/com/smartqueue/
│       │   ├── AdvancedDataSeeder.java            Auto seeds all data on startup
│       │   ├── AdvancedQueueManagerService.java   Core business logic
│       │   ├── AuthenticationService.java         Login handling
│       │   ├── JwtService.java                    JWT generation and validation
│       │   ├── JwtAuthenticationFilter.java       JWT check on every request
│       │   └── EmailNotificationService.java      Gmail SMTP integration
│       └── resources/
│           └── application.yml                    DB, SMTP, and server config
│
└── frontend/
└── src/
├── pages/
│   ├── Home.jsx               Landing page with module navigation
│   ├── Login.jsx              Unified staff login page
│   ├── Kiosk.jsx              Public token booking form
│   ├── TVDisplay.jsx          Live queue board for waiting area
│   ├── AgentWindow.jsx        Counter agent workspace
│   ├── AdminDashboard.jsx     Admin metrics and live snapshot
│   └── LiveStatus.jsx         Customer token tracking page
├── lib/
│   └── cn.js                  Tailwind class merge utility
├── config.js                  Environment variable validation
├── api.js                     Axios instance with JWT interceptor
└── App.jsx                    Route definitions

---

## ⚙️ Getting Started

### Prerequisites
- Java 17 or above
- Node.js 18 or above
- PostgreSQL 14 or above

### Step 1 — Create Database
CREATE DATABASE "Queue_System";

### Step 2 — Run Backend
cd backend
./mvnw spring-boot:run
Runs at http://localhost:8080
Auto seeds all demo data on first run

### Step 3 — Run Frontend
cd frontend
npm install
npm run dev
Runs at http://localhost:5173

### Backend Configuration
Edit backend/src/main/resources/application.yml

spring:
datasource:
url: jdbc:postgresql://localhost:5432/Queue_System
username: postgres
password: your_password
mail:
host: smtp.gmail.com
username: your_email@gmail.com
password: your_app_password
server:
port: 8080

---

## 🔑 Default Login Credentials

### Admin
- Username: admin
- Password: Smit@2006
- Redirects to: /admin

### Agents
- agent1 / Smit@123 → Counter CTR-1 → General Consultation
- agent2 / Smit@123 → Counter GOV-1 → Government Helpdesk
- agent3 / Smit@123 → Counter CTR-2 → Diagnostic Samples
- agent4 / Smit@123 → Counter CTR-3 → Billing and Claims
- agent5 / Smit@123 → Counter VIP-1 → Priority Consultation
- agent6 / Smit@123 → Counter SNR-1 → Senior Citizen Assistance

---

## 🧪 Demo Walkthrough

### Customer Flow
1. Open /kiosk
2. Select State Bank of India → SBI Ashram Road Branch → Loan Consultation
3. Enter name, phone, email and click Generate Token
4. Receive token number like A001 with a QR code
5. Open /status/tokenId to track live position

### Agent Flow
1. Login at /login with agent1 and password Smit@123
2. Agent workspace opens with assigned counter
3. Click Call Next — first waiting token moves to SERVING
4. Click Complete — counter becomes free
5. Repeat for next customer

### Admin Flow
1. Login at /login with admin and password Smit@2006
2. Admin dashboard opens at /admin
3. View total tokens, active counters, live serving
4. Monitor all branches and queues in real time

---

## 📊 Skills Demonstrated

- System Design — Multi-branch multi-role enterprise architecture
- REST API Design — Clean separation of public, auth, agent, and admin routes
- Database Design — Normalized schema with 10 tables and proper relationships
- Spring Security — JWT authentication with role-based route protection
- Business Logic — Queue lifecycle, priority routing, department-based assignment
- React Development — 7 pages with real API integration and state management
- Real-Time UI — Auto-polling every 4 seconds for live queue updates
- Email Integration — Gmail SMTP with booking and turn-alert notifications
- UI/UX Design — Dark professional theme with Tailwind CSS, fully responsive

---

## 🔮 Future Enhancements

- WebSocket integration for true real-time updates instead of polling
- SMS notifications via Twilio
- Dynamic queue and counter creation from admin UI
- Customer token cancellation and rescheduling
- Audit logs and report exports in CSV and PDF format
- Mobile app using React Native
- Holiday and working-hours management
- Analytics dashboard with historical data charts

Built with Java Spring Boot and React as a complete real-world project to demonstrate full-stack development skills including system design, backend API development, database modeling, frontend development, and production-ready configuration.