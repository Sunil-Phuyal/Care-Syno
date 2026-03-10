# CareSync 

A medication management system built to help families coordinate care for elderly or physically unable loved ones.

##  Problem Statement

When multiple family members care for elderly grandparents or individuals who cannot manage medications independently, critical communication gaps can occur:

* **Medication Overdose Risk**: One caregiver administers medicine, but another caregiver, unaware of this, administers it again
* **Missed Doses**: Confusion about who was responsible for giving medication
* **Lack of Coordination**: No central system to track caregiving activities across multiple family members
* **Communication Barriers**: Family members using different schedules and methods to coordinate care

##  Solution

CareSync provides a shared caregiving platform that enables family members to coordinate care activities, track medication administration, and prevent dangerous errors through real-time updates and intelligent alerts.

##  Key Features

### For Patients
- Simple, non-technical interface designed for elderly users
- Large, clear buttons and readable text
- Minimal complexity for easy interaction

### For Caregivers
- **Medication Reminders**: Automated notifications for scheduled medication times
- **Activity Logging**: Complete history of who administered what medication and when
- **Real-time Notifications**: All family members receive updates when medications are given
- **Confirmation System**: One-click "medication given" button with timestamp
- **Overdose Prevention**: Smart alerts when duplicate medication attempts are detected
- **Task Coordination**: Shared calendar and task assignment for caregiving duties
- **Multi-caregiver Access**: Multiple family members can access and manage the same patient profile

### Safety Features
- Duplicate dose detection and warnings
- Medication interaction alerts
- Time-window validation (too early/too late warnings)
- Emergency contact quick access
- Activity audit trail for medical professionals

##  Tech Stack

**Backend:**
- Spring Boot
- PostgreSQL
- Spring Security with JWT

**Frontend:**
- React
- Tailwind CSS

##  Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Sunil-Phuyal/Care-Sync.git
cd Care-Sync/CareSyncBE

# Configure database credentials in application.properties
# Then build and run:
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd CareSyncFE

# Install dependencies
npm install

# Start development server
npm start
```

### Database Configuration

```sql
-- Create database
CREATE DATABASE caresync;

-- Tables will be auto-created on first run
```

##  Usage Guide

### Setting Up a Patient Profile
1. Primary caregiver creates an account
2. Add patient information (name, age, medical conditions)
3. Set up medication schedule
4. Invite other family members as caregivers

### Adding Caregivers
1. Go to Settings → Manage Caregivers
2. Send invitation via email
3. Family members accept invitation and gain access
4. Assign roles and permissions

### Recording Medication Administration
1. System sends reminder at scheduled time
2. Caregiver clicks "Give Medication" button
3. Confirms medication and dosage
4. System logs the action and notifies all caregivers
5. Smart alerts prevent duplicate doses

##  Security

- Encrypted data transmission (HTTPS)
- Secure authentication with JWT tokens
- Role-based access control
- Audit logging for all critical actions
- Secure password policies

##  Contact

For questions or support, please contact: sunilphuyal954@gmail.com

---

**Note:** This is a Final Year Project developed to address real-world caregiving challenges. It is not intended for production medical use without proper certification and testing.
