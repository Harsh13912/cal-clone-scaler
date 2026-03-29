# 🗓️ Cal Clone - Scheduling Platform

A production-ready scheduling application built as part of the **Scaler SDE Intern Fullstack Assignment**. This clone replicates Cal.com's core functionality with a focus on robust time-slot logic, type-safe architecture, and pixel-perfect UI.

**🔗 Live Demo:** [cal-clone-scaler.vercel.app](https://cal-clone-scaler-harsh13912s-projects.vercel.app?_vercel_share=F37QWSQRS2JfkwhEJxZthd39uwIzVh8V)

**📂 Repository:** [github.com/Harsh13912/cal-clone-scaler](https://github.com/Harsh13912/cal-clone-scaler)

---

## ✨ Features

### Core Functionality
- **Event Types Management** - Create, edit, and delete meeting types with custom durations
- **Availability Engine** - Define weekly schedules with multiple time blocks per day
- **Public Booking Flow** - Dynamic calendar with real-time slot availability
- **Double-Booking Prevention** - Database-level overlap detection
- **Bookings Dashboard** - Manage upcoming and past appointments

### Advanced Features
- **Buffer Time Support** - Configurable gaps between meetings
- **Dark Mode UI** - Pixel-perfect replication of Cal.com's design
- **Responsive Design** - Mobile-first with hamburger navigation
- **Custom Durations** - Support for any meeting length (not just 15/30/45/60)
- **Timezone Handling** - Dynamic time slot calculation with IST support

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 16.2.1 (App Router) |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Prisma 7.6.0 with `@prisma/adapter-pg` |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Validation** | Zod 4.3.6 + React Hook Form |
| **Date/Time** | date-fns 4.1.0 |
| **Icons** | lucide-react |
| **Deployment** | Vercel |

---

## 📊 Database Schema

```prisma
model EventType {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  description String?
  duration    Int       // minutes
  bufferTime  Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bookings    Booking[]
}

model Availability {
  id        String   @id @default(cuid())
  dayOfWeek Int      // 0-6 (Sun-Sat)
  startTime String   // "HH:mm"
  endTime   String   // "HH:mm"
  timezone  String   @default("Asia/Kolkata")
  createdAt DateTime @default(now())
}

model Booking {
  id          String    @id @default(cuid())
  eventTypeId String
  eventType   EventType @relation(fields: [eventTypeId], references: [id])
  bookerName  String
  bookerEmail String
  startTime   DateTime
  endTime     DateTime
  status      String    @default("confirmed")
  createdAt   DateTime  @default(now())
  
  @@index([eventTypeId])
  @@index([startTime])
  @@index([status])
}
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harsh13912/cal-clone-scaler.git
   cd cal-clone-scaler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@host/database"
   ```

4. **Setup database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000`

---

## 🏗️ Architecture

### Key Design Decisions

**Next.js 16 Adaptation**
- All dynamic routes use `await params` pattern (required for Next.js 16)
- Strict separation of Server/Client Components for optimal performance

**Prisma 7 Migration**
- Custom `prisma.config.ts` for connection management
- `@prisma/adapter-pg` for Neon serverless compatibility
- Type-safe database helpers in `/lib/db/`

**Time Slot Engine**
- Mathematical interval generation based on `duration + bufferTime`
- Overlap detection: `booking.startTime < slot.endTime AND booking.endTime > slot.startTime`
- Automatic deduplication and chronological sorting

**State Management**
- React Hook Form + Zod for type-safe validation
- `safeParse()` pattern for production error handling
- SPA-style booking flow (no page reloads)

---

## 📁 Project Structure

```
cal-clone/
├── app/
│   ├── api/                    # API Routes
│   │   ├── event-types/       # Event CRUD endpoints
│   │   ├── availability/      # Availability CRUD
│   │   └── bookings/          # Booking creation & management
│   ├── dashboard/             # Admin UI
│   │   ├── event-types/
│   │   ├── availability/
│   │   └── bookings/
│   ├── [username]/[slug]/     # Public booking page
│   └── booking/[id]/          # Booking receipt
├── lib/
│   ├── db/                    # Database helpers
│   ├── time-slots.ts          # Time calculation engine
│   └── prisma.ts              # Prisma singleton
├── components/                # Reusable UI components
└── prisma/
    ├── schema.prisma          # Database schema
    ├── config.ts              # Prisma 7 config
    └── seed.ts                # Sample data
```

---

## 🔧 API Reference

### Event Types
```
GET    /api/event-types          # List all
POST   /api/event-types          # Create new
GET    /api/event-types/[id]     # Get single
PUT    /api/event-types/[id]     # Update
DELETE /api/event-types/[id]     # Delete
GET    /api/event-types/[id]/available-slots?date=YYYY-MM-DD
```

### Bookings
```
GET    /api/bookings?filter=upcoming|past
POST   /api/bookings             # Create booking
DELETE /api/bookings/[id]        # Cancel booking
```

### Availability
```
GET    /api/availability
POST   /api/availability
PUT    /api/availability/[id]
DELETE /api/availability/[id]
```

---

## 🎯 Technical Challenges Overcome

### 1. Next.js 16 Breaking Changes
**Problem:** Dynamic route parameters became Promises  
**Solution:** Implemented `const { id } = await params` pattern across all dynamic routes

### 2. Prisma 7 Architecture Shift
**Problem:** New version removed legacy connection patterns  
**Solution:** Migrated to `@prisma/adapter-pg` with custom pooling configuration

### 3. Duplicate Time Slots
**Problem:** Overlapping availability rules generated redundant slots  
**Solution:** Added deduplication via `Map` and chronological sorting with `date-fns`

### 4. Double-Booking Race Conditions
**Problem:** Simultaneous form submissions could book same slot  
**Solution:** Database-level overlap query before INSERT

### 5. Tailwind v4 Migration
**Problem:** Configuration moved from JS to CSS variables  
**Solution:** Adapted to CSS-first theming in `globals.css`

---

## 🚢 Deployment

### Vercel Setup
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `DATABASE_URL` (from Neon dashboard)
4. Deploy automatically triggers

### Build Configuration
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "next build"
  }
}
```

---

## 🎓 Assumptions & Scope

- **Single User System:** Assumes one admin user (no authentication required per assignment)
- **Timezone:** Default availability set to `Asia/Kolkata` 
- **Date Range:** Bookings limited to 60 days in advance
- **Email:** Validation via regex (no SMTP integration)

---

## 🔮 Future Enhancements

- [ ] Multiple user accounts with authentication
- [ ] Email notifications (SendGrid/Resend integration)
- [ ] Payment integration (Stripe)
- [ ] Video conferencing links (Zoom/Google Meet)
- [ ] Custom booking questions
- [ ] Team scheduling & round-robin
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Webhooks for external integrations

---

## 👤 Author

**Harsh Kumar**  
[GitHub](https://github.com/Harsh13912)

---



---

**⭐ Built with Next.js 16, Prisma 7, and a lot of debugging!**
