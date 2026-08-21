# SaltNPepper implementation plan

## Confirmed identity

- Brand: SaltNPepper
- Address: Allmendstrasse 18, 8154 Oberglatt
- Phone: +41 76 408 94 30
- Email: info@saltnpepper.ch
- Website: https://saltnpepper.ch
- Local database: lowercase `saltnpepper_dev`
- Public order format: `SNP-000001`

## Completed scope

1. Centralized the supplied identity, bilingual neutral copy, map link, and editorial photo credits.
2. Rebuilt the public landing, navigation, footer, about, contact, menu, account, cart, and order surfaces around one responsive ivory, charcoal, and paprika design system.
3. Rebranded the admin shell, staff emails, order labels, auth, and shared settings without changing proven authorization, ordering, payment, or refund rules.
4. Rebranded the React Native staff app, receipt header, native application identity, storage keys, and production API URL.
5. Replaced the inherited migration history with a clean Prisma baseline for the new `saltnpepper_dev` schema.
6. Added a provisional bilingual Pakistani grill catalog, including Raita/Salad suggestion fixtures and a Biryani drink-choice fixture, daily service hours, the 8154 delivery offer, and licensed representative product photography stored under the public `SaltNPepper/` S3 prefix.
7. Added the contact-page Google Map, database-backed hours and delivery announcement, Foodeez social destinations, site-wide WhatsApp access, and localized SweetNSavour-powered blog pages.
8. Added admin-configurable per-product suggested variants and customer option selection, with suggestions added as independent cart/order lines and server-authoritative live pricing and availability.
9. Hardened checkout validation and Stripe's immediate/delayed webhook lifecycle, added authorized pending-payment reconciliation on order tracking, enforced refund-before-cancel for paid Stripe orders, exposed exact order activities to customer history and notifications, and changed the staff queue to latest-activity ordering with compact, system-inset-safe screens.
10. Added reusable homepage section templates, a clearly labelled Instagram presentation gallery linked to the approved Foodeez profile, bilingual public routes with a code-configured default locale, one code-configured currency, and string-safe international postal-code validation with exact delivery-zone matching.

## Production blockers

- Replace temporary editorial Unsplash photography with approved restaurant photography.
- Export approved raster/SVG wordmark, monogram, and Android launcher icons. The website favicon and social preview now use the generated chili mark pending final owner approval.
- Approve or replace the provisional menu, prices, allergens, opening hours, delivery/pickup rules, and representative product photography.
- Confirm whether the intentionally shared Foodeez Facebook destination should remain or be replaced by a SaltNPepper-owned profile. The Foodeez Instagram profile is approved for the current website link.
- Replace the mock Instagram gallery with the approved SaltNPepper Professional account feed only after Meta credentials and real media are supplied.
- Add final legal copy, VAT status, and payment credentials.
- Publish a signed Android APK only after hardware/printer acceptance.
- Do not change DNS until the owner gives written launch approval.
