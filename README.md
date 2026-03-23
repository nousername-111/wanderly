# 🌍 Wanderly — AI-Powered Travel Planner

> "Plan smarter. Travel better."

Wanderly is a full-stack web application that helps users plan personalized trips using AI. It generates complete itineraries, budget breakdowns, and insider tips based on your preferences.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Frontend (root)
npm install

# Backend
cd backend && npm install
```

### 2. Configure Environment Variables

**Frontend** — create `.env` in root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend** — copy `backend/.env.example` to `backend/.env`:
```
PORT=5000
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### 3. Set Up Supabase Database

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Run the contents of `SUPABASE_SCHEMA.sql`
4. Copy your **Project URL** and **anon key** from Settings → API

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🗂️ Project Structure

```
wanderly/
├── backend/
│   ├── routes/
│   │   ├── ai.js          # AI recommendation engine
│   │   └── auth.js        # Profile & trip management
│   ├── data/
│   │   └── destinations.js # Travel destinations dataset
│   └── server.js          # Express entry point
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── data/
│   │   └── destinations.js # Frontend destination data
│   ├── pages/
│   │   ├── Home.jsx        # Landing page
│   │   ├── Auth.jsx        # Login / Signup
│   │   ├── Dashboard.jsx   # User dashboard & profile
│   │   ├── TripBuilder.jsx # AI trip input form
│   │   ├── Recommendation.jsx # AI result display
│   │   ├── MyTrips.jsx     # Saved trips
│   │   └── History.jsx     # Trip history timeline
│   ├── App.jsx             # Router + Auth context
│   └── supabaseClient.js   # Supabase client
└── SUPABASE_SCHEMA.sql     # Database schema
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Email/password signup with email verification |
| 👤 Profile | Name, email, phone — persisted to Supabase |
| 🤖 AI Planner | GPT-powered itinerary + budget + tips |
| 💾 Save Trips | Store plans to PostgreSQL via Supabase |
| 📋 History | Timeline view of all planned trips |
| 🎨 UI | Dark glassmorphism with orange branding |

---

## 🔑 API Endpoints

### AI Routes
```
POST /api/ai/recommend   — Generate travel plan
GET  /api/ai/destinations — List destinations
```

### Auth / Trip Routes
```
GET    /api/auth/profile/:userId    — Get user profile
PUT    /api/auth/profile/:userId    — Update profile
GET    /api/auth/trips/:userId      — Get user trips
POST   /api/auth/trips              — Save a trip
DELETE /api/auth/trips/:tripId      — Delete a trip
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6
- **Backend**: Node.js, Express 4
- **Database & Auth**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-3.5 Turbo
- **Fonts**: Playfair Display, DM Sans
