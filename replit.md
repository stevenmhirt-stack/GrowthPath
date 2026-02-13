# GrowthPath - Professional Development Platform

## Overview

GrowthPath is a full-stack professional development application designed to help users set, track, and achieve their professional goals with focused clarity. The platform provides comprehensive tools for goal management, routine tracking, daily planning, self-assessment, and personal development through an intuitive interface.

The application is built as a monolithic full-stack solution with a React frontend and Express backend, using PostgreSQL for data persistence. It follows a modular architecture with clear separation between client, server, and shared code.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and caching
- Tailwind CSS v4 for styling with shadcn/ui component library (New York style variant)
- Recharts for data visualization (charts and graphs)
- React Hook Form with Zod for form validation

**Backend:**
- Express.js as the web server framework
- TypeScript throughout for type safety
- PostgreSQL database via Neon serverless with performance indexes
- Drizzle ORM for database operations and schema management
- Pino for structured request logging
- express-rate-limit for API rate limiting
- Dual authentication (Replit Auth and email/password with bcrypt)

**Build & Development:**
- ESBuild for server bundling
- Vite for client bundling and HMR (Hot Module Replacement)
- Custom build script that bundles both client and server
- Separate development modes for client and server

### Project Structure

The codebase follows a three-tier architecture:

**`/client`** - Frontend application
- `/src/pages` - Route-based page components (Dashboard, Goals, Routines, Assessment, Daily Planner, Levers)
- `/src/components` - Reusable UI components including shadcn/ui library
- `/src/hooks` - Custom React hooks (mobile detection, toast notifications)
- `/src/lib` - Utility functions, API client, mock data, query client configuration
- `index.html` - Single-page application entry point

**`/server`** - Backend application
- `index.ts` - Express server setup with middleware and logging
- `routes.ts` - API route definitions
- `db.ts` - Database connection via Drizzle ORM
- `storage.ts` - Data access layer interface (repository pattern)
- `vite.ts` - Development-only Vite middleware integration
- `static.ts` - Static file serving for production builds
- `/middleware` - Reusable middleware modules:
  - `errorHandler.ts` - Centralized error handling with Zod validation support
  - `rateLimiter.ts` - Rate limiting (general, auth, API limiters)
  - `logger.ts` - Structured logging with Pino
  - `validation.ts` - Request validation helpers using Zod schemas

**`/shared`** - Code shared between client and server
- `schema.ts` - Drizzle database schema definitions and Zod validation schemas

### Database Schema

The application uses a PostgreSQL database with the following core entities:

**Users** - User accounts (authentication not yet fully implemented)
- UUID primary key
- Username, password, name, role, avatar fields

**Goals** - Professional development goals with hierarchical types
- Belongs to user
- Goal types: big-x (3-5 year vision), intermediate (18-30 months), near-term (12-18 months), current-capability (present)
- Includes title, category, goalType, status, progress percentage, deadline, description
- JSONB field for milestone tracking with completion status
- Big X goal displayed prominently across all pages via BigXHeader component

**Routines** - Daily/recurring activities
- Belongs to user
- Time-based scheduling with frequency
- Completion tracking and streak counting
- Category organization

**Schedule Items** - Daily planner entries
- Belongs to user
- Time-ordered activities
- Type classification (work, personal, etc.)

**Daily Reflections** - End-of-day journaling
- One per user per day (upsert pattern)
- Main focus, gratitude, wins, improvements fields
- Date-based retrieval

**Assessment Scores** - Self-evaluation tracking
- Scored words/attributes for personal assessment
- Historical tracking of scores over time

**Levers** - Personal development focus areas
- Eight key life domains (Mindset, Energy, Relationships, etc.)
- Score tracking (1-10 scale)
- Action item management
- JSONB for selected actions

### API Design

The API follows RESTful conventions with the following patterns:

**Resource Endpoints:**
- `GET /api/{resource}` - List all items for current user
- `POST /api/{resource}` - Create new item
- `PATCH /api/{resource}/:id` - Update specific item
- `DELETE /api/{resource}/:id` - Delete specific item

**Special Endpoints:**
- Daily reflection uses upsert pattern (create or update based on date)
- Assessment scores use upsert by word/category
- Levers use upsert by title

**Authentication Pattern:**
- Dual authentication: Replit Auth and email/password with JWT
- Session-based auth with express-session
- Email verification and password reset flows with hashed tokens
- User ID automatically injected on server side

**Billing Endpoints:**
- `GET /api/billing/subscription` - Returns user's subscription status
- `POST /api/billing/checkout` - Creates Stripe Checkout session for upgrade
- `POST /api/billing/portal` - Creates Stripe Customer Portal session
- `GET /api/stripe/publishable-key` - Returns Stripe publishable key

**Premium Feature Gating:**
- Free features: Dashboard, Goals, 8 Levers, Badges, Leaderboard
- Premium features: Assessment (36 Values), Routines, Daily Planner
- Premium middleware returns 402 with `upgradeRequired: true` for non-subscribers
- Frontend shows lock icons on premium nav items with upgrade modal

### State Management

**Client-side state:**
- TanStack Query for server state with aggressive caching
- Query keys organized by resource (`["goals"]`, `["routines"]`, etc.)
- Optimistic updates via mutation callbacks
- Local component state for form data and UI interactions

**Server-side state:**
- Database as source of truth
- No in-memory caching layer
- Direct database queries via Drizzle ORM

### Development vs Production

**Development Mode:**
- Vite dev server running on port 5000
- Server runs with tsx for TypeScript execution
- Vite middleware integrated into Express for HMR
- Additional Replit-specific plugins (cartographer, dev banner, runtime error overlay)

**Production Mode:**
- Client built to `dist/public` via Vite
- Server bundled to `dist/index.cjs` via ESBuild
- Static file serving from dist directory
- Allowlist bundling strategy for faster cold starts

### Design System

**Color Scheme:** "Focused Clarity"
- Primary: Deep Indigo (professional, focused)
- Secondary: Soft Teal (calm, growth-oriented)
- Neutral base with light/dark mode support via CSS variables

**Typography:**
- Inter: UI text (sans-serif, highly legible)
- Outfit: Display/headings (modern, geometric)

**Component Library:**
- shadcn/ui (New York variant) for consistent UI patterns
- Radix UI primitives for accessibility
- Custom hover and elevation effects
- Responsive design with mobile-first approach

## External Dependencies

### Database & Infrastructure
- **Neon Serverless PostgreSQL** - Hosted PostgreSQL database with HTTP-based queries
- **Drizzle ORM** - TypeScript ORM for type-safe database operations and migrations

### UI Component Libraries
- **Radix UI** - Unstyled, accessible component primitives (20+ packages)
- **Lucide React** - Icon library
- **Recharts** - Chart and data visualization library
- **Embla Carousel** - Carousel/slider functionality

### Development Tools
- **Vite** - Build tool and dev server with TypeScript support
- **Tailwind CSS v4** - Utility-first CSS framework
- **ESBuild** - Fast JavaScript bundler for server code

### Utilities
- **Zod** - Schema validation for forms and API
- **React Hook Form** - Form state management
- **TanStack Query** - Server state management and caching
- **Wouter** - Lightweight routing library
- **date-fns** - Date manipulation utilities
- **class-variance-authority** - CSS class variant management
- **nanoid** - Unique ID generation

### Replit-specific Plugins
- `@replit/vite-plugin-cartographer` - Development tooling
- `@replit/vite-plugin-dev-banner` - Development banner
- `@replit/vite-plugin-runtime-error-modal` - Error handling overlay

### Session Management (Not Yet Active)
- **express-session** - Session middleware
- **connect-pg-simple** - PostgreSQL session store
- Infrastructure present but authentication not implemented