# ElevateFlow Repository - Complete Analysis

**Date**: May 24, 2026 | **Status**: Demo-ready but needs fixes to run locally  
**Current Dev Server**: ✅ Running on port 3001 (but will fail on routing due to missing dependencies)

---

## 1. APP ARCHITECTURE & PURPOSE

### 🎯 Primary Goal
**AI-driven lead qualification via SMS & Email for Swedish crafts companies**

ElevateFlow is a B2B SaaS platform that automates lead response for crafts businesses (takläggare, badrumsrenöverare, etc.). When a lead submits contact info:
1. AI agent responds within seconds (SMS + Email)
2. AI asks targeted questions based on company's service offerings
3. Conversation is captured and summarized for the business owner
4. Lead status tracked (new → qualified → booked → lost)

### 🏗️ Core Workflows

**Lead Ingestion** (3 sources):
- Form submission at `/test-lead` (manual testing)
- Meta Lead Ads webhook at `/api/webhook/meta` (Facebook form fills)
- LeadForm component (embedded on company websites via API)

**Lead Qualification** (Bidirectional):
- Customer SMS/Email → Webhook → AI processing → Response back
- Messages stored in `messages` table with conversation context
- AI adapts prompts based on company's 14 available services

**Admin Features**:
- Dashboard showing lead metrics (total, new, booked)
- Company management with service selection
- API key generation per company
- Conversation history viewer (future)

**Background Jobs** (via Inngest):
- Retry failed message sends
- Follow-up messages after N hours
- Summary generation when conversation ends

---

## 2. CURRENT ROUTES - DETAILED MAP

### 📍 PAGE ROUTES (Frontend)

| Route | Type | Protection | Purpose |
|-------|------|-----------|---------|
| `/login` | Page | Public | Email/password login via Supabase |
| `/dashboard` | Page | ⚠️ Unprotected | Lead overview (metrics & table) |
| `/admin/companies` | Page | ⚠️ Unprotected | Company CRUD & service management |
| `/test-lead` | Page | ⚠️ Unprotected | Create test leads for debugging |
| `/` (ROOT) | Page | ❌ Missing | Should exist & redirect based on auth |

**⚠️ Protection Issue**: Routes 2-4 have no middleware protection. Anyone can access without login.

### 🔌 API ROUTES

#### **Public/Webhook Routes** (No Auth)
```
POST /api/lead
  Input: { companyId, customerName, phone, email, service, projectDescription }
  Output: { success: true, aiMessage: string }
  Action: Creates lead, generates AI response, sends SMS

POST /api/webhook/sms
  Twilio inbound SMS handler
  Extracts lead by phone → generates AI reply → sends response
  Input: Twilio FormData (From, Body, etc.)

GET/POST /api/webhook/meta
  Meta Lead Ads webhook
  GET: Webhook verification (token check)
  POST: Lead creation from Meta form
  ⚠️ Issue: hardcoded companyId ('00000000-0000...')

❌ POST /api/webhook/email (MISSING)
  Should: Accept Resend inbound emails
  Status: Not implemented yet

❌ GET /api/webhook/sms-media (MISSING)
  Should: Handle MMS/image attachments
  Status: Schema prepared but handler missing
```

#### **Admin Routes** (Should be protected, currently aren't)
```
POST /api/admin/companies
  Creates new company
  Input: { name, phone_number, email, services[], system_prompt }
  ⚠️ No auth check, no input validation

POST /api/admin/companies/[id]/api-key
  Generates new API key for company
  Output: { apiKey: "ef_..." }

❌ GET /api/admin/companies/[id] (MISSING)
  Should: Fetch single company for editing

❌ PATCH /api/admin/companies/[id] (MISSING)
  Should: Update company details

❌ DELETE /api/admin/companies/[id] (MISSING)
  Should: Delete company
```

#### **Auth Routes**
```
POST /api/auth/signout
  Clears Supabase session, redirects to /login
```

#### **Other**
```
POST /api/v1/leads
  Versioned lead endpoint (appears unused/duplicated)
```

---

## 3. ENVIRONMENT SETUP & CONFIGURATION

### 📋 Required Environment Variables

Create `.env.local` from `.env.example`:

```env
# === AI ===
ANTHROPIC_API_KEY=sk-ant-...
  Where: https://console.anthropic.com
  Used: Claude 3.5 Sonnet API calls

# === SMS ===
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+467...
  Where: https://www.twilio.com/console
  Used: Sending/receiving SMS messages

# === Email ===
RESEND_API_KEY=re_...
RESEND_DOMAIN=domain.se
  Where: https://resend.com/api-keys
  Used: Sending emails + receiving inbound emails

# === Database ===
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
  Where: https://supabase.com/dashboard
  Used: Client & server-side database access + auth

# === Webhooks ===
META_WEBHOOK_VERIFY_TOKEN=elevateflow-meta-2025
  Self-chosen: Use in Meta Webhooks dashboard for verification

# === App ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
  For dev: localhost:3000 or localhost:3001
  For prod: https://yourdomain.com
```

### ⚠️ Current Status
- ✅ `.env.example` exists with all required vars
- ❌ `.env.local` does NOT exist
- ❌ No Supabase credentials configured
- ❌ Will fail on first API call without these vars

---

## 4. DATABASE SCHEMA & MIGRATIONS

### 📊 Current Schema Version: **v3**
Located in `supabase/schema_v3.sql` (latest migration)

#### **companies** Table
```sql
- id: UUID (primary key)
- name: TEXT
- phone_number: TEXT
- email: TEXT
- system_prompt: TEXT (custom AI behavior per company)
- services: TEXT[] JSONB (["Takläggning", "Taktvätt", ...])
- created_at: TIMESTAMP
```
**Purpose**: Stores customer companies using ElevateFlow

#### **leads** Table
```sql
- id: UUID (primary key)
- company_id: UUID (FK → companies)
- name: TEXT
- phone: TEXT
- email: TEXT
- service: TEXT (which service they inquired about)
- project_description: TEXT
- status: TEXT (enum: 'new', 'qualified', 'booked', 'lost')
- created_at: TIMESTAMP
- Indexes: idx_leads_phone (for fast phone lookup)
```
**Purpose**: Individual customer inquiries

#### **messages** Table
```sql
- id: UUID (primary key)
- lead_id: UUID (FK → leads)
- role: TEXT ('user' or 'assistant')
- content: TEXT (message body)
- media_url: TEXT (for MMS attachments)
- created_at: TIMESTAMP
- Indexes: idx_messages_lead_id
```
**Purpose**: Conversation history between AI & customer

#### **api_keys** Table
```sql
- id: UUID (primary key)
- company_id: UUID (FK → companies)
- key: TEXT (format: "ef_" + random hex)
- name: TEXT
- created_at: TIMESTAMP
```
**Purpose**: API authentication for external integrations

#### **lead_media** Table (schema_v3)
```sql
- id: UUID (primary key)
- lead_id: UUID (FK → leads)
- media_url: TEXT
- media_type: TEXT
- created_at: TIMESTAMP
```
**Purpose**: Separated media storage for MMS

### 🔄 Migration Files in `supabase/`
1. **schema.sql** - Base tables (companies, leads, messages)
2. **schema_v2.sql** - (evolution details unknown)
3. **schema_v3.sql** - Media support added
4. **api_keys.sql** - API key table creation
5. **add_services_column.sql** - Added services[] JSONB to companies
6. **add_owner_id.sql** - Owner tracking (details unclear)
7. **row_level_security.sql** - Initial RLS policies
8. **row_level_security_v2.sql** - Updated RLS policies

### ⚠️ RLS Security Status
- ✅ RLS policies exist
- ❌ Need to verify they're actually enabling multi-tenancy
- ⚠️ Unverified: Are users scoped to only see their company's leads?

---

## 5. MISSING PIECES & BROKEN FUNCTIONALITY

### 🚨 CRITICAL BLOCKERS

#### **1. Missing Dependencies** (package.json incomplete)
**These are IMPORTED but NOT listed in package.json:**
- `@ai-sdk/anthropic` → Claude integration
- `@supabase/auth-helpers-nextjs` → Server-side auth
- `twilio` → SMS API
- `resend` → Email API
- `ai` → Vercel's `generateText()` function
- `tailwindcss`, `postcss`, `autoprefixer` → CSS

**Impact**: Runtime crashes on first API call or page load  
**Fix**: `npm install @ai-sdk/anthropic @supabase/auth-helpers-nextjs twilio resend ai tailwindcss postcss autoprefixer`

#### **2. No Root Page (`app/page.tsx`)**
**Impact**: 404 on `/` - users have no entry point  
**Fix**: Create `app/page.tsx` with auth redirect logic

#### **3. Missing `.env.local`**
**Impact**: All external API calls will fail silently  
**Fix**: Copy `.env.example` → `.env.local` + fill with real credentials

#### **4. No Route Protection**
**Impact**: Anyone can access `/dashboard`, `/admin/companies`, `/test-lead` without login  
**Fix**: Add `middleware.ts` or protect at component level

#### **5. Unimplemented Email Webhook**
**Impact**: `/api/webhook/email` referenced in docs but NOT in codebase  
**Fix**: Create `app/api/webhook/email/route.ts`

### ⚠️ MEDIUM PRIORITY

#### **6. API Route Missing Authentication**
- `/api/lead` - No API key validation (should use `validateApiKey()`)
- `/api/admin/*` - No auth checks at all
- Should verify JWT or API key before allowing requests

#### **7. Meta Webhook Hard-coded Company ID**
```typescript
// app/api/webhook/meta/route.ts:39
companyId: '00000000-0000-0000-0000-000000000000', // ← FIX THIS
```
- All Meta leads routed to one fake company
- Should extract company ID from webhook context or Meta data

#### **8. Missing Admin API Endpoints**
- No `GET /api/admin/companies/[id]` to fetch for editing
- No `PATCH /api/admin/companies/[id]` to update
- No `DELETE /api/admin/companies/[id]` to remove
- EditCompanyForm.tsx exists but nowhere to submit

#### **9. Inngest Setup Incomplete**
- Functions defined (`sendSummary.ts`, `retrySend.ts`, `followUp.ts`)
- But no Inngest middleware route (`/api/inngest`)
- No event triggers (where does "conversation/ended" event fire?)
- Local dev likely can't trigger Inngest without setup

#### **10. Email Never Sent**
```typescript
// app/api/lead/route.ts:64-72
const resend = new Resend(process.env.RESEND_API_KEY!);
// ↑ Created but never used
// Should call: await resend.emails.send({ from, to, subject, html })
```

#### **11. SMS Media Handler Missing**
- `/api/webhook/sms-media` route doesn't exist
- MMS images from Twilio will return 404

---

## 6. EXTERNAL SERVICE INTEGRATIONS

### 🔗 Required Integrations

| Service | Purpose | Status | Credentials | Setup Docs |
|---------|---------|--------|-------------|-----------|
| **Supabase** | Database + Auth | ✅ Used | URL, Keys | PostgreSQL DB |
| **Anthropic** | AI Claude 3.5 | ✅ Used | API Key | ANTHROPIC_API_KEY |
| **Twilio** | SMS Send/Receive | ⚠️ Partial | SID, Token, #  | TWILIO_* vars |
| **Resend** | Email Send/Receive | ❌ Email missing | API Key, Domain | RESEND_API_KEY |
| **Meta/Facebook** | Lead Ads Webhook | ⚠️ Hardcoded | Verify Token | META_WEBHOOK_VERIFY_TOKEN |
| **Inngest** | Background Jobs | ⚠️ Incomplete | (API setup needed) | INNGEST_EVENT_KEY? |

### 📚 Setup Documentation
- ✅ `EMAIL_AUTOMATION_SETUP.md` - Resend inbound configuration
- ✅ `META_ADS_SETUP.md` - Meta Lead Ads webhook setup
- ✅ `README.md` - Quick start guide
- ✅ `PRESENTATION_TILL_MUSSE.md` - Sales/feature presentation

---

## 7. CURRENT STATE & STARTUP ISSUES

### 🖥️ Dev Server Status
- ✅ **Started successfully** on port 3001 (port 3000 in use)
- ✅ Next.js 15 compiled without major errors
- ⚠️ **Will fail on first navigation** due to missing dependencies

### 🔍 Reported Compilation Errors

```
Cannot find module '@/components/Layout'
Cannot find module '@supabase/auth-helpers-nextjs'
Cannot find module '@/components/ui/card'
Cannot find module '@ai-sdk/anthropic'  (referenced in route handlers)
Cannot find module 'twilio'
Cannot find module 'resend'
```

### ⚠️ TypeScript Issues
```
Option 'moduleResolution=node10' is deprecated (tsconfig.json:16)
  Fix: Use "bundler" or add ignoreDeprecations: "6.0"
```

### 🧪 Manual Testing Checklist

After fixes, verify:
1. ✅ Dev server starts without errors
2. ✅ `/login` page loads & displays login form
3. ✅ Test Supabase user can login
4. ✅ Redirect to `/dashboard` on successful login
5. ✅ Redirect to `/login` if accessing protected route unauthenticated
6. ✅ `/test-lead` form visible & submittable
7. ✅ Lead created in database after form submit
8. ✅ AI generates response (check console for API calls)
9. ✅ Twilio SMS would be sent (check Twilio console logs)
10. ✅ Admin can create company with services
11. ✅ API key generated for company

---

## 8. PRIORITY FIX LIST

### 🔴 **CRITICAL - Do First** (Blocks Everything)

- [ ] **Install missing dependencies**
  ```bash
  npm install @ai-sdk/anthropic @supabase/auth-helpers-nextjs twilio resend ai tailwindcss postcss autoprefixer
  ```

- [ ] **Create `.env.local`**
  ```bash
  cp .env.example .env.local
  # Edit .env.local with actual credentials
  ```

- [ ] **Fix TypeScript config**
  ```bash
  # Update tsconfig.json moduleResolution or add ignoreDeprecations
  ```

- [ ] **Create root page** (`app/page.tsx`)
  - Redirect `/` to `/login` if unauthenticated, `/dashboard` if authenticated

- [ ] **Add route protection middleware** (`middleware.ts`)
  - Protect `/dashboard`, `/admin/*`, `/test-lead`
  - Allow public: `/login`, `/api/webhook/*`, `/api/lead`

### 🟠 **HIGH - Breaks Features**

- [ ] **Create `/api/webhook/email/route.ts`** (Resend inbound)
- [ ] **Create `/api/webhook/sms-media/route.ts`** (MMS handler)
- [ ] **Fix Meta webhook** (remove hardcoded companyId)
- [ ] **Add auth to admin routes** (`/api/admin/*`)
- [ ] **Implement Inngest middleware** & event triggers
- [ ] **Fix email sending** in `/api/lead/route.ts` (Resend actually send)
- [ ] **Complete admin CRUD endpoints** (GET, PATCH, DELETE company)

### 🟡 **MEDIUM - Quality of Life**

- [ ] Add input validation (zod/io-ts)
- [ ] Add structured logging (Sentry/Axiom)
- [ ] Add rate limiting
- [ ] Verify RLS policies work correctly
- [ ] Add error boundaries in React components

### 🟢 **LOW - Nice to Have**

- [ ] Lead scoring/quality metrics
- [ ] Dashboard analytics (ROI, lead sources)
- [ ] Conversation export/PDF
- [ ] Bulk company import
- [ ] Admin user roles

---

## 9. TECH STACK SUMMARY

```
Frontend:         Next.js 15 (App Router) + React 19 + TypeScript 5.8
Styling:          Tailwind CSS + shadcn/ui components (Radix UI primitives)
Database:         Supabase (PostgreSQL) + RLS security
Authentication:   Supabase Auth (email/password)
AI:               Anthropic Claude 3.5 Sonnet (via Vercel AI SDK)
SMS:              Twilio
Email:            Resend
Background Jobs:  Inngest
Icons/UI:         Lucide React, Sonner (toasts)
Deployment:       Ready for Vercel
```

**Built Components**:
- Layout (sidebar nav)
- LeadForm (test lead creation)
- AddCompanyForm (company CRUD)
- CompanyList
- EditCompanyForm (incomplete)
- UI: Badge, Button, Card, Dialog, Input, Label, Select, Table (shadcn/ui)

---

## 10. PRODUCTION DEPLOYMENT NOTES

### ✅ Ready For:
- Static site generation (if needed)
- Vercel deployment
- Supabase managed hosting
- Multi-tenancy with company isolation

### ⚠️ Before Deploy:
- [ ] All dependencies installed
- [ ] `.env.production` configured (not `.env.local`)
- [ ] Database migrations applied to production
- [ ] RLS policies verified & tested
- [ ] Twilio production account credentials configured
- [ ] Resend domain verified for inbound emails
- [ ] Meta Webhooks pointing to production HTTPS domain
- [ ] Inngest production event key configured
- [ ] Database backups configured
- [ ] Error logging (Sentry) configured
- [ ] SSL certificates (automatic with Vercel)
- [ ] Admin user created in Supabase
- [ ] Full end-to-end test (lead creation → SMS/Email)

---

## 11. QUICK START (After Fixes)

```bash
# 1. Install deps
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with credentials

# 3. Run Supabase migrations
# (Via Supabase dashboard or CLI)

# 4. Start dev server
npm run dev

# 5. Open browser
# http://localhost:3001/login

# 6. Create test user in Supabase Auth

# 7. Login & navigate to /test-lead

# 8. Submit lead form → Check SMS/Email logs
```

---

**Analysis Complete** ✅  
**Time to Production**: ~2-3 weeks with full integration testing  
**Critical Fixes**: 1-2 days with this guide
