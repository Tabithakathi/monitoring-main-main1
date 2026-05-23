# Website Monitoring System & SRE Console Dashboard

A comprehensive, real-time SRE website auditing and auto-remediation console. Monitors website performance, SEO health, UI/UX consistency, server logs, security standards, and WordPress cores. 

Includes interactive control mechanisms, simulated edge-latency nodes (US-East, SG-Central, IN-West, EU-Central), database connectivity tracking, and instant mock auto-remedial triggers.

---

## 🚀 Quick Start Guide

This project consists of a **Django Backend API** (running on port `8000`) and a **React Frontend SPA** (running on port `3000`).

To run the application, follow the platform-specific instructions below.

---

### 💻 macOS & Linux (Unix Platforms)

#### Prerequisites
Ensure you have **Python 3.8+** and **Node.js 14+** (with npm) installed.

#### Step 1: Initialize the Environment & Install Dependencies
Open your terminal and run:
```bash
# 1. Create a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Setup Django database migrations
python manage.py migrate

# 4. Install React frontend dependencies
cd frontend
npm install
cd ..
```

#### Step 2: Start the Servers
You can launch both servers simultaneously in the background or run them in separate terminal sessions:

* **Session 1 (Django Backend):**
  ```bash
  source venv/bin/activate
  python manage.py runserver
  ```
* **Session 2 (React Frontend):**
  ```bash
  cd frontend
  npm start
  ```

Once both are started, navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### 🔌 Windows (Powershell / Command Prompt)

#### Prerequisites
Ensure you have **Python 3** and **Node.js** added to your system environment variables (`PATH`).

#### Step 1: Setup and Dependency Installation
Open command prompt or PowerShell inside the project directory:
```powershell
# 1. Create Python Virtual environment
python -m venv venv
venv\Scripts\activate

# 2. Install python packages
pip install -r requirements.txt

# 3. Migrate DB
python manage.py migrate

# 4. Install frontend npm modules
cd frontend
npm install
cd ..
```

#### Step 2: Run servers
* **Terminal 1 (Backend):**
  ```powershell
  venv\Scripts\activate
  python manage.py runserver
  ```
* **Terminal 2 (Frontend):**
  ```powershell
  cd frontend
  npm start
  ```

---

## 🛠️ Project Structure Details

*   **`frontend/`**: Contains React components, routing layouts, and custom dark/light theme stylesheet `App.css`.
*   **`monitor/`**: Django application code.
    *   `services/`: Auditing core engines (e.g. SEO validation, image analysis, UI consistency check, SSL validator, WordPress scanner).
    *   `views.py`: Controls standard and quick inspection threads.
*   **`webmonitor/`**: Django main project configurations.
*   **`db.sqlite3`**: Core application storage containing history logs.

---

## 💡 Troubleshooting & Notes
*   **Proxy/CORS Problems**: The React `package.json` contains a proxy setting configured to route API queries directly to `http://127.0.0.1:8000`. Keep this in mind when hosting the backend on custom ports.
*   **Missing System Libraries (Linux)**: OpenCV (`opencv-python-headless`) is bundled to perform image comparisons without requiring UI server dependencies. This avoids dependency errors in headless Docker/Linux instances.
