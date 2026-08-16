# SaltNPepper project guide

## Scope

This is the standalone SaltNPepper restaurant website, admin panel, backend API, and React Native staff companion app. Read `PLAN.md` before architecture, schema, route, payment, or workflow changes.

- Public routes are German and English under `/de` and `/en`; `/` redirects to `/de`.
- Admin stays under `/admin` in the same Next.js app.
- The Android project lives at `apps/saltnpepper-staff-android` and uses only authenticated HTTPS APIs. It never connects to MySQL.
- This is a single-restaurant system. Do not add tenant or organization abstractions.

## Brand and content

- Central supplied identity and draft copy live in `src/content/restaurant.ts`.
- Exact contact: Allmendstrasse 18, 8154 Oberglatt; +41 76 408 94 30; info@saltnpepper.ch; saltnpepper.ch.
- Use the shared `BrandLogo` text treatment, semantic CSS variables, Archivo Black display font, and DM Sans UI font.
- Do not invent cuisine, menu, prices, hours, delivery rules, VAT, social links, or legal claims. Hide unconfirmed content and keep `content-todo.md` current.
- Temporary editorial imagery must be credited and must not be presented as actual SaltNPepper dishes or premises.

## Public content integrations

- The user approved a provisional development catalog: 15 bilingual Pakistani grill products including Raita/Salad suggestion fixtures and a Biryani drink-choice fixture, daily 11:00–22:00 pickup/delivery, and delivery to 8154 for CHF 5 with CHF 30 minimum and free delivery from CHF 60. These remain production-blocking drafts in `content-todo.md`, not confirmed restaurant claims.
- New uploads use the `SaltNPepper/{brand|menu|products}/` S3 key prefix. Prisma stores object keys, `resolvePublicImageUrl` remains the only public URL resolver, and the bucket policy grants read-only access to `SaltNPepper/*`; do not broaden it.
- The global announcement is derived from the active delivery zone so its postcode, minimum, and free-delivery threshold stay aligned with checkout. `SiteSettings.announcementActive` remains the display switch.
- The contact map is a native lazy Google Maps embed for the supplied address. CSP permits frames only from `www.google.com`; do not add a map SDK or API key unless the embed is insufficient.
- Facebook and Instagram intentionally point to Foodeez until SaltNPepper-owned profiles are supplied. WhatsApp is derived from the existing restaurant phone as `https://wa.me/41764089430`.
- `/de/blog` and `/en/blog` read the shared `sweetnsavour` WordPress category from `mydaytogo.com`. Fetches stay server-side with bounded revalidation, external payloads are Zod-validated, and article HTML passes the `sanitize-html` allowlist. Blog content is not copied into Prisma, admin, or Android.

## Architecture

- Server Components are the default. Add client components only for real interactivity.
- `src/server/db.ts` is the only Prisma client constructor; `prisma/schema.prisma` is the schema source of truth.
- Ordering rules stay in `src/server/services/ordering.ts`; admin rules stay in `src/server/services/admin.ts`.
- Public web and versioned mobile routes must call shared server services instead of duplicating pricing, authorization, availability, payment, or transition rules.
- Product suggestions pin one target `ProductVariant`, are configured in admin, and reach checkout as ordinary independent cart/order lines; public pricing and orderability remain server-authoritative.
- Validate trust boundaries with shared schemas and return explicit DTOs.
- Use integer CHF rappen, UTC storage, and `Europe/Zurich` display/calculation.
- Public order labels use `SNP-000001`; raw IDs remain internal.

## Database and integrations

- Local migrations and seeds target only lowercase `saltnpepper_dev`. Never reuse or modify an unrelated schema.
- Prisma owns tables and indexes. Local work uses `prisma migrate dev`; preview/production uses committed `prisma migrate deploy`.
- Never edit a migration already deployed outside disposable local development; create a forward migration.
- Keep network calls outside long database transactions.
- Stripe webhooks are authoritative and signature verified. S3 writes are server-authorized. Secrets remain server-only.

## UI and safety

- Keep cards, buttons, forms, dialogs, terminology, and brand treatment consistent across public, admin, and Android.
- Single-choice option groups use labelled native radio inputs; multi-choice groups use bounded checkboxes.
- Target WCAG 2.2 AA: semantic HTML, labels/errors, keyboard support, visible focus, contrast, reduced motion, and 44px touch targets.
- Keep return, reject, cancel, refund, delete, clear, logout, and other dangerous actions visually and spatially separate from routine actions.
- Dangerous actions require confirmation and a reason when applicable. Refund confirmation shows the exact CHF amount.
- Use Lucide icons on web; do not use emoji as UI icons.

## Verification

- Non-trivial pricing, scheduling, transition, authorization, and payment changes need the smallest runnable regression check.
- Before completion run Prisma validation/generation, tests, type checking, lint, production build, and responsive browser checks.
- Android hardware printing remains adapter-based until the terminal, printer, connection, and paper width are physically confirmed.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
