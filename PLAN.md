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

## Production blockers

- Replace temporary editorial Unsplash photography with approved restaurant photography.
- Export approved raster/SVG wordmark, monogram, favicon, social image, and Android launcher icons. The live product currently uses the approved text-only typographic treatment because image-generation quota was unavailable.
- Add the confirmed menu, prices, opening hours, delivery/pickup rules, legal copy, social links, VAT status, and payment credentials.
- Publish a signed Android APK only after hardware/printer acceptance.
- Do not change DNS until the owner gives written launch approval.
