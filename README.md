# ResolveX – Smart Ticket Resolution System

ResolveX is a smart ticket resolution platform that enables clients to raise issues or service requests, and internal teams (Admin, Manager, Team Lead, Employees) to manage, assign, and resolve them efficiently. The system ensures smooth communication and a structured ticket lifecycle: Open → Assigned → In Progress → Closed.

---

## Table of Contents
- [Features](#features)
- [System Modules](#system-modules)
- [Ticket Lifecycle](#ticket-lifecycle)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)


---

## Features
- Role-based access: Admin, Manager, Team Lead, Employee, Client
- Department-wise ticket routing and management
- Ticket creation, assignment, comments, attachments
- Status updates: Open / Assigned / In Progress / Closed / Reopen
- Notifications for ticket activities
- Dashboard with stats and charts (weekly trends, department breakdown, employee leaderboard)
- Export ticket reports (CSV/PDF)
- JWT-based authentication and secure access

---

## System Modules

### 1. Admin Module
- Department Management (Create/Edit/Delete, view users & tickets)
- User Management (Register users, assign roles/departments, block/activate, permissions)
- Ticket Management (Full control over all tickets)
- Dashboard & Charts
- Notifications
- Profile management

### 2. Client Module
- Register/Login
- Create/Edit/Delete own tickets
- View ticket status & history
- Dashboard & weekly trends chart
- Notifications for own tickets
- Profile management

### 3. Manager Module
- Department oversight & ticket assignment
- Create/Edit/Delete own tickets
- Filter tickets by department, priority, status
- Dashboard with stats, charts & employee leaderboard
- Notifications for all tickets in departments

### 4. Team Lead Module
- Manage department operations & assign tickets to employees
- Dashboard with department-specific stats
- Filter & manage department tickets
- Notifications for department tickets
- Profile management

### 5. Employee Module
- Work on assigned tickets only
- Close/Reopen assigned tickets
- Dashboard with assigned ticket stats
- Notifications for assigned tickets
- Profile management

### 6. Ticket Management Module (Core)
- Ticket creation, routing, assignment
- Comments & attachments
- Status management & ticket history
- Department-wise visibility

### 7. Notification Module
- Alerts on ticket creation, assignment, updates, completion
- In-app notifications
- Avoid duplicate and self-notifications

### 8. Dashboard & Reporting Module
- Ticket stats by status & department
- Employee performance leaderboard
- Overdue tickets tracking
- Export reports (CSV / PDF)

### 9. Authentication & User Management
- Registration/Login (Client & Staff)
- JWT-based authentication
- Password encryption & reset (via Mailtrap)
- Role-based access control
- Profile management

---

## Ticket Lifecycle

- Open → Assigned → In Progress → Closed → Reopen


---

## Technology Stack
- **Backend:** Python, Django, Django REST Framework
- **Frontend:** React.js, Tailwind CSS
- **Database:** MySQL
- **Authentication:** JWT
- **Notifications:** Celery + Redis
- **Charts:** Chart.js / Recharts
- **Deployment:** AWS / Render / Heroku

---

## Installation
1. **Clone the repository**
```bash
git clone https://github.com/<your-username>/ResolveX.git
cd ResolveX

```
2. ** Setup Backend

```bash
cd resolveX_backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

```
```bash
3. ** Setup Frontend

cd resolveX_frontend
npm install
npm start
```

## Access 

-Client login: /login/
-Staff login (Admin, Manager, Team Lead, Employee): /staff-login/

## Usage

-Register users (Admin for staff, self-registration for clients)
-Create departments and assign users
=Raise tickets (Clients or Staff)
-Assign tickets (Managers/Team Leads)
-Track ticket status & history
-Receive notifications
-View dashboards and export reports