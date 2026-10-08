# Maasin Dental Spa - Web Application

> **Clinic**: Maasin Dental Spa  
> **Lead Practitioner**: Dr. Alfred Roa III, DMD  
> **Location**: Ruperto K. Kangleon St, Maasin, 6600 Southern Leyte, Philippines  
> **Telephone**: (053) 570-8220  
> **Currency**: Philippine Peso (₱)

Full-featured clinical dental operating platform and patient portal built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**. Includes real-time appointment booking, interactive 32-tooth odontogram charting, digital intake with canvas signature, AI dental symptom triage (powered by Google Gemini), telehealth video suites, waitlist management, and billing in Philippine Peso (₱).

---

## 🚀 How to Run in Your GitHub Repo

Follow these steps to run this project locally, push it to your GitHub repository, and deploy it to GitHub Pages, Vercel, or Netlify.

### 1. Prerequisites

Ensure you have installed:
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Git**: Installed and configured on your machine
- **Package Manager**: `npm`, `yarn`, `pnpm`, or `bun`

---

### 2. Quick Start (Local Setup)

```bash
# 1. Clone your repository (or initialize a new git repo in this folder)
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# 2. Install dependencies
npm install

# 3. Create your environment file (optional for Gemini AI features)
cp .env.example .env.local

# 4. Start the local Vite development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

### 3. Pushing this Code to Your GitHub Repository

If you downloaded or exported this project and want to publish it to a new GitHub repository:

```bash
# Step 1: Initialize git in this directory
git init

# Step 2: Add all files
git add .

# Step 3: Create your first commit
git commit -m "feat: Initial commit for Maasin Dental Spa platform"

# Step 4: Rename the default branch to main
git branch -M main

# Step 5: Add your remote repository URL (created on github.com)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Step 6: Push your code to GitHub
git push -u origin main
```

---

### 4. Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts Vite dev server on port `3000` with instant hot reloading |
| **Production Build** | `npm run build` | Compiles TypeScript and builds optimized production bundles into `/dist` |
| **Preview** | `npm run preview` | Previews the production build locally |
| **Type Check / Lint** | `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) |
| **Clean** | `npm run clean` | Removes built `/dist` directory |

---

### 5. Environment Variables

Create a `.env.local` or `.env` file in the root directory:

```env
# Optional: Google Gemini API Key for AI Symptom Triage & Patient Explanations
# Get a free key at https://aistudio.google.com/
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

*(Note: The app includes robust offline/deterministic dental triage fallbacks, so it works out-of-the-box even without an API key).*

---

### 6. Free 1-Click Deployment Options

#### Option A: Vercel (Recommended)
1. Push your repo to GitHub.
2. Visit [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. Click **Deploy**. Vercel will build and give you a live production URL in ~1 minute.
6. *(Optional)* Add `VITE_GEMINI_API_KEY` under **Settings > Environment Variables**.

#### Option B: GitHub Pages
1. Install `gh-pages` if desired: `npm install -D gh-pages`
2. Add to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. In `vite.config.ts`, set `base: '/<your-repo-name>/'`.
4. Run:
   ```bash
   npm run deploy
   ```

#### Option C: Netlify
1. Connect your GitHub repository on [netlify.com](https://netlify.com).
2. Set Build command: `npm run build` and Publish directory: `dist`.
3. Click **Deploy Site**.

---

## 🏥 Key Features & Modules

- **Patient Portal & Booking**: Fast appointment reservation with real-time slot selection, SMS/Calendar (.ics) exports, and Philippine HMO options (Maxicare, Intellicare, Medicard, PhilHealth).
- **Interactive Odontogram Chart**: Visual 32-tooth dental arch with FDI/Universal numbering, color-coded restoration states (composite, crowns, endo, implants, extractions).
- **AI Symptom Triage**: Guided dental triage engine assessing urgency scores, ADA CDT code mapping, and palliative guidance.
- **Radiograph & X-Ray Viewer**: High-contrast periapical, bitewing, and panoramic viewer with zoom, pan, and negative inversion filters.
- **Treatment Plan Builder**: Multi-phased treatment plans with insurance calculations and Philippine Peso (₱) pricing.
- **Digital Intake & Consent**: Mobile-friendly medical history questionnaire with interactive canvas finger/stylus signature.
- **Telehealth Room**: Integrated video consultation room with live chat, camera preview, and symptom checklist.
- **Admin & Front Desk**: Waitlist management, recall cadences, operatory scheduling, and regulatory audit log compliance.

---

## 🏛️ Clinic Information

- **Facility**: Maasin Dental Spa
- **Dentist**: Dr. Alfred Roa III, DMD
- **Address**: Ruperto K. Kangleon St, Maasin, 6600 Southern Leyte
- **Contact**: (053) 570-8220
