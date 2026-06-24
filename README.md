# HungerBridge — Bridging the Gap Between Surplus Food & Empty Stomachs

> **An AI-powered food donation and logistics platform connecting Food Donors, NGOs, and Volunteers to reduce food waste and fight hunger.**

**Live Demo:**  
**https://hunger-bridge-kappa.vercel.app/**

---

# Project Overview

Millions of people sleep hungry while tons of perfectly edible food are wasted every day.

**HungerBridge** solves this problem by creating an intelligent ecosystem where:

- Food Donors can instantly list surplus food
- AI automatically analyzes food images
- NGOs can claim donations and generate campaigns
- Volunteers can deliver food before it expires

Our goal is to build a **Zero Hunger, Zero Food Waste** future using modern technology and AI.

---

# Standout Features

## AI-Powered Food Analysis

Simply upload a food image and our **Google Gemini Flash Vision Model** automatically:

- Detects food type
- Estimates quantity
- Suggests the most appropriate food source
- Reduces manual data entry

---

## AI Campaign Studio

NGOs can generate high-conversion social media campaigns in **one click**.

Powered by **Google Gemini Flash**, it creates:

- Emotional campaign descriptions
- Ready-to-share awareness posts
- Instant fundraising appeals

---

## Real-Time NGO Dashboard

Modern SaaS-inspired dashboard featuring:

- Live Donation Feed
- Active Campaign Tracking
- Meals Served Statistics
- Volunteer Activity
- Interactive Analytics

---

## Email Notification for Otp and Alerts for key events: donation accepted, volunteer assigned, delivery completed

- Donor receives email when food is accepted by NGO
- NGO receives email when volunteer is assigned
- NGO can mark if the food is accepted
- Donor recieves email when food is recieved by the NGO

---

## Secure Role-Based Authentication

Different experiences for:

- Donors
- NGOs
- Volunteers

Also it has the dark mode toggle to view the project in dark mode

Built using **NextAuth.js**, **Zod Validation**, and **BcryptJS**.

---

## Graceful AI Fallback System

If the AI endpoint is unavailable or rate-limited:

- Automatic fallback responses
- Zero downtime
- Smooth demo experience
- Production-friendly architecture

---

# Tech Stack

| Category              | Technologies                   |
| --------------------- | ------------------------------ |
| **Framework**         | Next.js 16 (App Router)        |
| **Language**          | TypeScript                     |
| **Frontend**          | React, Tailwind CSS, Shadcn UI |
| **Icons**             | Lucide React                   |
| **Backend**           | Next.js API Routes             |
| **Database**          | MongoDB + Mongoose             |
| **Authentication**    | NextAuth.js                    |
| **Validation**        | Zod                            |
| **Password Security** | BcryptJS                       |
| **Email Service**     | Nodemailer                     |
| **AI Integration**    | Google Gemini Flash            |

---

# Setup Instructions

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yashpandeycodes/HungerBridge.git

cd HungerBridge
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a **`.env.local`** file in the root directory.

```env
MONGODB_URI=your_mongodb_connection_string

NEXTAUTH_SECRET=your_super_secret_key

NEXTAUTH_URL=http://localhost:3000

GEMINI_API_KEY=your_google_gemini_api_key

SMTP_USER=your_email

SMTP_PASS=your_email_app_password
```

---

## 4️⃣ Run the Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

in your browser.

---

# Core Workflow

```
Food Donor
      │
      ▼
Upload Food Image
      │
      ▼
Gemini AI Analysis
      │
      ▼
Donation Listed
      │
      ▼
NGO Claims Donation
      │
      ▼
AI Generates Campaign
      │
      ▼
Volunteer Picks Up Food
      │
      ▼
Food Reaches People In Need
```

---

# Vision

Technology should serve humanity.

**HungerBridge** demonstrates how AI can solve real-world social challenges by reducing food waste and improving food accessibility through intelligent automation.

Together, we can build a future with:

- Zero Food Waste
- Zero Hunger
- Stronger Communities

---

# Developed For

**Hackathon Submission**

---
