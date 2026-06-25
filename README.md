# HungerBridge — Bridging the Gap Between Surplus Food & Empty Stomachs

> **An AI-powered food donation and logistics platform connecting Food Donors, NGOs, and Volunteers to reduce food waste and fight hunger.**

**Live Demo:**  
**https://hunger-bridge-kappa.vercel.app/**

---

# Project Purpose

We live in a world of stark contrast. Every single day, massive amounts of perfectly edible, nutrient-rich food from restaurants, weddings, and households are thrown into landfills. Yet, just a few miles away, millions of people go to sleep on an empty stomach.

Why does this happen?
The core problem isn't a lack of empathy; it's a lack of real-time logistics. Food is highly perishable. The manual friction of finding a willing NGO, coordinating a volunteer, and arranging a pickup takes too long. By the time the logistics are figured out, the food has already expired.

HungerBridge is built to eliminate this friction. We are transforming food rescue from a slow, manual chore into a hyper-efficient, community-driven ecosystem powered by AI.

Our platform bridges the gap between surplus and scarcity in real-time:

For Donors (Zero Friction): Instantly list surplus food. Our AI Vision Model automatically categorizes the food, estimates servings, and flags urgent items, taking the hassle out of donating.

For NGOs (Actionable Impact): Claim nearby donations instantly and use our AI Campaign Studio to generate powerful awareness and fundraising drives in a single click.

For Volunteers (Gamified Logistics): An "open-board" system to claim delivery missions, track live progress, and earn Karma points for saving meals before they spoil.

By replacing logistical chaos with a streamlined, GenAI-powered platform, HungerBridge ensures that surplus food reaches hungry stomachs, not garbage bins.

Our mission is simple: Zero Hunger, Zero Food Waste.

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
| **Deployment**        | Vercel                         |

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

## AI Trust Scoring & Fraud Detection

Ensures platform integrity and safety by automatically analyzing incoming donations.

- AI-assigned "Trust Score" for every listing
- Highlights high-risk or suspicious donation patterns
- Visual "AI Verified" badges to help NGOs accept safe food
- Maintains high quality control across the platform

---

## AI Predictive Demand Forecast

Empowers NGOs to be proactive rather than reactive using data analysis.

- Predicts high-demand periods for food collection
- Suggests optimal days and times to run campaigns
- Helps NGOs prepare volunteer capacity in advance
- Powered by real-time contextual data analysis

---

## Smart Auto-Urgency Flagging

Prioritizes critical food rescues to completely eliminate food spoilage

- Automatically detects if the food expiry time is within 4 hours
- Instantly flags the donation as "Urgent" with high-visibility UI
- Real-time toast notifications for donors
- Manual toggle override available for extreme emergencies

---

## Volunteer Gamification & Dynamic Leaderboard

Keeps the community engaged and highly motivated to rescue more food.

- Volunteers earn "Karma Points" for every successful delivery
- Real-time dynamic leaderboard showing top contributors
- Clear visual status indicators (Pending vs. Completed missions)
- "Uber/Ola" style open-board claiming system for instant task assignment

---

## Live Progress Tracking & Viral Certificates

Delivers a "Swiggy-style" real-time experience to donors to build trust.

- Live donation lifecycle timeline (Pending ➔ Assigned ➔ Completed)
- 1-click downloadable high-quality "Impact Certificate"
- Powered by html-to-image for instant generation
- Encourages social sharing and creates viral loops for the platform

---

## Enterprise-Level Session Security

Ensures accounts and sensitive NGO/Donor data remain secure on shared devices.

- Intelligent client-side 15-minute inactivity auto-logout
- Custom DOM event listeners to track active usage seamlessly
- Complements the robust OTP-based and Role-Based Authentication
- Auto-redirects to login with a grace period notification

---

## Graceful AI Fallback System

If the AI endpoint is unavailable or rate-limited:

- Automatic fallback responses
- Zero downtime
- Smooth demo experience
- Production-friendly architecture

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
