# Backend System — Complete Architecture Documentation

## PURPOSE OF THIS FILE
Yeh file isliye bani hai taaki kisi bhi nayi chat mein sirf yeh file padhke poora system samajh aaye.
Code dobara analyse karne ki zaroorat na pade, user se poochne ki zaroorat na pade.

---

## SYSTEM KA MAKSAD

**Single Next.js backend jo multiple journals (sites) ko manage karta hai.**

- Har journal ka apna alag database hai
- Har journal ka apna domain hai
- Ek SUPER_ADMIN hai jo kisi bhi journal ka data manage kar sakta hai
- Har journal ka apna ADMIN hota hai jo sirf apna data manage kar sakta hai

---

## SITES CONFIGURATION

**File:** `src/config/sites.ts`

Abhi 2 sites configured hain:

| Slug | Domain | DB Env Var | Short Name |
|------|--------|------------|------------|
| `wjiis` | `wjiis.com` | `DATABASE_URL_WJIIS` | WJIIS |
| `ijarcm` | `ijarcm.com` | `DATABASE_URL_IJARCM` | IJARCM |

**Localhost fallback:** `DEV_SITE_SLUG = 'wjiis'` — localhost pe sirf wjiis kaam karta hai (line 47)

**Naya site add karna ho to:** `sites` object mein entry add karo, `.env` mein DB/SMTP/R2 vars add karo.

---

## HOW SITE IS DETERMINED — FLOW

### Step 1: Middleware (`middleware.ts`)
- Har incoming request pe `Host` header se domain nikalta hai
- `getSiteConfigByDomain(host)` se site config milti hai
- `x-site-slug: 'wjiis'` header inject karta hai request mein
- Localhost pe → wjiis (hardcoded fallback)
- Unknown domain → 404

### Step 2: API Routes — DB Selection (`src/lib/site-context.ts`)
Function: `getPrismaForAdminRequest(request)`

```
SUPER_ADMIN ke liye:
  → x-active-site header check karo
  → Agar valid site slug hai → us site ka Prisma client return karo
  → Agar nahi → request ke x-site-slug se determine karo

NORMAL ADMIN ke liye:
  → session.user.siteSlug se Prisma client return karo
```

### Step 3: Prisma Registry (`src/lib/prisma-registry.ts`)
- `getPrismaClient(slug)` — slug ke hisaab se DB connection return karta hai
- Connection pool hai — ek baar bana to cache hota hai

---

## AUTHENTICATION SYSTEM

**File:** `src/lib/auth-factory.ts`

### SUPER_ADMIN
- Credentials: `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASS_HASH` env vars se
- DB mein koi row nahi hota SUPER_ADMIN ka
- Session mein: `role: 'SUPER_ADMIN'`, `siteSlug: 'super'`
- `'super'` kisi bhi configured site ka slug nahi hai — yeh sirf identifier hai

### Normal ADMIN
- DB mein user row hota hai apni site ke DB mein
- Session mein: `role: 'ADMIN'`, `siteSlug: 'wjiis'` (ya jis site ka admin ho)

### Per-Site Auth
- Har site ka apna `NEXTAUTH_SECRET_*` env var hai
- `getAuthOptions(prisma, siteSlug)` — site ke hisaab se auth options banata hai

---

## CLIENT-SIDE SITE SWITCHING

**File:** `src/lib/admin-fetch.ts`

`adminFetch()` function — saare admin API calls isse karte hain.

- SUPER_ADMIN ke liye: `localStorage['superadmin_active_site']` se active site slug uthata hai
- `x-active-site: 'wjiis'` (ya selected site) header bhejta hai
- Normal ADMIN ke liye: `session.user.siteSlug` se header set hota hai

**File:** `src/lib/admin-site.ts`

- `getAdminSiteSlug()` — localStorage se current active site slug
- `setAdminSiteSlug(slug)` — localStorage mein site slug save karo
- `getAdminStoreStorageKey(name)` — site-specific sessionStorage key banata hai (e.g., `admin-store:wjiis`)

---

## SITE SWITCHER UI

**File:** `src/app/admin/page.tsx` (lines 311-330)

- Sirf SUPER_ADMIN ko dikh`ta hai dashboard header mein
- `<select>` dropdown — wjiis / ijarcm
- Switch karne pe: `setAdminSiteSlug(slug)` → `window.location.reload()`
- Page reload ke baad saari API calls naye site ke liye `x-active-site` header bhejti hain

---

## ADMIN STORE — CACHING

**File:** `src/store/adminStore.ts`

- Zustand store with sessionStorage persistence
- Site-specific keys: `admin-store:wjiis`, `admin-store:ijarcm`
- Site switch hone pe page reload se automatically naya site ka store load hota hai
- `invalidatePapers()`, `invalidateStats()` etc. — manually cache clear karne ke liye

---

## ROLE CHECK — CURRENT PROBLEM

**Sahi check (9 files mein):**
```ts
if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Galat check (57 files mein):**
```ts
if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

**Impact:** SUPER_ADMIN 57 routes pe block ho jata hai — kuch bhi nahi kar sakta.

**Fix:** `role !== 'ADMIN'` ko `!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)` se replace karna hai.

---

## INCOMPLETE / BROKEN THINGS (Priority Order)

### 1. Localhost pe sirf WJIIS kaam karta hai
**Problem:** `sites.ts` line 60-62 mein localhost hardcode hai `wjiis` ke liye.
Development mein IJARCM test nahi ho sakta.

**Fix Options:**
- Option A: `localhost:3004` → wjiis, `localhost:3005` → ijarcm (alag ports)
- Option B: Local hosts file mein `wjiis.local` aur `ijarcm.local` add karo
- Option C: Middleware mein port-based routing add karo

**User ki zaroorat:** Decide karna hai ke development mein dono sites kaise distinguish hongi.

### 2. SUPER_ADMIN 57 routes pe block hai
**Problem:** Role check galat hai (dekho upar)
**Fix:** PowerShell se automated replacement + 5 files manual cleanup

### 3. IJARCM .env incomplete
```
# YEH COMMENTED OUT HAIN — ACTIVATE KARNA HOGA:
# SMTP_USER_IJARCM=
# SMTP_PASS_IJARCM=
# SMTP_FROM_IJARCM=
# R2_BUCKET_IJARCM=ijarcm-files
# R2_PUBLIC_URL_IJARCM=
```

### 4. next.config.js mein sirf WJIIS ka domain
```js
images: {
  domains: ['localhost', 'wjiis.com', 'www.wjiis.com'],
  // MISSING: 'ijarcm.com', 'www.ijarcm.com'
}
```

### 5. Papers list mein naye papers nahi dikhte
**Problem:** `/admin/research-papers/new` se paper submit hone ke baad `invalidatePapers()` call nahi hoti.
Zustand cache stale rehta hai, fresh fetch nahi hota.
**Fix:** Submit ke baad `invalidatePapers()` call karo phir `router.push('/admin/papers')`.

### 6. research-papers system aur papers system overlap
**Situation:**
- `/admin/research-papers/new` — paper add karne ka naya flow (DOCX → AI extract → PDF → submit)
- `/admin/papers` — paper list
- Dono `prisma.paper` table use karte hain
- **Maksad:** research-papers wala add flow `/admin/papers/new` mein merge karna, `/admin/research-papers` hatana

---

## FILE STRUCTURE — KEY FILES

```
e:/wjiis.com/
├── middleware.ts                          # Domain → x-site-slug injection
├── next.config.js                         # Image domains, webpack aliases
├── .env                                   # DB URLs, SMTP, R2, secrets
├── prisma/schema.prisma                   # Shared schema — dono sites ke liye same
├── src/
│   ├── config/
│   │   └── sites.ts                       # Site configs (slug, domain, env var names)
│   ├── lib/
│   │   ├── auth-factory.ts                # Per-site NextAuth options + SUPER_ADMIN auth
│   │   ├── prisma-registry.ts             # DB connection pool per site
│   │   ├── site-context.ts                # Server-side site/DB resolution
│   │   ├── admin-fetch.ts                 # Client-side fetch with x-active-site header
│   │   └── admin-site.ts                  # localStorage site slug management
│   ├── store/
│   │   └── adminStore.ts                  # Zustand store — site-specific caching
│   └── app/
│       ├── admin/
│       │   ├── layout.tsx                 # Auth check, sidebar, navbar
│       │   ├── page.tsx                   # Dashboard + site switcher UI (SUPER_ADMIN only)
│       │   ├── papers/
│       │   │   └── page.tsx               # Paper list — fetches from /api/admin/papers
│       │   └── research-papers/
│       │       └── new/page.tsx           # Paper add flow (DOCX → PDF → submit)
│       └── api/
│           └── admin/
│               ├── papers/route.ts        # GET: paper list (CORRECT role check)
│               ├── research-papers/
│               │   ├── route.ts           # GET: WRONG role check (blocks SUPER_ADMIN)
│               │   └── submit/route.ts    # POST: WRONG role check (blocks SUPER_ADMIN)
│               └── [57 other routes]      # Sab WRONG role check use karte hain
```

---

## KAAM KARNE KE RULES (NEW CHAT MEIN BHI FOLLOW KARO)

1. **Permission pehle, kaam baad mein** — koi bhi change karne se pehle user se confirm karo
2. **Sirf analyse karne ko bola hai to sirf analyse karo** — code mat badlo
3. **Naya system mat banao** — jo already bana hua hai use karo (auth-factory, site-context, admin-fetch sab sahi hain)
4. **Assumptions mat lo** — user se seedha poochho agar kuch unclear ho
5. **English only** — code mein comments, errors, UI text, logs — sab English mein
6. **Ek kaam ek baar** — plan banao, user approve kare, tab karo
7. **Context waste mat karo** — agar ek agent ya tool se kaam ho jaye to zyada mat chalao
8. **Galti ho to seedha bolo** — chhupaao mat, baar baar wohi galti mat karo

---

## CURRENT TASK STATUS (2026-06-15)

**Abhi jo kaam karna tha:**
Point 1 — Development mein localhost pe dono sites (wjiis + ijarcm) distinguish karna.

**User ka decision chahiye:** Kaunsa approach use karein localhost pe dono sites ke liye?
- Port-based (3004 = wjiis, 3005 = ijarcm)?
- Hosts file based (wjiis.local, ijarcm.local)?
- Middleware mein kuch aur?
