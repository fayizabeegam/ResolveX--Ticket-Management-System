# ResolveX - Ticket Management System

Full-stack web application for managing support tickets with **role-based access** and **real-time notifications**.

---

## 🗂 Project Structure
RESOLVEX/
│
├── resolveX_backend/ # Django REST API backend
├── resolveX_frontend/ # React frontend


---

## 🚀 Features

- 🔐 JWT Authentication
- 👥 Role-based access: Admin, Manager, Team Lead, Employee, Client
- 🎫 Ticket creation, assignment, updates, and status management
- 🔔 Real-time notifications
- 📊 Dashboard with charts (Chart.js / Recharts)
- 📎 File uploads (AWS S3 / Local)
- ⚡ Asynchronous tasks with Celery + Redis

---

## 🛠 Tech Stack

**Backend:** Python, Django, Django REST Framework  
**Frontend:** React.js, Tailwind CSS  
**Database:** PostgreSQL  
**Async & Notifications:** Celery + Redis  
**Charts:** Chart.js / Recharts  

---

## ⚙️ Installation

### 1. Clone repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo

cd resolveX_backend
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt


