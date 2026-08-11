# SaltNPepper Staff Android

React Native CLI companion app for staff order handling. It talks only to the SaltNPepper HTTPS staff API and never connects to MySQL.

```powershell
npm install
npm run typecheck
npm run android
```

The debug build uses the Android emulator host at `http://10.0.2.2:3000`; release uses `https://saltnpepper.ch`.
