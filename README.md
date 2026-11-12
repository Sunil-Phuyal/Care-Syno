# CareSyno


A medication management system built to help families coordinate care for elderly or physically unable loved ones.

**Live demo:** https://care-syno.vercel.app

**API:** https://care-syno.onrender.com

The demo runs on free hosting, so if it has been idle the first page can take about a minute to respond while the server wakes up.

## Problem Statement

When multiple family members care for elderly grandparents or individuals who cannot manage medications independently, critical communication gaps can occur:

* **Medication Overdose Risk**: One caregiver administers medicine, but another caregiver, unaware of this, administers it again
* **Missed Doses**: Confusion about who was responsible for giving medication
* **Lack of Coordination**: No central system to track caregiving activities across multiple family members
* **Communication Barriers**: Family members using different schedules and methods to coordinate care

## Solution

CareSyno provides a shared caregiving platform where family members work from the same medication schedule, record every dose that is given, and are warned before a dose is repeated or logged at the wrong time.

## Key Features

### Medication management
- **Medicine schedules** per patient, including several patients under one account
- **Reminder emails** 30 minutes before a dose, 5 minutes before, and when it is due, plus optional browser notifications
- **Dose log**: record a dose as given or skipped, with the time and the name of the caregiver who gave it
- **Adherence reports** that can be printed for a doctor visit

### Safety checks
- **Duplicate dose warning** when a dose that was already given is logged again
- **Time-window validation**: a dose cannot be logged more than 5 minutes before or 10 minutes after its scheduled time
- **Alerts** for upcoming, overdue and missed doses
- **Activity log** showing who did what and when
- **Emergency contact** name and phone stored on each patient profile

### Caregivers and access
- Invite family members and helpers by email
- Primary and secondary caregivers, with permissions chosen per person (for example view, edit, invite)
- Multiple caregivers can work on the same patient profile
- Light and dark mode, responsive layout for phones

## Tech Stack

**Backend:** Java 17, Spring Boot, Spring Security with JWT, PostgreSQL

**Frontend:** React 19, Vite, Tailwind CSS, React Router, TanStack Query, Axios

**Hosting:** Vercel (frontend), Render with Docker (backend), Neon (PostgreSQL)

**Services:** Brevo SMTP for email (port 2525), ImageKit for patient photos

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 20.19 or higher
- PostgreSQL

### Database

```sql
CREATE DATABASE caresync;
```

Then run the SQL files in `CareSyncBE/src/main/resources/db/schema/` in numeric order. The tables are not created automatically.

### Backend Setup

```bash
git clone https://github.com/Sunil-Phuyal/Care-Sync.git
cd Care-Sync/CareSyncBE
```

Put your real settings (database, JWT, email, ImageKit) in
`src/main/resources/application-local.properties`. This file is ignored by git and must never be committed.
`application.properties` contains only `${PLACEHOLDER}` values.

```bash
./mvnw clean install
./mvnw spring-boot:run
```

The backend listens on port 9878.

### Frontend Setup

```bash
cd CareSyncFE
npm install
npm run dev
```

The app opens at http://localhost:5173 and talks to `http://localhost:9878/api/v1` (set in `.env.development`).
For a production build, run `npm run build`.

## Configuration

In production (`SPRING_PROFILES_ACTIVE=prod`) the backend reads these environment variables:

- Database: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DB_POOL_MAX`, `DB_POOL_MIN_IDLE`, `DB_IDLE_TIMEOUT_MS`
- Security: `JWT_SECRET`, `JWT_ENCRYPTION_KEY`, `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`
- Email: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `EMAIL_FROM`, `EMAIL_FROM_NAME`
- Images: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- URLs and CORS: `APP_FRONTEND_URL`, `APP_BACKEND_URL`, `CORS_ALLOWED_ORIGINS`, `RESET_LINK_FORGOT_BASE_URL`, `RESET_LINK_INVITE_BASE_URL`

The frontend uses `VITE_API_BASE_URL` (the backend address ending in `/api/v1`) and `VITE_APP_NAME` in `.env.production` and `.env.development`.

## Usage Guide

### Setting Up a Patient Profile
1. Primary caregiver creates an account
2. Add patient information (name, age, medical conditions, emergency contact)
3. Set up the medication schedule
4. Invite other family members as caregivers

### Adding Caregivers
1. Open the Caregivers section
2. Send an invitation by email
3. The family member accepts the invitation and sets a password
4. Choose what that caregiver is allowed to do

### Recording Medication Administration
1. The caregiver receives a reminder at the scheduled time
2. Open the dose log, choose the scheduled medicine and record it as given
3. The system saves the time and who gave it
4. A warning appears if the same dose was already given or the time is outside the allowed window

## Deployment Notes

- **Frontend (Vercel):** deploys from the `dev_deploy` branch. `vercel.json` rewrites every path to `index.html` so refreshing works.
- **Backend (Render):** built from `CareSyncBE/Dockerfile`. It accepts requests only from the origin in `CORS_ALLOWED_ORIGINS`.
- **Email:** Render's free plan blocks port 587, so Brevo is used on port 2525.

## Security

- HTTPS between the browser, the frontend host and the API
- JWT authentication
- Role-based access with per-caregiver permissions
- Activity log of who recorded which dose
- Secrets are kept out of the repository and supplied through environment variables

## Planned

Ideas that are not built yet: a simplified interface for patients, medication interaction alerts, a shared calendar with task assignment, and quick access to emergency contacts.

## Contact

For questions or support, please contact: sunilphuyal954@gmail.com

---

**Note:** This is a Final Year Project developed to address real-world caregiving challenges. It is not intended for production medical use without proper certification and testing.
