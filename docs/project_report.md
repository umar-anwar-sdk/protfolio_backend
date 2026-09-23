# Portfolio Project Documentation Report

## Executive Summary
This project is a full-stack portfolio application composed of a Django REST API backend and a React + Tailwind frontend. The backend manages portfolio content, projects, admin authentication, contact management, and visitor tracking. The frontend renders the public portfolio and a protected admin dashboard used to manage content.

## Project Architecture

### Backend
- Framework: Django + Django REST Framework
- Database: SQLite by default for local development; PostgreSQL-ready settings are supported when DATABASE_URL is configured
- Media and static files: served from project-local directories via Django settings
- Authentication: JWT-based admin auth using SimpleJWT
- Apps:
  - apps.portfolio: profile, hero, skills, social links, experiences, education, testimonials, CV downloads
  - apps.projects: project collection, technologies, project images, sections
  - apps.contact: public contact info and messages
  - apps.accounts: admin login and identity endpoints
  - apps.visitors: endpoint and model tracking for visitor analytics

### Frontend
- Framework: React + Vite
- Styling: Tailwind CSS
- Main sections: Hero, About, Experience, Projects, Testimonials, Contact
- Admin dashboard: protected routes and section management pages with message and contact info management

## Relevant Implementation Files
- Backend settings: config/settings.py
- API routing: config/urls.py
- Portfolio APIs: apps/portfolio/urls.py, apps/portfolio/views.py, apps/portfolio/admin_views.py
- Projects APIs: apps/projects/urls.py, apps/projects/views.py
- Contact APIs: apps/contact/models.py, apps/contact/views.py, apps/contact/serializers.py
- Admin frontend: frontend/src/pages/AdminDashboardPage.jsx, frontend/src/pages/AdminSectionPage.jsx
- Public frontend: frontend/src/sections/Hero.jsx, frontend/src/pages/ProjectsPage.jsx, frontend/src/pages/ProjectDetailPage.jsx
- API client: frontend/src/api/client.js

## Completed Admin Enhancements
### Messages Inbox
The admin dashboard includes a dedicated messages section that:
- fetches contact submissions from the backend
- supports searching and selecting conversations
- marks messages as read/unread
- updates status values and deletes messages
- renders sender details, subject, content, and timestamps

### Contact Information Management
The admin dashboard includes a dedicated contact information form that:
- loads the single active contact record
- validates required values and email format
- creates or updates the record via the admin API
- toggles active/inactive visibility

These were implemented without introducing extra architectural layers, reusing the existing models and API patterns already present in the backend.

## Media Persistence Fix
A root-cause investigation showed that the project media and static roots were pointing to temporary directories. The issue was not caused by front-end rendering or serializer logic.

### Verified fix
In config/settings.py, the application uses persistent project-local storage:
- STATIC_ROOT = BASE_DIR / 'staticfiles'
- MEDIA_ROOT = BASE_DIR / 'media'

This prevents uploaded files and project images from disappearing after a machine or application restart.

## Validation Evidence
The following checks were performed successfully:
- Django system check: passed
- Django test suite: 31 tests passed
- Frontend production build: succeeded
- Live API check for the portfolio profile endpoint: returned valid data and asset URLs
- Media files were confirmed to resolve from project-local storage rather than temporary folders

## Contact Form Verification
A live HTTP request was sent to the backend contact endpoint using the application running locally. The server responded with:
- Status: 500
- Detail: "Message saved successfully, but the email notification could not be sent."
- Error: SMTP authentication required for the configured Gmail account

This confirms the message storage path is working, while the actual email delivery is blocked by the SMTP credentials configuration. The message is saved successfully, but the notification mail fails because the configured sender account is not authenticated in the current environment.

## Current Status
- Backend architecture and admin dashboard features are in place.
- Media persistence issue was fixed by switching to project-local storage paths.
- Contact message submission works up to email dispatch, but actual outbound email sending requires valid SMTP credentials in the environment.
- Frontend and backend validation passed in the current environment.

## File Artifact
This report is generated from the verified project state and live checks performed during validation.
