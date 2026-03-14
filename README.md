# EduHub - Free Public Educational Content Platform

A monorepo for building a free, SEO-optimized educational content platform with Next.js, Express, and PostgreSQL.

## 🏗️ Project Structure

```
eduhub/
├── apps/
│   ├── api/              # Express backend
│   │   ├── src/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/              # Next.js frontend
│       ├── app/          # App Router
│       ├── components/
│       ├── lib/
│       ├── styles/
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.js
├── packages/
│   └── database/         # Prisma schema & seeds
│       ├── prisma/
│       │   └── schema.prisma
│       ├── seed.ts
│       └── package.json
├── package.json          # Monorepo root (Turborepo)
└── turbo.json           # Turborepo config
```

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- Git (`git --version`)
- PostgreSQL database (use Neon.tech free tier)

### 1. Setup Environment Variables

Copy .env.example files to .env in each workspace:

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env

# Database
cp packages/database/.env.example packages/database/.env
```

Update the values:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Choose secure credentials
- `JWT_SECRET`: Generate a strong random string
- Cloudflare credentials (optional for MVP)

### 2. Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (Turborepo).

### 3. Setup Database

```bash
# Run migrations
npm run db:migrate

# Seed initial admin user
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

This starts both backend and frontend:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## 📦 Available Scripts

**Monorepo (root):**
```bash
npm run dev              # Start all apps
npm run build            # Build all apps
npm run lint             # Lint all apps
npm run type-check       # Type check all apps
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
```

**Individual workspaces:**
```bash
cd apps/api && npm run dev       # Start backend only
cd apps/web && npm run dev       # Start frontend only
cd apps/web && npm run build     # Build frontend for production
```

## 🗄️ Database Schema

6 tables in PostgreSQL:

1. **admins** - Admin users (email, password_hash)
2. **topics** - Top-level categories (name, slug, thumbnail)
3. **courses** - Learning paths within topics (title, slug, lesson_count)
4. **content** - Lessons (video/audio/image/blog, file_url, stream_id, body)
5. **tags** - Reusable labels (name, slug)
6. **content_tags** - Join table (many-to-many)

See `packages/database/prisma/schema.prisma` for full schema.

## 🛣️ API Endpoints (Planned)

### Public (No Auth)
- `GET /api/topics` - All published topics
- `GET /api/topics/:slug` - Topic detail + courses
- `GET /api/courses/:slug` - Course + lessons
- `GET /api/content/:slug` - Single lesson
- `GET /api/search?q=:query` - Full-text search
- `GET /api/tags/:slug/content` - Content by tag

### Admin (JWT Auth)
- `POST /api/admin/auth/login` - Login
- `POST /api/admin/topics` - Create topic
- `PUT /api/admin/topics/:id` - Update topic
- `POST /api/admin/courses` - Create course
- `POST /api/admin/content` - Create lesson (any type)
- `POST /api/admin/upload/presign` - Get R2 presigned URL
- And more...

## 📋 Development Roadmap

**Week 1: Foundation**
- [x] Monorepo scaffolding
- [ ] Admin authentication
- [ ] Topic CRUD
- [ ] Course CRUD

**Week 2: Content Uploads**
- [ ] Blog editor (TipTap)
- [ ] Image upload (R2)
- [ ] Audio upload (R2)
- [ ] Video upload (Cloudflare Stream)
- [ ] Tags management

**Week 3: Public Frontend**
- [ ] Homepage
- [ ] Topic pages
- [ ] Course pages
- [ ] Lesson players (all 4 types)
- [ ] Search

**Week 4: SEO & Launch**
- [ ] Meta tags & Open Graph
- [ ] Sitemap & robots.txt
- [ ] JSON-LD schema
- [ ] Launch!

## 🔐 Security

- Passwords: bcrypt (cost 12)
- Auth: JWT in HttpOnly cookies (7-day expiry)
- API: Rate limiting on login (5/15min)
- File uploads: MIME validation, size limits
- CORS: Restricted to frontend domain
- HTML: Sanitized blog content (no XSS)

## 📈 Cost at Launch

| Service | Cost |
|---------|------|
| Vercel (frontend) | ₹0 |
| Render (backend) | ₹0 |
| Neon (database) | ₹0 |
| Cloudflare R2 | ₹0 |
| Cloudflare Stream | ₹0 (first 10k min/mo) |
| **Total** | **₹0** |

## 📚 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Shadcn/ui
- **Backend**: Express, Node.js, TypeScript
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Blog Editor**: TipTap
- **Video**: Cloudflare Stream
- **Storage**: Cloudflare R2
- **Deployment**: Vercel (frontend) + Render (backend)

## 📖 Further Reading

- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [Neon Docs](https://neon.tech/docs/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Cloudflare Stream Docs](https://developers.cloudflare.com/stream/)

## 📝 PRD

See [EduHub_PRD.md](../simplePlan/EduHub_PRD.md) for the complete Product Requirements Document with all design decisions, API specs, and more.

---

**Ready to build?** 🚀

Start with connecting your database and running migrations!
