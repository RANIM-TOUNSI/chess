# Chess Game Codebase - AI Agent Guidelines

## Architecture Overview

**Stack**: Spring Boot 3.4 backend + Angular 17 frontend with WebSocket real-time communication.

- **Backend**: `backend/` - Spring Boot REST API + STOMP WebSocket messaging
- **Frontend**: `frontend/` - Angular standalone components (no modules)
- **Database**: MySQL with Liquibase schema management (`backend/src/main/resources/changelog/`)
- **Authentication**: JWT tokens (issued by `/user/login`, stored in localStorage)

### Data Flow
1. User authenticates via `UserController.login()` → JWT token issued
2. Token sent in Authorization header (`JwtAuthenticationFilter`) for protected endpoints
3. Real-time game updates via WebSocket STOMP subscriptions (topic-based)
4. Entities: `User`, `Game`, `Move` persisted to MySQL via JPA repositories

---

## Build & Deployment

### Backend
```bash
cd backend
mvn clean package  # Creates backend-0.0.1-SNAPSHOT.jar
mvn spring-boot:run  # Runs on port 8081
```
- Database: Create MySQL schema `chessdb` with user `test:test123` (configured in `application.yaml`)
- Liquibase auto-runs changelog migrations on startup (set to `enabled: true`)

### Frontend
```bash
cd frontend
npm install
ng serve  # Dev server http://localhost:4200
ng build  # Production build to dist/
```

---

## Key Architectural Patterns

### 1. **Authentication & Authorization**
- **Location**: `backend/src/main/java/com/chess/backend/security/` + `frontend/src/app/auth/`
- **Pattern**: JWT stored in localStorage after login; sent as Bearer token in every request
- **Frontend Guard**: `authGuard` protects routes (currently allows all, but tied to `AuthService.getToken()`)
- **Backend Filter**: `JwtAuthenticationFilter` validates JWT before reaching endpoints
- **Note**: Auth guard is a stub (`return true`) - implement actual token validation if hardening needed

### 2. **WebSocket Communication**
- **Location**: `WebSocketConfig` (backend) + `WebSocketService` (frontend)
- **Protocol**: STOMP over SockJS for fallback support
- **Endpoints**:
  - Backend: `/ws` (enables STOMP endpoints)
  - Message broker: `/topic` (subscriptions), `/app` (application destinations)
- **Reconnection**: Auto-reconnect after 5s with heartbeat every 4s (both directions)
- **Usage Pattern**: Frontend subscribes to `/topic/*` topics after connecting; backend publishes via `SimpMessagingTemplate`

### 3. **Database Schema Management**
- **Location**: `backend/src/main/resources/changelog/`
- **Tool**: Liquibase (version control for schema)
- **Approach**: Immutable changesets (`.xml` files numbered `db.changelog-0.0.X.xml`)
- **Key Setting**: `spring.jpa.hibernate.ddl-auto: none` (let Liquibase manage schema, not Hibernate auto-update)
- **Contexts**: `development` and `production` (both applied by default)

### 4. **API Request/Response Pattern**
- **Base URL**: `http://localhost:8081` (backend port)
- **Format**: JSON in/out
- **CORS**: Enabled in `SecurityConfig` for all origins
- **Error Handling**: `GlobalExceptionHandler` catches exceptions and returns consistent error responses
- **Controllers**: Three main entry points - `UserController` (auth), `GameController` (game ops), `MoveController` (moves)

---

## Project-Specific Conventions

### Backend (Java/Spring)
- **Lombok**: Heavy use of `@Getter`, `@Setter`, `@RequiredArgsConstructor` - avoid boilerplate
- **Service Layer**: `UserService`, `GameService`, `MoveService` in `service/impl/` handle business logic
- **Repositories**: JPA repositories extend `JpaRepository` for database operations
- **Package Structure**: 
  - `controller/` - REST endpoints
  - `service/impl/` - Business logic (implementation behind interface)
  - `model/entity/` - JPA entities
  - `model/dto/` - Data transfer objects for API contracts
  - `repository/` - Data access layer
  - `security/` - JWT filter, user details service
  - `config/` - Spring configuration beans

### Frontend (Angular 17)
- **Standalone Components**: No NgModule - all components use `standalone: true` and `imports: [...]`
- **Routes**: Defined in `app.routes.ts` with guard metadata
- **Services**: Injected via `providedIn: 'root'` (tree-shakeable)
- **HTTP Client**: Used with `tap()` for side effects (token storage in `AuthService.login()`)
- **Directory Structure**:
  - `auth/` - Login, register, guard, service
  - `game/` - Board component and game logic
  - `players/` - Players list component
  - `services/` - WebSocket, auth services
  - `environments/` - Config per build (development vs. production API URLs)

---

## Common Development Workflows

### Adding a New API Endpoint
1. Create `@RestController` method in appropriate controller (e.g., `GameController`)
2. Define request DTO in `model/dto/` if needed
3. Add business logic in `service/impl/` (call repository)
4. Endpoint auto-secured by `SecurityConfig` (permit `/user/*` and `/ws/**`, require token for others)
5. Add corresponding Angular service method in `frontend/src/app/services/`

### Real-time Game Updates
1. Backend: Inject `SimpMessagingTemplate` in service, call `convertAndSend("/topic/game/{id}", payload)`
2. Frontend: Subscribe via `WebSocketService.subscribe("/user/queue/game-{id}", callback)`
3. Ensure WebSocket connects before subscribing (check `connected$` Observable)

### Database Schema Changes
1. Create new changeset file: `db.changelog-X.X.X.xml` in `changelog/changes/`
2. Reference it in `db.changelog-master.xml` with `<include>`
3. JPA entities should match schema (Liquibase is source of truth, not Hibernate)
4. Liquibase runs automatically on `BackendApplication` startup

---

## Testing Notes

- **Backend**: `mvn test` (Spring Boot test setup in pom.xml, security test dependencies included)
- **Frontend**: `ng test` (Karma + Jasmine configured)
- **Components**: Spec files exist (e.g., `login.component.spec.ts`) but may need updating for new features

---

## Environment Configuration

- **Backend** (`application.yaml`):
  - MySQL URL, credentials, JPA settings, Liquibase config, logging levels
  - Port: 8081 (Spring Boot default overridable here)
  
- **Frontend** (`environments/` folder):
  - `environment.ts` (production) and `environment.development.ts`
  - Define `apiUrl` pointing to backend (e.g., `http://localhost:8081`)
  - Injected via `environment` import in services

---

## Common Issues & Gotchas

1. **WebSocket Connection**: Frontend must call `WebSocketService.connect()` before subscribing to topics
2. **CORS**: Backend permits all origins (`"*"`) - restrict in production via `CorsConfiguration`
3. **localStorage**: Accessed only in browser context (guard with `typeof localStorage !== 'undefined'` for SSR)
4. **JWT Expiry**: No refresh token mechanism - once expired, user must re-login
5. **Liquibase Context**: Both `development` and `production` contexts run - avoid conditional schemas based on context
