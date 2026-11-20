# Saanjh — MERN E-commerce (Auth + Admin Panel + Razorpay)

MongoDB · Express · React (Vite) · Node. JWT auth, admin dashboard, cart, checkout with Razorpay (and Cash on Delivery).

## Setup
1. Install Node 18+ and MongoDB (local) or use MongoDB Atlas.
2. `cp server/.env.example server/.env` and fill in values (Razorpay **test** keys: dashboard.razorpay.com → Settings → API Keys).
3. `npm run install-all`
4. `npm run seed`  → creates sample products + admin user
5. `npm run dev`  → API on :5000, site on http://localhost:5173

## Logins after seeding
- Admin: `admin@saanjh.com` / `Admin@123` (change in server/.env before seeding)
- Log in as admin, then open `/admin`.

## Razorpay test payment
Test card `4111 1111 1111 1111`, any future expiry, any CVV — or test UPI `success@razorpay`.
The payment signature is verified on the server (HMAC SHA256) before an order is marked paid.

## Production
`npm run build` then `npm start` — Express serves `client/dist` too.

## Structure
- `server/` models (User, Product, Order), routes (auth, products, orders, payment, admin), JWT middleware
- `client/` pages, cart + auth context, admin panel, framer-motion animations, single `styles.css`
