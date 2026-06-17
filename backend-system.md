# Backend System — Complete Architecture Documentation

## PURPOSE OF THIS FILE
Yeh file isliye bani hai taaki kisi bhi nayi chat mein sirf yeh file padhke poora system samajh aaye.
Code dobara analyse karne ki zaroorat na pade, user se poochne ki zaroorat na pade.

---

## SYSTEM KA MAKSAD (GOAL — YEH NA BADLE)

**Single Next.js backend jo multiple journals (sites) ko manage karta hai.**

- Har journal ka apna alag database hai
- Har journal apni apni domain par chalta hai (e.g. wjiis.com, ijarcm.com)
- SUPER_ADMIN: ek hi login, kisi bhi domain se ho sakta hai, apne panel mein kisi bhi site ka data dekh/change kar sakta hai (site-switcher dropdown se)
- Normal ADMIN: sirf apni domain se login hota hai, sirf apne site ke DB ka data dekhta hai
- Public visitor: jis domain par jaye, usi journal ka frontend (homepage, papers, about, etc.) dikhe

**Important boundary**: Admin panel ko "poori tarah alag" (separate app/subdomain) nahi karna — abhi jo single-codebase + per-site-secret design hai usi mein SUPER_ADMIN ke session ko site-independent banana hai. Yeh chhota targeted fix hai, redesign nahi.

---

## SITES CONFIGURATION

**File:** `src/config/sites.ts`

Abhi 2 sites configured hain:

| Slug | Domain | Dev domain | DB Env Var | Short Name |
|------|--------|-----------|------------|------------|
| `wjiis` | `wjiis.com` | `wjiis.local` | `DATABASE_URL_WJIIS` | WJIIS |
| `ijarcm` | `ijarcm.com` | `ijarcm.local` | `DATABASE_URL_IJARCM` | IJARCM |

`getSiteConfigByDomain(host, activeSiteCookie?)`:
- Real domain match → us site ka config
- Dev domain (`wjiis.local` / `ijarcm.local`) → mapped site
- `localhost` / `127.0.0.1` → `active-site` cookie agar set hai to wahi site, warna `DEV_SITE_SLUG` (wjiis) fallback
- Unknown domain → `null` (404)

**Naya site add karna ho to:** `sites` object mein entry add karo, `.env` mein DB/SMTP/R2/NEXTAUTH_SECRET vars add karo, `devDomains` mein dev domain map karo.

---

## LOCALHOST DEV SETUP (SOLVED)

- Windows hosts file mein `wjiis.local` aur `ijarcm.local` add kiye gaye hain (127.0.0.1 par point)
- SUPER_ADMIN panel mein site-switch dropdown plain `localhost` par bhi `active-site` cookie set karta hai (`src/lib/admin-site.ts` → `setAdminSiteSlug`), jisse middleware us cookie ke hisaab se site resolve karta hai — sirf localhost/127.0.0.1 par honored, production domains is cookie se affected nahi hote

---

## ROUTING — PUBLIC PAGES (MIDDLEWARE REWRITE)

**File:** `src/middleware.ts` ⚠️ **root mein nahi, `src/` ke andar hona ZAROORI hai** (project `src/app` structure use karta hai — Next.js convention; root `middleware.ts` silently ignore ho jaata hai, koi error nahi aata)

Public page folders route-groups nahi hain (`(wjiis)`/`(ijarcm)` build error deta hai — "two parallel pages resolve to same path"). Isliye plain folders use hote hain:

```
src/app/sites/wjiis/page.tsx, layout.tsx, about/, papers/, etc.
src/app/sites/ijarcm/page.tsx, layout.tsx  (sirf homepage abhi tak — baaki pages pending)
```

⚠️ Folder ka naam underscore se shuru NAHI hona chahiye (`_sites` Next.js ka "private folder" convention hai, automatically routing se exclude ho jaata hai — yeh ek baar bug ban chuka hai).

**Middleware flow:**
1. `Host` header + `active-site` cookie se `siteConfig` resolve karta hai
2. `x-site-slug` header inject karta hai (sab API routes/Server Components ke liye)
3. `ALLOWED_PATHS` (`/api/maintenance`, `/api/auth`, `/_next`, `/favicon.ico`, `/images`, `/static`, `/uploads`) aur `ADMIN_PATHS` (`/admin`, `/api/admin`) → sirf header set, pass through, URL nahi badalta
4. Baaki sab (public pages) → `NextResponse.rewrite()` se `/sites/{slug}{pathname}` par silently rewrite, browser URL same rehta hai

---

## API ROUTES — DB SELECTION

**File:** `src/lib/site-context.ts`

```
getPrismaForRequest(request) → x-site-slug header se Prisma client (public pages ke liye)

getPrismaForAdminRequest(request):
  SUPER_ADMIN ke liye:
    → x-active-site header check karo
    → Valid site slug hai → us site ka Prisma client return karo
    → Nahi hai → request ke x-site-slug se determine karo
  NORMAL ADMIN ke liye:
    → session.user.siteSlug se Prisma client return karo
```

**File:** `src/lib/prisma-registry.ts` — `getPrismaClient(slug)`, connection pool cached per site.

---

## AUTHENTICATION SYSTEM

**File:** `src/lib/auth-factory.ts`

### SUPER_ADMIN
- Credentials: `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASS_HASH` env vars se, DB mein koi row nahi
- Session: `role: 'SUPER_ADMIN'`, `siteSlug: 'super'`

### Normal ADMIN
- DB mein user row apni site ke DB mein
- Session: `role: 'ADMIN'`, `siteSlug: 'wjiis'` (ya jis site ka admin ho)

### Per-Site Auth Secret
- Har site ka apna `NEXTAUTH_SECRET_*` env var hai
- `getAuthOptions(prisma, siteSlug)` — site ke hisaab se JWT secret select karta hai

---

## CLIENT-SIDE SITE SWITCHING

**File:** `src/lib/admin-fetch.ts` — `adminFetch()`, saare admin API calls isse hote hain
- SUPER_ADMIN: `localStorage['superadmin_active_site']` se `x-active-site` header bhejta hai (sirf agar explicitly select kiya ho)
- Normal ADMIN: `session.user.siteSlug` se header

**File:** `src/lib/admin-site.ts`
- `getAdminSiteSlug()` / `setAdminSiteSlug(slug)` — localStorage + `active-site` cookie (cookie sirf localhost site-resolution ke liye)

**File:** `src/app/admin/page.tsx` — site-switcher dropdown (SUPER_ADMIN only), switch → `setAdminSiteSlug()` → `window.location.reload()`

---

## 🔴 KNOWN BUGS — ABHI PENDING (Priority Order)

### BUG 1 — Public API fetches 404 ho jaate hain (HIGH PRIORITY, next karna hai)
**Root cause:** `src/middleware.ts` ke `ALLOWED_PATHS` / `ADMIN_PATHS` mein generic `/api/*` (non-admin) paths included nahi hain. Isliye client-side `fetch('/api/team-members')` jaisi calls bhi "public page" samjhi jaati hain aur `NextResponse.rewrite()` se `/sites/{slug}/api/team-members` par bhej di jaati hain — yeh path exist nahi karta (API routes hamesha `src/app/api/...` mein hi hoti hain, kisi `sites/{slug}/api/` mein nahi).

**Impact:** Har public-facing component jo browser se `fetch('/api/...')` karta hai woh silently fail hota hai (zyada components fail "ho hi error UI nahi dikhate — chhup ke null return karte hain). Confirmed affected: `OurLeadership.tsx` (Editorial Leadership widget, `/api/team-members`). Sambhavtah aur bhi components isी pattern se affected honge (announcements, visitor-counter, stats, etc. — verify karna baaki hai).

**Fix approach (decided, abhi implement nahi hua):** Middleware mein generic `/api/` (non-`/api/admin`, non-`/api/auth`, non-`/api/maintenance`) paths ko bhi `ALLOWED_PATHS` jaisa treat karo — sirf `x-site-slug` header set karke pass through karo, rewrite mat karo.

### BUG 2 — SUPER_ADMIN site switch karne par login maangta hai (HIGH PRIORITY — USER ABHI STUCK HAI, PEHLE YEH KARNA HAI)
**Root cause:** `getAuthOptions(prisma, siteSlug)` site-specific `NEXTAUTH_SECRET_*` se JWT sign/verify karta hai. Login ke waqt (`src/app/api/auth/[...nextauth]/route.ts`) bhi `x-site-slug` header (jo cookie-driven hai) se secret choose hota hai. Toh SUPER_ADMIN jab wjiis context mein login karta hai, JWT `NEXTAUTH_SECRET_WJIIS` se signed hoti hai. Site-switch dropdown `active-site` cookie ko `ijarcm` set karta hai → agla request `x-site-slug=ijarcm` → session verify `NEXTAUTH_SECRET_IJARCM` se try hota hai → decode fail (silently null) → session invalid → login screen.

**Impact:** SUPER_ADMIN IJARCM select karte hi admin panel se bahar nikal jaata hai, login bhi fail hota hai, state wapas bhi nahi badalti — completely stuck.

**Fix approach (decided — Approach 1, abhi implement nahi hua):** SUPER_ADMIN ka login/session sign/verify hamesha ek **common, site-independent secret** (`NEXTAUTH_SECRET`) se ho — site switch sirf data-fetch context (`x-active-site`) badle, kabhi login secret nahi. Normal per-site admin/user ka secret pehle jaisa hi site-specific rahega (unka session kabhi site switch nahi karta, isliye unaffected).
- Iske liye `[...nextauth]/route.ts` mein login attempt SUPER_ADMIN email se match ho to common secret use karna hoga (chicken-egg: login se pehle role pata nahi hota, isliye email-pattern check chahiye)
- `site-context.ts` ke `getPrismaForAdminRequest`/`getActiveSiteSlug` mein bhi session verify pehle common secret se try, SUPER_ADMIN role confirm hone ke baad hi `x-active-site` se data-context decide karo

**User ka decision: BUG 2 pehle fix karna hai (kyunki abhi stuck hai), BUG 1 uske baad.**

---

## IJARCM FRONTEND MIGRATION — STATUS

Source: standalone project `e:\ijarcm.com` (poora bana hua IJARCM site, alag git/env).
Target: `e:\wjiis.com\src\app\sites\ijarcm\`

**Done:**
- `layout.tsx` — wjiis layout pattern copy (Navbar, MainContent, Footer, ChatBot — sab `@/components/shared/` se)
- `page.tsx` (homepage) — `e:\ijarcm.com\src\app\page.tsx` se copy, imports `@/components/shared/X` mein adapt kiye, `ijrcam.com` typo `ijarcm.com` fix kiya (DynamicSEO, schema, contact email)

**Pending (user ne explicitly deferred — "homepage test ho jaye phir baaki"):**
- About, Papers, Archives, aur baaki saare subdirectories `e:\ijarcm.com` se copy karna `src/app/sites/ijarcm/` mein
- Root `src/app/layout.tsx` mein hardcoded IJARCM-specific metadata (title, metadataBase URL) hai jo dono sites ke liye shared root layout hai — flag kiya gaya hai, fix nahi kiya (site-agnostic banana hoga ya per-site layout mein move karna hoga)

---

## NOT IN SCOPE / DEFERRED (goal se related nahi, isliye yahan se hata diya gaya)

Niche wale items purane document mein the lekin current goal (multi-tenant routing + auth correctness) se directly judey nahi hain — agar future mein zaroorat ho to alag se discuss karna:
- Papers / research-papers system overlap aur merge
- `/admin/research-papers/new` ke baad `invalidatePapers()` cache issue
- Role-check inconsistency (57 routes mein `role !== 'ADMIN'` vs `!['ADMIN','SUPER_ADMIN'].includes(...)`) — yeh BUG 2 fix hone ke baad recheck karna chahiye, kyunki ho sakta hai connected ho

---

## FILE STRUCTURE — KEY FILES

```
e:/wjiis.com/
├── next.config.js                         # Image domains (dono sites), webpack aliases
├── .env                                   # DB URLs, SMTP, R2, secrets (per site)
├── prisma/schema.prisma                   # Shared schema — dono sites ke liye same
├── src/
│   ├── middleware.ts                      # ⚠️ src/ ke andar — domain/cookie → x-site-slug, public page rewrite
│   ├── config/
│   │   └── sites.ts                       # Site configs + dev domain mapping
│   ├── lib/
│   │   ├── auth-factory.ts                # Per-site NextAuth options + SUPER_ADMIN auth
│   │   ├── prisma-registry.ts             # DB connection pool per site
│   │   ├── site-context.ts                # Server-side site/DB/session resolution
│   │   ├── admin-fetch.ts                 # Client-side fetch with x-active-site header
│   │   └── admin-site.ts                  # localStorage + active-site cookie management
│   ├── store/
│   │   └── adminStore.ts                  # Zustand store — site-specific caching
│   ├── components/shared/                 # Saare sites ke liye common UI (Navbar, Footer, OurLeadership, etc.)
│   └── app/
│       ├── layout.tsx                     # Root layout — ⚠️ abhi IJARCM-hardcoded metadata hai
│       ├── admin/page.tsx                 # Dashboard + site switcher UI (SUPER_ADMIN only)
│       ├── api/
│       │   ├── auth/[...nextauth]/route.ts  # Login — x-site-slug se secret choose karta hai (BUG 2 yahin)
│       │   ├── team-members/route.ts        # Public API example (BUG 1 se affected)
│       │   └── admin/...                    # Admin-only APIs
│       └── sites/
│           ├── wjiis/                     # Saare WJIIS public pages (complete)
│           └── ijarcm/                    # Sirf homepage abhi (page.tsx, layout.tsx)
```

---

## KAAM KARNE KE RULES (NEW CHAT MEIN BHI FOLLOW KARO)

1. **Permission pehle, kaam baad mein** — koi bhi change karne se pehle user se confirm karo
2. **Sirf analyse karne ko bola hai to sirf analyse karo** — code mat badlo
3. **Naya system mat banao** — jo already bana hua hai use karo (auth-factory, site-context, admin-fetch sab sahi pattern hain, sirf bugs fix karne hain)
4. **Assumptions mat lo** — user se seedha poochho agar kuch unclear ho, ya code padh kar confirm karo
5. **English only** — code mein comments, errors, UI text, logs — sab English mein
6. **Ek kaam ek baar** — plan banao, user approve kare, tab karo
7. **Context waste mat karo** — agar ek agent ya tool se kaam ho jaye to zyada mat chalao
8. **Galti ho to seedha bolo** — chhupaao mat, baar baar wohi galti mat karo
9. **Git operations sirf jab commit involved ho** — plain filesystem move/rename (`mv`) ke liye `git mv` mat use karo jab tak commit nahi ho raha
10. **Dev server middleware/config changes ke baad full restart chahiye** — sirf hot-reload kaafi nahi hota kabhi kabhi (especially middleware file location change)
11. **Goal se bahar mat jao** — agar koi fix simple ho sakta hai (jaise secret resolution decouple karna), to poora subsystem redesign (jaise admin panel alag app banana) mat suggest karo

---

## CURRENT STATUS (2026-06-16)

**Abhi turant karna hai:** BUG 2 fix (SUPER_ADMIN session/secret decouple — Approach 1, abhi tak sirf options discuss hue hain, implementation pending, user ne abhi approve nahi kiya final code).

**Uske baad:** BUG 1 fix (middleware mein generic `/api/*` paths ko rewrite se exempt karna).

**Phir:** IJARCM ke baaki pages (`about`, `papers`, `archives`, etc.) copy karna `e:\ijarcm.com` se.
