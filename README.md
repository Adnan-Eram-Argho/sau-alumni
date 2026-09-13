# SAU Alumni Network — Complete Project Documentation

Platform connecting alumni and current students of **Sher-e-Bangla Agricultural University (SAU)**, Sher-e-Bangla Nagar, Dhaka, Bangladesh.
Motto: Research · Education · Extension (গবেষণা · শিক্ষা · সম্প্রসারণ)

| | |
|---|---|
| **Live URL** | https://sau-alumni.vercel.app |
| **Repository** | GitHub `sau-alumni` (private) — auto-deploys to Vercel on push |
| **Supabase project ref** | `kkdmyrbwnupcyvzpevv` (Singapore region) |
| **Cost basis** | ৳0 — 100% free tiers: Vercel Hobby, Supabase Free (500MB DB / 1GB storage), Upstash Free |
| **Status** | Phases 1–6 complete (foundation → public site → member area → admin → notices → images). Launch phase pending. |
| **License / usage** | Non-commercial, community-run (Vercel Hobby terms require this) |

**Language conventions (important):**
- **UI text: 100% Bangla, hardcoded** — no i18n library, no locale files.
- **User-generated content (names, bios, notices, job text): English.**
- **Code comments: Banglish** (Bengali in Latin script).
- HTML `<html lang="bn">`.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Feature Map](#2-feature-map)
3. [Tech Stack](#3-tech-stack)
4. [Quick Start (Local Development)](#4-quick-start-local-development)
5. [Environment Variables](#5-environment-variables)
6. [Folder & File Structure](#6-folder--file-structure)
7. [Database Schema (Complete)](#7-database-schema-complete)
8. [Row-Level Security (RLS) Policies](#8-row-level-security-rls-policies)
9. [Storage: Buckets, Policies, Image Lifecycle](#9-storage-buckets-policies-image-lifecycle)
10. [Auth & Signup Flow](#10-auth--signup-flow)
11. [Roles & Permission Matrix](#11-roles--permission-matrix)
12. [Security Model](#12-security-model)
13. [API Routes (Complete Reference)](#13-api-routes-complete-reference)
14. [Pages (Complete Reference)](#14-pages-complete-reference)
15. [Realtime](#15-realtime)
16. [SEO & PWA](#16-seo--pwa)
17. [Theme & Design System](#17-theme--design-system)
18. [Development Workflow — Golden Rules](#18-development-workflow--golden-rules)
19. [Known Quirks & Pitfalls (READ BEFORE CODING)](#19-known-quirks--pitfalls-read-before-coding)
20. [Common Tasks — Recipes](#20-common-tasks--recipes)
21. [Deployment](#21-deployment)
22. [Admin Operations Runbook](#22-admin-operations-runbook)
23. [Rebuilding From Scratch](#23-rebuilding-from-scratch)
24. [Documented Deviations From Original Spec](#24-documented-deviations-from-original-spec)
25. [Roadmap / Upgrade Ideas](#25-roadmap--upgrade-ideas)
26. [Credits](#26-credits)

---

## 1. Overview

A directory-first alumni platform: the core value is a **searchable public directory** of SAU alumni and current students (by name, company, designation, country, faculty, batch), plus a **member area** (profile editing with privacy controls), an **admin system** (role management, verification, moderation with a full audit trail), and a **notice board** (draft → admin publish workflow, markdown + images, realtime unread bell). Installable as a PWA on phones.

Design intent: **trust** (verification, audit log, trigger-guarded privileges) + **frictionless signup** (instant, no email confirmation — see §24) + **privacy control** (public/private profile, phone visibility levels) + **zero-cost operation**.

Analytics: **Vercel Analytics** (`@vercel/analytics/next`) is integrated in the root layout for page-view tracking.

---

## 2. Feature Map

**Public (no login):**
- Landing page (SAU green/gold theme, dark/light toggle)
- Alumni directory: full-text search (`search_vector`) with partial/typo-tolerant name fallback (trigram), faculty filter, country filter (সবাই/বাংলাদেশে/বিদেশে + specific country), keyset pagination (24/page)
- Public profile pages: unique `<title>`/description per profile, JSON-LD `ProfilePage/Person`, private profiles → 404
- Notice board: list (pinned first) + detail pages (markdown via react-markdown + rehype-sanitize, images), draft preview for the author only
- Faculty pages, About page, floating "Made by" badge
- `sitemap.xml` (public profiles + published notices + static pages), `robots.txt` (admin/dashboard/auth disallowed)
- PWA: installable, offline fallback page, service worker precache

**Members (login required, `/dashboard`):**
- Dashboard with status chips, guards for missing profile row
- Profile edit: avatar (square, WebP, auto-cropped), name, department (from DB), batch year, student/alumnus, country (fixed dropdown), designation, company, LinkedIn, higher study, bio
- Contact & privacy: phone number + visibility (কারো না / শুধু লগইন-করা সদস্য / সবাই), profile public/private toggle
- Verification request ("আমাকে verified বানাও") with evidence note
- Notice writing (contributors and above): create/edit/delete drafts with images, draft preview at `/notices/<slug>`
- Realtime unread notice bell in header

**Admins (`/admin`):**
- Member list: verify/unverify, promote contributor, make/remove admin (super-admin only), suspend/restore
- Queues (`/admin/queues`): notice drafts (publish/delete), published/archived notices (pin/archive/unpublish/re-publish), verification requests (approve/reject), reports (reviewed/dismiss), audit log (last 50; super-admin sees all, admin sees own)
- Every mutation is Zod-validated, service-role, and audit-logged

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript | `params`/`searchParams`/`cookies()` are **Promises** — always `await` |
| Styling | Tailwind CSS v4 | Theme tokens in `app/globals.css`; dark mode = class strategy |
| Font | Hind Siliguri (Bangla+Latin) | via `next/font` (self-hosted, CSP-safe) |
| DB / Auth / Storage / Realtime | Supabase | Singapore region; RLS is the main security wall |
| Deployment | Vercel (Hobby) | auto-deploy on push; 2 cron jobs allowed if needed |
| PWA | `@serwist/next` | `app/sw.ts` → `public/sw.js`; disabled in dev |
| Rate limiting | Upstash Redis | login/signup pages, 10 req/min/IP; fails soft |
| Markdown | react-markdown + rehype-sanitize | never `dangerouslySetInnerHTML` |
| Validation | Zod | every form and every API route |
| Country flags | flag-icons (SVG) | emoji flags break on Windows |
| Icons | Lucide React (`lucide-react`) | Accessible, modern vector icons replacing emojis |
| Motion & Animation | Framer Motion (`framer-motion`) | Page transitions, spring physics, drawer & card reveals |
| Smooth Scrolling | Lenis (`lenis`) | Momentum inertial smooth scrolling (reduced-motion safe) |
| 3D Graphics | Three.js + React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`) | Botanical floating seed hero scene with device-aware CSS fallback |
| Analytics | Vercel Analytics (`@vercel/analytics/next`) | Page-view tracking; loaded in root layout |

---

## 4. Quick Start (Local Development)

Prerequisites: Node.js 20+, Git, VS Code.

```bash
git clone <repo> && cd sau-alumni
npm install
# create .env.local (see §5)
npm run dev        # http://localhost:3000
```

**Before pushing, ALWAYS:**

```bash
rm -rf .next && npm run build   # dev mode hides type errors; the build does not
```

Dev server notes:
- The Supabase service worker is disabled in dev (see `next.config.ts`).
- After running `npm run build`, delete `.next` before going back to `npm run dev` (mixed build artifacts cause `Cannot find module './xxx.js'`).
- Keep the VS Code "Console Ninja" extension **disabled** — its build hook corrupts Next dev.
- Windows Git Bash: `rm -rf .next`; cmd: `rmdir /s /q .next`.

---

## 5. Environment Variables

`.env.local` (dev) — never committed (`.gitignore` covers `.env*`); same values must exist in Vercel → Settings → Environment Variables (Production + Preview + Development).

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | `https://kkdmyrbwnupcyvzpevv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client+server | public-safe key; RLS applies |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | bypasses RLS — used by `/api/admin`, `/api/notices`, `/api/delete-image`. NEVER `NEXT_PUBLIC_`, never imported into a client component |
| `UPSTASH_REDIS_REST_URL` | server (middleware) | rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | server (middleware) | rate limiting |

`.env.example` documents the structure with placeholder values.

---

## 6. Folder & File Structure

```
app/
  layout.tsx                  root layout: Header, Footer, MadeByBadge, SmoothScroll, theme script
  globals.css                 Tailwind v4 theme tokens, glassmorphism, skeleton shimmer keyframes
  page.tsx                    landing page (3D botanical HeroScene, feature grid, stats)
  loading.tsx                 global instant route-transition loading with botanical spinner
  manifest.ts                 PWA manifest (name, icons, theme_color #1e5c3a)
  sw.ts                       Serwist service worker (navigation-only offline fallback)
  sitemap.ts                  dynamic sitemap (public profiles, published notices, faculties)
  robots.ts                   disallow /admin, /dashboard, /auth
  offline/page.tsx            PWA offline fallback

  auth/
    login/page.tsx            split-screen modern login with hero gradient panel
    signup/page.tsx           split-screen instant signup
    forgot-password/page.tsx  email-based password reset request (sends reset link)
    reset-password/page.tsx   set new password (reached via email reset link → callback)
    callback/route.ts         auth code exchange + profile row creation (used by reset-password flow and future email-confirmation)

  directory/
    page.tsx                  public directory: search, filters, keyset pagination, contacts via VIEW
    loading.tsx               directory skeleton: filter bar & alumni card grid

  alumni/[id]/
    page.tsx                  public profile: metadata, JSON-LD, avatar, contact cards
    loading.tsx               alumni profile spotlight card skeleton

  notices/
    page.tsx                  public notice list (pinned first, 30 latest)
    loading.tsx               notices list & pinned banner skeleton
    [slug]/
      page.tsx                notice detail: markdown+sanitize, image, draft preview
      loading.tsx             notice reader & detail skeleton

  faculty/[slug]/
    page.tsx                  faculty page with departments + member counts
    loading.tsx               faculty departments skeleton

  about/page.tsx              about + vision + credits

  privacy/page.tsx            গোপনীয়তা নীতি (privacy policy)
  terms/page.tsx              শর্তাবলী (terms of service)

  dashboard/
    page.tsx                  member home: status chips, profile-missing banner, quick actions
    loading.tsx               dashboard overview & quick action cards skeleton
    profile/page.tsx          profile edit (fetches profile + departments)
    contact/page.tsx          phone visibility + public/private toggle
    notices/page.tsx          my notices (edit/delete drafts)
    notices/new/page.tsx      create draft (contributor+)
    notices/[id]/edit/page.tsx edit own draft
    upload-test/page.tsx      manual image-upload test page

  admin/
    page.tsx                  member management (admin+; requireAdmin)
    loading.tsx               admin member list & queue skeleton
    queues/page.tsx           notices/verification/reports queues + audit log

  api/
    admin/route.ts            ALL privileged mutations (see §13)
    notices/route.ts          PATCH/DELETE own drafts (+ image cleanup on delete)
    delete-image/route.ts     server-side storage delete (service-role, own-file check)
    health/route.ts           GET uptime check (DB ping — monitors er jonno)

components/
  Header.tsx                  nav, auth state, bell, toggle, animated mobile drawer
  Footer.tsx, MadeByBadge.tsx rich 4-column footer, floating glass creator badge
  ThemeToggle.tsx             dark/light, localStorage, spring motion
  NoticeBell.tsx              realtime unread count + notification ping
  MarkNoticeRead.tsx          invisible marker on notice detail (inserts notice_reads)
  AlumniCard.tsx              directory card (avatar, verified badge, flag, career line, hover lift)
  CountryFlag.tsx             flag-icons wrapper (utils/countries code lookup)
  DirectoryFilters.tsx        search (300ms debounce) + faculty + country selects with icons
  NoticeForm.tsx              create/edit drafts, image upload + old-image cleanup
  ProfileEditForm.tsx         full profile form incl. avatar + cleanup with glass cards
  ContactPrivacyForm.tsx      phone/email privacy controls
  ImageUploader.tsx           generic uploader: bucket/maxSide/square props; resize, EXIF strip, WebP
  MyNoticesList.tsx           author's notice list (edit/delete)
  AdminMemberList.tsx         member rows + action buttons with role badges & Lucide icons
  AdminQueues.tsx             queue sections + action buttons with Lucide icons
  VerificationRequestCard.tsx "verify me" request UI with Framer Motion transitions
  HeroScene.tsx               interactive 3D Three.js/R3F botanical seed scene with mobile fallback
  SmoothScroll.tsx            Lenis smooth scrolling provider
  AnimatedSection.tsx         Framer Motion stagger animation container
  Skeleton.tsx                reusable skeleton building blocks + page composite skeletons

utils/
  supabase/server.ts          cookie-aware server client (await createClient())
  supabase/client.ts          browser client ("use client" only)
  admin.ts                    requireAdmin() + writeAudit() — SERVER ONLY
  service-client.ts           service-role client factory — SERVER ONLY
  rate-limit.ts               Upstash limiter (undefined-safe)
  countries.ts                fixed country list (name + ISO code)

supabase/migrations/          FULL schema history — source of truth, run in order
middleware.ts                 session refresh, /dashboard+/admin login gate, auth-page rate limit
```

---

## 7. Database Schema (Complete)

All tables in `public` schema. Migrations live in `supabase/migrations/` (applied via `npx supabase db push`).

### faculties
`id` uuid PK · `name` text unique · `slug` text unique · `code` varchar(10) · `created_at`
Seeded: Agribusiness Management.

### departments
`id` uuid PK · `faculty_id` → faculties (RESTRICT) · `name` · `slug` unique · `created_at`
Seeded: Agricultural Economics. **Never hardcode faculty/department names in code** — always read from these tables.

### profiles
| Column | Notes |
|---|---|
| `id` uuid PK | = `auth.users.id`, CASCADE delete |
| `department_id` → departments | nullable |
| `full_name` text NOT NULL | English |
| `avatar_url` text | public URL in `avatars` bucket |
| `graduation_year` int | expected year for current students |
| `current_designation`, `current_company` | English |
| `linkedin_url` | https://linkedin.com/... |
| `bio` | English, <=1000 chars |
| `is_public` bool default **true** | directory + profile visibility |
| `role` | `super_admin`/`admin`/`contributor`/`alumni` (default alumni) |
| `is_permanent` bool default false | true ONLY for the one permanent super-admin |
| `is_verified` bool default false | set only via admin API |
| `status` | `alumnus`/`current_student` |
| `current_country` | from `utils/countries.ts` fixed list, default 'Bangladesh' |
| `higher_study_institution`, `higher_study_program` | |
| `search_vector` | generated tsvector (english) over name+company+designation+bio |
| `deleted_at` | soft delete (suspend) |
| `created_at` | |

Indexes: department_id, graduation_year, status, partial (is_public), current_country, GIN(search_vector), GIN trigram(full_name).

### profile_contacts (contact privacy — column-level by design)
`profile_id` uuid PK → profiles · `email` text NOT NULL · `phone_number` text · `phone_visibility` (`public`/`members_only`/`private`, default **private**) · `updated_at`

**The app never reads this table directly for others** — it queries the VIEW:

### public_contact_info (VIEW)
```sql
CREATE VIEW public_contact_info AS
SELECT pc.profile_id, pc.email,
  CASE
    WHEN pc.phone_visibility = 'public' THEN pc.phone_number
    WHEN pc.phone_visibility = 'members_only' AND auth.uid() IS NOT NULL THEN pc.phone_number
    ELSE NULL
  END AS phone_number
FROM profile_contacts pc
JOIN profiles p ON p.id = pc.profile_id
WHERE p.is_public = true OR pc.profile_id = auth.uid();
```
Runs with **owner privileges (no security_invoker — deliberate, see §24)** so its WHERE/CASE is the single access rule; the raw table stays owner-RLS-locked. `GRANT SELECT` to anon + authenticated.

### notices
`id` · `author_id` → profiles · `faculty_id`, `department_id` (null = everyone) · `title` · `slug` unique (auto from title) · `content` (markdown) · `status` (`draft`/`published`, default draft) · `pinned` bool · `publish_at` (set on publish) · `image_url` · `created_at`

### notice_reads
`user_id`+`notice_id` PK (both CASCADE) · `read_at` — powers the unread bell.

### jobs (built, no UI yet — monetization-ready)
`id` · `posted_by` · `target_faculty_id` · `title` · `company_name` · `location` · `job_type` · `application_url_or_email` · `description` · `status` (`pending`/`active`/`archived`) · `is_featured` · `featured_until` · `created_at`

### invites (built, no UI yet)
`id` · `token_hash` unique (SHA-256; raw token never stored) · `invited_email` · `faculty_id`/`department_id` · `expires_at` (14d) · `used_at`/`used_by` · `created_at`

### verification_requests
`id` · `profile_id` (CASCADE) · `evidence_note` · `status` (`pending`/`approved`/`rejected`) · `reviewed_by` · `created_at`

### reports
`id` · `reporter_id` · `target_table` · `target_id` · `reason` · `status` (`pending`/`reviewed`/`dismissed`) · `created_at`

### audit_log (immutable)
`id` · `actor_id` (SET NULL) · `action` · `target_table` · `target_id` · `metadata` jsonb · `created_at`
No UPDATE/DELETE policies exist → immutable. Written only by service-role routes.

### Trigger: protect_profiles_privilege (BEFORE UPDATE/DELETE on profiles)
- DELETE of a permanent-admin row → exception
- UPDATE of permanent-admin row: changing `role`/`is_permanent`/`is_verified` → exception; other fields allowed (self-edit)
- Anyone with a JWT (auth.uid() not null) changing `role` or `is_verified` on any row → exception (admin API only — service-role requests have no auth.uid())
- Granting `is_permanent` to anyone → exception

Realtime: `alter publication supabase_realtime add table notices;`

---

## 8. Row-Level Security (RLS)

RLS is ON for **every** table. Summary:

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | `is_public OR id=auth.uid()` | own row | own row | none (hard delete only via admin) |
| profile_contacts | owner only | — | owner only | owner only |
| public_contact_info (VIEW) | granted anon+authenticated; logic inside | — | — | — |
| faculties, departments | everyone (`USING true`) | none (service only) | none | none |
| notices | `published OR author_id=auth.uid()` | own row **AND status='draft'** | none (service) | none (service) |
| notice_reads | own rows | own rows | own | own |
| jobs | `active OR posted_by=auth.uid()` | own | none | none |
| invites | no policies (service only) | — | — | — |
| verification_requests | own rows | own row AND status='pending' | none | none |
| reports | own rows | own row AND status='pending' | none | none |
| audit_log | permanent super_admin only | service only | none | none |

Storage RLS in §9.

---

## 9. Storage: Buckets, Policies, Image Lifecycle

### Buckets
| Bucket | Public read | Max size | MIME allowlist | Who can upload | Path pattern |
|---|---|---|---|---|---|
| `notice-images` | yes | 5MB | jpeg/png/webp (SVG blocked — XSS) | contributor/admin/super_admin | `<userId>/<timestamp>-<rand>.<ext>` |
| `avatars` | yes | 2MB | same | any authenticated user | same |

Storage policies (on `storage.objects`):
- `notice_images_upload` — insert to authenticated where role in (contributor, admin, super_admin) AND folder[1]=auth.uid()
- `notice_images_delete_own` — delete where folder[1]=auth.uid()
- `avatars_upload_own` / `avatars_delete_own` — insert/delete where folder[1]=auth.uid()

### Client upload pipeline (`components/ImageUploader.tsx`)
1. `createImageBitmap` → optional **square center-crop** (avatars)
2. Canvas resize to `maxSide` (1200 notices / 400 avatars) — **re-encode strips all EXIF incl. GPS**
3. Encode **WebP** q=0.85; if browser can't (Safari fallback returns non-webp), re-encode JPEG
4. Upload directly browser→Storage with the user's JWT (path starts with their user id)

### Deletion / orphan-free invariant (**preserve this!**)
- User-triggered removal (avatar remove, notice image remove/replace) → after a successful save, the client calls **`POST /api/delete-image`** with the old URL. That route: verifies login → parses bucket+path → checks the path starts with the caller's user id → deletes via **service-role** (guaranteed, no RLS dependency).
- Notice deletion (author `/api/notices` DELETE, admin `delete_notice`) → the route deletes the row **and** removes the image server-side with the service client.
- If you add any new image feature, keep the invariant: **when a file stops being referenced, delete it in the same flow.**

---

## 10. Auth & Signup Flow

Supabase Auth (email+password). Dashboard settings: **email confirmation OFF** (owner's decision — instant signup; invite tokens are the planned gate instead), minimum password 10, leaked-password protection ON, anonymous sign-in OFF, refresh token rotation ON.

**Signup (`app/auth/signup/page.tsx`):** Zod (name >=2, email, password 10-72) → `supabase.auth.signUp` (instant session; name stored in user metadata) → client inserts `profiles` row (RLS: own) → client inserts `profile_contacts` row with the signup email (RLS: own) → redirect `/`.

**Login:** `signInWithPassword`; generic error message (never reveals whether the email exists). Supports `?next=/path` redirect (validated: must start with `/` and not `//`).

**Forgot Password (`app/auth/forgot-password/page.tsx`):** Zod-validated email → `supabase.auth.resetPasswordForEmail` with `redirectTo` pointing at `/auth/callback?next=/auth/reset-password` → success banner instructs user to check email (incl. spam folder). Rate-limited via middleware.

**Reset Password (`app/auth/reset-password/page.tsx`):** Reached after clicking the email link → callback exchanges code for session → page lets user set a new password (min 10 chars, confirm match, Zod). `supabase.auth.updateUser({ password })` → redirect to `/dashboard`. Handles weak/leaked-password and missing-session errors with Bangla messages.

**Middleware (`middleware.ts`):** refreshes the Supabase session on every request; redirects logged-out users from `/dashboard` and `/admin` to `/auth/login?next=...`; rate-limits (10/min/IP) the login/signup/forgot-password pages via Upstash.

**Fallback guard:** the dashboard detects "logged in but no profiles row" (e.g., network failure during signup) and shows a "create profile" banner; the profile edit page upserts, so it self-heals.

---

## 11. Roles & Permission Matrix

| Capability | Alumni | Contributor | Admin | Super Admin |
|---|:--:|:--:|:--:|:--:|
| Edit own profile / privacy toggle | YES | YES | YES | YES |
| Write notice **drafts** | NO | YES | YES | YES |
| Publish / pin / archive / delete notices | NO | submit only | YES | YES |
| Verify / suspend members, manage contributors | NO | NO | YES | YES |
| Make / remove admins | NO | NO | NO | YES |
| Touch the permanent super-admin | NO | NO | NO | NO (DB-trigger-enforced) |
| See full audit log | NO | NO | own actions | YES all |
| Faculty/department management | NO | NO | NO | YES (SQL for now; UI pending) |
| Hard-delete accounts | NO | NO | soft only | YES (via API/SQL) |

---

## 12. Security Model

**Layered walls:**
1. **RLS on every table** (§8) — the primary wall for normal traffic (anon key).
2. **DB trigger** `protect_profiles_privilege` (§7) — even a buggy service call cannot escalate privileges.
3. **`requireAdmin()`** (`utils/admin.ts`) — every privileged API call re-verifies the caller's role **from the database** (never client state), then hands out a service-role client.
4. **Zod** on every request body; action enums are closed lists.
5. **Audit log** — every admin mutation recorded (actor, action, target, metadata).
6. **CSP + security headers** in `next.config.ts` (X-Frame-Options DENY, nosniff, HSTS, Permissions-Policy, Referrer-Policy; CSP `default-src 'self'`, img-src includes the Supabase host derived from env, connect-src includes Supabase + realtime wss; dev adds eval+ws localhost).
7. **Rate limiting** on auth pages.
8. **Markdown sanitized** via rehype-sanitize; SVG uploads blocked.
9. `SUPABASE_SERVICE_ROLE_KEY` never leaves server code (`utils/admin.ts`, `utils/service-client.ts`, and API routes only).

**Never do:** import `utils/admin.ts` or `utils/service-client.ts` from a client component; put the service key in `NEXT_PUBLIC_*`; add an RLS policy with `USING (true)` on a table with private data; render notice content as raw HTML.

---

## 13. API Routes (Complete Reference)

### `POST /api/admin` — all privileged mutations
Request: `{ action: string, target_id: uuid, value?: boolean }` — requires admin or super_admin session.
Actions: `set_verified`, `make_contributor`, `make_alumni`, `make_admin`, `demote_admin`, `suspend`, `restore`, `approve_verification`, `reject_verification`, `review_report`, `dismiss_report`, `publish_notice`, `unpublish_notice`, `pin_notice`, `archive_notice`, `unarchive_notice`, `delete_notice` (drafts only; also removes its image).
Guards: permanent/super-admin rows untouchable; admin rows only by super-admin; status transitions validated (publish requires draft, etc.). Every action → `writeAudit`.
Responses: `{ok:true}` / 4xx with `{error: "..."}`.

### `PATCH /api/notices` — update own draft
`{ id, title, content, image_url, faculty_id, department_id }` — author-only, draft-only (checked via RLS-visible row + explicit status check), update via service client.

### `DELETE /api/notices` — delete own draft
`{ id }` — author-only, draft-only; deletes the row and its image (service client).

### `POST /api/delete-image` — storage cleanup
`{ url }` — login required; URL must be a Supabase public URL of bucket `avatars` or `notice-images`; path must start with the caller's user id; deletes via service-role. Returns `{ok:true}` / 403 `{error:"forbidden"}`.

### `GET /api/health` — uptime monitoring
Returns `{ status: "ok", db: "ok" }` (200) if the DB is reachable; `{ status: "unhealthy", db: "error" }` (500) otherwise. Used by external monitors like UptimeRobot.

### `GET /auth/callback` — auth code exchange
Exchanges the `code` query param for a session; if the user has no `profiles` row yet (e.g., signup email confirmation), auto-creates one with their `user_metadata.full_name`. Validates `next` param (must start with `/`, not `//`) to prevent open redirect. Used by **password reset** and retained for **future email-confirmation** flows.

---

## 14. Pages (Complete Reference)

| Route | Access | Notes |
|---|---|---|
| `/` | public | landing |
| `/directory` | public | search+filters; contacts come from `public_contact_info` VIEW only |
| `/alumni/[id]` | public (private → 404) | metadata + JSON-LD; owner sees own private with banner |
| `/notices` | public | pinned first, 30 latest published |
| `/notices/[slug]` | public | markdown+sanitize; draft preview only for its author |
| `/faculty/[slug]` | public | departments + counts |
| `/about` | public | credits + creator mini-portfolio |
| `/privacy` | public | গোপনীয়তা নীতি — plain Bangla privacy policy |
| `/terms` | public | শর্তাবলী — terms of service |
| `/offline` | public | PWA offline fallback |
| `/auth/login`, `/auth/signup` | public | split-screen themed |
| `/auth/forgot-password` | public | email-based password reset request |
| `/auth/reset-password` | public (session via callback) | set new password after email link |
| `/dashboard` | login | guards + verification card |
| `/dashboard/profile` | login | upsert profile |
| `/dashboard/contact` | login | phone visibility + is_public |
| `/dashboard/notices` (+`/new`, `/[id]/edit`) | login (contributor+ for write) | drafts management |
| `/dashboard/upload-test` | login | manual image-upload test page (dev utility) |
| `/admin` | admin+ | member management |
| `/admin/queues` | admin+ | notices/verification/reports + audit |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/sw.js` | public | generated |

---

## 15. Realtime

`components/NoticeBell.tsx` (in the Header): computes unread = published notices minus own `notice_reads`; subscribes to `postgres_changes` INSERT+UPDATE on `notices` filtered `status=eq.published` → refetch on event; **60-second polling fallback**; channel name is randomized per mount (StrictMode-safe); unsubscribe on unmount. `MarkNoticeRead` inserts a `notice_reads` row when a published notice page is opened (idempotent). `wss://*.supabase.co` is allowed in CSP connect-src.

---

## 16. SEO & PWA

- `generateMetadata` on profile + notice detail pages (unique title/description).
- `metadataBase` = production URL (root layout).
- `sitemap.ts`: static pages + faculty slugs + published notice slugs + **public profiles only** (privacy-first).
- `robots.ts`: disallow `/admin`, `/dashboard`, `/auth`.
- JSON-LD `ProfilePage`/`Person` (alumniOf SAU) on profiles.
- PWA: `manifest.ts` (SAU icons 192/512 + maskable, theme #1e5c3a, standalone), Serwist precache + navigation-only offline fallback. iOS: install via Safari → Share → Add to Home Screen (Chrome on iOS doesn't trigger install).

---

## 17. Theme & Design System

Tokens in `app/globals.css` (Tailwind v4 `@theme inline`):

| Token | Light | Dark |
|---|---|---|
| `base` (page bg) | #faf6ea (warm cream) | #111814 (muted dark green) |
| `surface` (cards) | #ffffff | #1a231d |
| `ink` (text) | #20301f | #e7efe8 |
| `line` (borders) | #e7e0cd | #2c382f |
| `sau` (primary) | #1e5c3a (deep forest green) | same |
| `sau-hover` | #174a2e | #1e5c3a |
| `sau-light` | #2a7d52 | #3da87a |
| `gold` (accent) | #b45309 (harvest) | #f59e0b |
| `gold-light` | #d97706 | #fbbf24 |

Dark mode: `@custom-variant dark` (class strategy), `ThemeToggle` persists to `localStorage("theme")`, an inline script in `layout.tsx` applies the class before paint (no flash), `<html suppressHydrationWarning>`.

### Modern Visual & UX Redesign Overhaul

1. **Rich Agricultural Aesthetics**:
   - Deep forest green (`#1e5c3a`), warm harvest gold (`#b45309`), and organic soil/cream backgrounds (`#faf6ea` / dark `#111814`).
   - `.glass-card` and `.glass-navbar` with backdrop-blur, subtle ambient glow borders, and light background grain texture (`.bg-grain`).
2. **Interactive 3D Hero Scene (`components/HeroScene.tsx`)**:
   - Built using Three.js & React Three Fiber (`@react-three/fiber`, `@react-three/drei`).
   - Features floating, organic botanical seed/leaf meshes with particle spore fields.
   - Device-aware fallback: automatically detects mobile or low-spec hardware and renders lightweight CSS radial gradients.
3. **Smooth Inertial Scrolling (`components/SmoothScroll.tsx`)**:
   - Powered by Lenis for buttery-smooth desktop scrolling, strictly disabled when `prefers-reduced-motion` is active.
4. **Fluid Motion & Micro-Interactions (`components/AnimatedSection.tsx`)**:
   - Framer Motion stagger animations for headers, card grids, and mobile drawer transitions.
5. **Icon System Modernization**:
   - Completely phased out plain emojis in favor of crisp, accessible Lucide React icons (`lucide-react`) across Header, Directory, Cards, Notices, Auth, Forms, and Admin views.
6. **Split-Screen Authentication Experience**:
   - Modern split layouts for `/auth/login` and `/auth/signup` featuring gradient illustration sidebars and glass form cards.

---

### Loading Animations & Skeleton Body System

To eliminate abrupt content popping and provide feedback during network latency and data fetching, the application implements a multi-tier loading architecture:

1. **CSS Shimmer Engine (`app/globals.css`)**:
   - Custom `.skeleton` utility utilizing `@keyframes skeleton-shimmer` with a 200% gradient sweep matching both light and dark mode tones.
2. **Modular Skeleton Library (`components/Skeleton.tsx`)**:
   - `Skeleton`: Atomic primitive for arbitrary shapes.
   - `AlumniCardSkeleton`: Matches directory card dimensions (avatar, name, batch, designation, and tags).
   - `DirectorySkeleton`: Full directory layout preview including filter bar and card grid.
   - `ProfileSkeleton`: Profile spotlight hero, cover banner, bio, and contact information skeleton.
   - `NoticeCardSkeleton` & `NoticeDetailSkeleton`: Pinned notice, post list, and article reader skeletons.
   - `DashboardSkeleton`: User greeting, verification alert, and quick action cards preview.
   - `FacultySkeleton` & `AdminSkeleton`: Department cards, metric chips, and administrative table row skeletons.
3. **Route-Level Suspense Boundaries (`loading.tsx`)**:
   - `app/loading.tsx`: Global instant route-transition loading with branded botanical spinner and pulsating message.
   - `app/directory/loading.tsx`: Instant skeleton for public alumni directory.
   - `app/alumni/[id]/loading.tsx`: Instant skeleton for profile view.
   - `app/notices/loading.tsx`: Instant skeleton for the notice board.
   - `app/notices/[slug]/loading.tsx`: Instant skeleton for notice detail reading.
   - `app/dashboard/loading.tsx`: Instant skeleton for authenticated member dashboard.
   - `app/faculty/[slug]/loading.tsx`: Instant skeleton for faculty department listings.
   - `app/admin/loading.tsx`: Instant skeleton for the admin management console.

---

## 18. Development Workflow — Golden Rules

1. **`npm run build` before every push.** (Dev hides type errors.)
2. **Schema changes only via migrations**: `npx supabase migration new <name>` → edit SQL → `npx supabase db push`. Never click-edit the dashboard.
3. **Every admin mutation**: Zod → `requireAdmin()` → guards → service-client update → `writeAudit()`.
4. **Every form**: Zod with Bangla error messages.
5. **Never hardcode** faculties/departments/countries — read from DB / `utils/countries.ts`.
6. **Image changes must keep the orphan-free invariant** (§9).
7. Commit style: short imperative English, e.g. `Realtime notice bell fix`.
8. UI additions must be Bangla; placeholders tell users to write content in English.

---

## 19. Known Quirks & Pitfalls (READ BEFORE CODING)

1. **Next.js 15 async APIs** — `await params`, `await searchParams`, `await cookies()`. Files with JSX must be `page.tsx`; endpoints are `route.ts`.
2. **PostgREST embed ambiguity** — when two FK paths connect the same tables, plain embeds fail ("more than one relationship"). Use FK hints:
   - `profiles!notices_author_id_fkey(full_name)`
   - `faculties!notices_faculty_id_fkey(name)`, `departments!notices_department_id_fkey(name)`
   - `profiles!verification_requests_profile_id_fkey(full_name)` (table has two FKs to profiles: profile_id + reviewed_by)
   - FK names = `<table>_<column>_fkey`. This bites `notices→profiles` (direct author_id + via notice_reads) and `verification_requests→profiles`.
3. **Untyped Supabase results** — structured selects don't match hand-written types; cast `as unknown as T[]`. Plain `as` fails when embeds are involved.
4. **Supabase SQL Editor runs as table owner** → RLS is bypassed there. To actually test RLS: `SELECT set_config('request.jwt.claims', json_build_object('sub','<uuid>')::text, true); SET LOCAL ROLE authenticated;` inside a transaction. Triggers fire for the owner (that's why trigger tests work directly).
5. **PostgREST schema cache** — after DDL, run `NOTIFY pgrst, 'reload schema';` and wait ~10s if you get "Could not find column ... in schema cache".
6. **Serwist typing** — `sw.ts` derives options via `ConstructorParameters<typeof Serwist>[0]` because exported type names changed across versions. Don't "simplify" it.
7. **`.next` corruption** — after a production build, `rm -rf .next` before `npm run dev`, or you'll see `Cannot find module './xxx.js'`.
8. **Realtime channel names must be unique per mount** (React StrictMode double-mounts effects in dev).
9. **Table Editor caches** — refresh the table after API-side changes before concluding "it didn't work".
10. **CSP is env-driven** — the Supabase host in `img-src` comes from `NEXT_PUBLIC_SUPABASE_URL`; if you add external image hosts (R2, etc.), extend CSP in `next.config.ts`.
11. **The middleware matcher** excludes `_next/static`, `_next/image`, favicon, manifest.json, sw.js, swe-worker, and image extensions — don't break this or the PWA/directory will misbehave.
12. **`current_country` is a fixed dropdown** (`utils/countries.ts`) — free text would shatter filters/aggregation.
13. **Contact info must be read through the `public_contact_info` VIEW**, never `profile_contacts`.
14. **Signup is instant** (no email confirmation) and inserts two rows client-side (`profiles`, `profile_contacts`); the dashboard self-heals a missing row.
15. **The contact VIEW intentionally has no `security_invoker`** — see §24; adding it back will blank everyone's email in the directory.

---

## 20. Common Tasks — Recipes

**Add a new admin action:**
1. Add the action string to the `z.enum([...])` in `app/api/admin/route.ts`.
2. Add a guard-checked block (see existing ones) → service-client update → `writeAudit`.
3. Add a button in `AdminMemberList.tsx` / `AdminQueues.tsx` calling `act("<action>", id)`.

**Add a new page:** create `app/<route>/page.tsx` (JSX) or `route.ts` (endpoint); server components use `await createClient()` from `utils/supabase/server`; client components start with `"use client"`.

**Add a migration:** `npx supabase migration new <name>` → write SQL → `npx supabase db push`.

**Add an env var:** add to `.env.local` **and** Vercel env vars; document in `.env.example`.

**Add a faculty/department (UI pending):** insert a row in `faculties`/`departments` (SQL or Table Editor — read-only convention applies to *code*, not manual data entry).

**Make someone an admin:** as permanent super-admin, use `/admin` → Admin button (uses `make_admin`).

**Change CSP for a new image host:** edit `next.config.ts` `headers()` — derive hosts from env where possible.

**Change the country list:** edit `utils/countries.ts` (name + ISO code — codes power the flags).

---

## 21. Deployment

1. Push to `main` → Vercel auto-builds (`next build`) and deploys https://sau-alumni.vercel.app.
2. Ensure all five env vars exist in Vercel (Production/Preview/Development).
3. After first deploy: submit `https://sau-alumni.vercel.app/sitemap.xml` to Google Search Console + Bing Webmaster Tools.
4. Local build parity: `rm -rf .next && npm run build` must pass clean (yellow Upstash warnings are fine).

---

## 22. Admin Operations Runbook

- **Members:** verify, promote contributor, suspend (soft-delete: hides from directory/public pages and sitemap; login still possible — upgrade to full block if needed), restore.
- **Notices:** drafts → publish (sets publish_at, fires realtime bell); pin; archive; delete (draft only, removes image).
- **Verification:** approve → sets `is_verified` + badge; reject → user can re-request.
- **Audit:** `/admin/queues` bottom table (last 50).
- **Backups (free tier = your responsibility):** periodically dump the DB and store outside the repo; practice a restore once.
- **Idle pause:** Supabase free projects pause after ~1 week of inactivity — real traffic or a scheduled keep-alive ping prevents it.

---

## 23. Rebuilding From Scratch

1. New Supabase project (Singapore) → note URL/keys.
2. `npx supabase link --project-ref <ref>` then `npx supabase db push` (runs every migration in order: schema, trigger, RLS, buckets, storage policies, realtime publication).
3. Create the permanent super-admin (SQL editor):

```sql
ALTER TABLE profiles DISABLE TRIGGER profiles_privilege_guard;
UPDATE profiles SET is_permanent = true, role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = '<your-email>');
ALTER TABLE profiles ENABLE TRIGGER profiles_privilege_guard;
```

4. Dashboard auth settings: confirm email OFF, min password 10, leaked-password protection ON, anonymous OFF.
5. Set redirect URLs (Auth → URL Configuration): production + `http://localhost:3000/auth/callback`.
6. Deploy to Vercel with the five env vars; submit the sitemap.
7. Seed faculties/departments (or reuse the migration seeds).

---

## 24. Documented Deviations From Original Spec

Transparency for future maintainers — each was a deliberate, tested decision:

1. **Email confirmation OFF** at signup (spec wanted ON) — owner chose frictionless signup; invite-token gating is the planned replacement. Code impact: signup inserts profile rows immediately; `/auth/callback` retained for future use.
2. **Cloudflare R2 → Supabase Storage** — R2 requires a payment card; budget is ৳0. 1GB is ample; `ImageUploader` centralizes bucket access so a future move to R2 touches one file + CSP.
3. **`public_contact_info` VIEW without `security_invoker`** — with security_invoker, the view ran under the caller's RLS and the owner-only policy on `profile_contacts` blanked everyone's email. Owner-executing (default) makes the view's own WHERE/CASE the single rule; the raw table remains locked. Verified: emails visible anon+logged-in, phone follows visibility.
4. **Trigger softened for self-edit** — the permanent super-admin can edit their own non-privileged profile fields (spec's original trigger blocked all updates, contradicting the role matrix). Privilege fields remain frozen; audit-logged admin API remains the only path for role changes.
5. **`country-list` npm → custom `utils/countries.ts`** — one source for dropdown + flag codes, fewer dependencies.
6. **CSP `script-src 'unsafe-inline'`** — required by Next.js App Router inline hydration scripts; XSS defense shifted to sanitized markdown + escaped React rendering.

---

## 25. Roadmap / Upgrade Ideas

Near-term: faculty/department management UI (super-admin), scheduled notice publishing (`publish_at` + Vercel cron — 2 jobs on Hobby), weekly email digest (Resend free tier + SPF/DKIM on a subdomain), job board UI (`jobs` table ready), invite-token signup gating (`invites` table ready), account self-deletion, Cloudflare Turnstile on signup, Sentry, custom domain.

Later: events + RSVP, mentorship opt-in, web push, "claim your profile" pre-seeding, alumni stats widgets, R2 migration.

**Deliberately not planned:** direct messaging (moderation burden), paid features (Hobby = non-commercial).

---

## 26. Credits

Built by **Adnan Eram Argho** — non-commercial, community-run. The floating "AE" badge (bottom-right, expands on hover) links to `/about`.
