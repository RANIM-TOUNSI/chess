# Chess Game Prototype

This is a functional prototype of a multiplayer chess game built with Angular and Spring Boot.

## Prerequisites

*   **Java 17** or higher
*   **Maven**
*   **Node.js** (v18+ recommended) and **npm**
*   **MySQL Database**

## Setup & Running

### 1. Database Setup

Ensure you have a MySQL server running. Create a database named `chessdb` and a user `test` with password `test123` (or update `backend/src/main/resources/application.yaml` with your credentials).

```

### 2. Backend

The backend is a Spring Boot application.

## Features Included

*   **Authentication**: Login/Register with JWT.
*   **Real-time**: WebSockets for invitations and moves.
*   **Persistence**: Games and moves are saved in MySQL.
*   **UI**: Angular standalone components, simple CSS board.
