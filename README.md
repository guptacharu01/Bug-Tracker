# Bug Tracker

A simple issue tracker like Jira. Teams can make projects, add team members, create bugs and tasks, assign them to developers, move them on a Kanban board, and discuss them in comments.

## Tech stack

- Frontend: React 18 + Vite, Tailwind CSS, dnd-kit, Axios, React Router
- Backend: Java 17, Spring Boot 3.2.5, Spring Security + JWT, Hibernate/JPA
- Database: MySQL 8
- Docs: Swagger at http://localhost:8080/swagger-ui.html

## Roles

- Admin: manages users and everything
- Manager: creates projects, adds members, creates and assigns issues
- Developer: sees assigned issues, updates status, adds comments

## How to run (Windows)

You need Java 17, Node.js, MySQL, and Docker Desktop.

1. Start MySQL with Docker:
   ```powershell
   cd C:\Users\kgkes\Downloads\Bug-Tracker
   docker compose up -d db
   ```
   This makes a database called `bugtracker` (user `root`, password `root`).

2. Run the backend:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```
   It runs on http://localhost:8080.

3. Run the frontend (new PowerShell window):
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173.

Or run everything with Docker: `docker compose up --build`

## Demo accounts

These are made automatically the first time the backend starts:

- Admin: admin@bugtracker.com / admin123
- Manager: manager@bugtracker.com / manager123
- Developer: dev@bugtracker.com / dev123

Please change these passwords after you log in the first time.

## Deployment (short notes)

- Backend on Render: Runtime Docker, Root Directory `backend`. Set env vars `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (use a hosted MySQL), `JWT_SECRET` (long random secret), `CORS_ALLOWED_ORIGINS` (your Vercel URL).
- Frontend on Vercel: Root Directory `frontend`. Set `VITE_API_URL` to `https://<your-render-url>/api`.
- After deploying, log in and check that registration and the Kanban board work.
