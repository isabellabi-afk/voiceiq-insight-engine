# VoiceIQ frontend clean rebuild

This package restores the visual Lovable structure and removes the most damaging hardcoded/demo values.

## What changed

- Removed the hardcoded Railway API URL from `src/apiService.ts`.
- Added `.env.example` with `VITE_API_BASE_URL`.
- Fixed the `Performance.tsx` syntax error caused by `value: dynamicMetrics.repeatVisitRate: confidenceRate`.
- Kept the Lovable visual layout from the original frontend.
- Replaced the sidebar hardcoded `127K reviews` label with a neutral API status label.

## How to use

1. Copy these files over your repo branch.
2. Create `.env` from `.env.example`.
3. Run `npm install`.
4. Run `npm run dev`.

If your backend is deployed, set `VITE_API_BASE_URL` to that backend URL.
