# 🍽️ Menu & Services Management Backend

A production-style **backend-only platform** built using **Node.js, Express, and MongoDB** to manage menus, services, pricing, availability, bookings, and add-ons — similar to real-world restaurant and booking systems.

This project focuses on **business logic, clean architecture, and correctness**, not frontend or simple CRUD APIs.

---

## ✨ Features

- 📂 Category & Subcategory management with soft delete
- 📦 Item management (belongs to category OR subcategory)
- 🧾 Dynamic tax inheritance (Category → Subcategory → Item)
- ⏱️ Item availability with days & time slots
- 📅 Booking system with conflict & double-booking prevention
- ➕ Item add-ons (optional, mandatory, grouped)
- 🔍 Search, filtering, sorting, and pagination

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- TypeScript
- Zod (validation)

---
## Local Development Setup
```bash
git clone https://github.com/mrDeepakk/menu-services.git
```
## Setup `.env` file Create a `.env file Project Root`
```bash
PORT=3000
NODE_ENV=development
MONGODB_URI="mongodb+srv://[username]:[password]@cluster0.nyvxddr.mongodb.net/"  #use your own database connection url
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

## 🖥️ Backend Setup & Start server
```bash
cd menu-services
npm install
npm run dev
```

Backend Run at: http://localhost:3000/
