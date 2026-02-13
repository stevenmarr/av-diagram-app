# AV Diagram App

Web app for creating AV system diagrams (audio/video signal flow, connections, cable lengths, systems/sub-graphs) using React Flow.

**Repo**: https://github.com/stevenmarr/av-diagram-app  
**Backend**: Flask + SQLAlchemy + PostgreSQL  
**Frontend**: React + Vite + React Flow  
**Target server**: Ubuntu 22.04 LTS  
**IDE**: PyCharm recommended

## Quick Start – Get It Running

On a fresh Ubuntu 22.04 machine (local VM or server):

```bash
# 1. Install Docker + git
sudo apt update
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker $USER
# log out and back in (or new terminal)

# 2. Clone the project
git clone https://github.com/stevenmarr/av-diagram-app.git
cd av-diagram-app

# 3. Create minimal .env file
cat > .env << 'EOF'
SECRET_KEY=replace-this-with-a-very-long-random-string-min-64-chars
FLASK_ENV=development
DATABASE_URL=postgresql://postgres:postgres@db:5432/avdiagram
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=avdiagram
EOF

# 4. Start everything
docker compose up -d --build
Wait ~30–90 seconds for containers to be ready.
Bash# 5. Apply database migrations (run once or after model changes)
docker compose exec backend alembic upgrade head

# 6. Create default superadmin user (run once)
docker compose exec backend python create_superadmin.py
# Default login:
#   username: superadmin
#   password: superadmin123
#   → CHANGE THIS IMMEDIATELY after first login
Open in browser:

Frontend / canvas → http://localhost:3000
Backend API base → http://localhost:5000

Stop: docker compose down
Development Basics
Bash# Run backend tests
docker compose exec backend pytest --cov=app

# Run frontend tests
cd frontend
npm test

Use feature branches: git checkout -b feature/sprint-1-master-data
Conventional commits: feat:, fix:, chore:, refactor:, test:, docs:
Protected main → merge via pull request only

Current Status (Feb 2026)

Docker + Flask + React + React Flow skeleton running
Basic authentication (Flask-Login)
Alembic migrations configured
Models split: user.py (auth) + master.py (everything else)
Early work on master data endpoints and context menus

Most sprint 1–6 features (sync, graphs, systems, connections, cable lengths, tables, org branding) are still to be implemented.
See sprints.pdf for full planned roadmap.
Questions → open an issue.