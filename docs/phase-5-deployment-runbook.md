# Phase 5 deployment runbook

This runbook is the launch gate for SaltNPepper. It prepares production safely, but no DNS record may be changed and no production ordering may be enabled until the owner gives explicit launch approval.

## Current checkpoint

| Gate | Status |
| --- | --- |
| Repository hardening and non-build checks | In progress |
| Managed MySQL, AWS, Stripe, Google, Resend, and Vercel access | Required from the owner |
| Real menu, photography, delivery, VAT, and legal approvals in `content-todo.md` | Blocking |
| Production migrations, backup restore, webhook replay, and smoke evidence | Pending provisioned services |
| DNS cutover | Stopped pending explicit launch approval |

Do not put owner seed credentials in Vercel. Run the owner seed once from a trusted operator machine, remove the seed values afterward, and rotate any temporary credential.

## 1. Managed MySQL

1. Create a dedicated production database and separate runtime and migration users in a Swiss/EU region compatible with Vercel.
2. Require TLS. Set `DATABASE_URL` with `sslaccept=strict`, `DATABASE_SSL=true`, and a provider-approved `DATABASE_CONNECTION_LIMIT` between 1 and 10. Add `DATABASE_SSL_CA_BASE64` only when the provider CA is not in the system trust store.
3. Give the runtime user only the data privileges the application needs. Give schema-change privileges only to the migration user used by the controlled deployment job.
4. Enable encrypted automated backups and point-in-time recovery before migrations.
5. From a trusted operator environment using the migration URL, run:

   ```powershell
   npm.cmd ci
   npm.cmd run db:generate
   npm.cmd run db:validate
   npm.cmd run phase5:preflight
   npm.cmd run db:deploy
   ```

6. Record `prisma migrate status`, the migration timestamp, operator, database identifier, and backup/PITR point. Never run `prisma migrate dev` or `prisma db push` against production.
7. Restore the newest backup into an isolated temporary database. Verify migration history plus counts for `SiteSettings`, `User`, `Order`, `Payment`, and `StripeWebhookEvent`, then delete the temporary restore through the provider after evidence is saved.

No Phase 5 schema change is required. The two committed migrations remain immutable.

## 2. S3 and IAM

1. Create a production bucket in the selected region with encryption, versioning, public-write blocking, and access logging enabled.
2. Permit public reads only for approved public asset prefixes, or place a CDN in front and use its HTTPS origin as `S3_PUBLIC_BASE_URL`.
3. Create a bucket-scoped IAM principal that can write only `brand/*`, `menu/*`, and `products/*`. It must not administer buckets or IAM.
4. Configure CORS for `PUT` from the exact production and approved preview origins, allowing `Content-Type` only. The application already limits uploads to approved image types, 10 MB, and five-minute signed URLs.
5. Upload and fetch one disposable image through the application, then remove that object and record the request IDs.

## 3. Stripe

1. Complete account activation and confirm Swiss business, bank, statement descriptor, and refund permissions.
2. Create separate preview/test and production/live keys. Never expose either secret with a `NEXT_PUBLIC_` prefix.
3. Create the live webhook endpoint `https://saltnpepper.ch/api/webhooks/stripe` for:

   - `checkout.session.completed`
   - `checkout.session.expired`

4. Store the endpoint signing secret as `STRIPE_WEBHOOK_SECRET`. Use the live secret key only in Production.
5. Before DNS cutover, replay one signed fixture twice against the preview deployment and verify one `StripeWebhookEvent` row. Force that row to `FAILED` in the isolated test database, replay it, and verify it becomes `PROCESSED`.
6. Complete one approved low-value live checkout and one owner refund only after real pricing/VAT/legal content is approved. Confirm the Checkout session ID, CHF amount, payment state, order state, refund, audit event, and deduplicated email.

## 4. Google OAuth and Resend

1. Configure separate Google OAuth clients for preview and production. The production redirect URI is `https://saltnpepper.ch/api/auth/callback/google`; add only exact approved preview redirect URIs.
2. Configure the OAuth consent screen, authorized JavaScript origins, support email, and production publishing status.
3. Verify `saltnpepper.ch` in Resend, publish its SPF and DKIM records, and use the approved `EMAIL_FROM`.
4. Send account/invitation and order-status test messages to different providers. Check delivery, links, plain-text fallback, sender alignment, and that no token appears in logs.

## 5. Vercel environments and controls

1. Link the repository to one SaltNPepper Vercel project. Keep Preview and Production variables isolated; preview must not access the production database, S3 bucket, Stripe live keys, or production OAuth client.
2. Add every non-owner key from `.env.example` to the correct environment. Mark secrets sensitive. Run `npm.cmd run phase5:preflight` with Production variables before any production promotion.
3. Use Node.js 22 and the repository lockfile. Keep functions using Prisma, Auth.js, Stripe, and S3 on the Node runtime.
4. Configure platform rate limits for credentials login, registration, checkout/quote creation, staff mutations, uploads, and public slot/delivery quote endpoints. Alert on repeated 401/403/429/5xx responses and Stripe webhook failures.
5. Validate a preview deployment first. Promote the same verified artifact rather than rebuilding a different artifact. Keep the previous healthy deployment available for immediate Vercel rollback; database rollback remains a new forward migration.

## 6. Responsive, accessibility, security, and smoke evidence

Use Playwright CLI against the preview URL and save output under `output/playwright/`. Check keyboard-only navigation, visible focus, skip links, dialogs and focus restoration, connected labels/errors, reduced motion, zoom, no horizontal page overflow, and 44 px controls at 375, 768, 1024, and 1440 px.

Cover German and English navigation, menu options, invalid postcode, delivery minimum, scheduled slots, sold-out items, guest tracking, customer history, owner/staff boundaries, cancellation confirmation, exact refund amount, and separation of dangerous actions. Do not mutate production data during the broad UI pass.

Security evidence must include the CSP, HSTS, frame denial, MIME sniffing denial, permissions policy, origin rejection on browser mutations, secure session cookie, secret scan, dependency audit, S3 upload restrictions, Stripe signature rejection, and redacted logs.

Production smoke checks after promotion but before DNS cutover:

1. Open the Vercel production URL directly and verify `/de`, `/en`, menu/config, admin login, and authenticated role boundaries.
2. Verify MySQL TLS, S3 upload/read, Google login, Resend delivery, Stripe signed webhook handling, and backup/PITR status.
3. Check Vercel function logs for errors without logging customer secrets or tokens.
4. Save URL, commit SHA, timestamps, screenshots/traces, migration status, backup restore evidence, webhook event IDs, and approver.

## 7. DNS hold point

Prepare the exact apex/www, Google, Resend, and verification records with the DNS owner, but do not modify them. Confirm current records and TTLs immediately before launch because they can drift.

Launch requires all `content-todo.md` blockers resolved, all evidence above attached, rollback owners available, and the SaltNPepper owner explicitly approving DNS cutover in writing.
