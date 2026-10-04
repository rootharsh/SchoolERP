<div align="center">

# 🏫 ClassSec

### Modern School ERP for Gujarat's private schools

GSEB-aligned administration, fees and academics in one place. Bilingual: **English & ગુજરાતી**.

**[🌐 Live demo](https://school-erp-pearl.vercel.app)**

![TypeScript](https://img.shields.io/badge/TypeScript-0d1117?style=flat&logo=typescript&logoColor=3178c6)
![Bun](https://img.shields.io/badge/Bun-0d1117?style=flat&logo=bun&logoColor=fbf0df)
![D3.js](https://img.shields.io/badge/D3.js-0d1117?style=flat&logo=d3dotjs&logoColor=f9a03c)
![Vercel](https://img.shields.io/badge/Vercel-0d1117?style=flat&logo=vercel&logoColor=white)
![GSEB](https://img.shields.io/badge/GSEB-compliant-2ea043?style=flat)

<!-- Add a dashboard screenshot here, e.g. ![ClassSec dashboard](docs/dashboard.png) -->

</div>

---

## 📌 Overview

**ClassSec** is a full-featured Educational Resource Planning (ERP) and campus governance system built for private, self-financed schools under the **Gujarat Secondary and Higher Secondary Education Board (GSEB)**.

It handles the paperwork schools actually deal with every day: statutory registers, leaving certificates, state grading schemes and fee collection, with compliance to **UDISE+** and Gujarat Education Department standards.

## ✨ Key Features

### 🏛️ GSEB compliance & statutory documents
- **General Register (G.R. Book)** with immutable G.R. numbers, UDISE+ student IDs and automated roll allocation
- **School Leaving Certificate (L.C. / T.C.)** generated in one click, bilingual, with GSEB watermark and print-ready layout
- **Gujarat state grading:** Ekam Kasoti (એકમ કસોટી), Periodic Assessment Tests (PAT), Pratham Pariksha (Semester 1) and Varshik Pariksha (Annual), using the 8-point GSEB scale (A1 to E2)

### 💳 Multi-campus fee counter & accounts
- **Dynamic fee structures:** tuition, lab, computer, term and transport fees by grade
- **Instant UPI QR & receipts** with BharatQR/UPI, numbered receipts (`REC-2026-XXXX`), printable thermal/A4 vouchers and fee clearance certificates
- **Defaulter tracking** with SMS/WhatsApp alerts for outstanding balances

### 👥 Role-based institutional portals
- **Trustee / Super Admin:** multi-campus overview and revenue analytics (D3.js charts)
- Separate portals for the other staff and parent roles, each with only the access they need

## 🧰 Tech stack

| Layer | Tech |
|---|---|
| Language | TypeScript |
| Runtime / package manager | Bun |
| Backend | `server.ts` |
| Analytics | D3.js |
| Hosting | Vercel |

## 🚀 Getting started

```bash
git clone https://github.com/rootharsh/SchoolERP.git
cd SchoolERP
bun install
cp .env.example .env   # then fill in your own values
bun run dev
```

> Check `package.json` for the exact script names if `dev` differs.

## 🔐 Security & data note

This project deals with student information (IDs, certificates, fee records).

- The demo runs on **fake data only**
- Never commit real student records, Aadhaar-related data, or a real `.env` file
- Keep secrets in environment variables; `.env.example` shows the variable names only

## 🗺️ Roadmap

- [ ] More report exports (PDF/Excel)
- [ ] Parent mobile view improvements
- [ ] Automated backup and audit log

## 👤 Author

**Harsh R.** is a cybersecurity student, web developer and guitarist.

- 🌐 Portfolio: [harshsec.in](https://harshsec.in)
- 💻 GitHub: [@rootharsh](https://github.com/rootharsh)
- 📸 Instagram: [@harsh.sec](https://instagram.com/harsh.sec)

---

<div align="center"><sub>Built with ❤️ for Gujarat's schools by Harsh R.</sub></div>
