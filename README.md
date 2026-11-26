# Saanjh — Full-Stack MERN E-commerce

A full-stack online store for handcrafted home goods, built with **MongoDB, Express, React (Vite) and Node.js**. It covers the whole shopping flow: browsing and search, cart, JWT authentication, checkout with **Razorpay** or Cash on Delivery, order tracking, and an **admin panel** for products, orders and users.

## Features

**Storefront**
- Home page with featured products, and a shop page with text search, category filter and sorting (newest, price low→high, price high→low)
- Product detail page
- Cart (React context) and checkout with a delivery address form
- Free shipping on orders of ₹999 or more, otherwise ₹79 flat
- Page transitions with Framer Motion and toast notifications

**Accounts**
- Register and login with bcrypt-hashed passwords and 30-day JWTs
- Protected routes for checkout, orders and account pages
- Account page to update profile details, and an order history page

**Payments and orders**
- Razorpay Checkout or Cash on Delivery
- Order totals are **recalculated on the server** from database prices, so the client cannot set a price
- Server-side stock validation, with stock decremented on order and restored on cancellation
- Razorpay payment signature verified with HMAC-SHA256 before an order is marked paid
- COD orders are marked paid when the admin sets them to Delivered

**Admin panel (`/admin`, admin-only)**
- Dashboard: user, product and order counts, paid revenue, pending orders, low-stock list, recent orders and a 7-day sales chart
- Products: create, edit and delete
- Orders: view all orders and update status (Pending → Processing → Shipped → Delivered / Cancelled)
- Users: list users, promote or demote admins, delete users (admins cannot change or delete their own account)

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router 6, Axios, Framer Motion, react-hot-toast |
| Backend | Node.js, Express 4, Mongoose 8, JSON Web Tokens, bcryptjs, CORS, dotenv |
| Database | MongoDB (local or Atlas) |
| Payments | Razorpay (Orders API + Checkout) |
| Tooling | concurrently (runs API and client together), nodemon |

## Project structure

```
.
├── client/                    # React app (Vite)
│   └── src/
│       ├── pages/             # Home, Shop, Product, Cart, Checkout, Auth, Orders, Account
│       │   └── admin/         # AdminLayout, Dashboard, AdminProducts, AdminOrders, AdminUsers
│       ├── components/        # Navbar, Footer, ProductCard, route Guards
│       ├── context/           # AuthContext, CartContext
│       ├── api.js             # Axios instance
│       └── pay.js             # Razorpay Checkout helper
└── server/
    ├── config/db.js           # MongoDB connection
    ├── middleware/auth.js     # protect (JWT) and admin guards
    ├── models/                # User, Product, Order
    ├── routes/                # auth, products, orders, payment, admin
    ├── utils/helpers.js       # async wrapper, error helper, token signing
    ├── seed.js                # sample products + admin user
    └── server.js              # Express entry; serves client/dist in production
```

## API reference

All routes are prefixed with `/api`. **Auth** = valid `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account |
| POST | `/auth/login` | Public | Log in, returns a JWT |
| GET | `/auth/me` | Auth | Current user |
| PUT | `/auth/me` | Auth | Update profile |
| GET | `/products` | Public | List products (`q`, `category`, `sort`, `featured` query params) |
| GET | `/products/categories` | Public | Distinct categories |
| GET | `/products/:id` | Public | Single product |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| POST | `/orders` | Auth | Place an order (server recalculates prices, checks stock) |
| GET | `/orders/mine` | Auth | Current user's orders |
| GET | `/orders` | Admin | All orders |
| GET | `/orders/:id` | Auth | One order (owner or admin) |
| PUT | `/orders/:id/status` | Admin | Update order status |
| POST | `/payment/create` | Auth | Create a Razorpay order for one of your orders |
| POST | `/payment/verify` | Auth | Verify the Razorpay signature and mark the order paid |
| GET | `/admin/stats` | Admin | Dashboard statistics |
| GET | `/admin/users` | Admin | List users |
| PUT | `/admin/users/:id/role` | Admin | Grant or revoke admin |
| DELETE | `/admin/users/:id` | Admin | Delete a user |

## Getting started

**Prerequisites:** Node.js 18+ and MongoDB (local) or a free MongoDB Atlas cluster.

```bash
git clone https://github.com/Abhishek7258/saanjh_mern_ecommerce.git
cd saanjh_mern_ecommerce

cp server/.env.example server/.env   # then fill in the values below
npm run install-all                  # installs root, server and client dependencies
npm run seed                         # sample products + admin user
npm run dev                          # API on :5000, site on http://localhost:5173
```

Vite proxies `/api` to `http://localhost:5000` in development.

### Environment variables (`server/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Allowed CORS origin (e.g. `http://localhost:5173`) |
| `RAZORPAY_KEY_ID` | Razorpay API key id (use a **test** key) |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret (stays on the server) |
| `ADMIN_EMAIL` | Email of the seeded admin (default `admin@saanjh.com`) |
| `ADMIN_PASSWORD` | Password of the seeded admin (default `Admin@123`) |

> `npm run seed` **deletes all existing products and orders** before inserting sample data. Only run it on a development database.

### Admin login after seeding

Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults: `admin@saanjh.com` / `Admin@123`), then open `/admin`.
**Change the default password** by setting `ADMIN_PASSWORD` in `server/.env` before seeding. Never use the defaults in production.

## Razorpay payment flow

1. Checkout calls `POST /api/orders`; the server builds the order from database prices.
2. For online payment the client calls `POST /api/payment/create`, and the server creates a Razorpay order for the order total.
3. Razorpay Checkout opens in the browser and the customer pays.
4. The client sends the payment details to `POST /api/payment/verify`. The server recomputes the HMAC-SHA256 signature with the key secret and only then marks the order paid (status → Processing).

To try it, use Razorpay **test** keys (Dashboard → Settings → API Keys) with test card `4111 1111 1111 1111`, any future expiry and any CVV, or test UPI `success@razorpay`.

## Production build

```bash
npm run build   # builds client/dist
npm start       # Express serves the API and client/dist together
```

## Author

**Abhishek Kumar** — [GitHub](https://github.com/Abhishek7258) · [LinkedIn](https://www.linkedin.com/in/abhishek-kumar-588513268)
