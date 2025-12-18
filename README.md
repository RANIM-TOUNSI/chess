# Chess Game Prototype

A functional prototype of a **multiplayer chess game** built with **Angular** and **Spring Boot**, designed to validate core full‑stack concepts such as authentication, real‑time communication, and persistence.

---

## Tech Stack

* **Frontend**: Angular (standalone components), TypeScript
* **Backend**: Spring Boot, Spring Security, JWT
* **Real-time**: WebSockets (STOMP / SockJS)
* **Database**: MySQL

---

## Prerequisites

* **Java 17** or higher
* **Maven**
* **Node.js** (v18+ recommended) and **npm**
* **MySQL** server

---

## Setup & Running

### 1. Database

Create a MySQL database named `chessdb` and a user `test` with password `test123`.

> Credentials can be changed in:
> `backend/src/main/resources/application.yaml`

---

### 2. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on:

```
http://localhost:8081
```

WebSocket endpoint:

```
/ws
```

---

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

Application available at:

```
http://localhost:4200
```

---

## Features

* **Authentication**: User registration and login with JWT
* **Real-time**: Player invitations and move exchange via WebSockets
* **Persistence**: Games and moves stored in MySQL
* **UI**: Simple chess board using Angular standalone components

---

## Scope

This project is a **prototype**, not a full chess engine. The focus is on:

* Angular ↔ Spring Boot integration
* WebSocket communication
* Backend persistence

Advanced chess rules and UI polish are intentionally out of scope.
