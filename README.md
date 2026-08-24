# ClassSec — Gujarat GSEB School ERP & Governance System

> **Bilingual (English & ગુજરાતી) Enterprise Management Platform for K-12 Self-Financed Institutions in Gujarat**

![ClassSec Banner](https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=80)

---

## 📌 Overview

**ClassSec** is a state-aligned, full-featured Educational Resource Planning (ERP) and campus governance system tailored specifically for private, self-financed schools under the **Gujarat Secondary and Higher Secondary Education Board (GSEB)**. 

Engineered with dual-language fluency (**English & ગુજરાતી**) and compliance with **UDISE+ and Gujarat Education Department** standards, ClassSec bridges campus administration, academic operations, state grading schemas, fee management with instant QR receipts, and role-gated portals.

---

## ✨ Key Features

### 🏛️ 1. GSEB Compliance & Statutory Documentation
- **General Register (G.R. Book)**: Digital General Register with immutable G.R. numbers, UDISE+ student IDs, Aadhaar Dise validation, caste/category tracking, and automated roll allocation.
- **School Leaving Certificate (L.C. / T.C.)**: One-click generation of official bilingual Leaving Certificates with GSEB watermark, conduct remarks, progress assessments, and print-ready layouts.
- **Gujarat State Board Grading**: Full support for **Ekam Kasoti (એકમ કસોટી)**, **Periodic Assessment Tests (PAT)**, Pratham Pariksha (Semester 1), and Varshik Pariksha (Annual Exam) with 8-point GSEB grading scales (A1 to E2).

### 💳 2. Multi-Campus Fee Counter & Accounts
- **Dynamic Fee Structures**: Manage Tuition, Lab, Computer, Term, and Transport fees by grade level.
- **Instant UPI QR & Receipts**: Real-time payment collection with BharatQR/UPI integration, receipt numbering (`REC-2026-XXXX`), printable thermal/A4 vouchers, and fee clearance certificates.
- **Defaulter Tracking**: Real-time dues tracking and SMS/WhatsApp alert dispatch for outstanding balances.

### 👥 3. Multi-Role Institutional Portals
- **👑 Trustee / Super Admin**: Multi-campus overview across Rajkot, Junagadh, and Keshod campuses; revenue analytics; institutional audit logs.
- **🛡️ Principal**: Staff oversight, timetable management, admission approvals, circulars, and board registration.
- **📚 Class Teacher (વર્ગ શિક્ષક)**: Daily attendance register (હાજરી પત્રક), marks entry for Ekam Kasoti, remarks, and homework broadcast.
- **🎓 Student**: Academic report cards, download L.C., timetable view, homework tracker, and attendance summary.
- **👨‍👩‍👧 Parent (વાલીશ્રી)**: Child performance tracking, online fee payment, bus transport tracker, and direct messaging with teachers.

### 🌐 4. Full Bilingual Experience (English & ગુજરાતી)
- Instant, non-reloading toggle between **English** and **ગુજરાતી**.
- Proper Gujarati typography (લૉગિન, હાજરી, પરીક્ષા પરિણામ, ફી રસીદ, સામાન્ય રજીસ્ટર) across all views, reports, and generated PDF printouts.

### 🔒 5. Security & Multi-Factor Authentication
- Role-based access control (RBAC).
- Simulated **Two-Factor Authentication (2FA / TOTP)** for administrative actions.
- Audit trail for sensitive records (G.R. updates, mark modifications, fee discounts).

---

## 🚀 Demo Persona Accounts

You can test ClassSec immediately using one-click pass selection on the login page:

| Role | Name | Email | Password | Default 2FA Code |
| :--- | :--- | :--- | :--- | :--- |
| **Principal** | Dr. Vinodbhai C. Pandya | `principal@avinyagurukul.edu.in` | `gseb2026` | `123456` |
| **Class Teacher** | Smt. Neetaben R. Patel | `neeta.patel@avinyagurukul.edu.in` | `gseb2026` | `123456` |
| **Student** | Harsh V. Patel (G.R. 4821) | `harsh.patel@student.avinyagurukul.edu.in` | `gseb2026` | `123456` |
| **Parent** | Shri Vinodbhai K. Patel | `vinodbhai.patel@gmail.com` | `gseb2026` | `123456` |
| **Trustee Admin** | Shri Pravinbhai G. Patel | `trustee@avinyagurukul.edu.in` | `gseb2026` | `123456` |

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 (Light neutral aesthetic with refined typography and soft mesh accents)
- **Icons**: Lucide React
- **Animations**: Motion (`motion/react`)
- **Backend / Mock State**: React Context API with state persistence and session storage
- **Bilingual Engine**: Custom lightweight i18n context for synchronized Gujarati/English translation

---

## 📦 Project Structure

```
├── src/
│   ├── components/
│   │   ├── academic/       # Ekam Kasoti, PAT, exams, and report cards
│   │   ├── admin/          # Trustee, campus analytics, and audit logs
│   │   ├── attendance/     # Daily attendance registers & monthly summaries
│   │   ├── auth/           # Login screen, persona switcher & 2FA modal
│   │   ├── certificates/   # Leaving Certificate (L.C.) & Bonafide generation
│   │   ├── common/         # Header, navigation, logos, and UI primitives
│   │   ├── fees/           # Fee collection, UPI QR, receipts & dues
│   │   ├── parent/         # Parent portal & ward tracking
│   │   ├── student/        # Student dashboard & self-service
│   │   └── students/       # General Register (G.R.) directory & profile views
│   ├── context/
│   │   ├── AuthContext.tsx     # Role authentication & user state
│   │   └── LanguageContext.tsx # Dual-language (EN / GU) manager
│   ├── types/
│   │   └── erp.ts          # Comprehensive TypeScript schemas for GSEB models
│   ├── App.tsx             # Main router & portal view controller
│   ├── main.tsx            # React application entry point
│   └── index.css           # Global Tailwind CSS imports & theme definitions
├── package.json
├── vite.config.ts
└── README.md
```

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd classsec-gujarat-erp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will run at `http://localhost:3000`.

4. **Production Build**:
   ```bash
   npm run build
   ```

5. **Type Check / Lint**:
   ```bash
   npm run lint
   ```

---

## 📄 License & Attribution

Designed for educational institutions in Gujarat following GSEB standards.  
© 2026 **ClassSec Gujarat School ERP** • Built with craftsmanship and cultural alignment.
