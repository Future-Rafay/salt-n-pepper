# SaltNPepper Android staff companion

The React Native CLI app lives in `apps/saltnpepper-staff-android` and calls only authenticated `/api/v1/staff/*` HTTPS APIs.

- Debug API: `http://10.0.2.2:3000`
- Release API: `https://saltnpepper.ch`
- Run `npm install`, `npm run typecheck`, and `npm run android` from the app folder.
- Release signing uses `SALTNPPEPPER_RELEASE_STORE_FILE`, `SALTNPPEPPER_RELEASE_STORE_PASSWORD`, `SALTNPPEPPER_RELEASE_KEY_ALIAS`, and `SALTNPPEPPER_RELEASE_KEY_PASSWORD`.
- Receipt formatting supports 58mm and 80mm text, but real printing remains blocked until hardware is physically confirmed.
- Push registration remains disabled in this long Windows workspace; local vibration alerts and foreground polling remain available.
