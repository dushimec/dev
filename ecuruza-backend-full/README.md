# Ecuruza Backend — Full Starter

This project is a complete starter for Ecuruza backend with:
- Auth (register/login, refresh tokens, logout)
- Email verification & password reset via email codes
- Phone OTP via InTouchSMS (placeholder)
- Flutterwave payment helpers + webhook endpoint
- Prisma schema for Postgres
- Jest + Supertest test setup

## Setup
1. Install deps: `npm install`
2. Update `.env` with your DATABASE_URL and API keys
3. Generate Prisma client and migrate: `npx prisma migrate dev --name init`
4. Run dev server: `npm run dev`

## Endpoints (auth highlights)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/logout
- POST /api/auth/verify-email
- POST /api/auth/request-password-reset
- POST /api/auth/reset-password
- POST /api/auth/send-otp
- POST /api/auth/verify-otp
