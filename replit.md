# ChemViz - Chemical Equipment Parameter Visualizer

## Overview
A web application for uploading, analyzing, and visualizing chemical equipment data from CSV files. Users can view interactive charts, summary statistics, and download PDF reports.

## Current State
- Fully functional web application with authentication, CSV upload, data analytics, and PDF report generation
- Last updated: February 2026

## Architecture
- **Backend**: Python Flask + Flask-SQLAlchemy + PostgreSQL
- **Frontend**: React.js + Vite + Chart.js (built into `client/dist/`, served by Flask)
- **Auth**: Replit Auth (OpenID Connect via flask-dance)
- **Database**: PostgreSQL (Replit managed)

## Project Structure
```
/
├── main.py                  # Entry point
├── app.py                   # Flask app config, DB setup
├── models.py                # User, OAuth, Dataset, EquipmentData models
├── routes.py                # API routes + auth integration
├── replit_auth.py           # Replit Auth (OIDC) integration
├── sample_equipment_data.csv # Demo data file
├── client/                  # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app with auth state
│   │   ├── components/      # LandingPage, Dashboard, FileUpload, DatasetView, HistoryPanel
│   │   └── styles/          # CSS modules per component
│   ├── vite.config.js       # Vite config with proxy for dev
│   └── dist/                # Built frontend (served by Flask)
```

## Key API Endpoints
- `GET /api/auth/status` - Check authentication
- `POST /api/upload` - Upload CSV file
- `GET /api/datasets` - List user's datasets (last 5)
- `GET /api/datasets/<id>` - Get dataset with equipment details
- `DELETE /api/datasets/<id>/delete` - Delete a dataset
- `GET /api/datasets/<id>/report` - Download PDF report

## Development Workflow
1. Frontend dev: `cd client && npm run dev` (proxies API to Flask)
2. Backend: `python main.py`
3. Build frontend: `cd client && npm run build`
4. Production: `gunicorn --bind=0.0.0.0:5000 main:app`

## User Preferences
- Industrial dark theme with Rajdhani/Outfit/JetBrains Mono fonts
- Orange accent color scheme on dark navy background
