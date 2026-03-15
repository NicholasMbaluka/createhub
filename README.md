# CreateHub — Creator Economy SaaS Platform

A full-stack creator economy platform similar to Patreon/Gumroad. Creators can sell digital products, build link-in-bio pages, manage subscribers, and track analytics. Admins oversee the platform with user management, KYC review, and transaction monitoring.

---

## 🏗️ Architecture

```
createhub/
├── backend/                  # Node.js / Express API
│   └── src/
│       ├── config/           # Database connection
│       ├── controllers/      # Route handlers
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── productController.js
│       │   ├── orderController.js
│       │   ├── kycController.js
│       │   ├── analyticsController.js
│       │   ├── subscriptionController.js
│       │   ├── notificationController.js
│       │   └── adminController.js
│       ├── middleware/
│       │   └── auth.js       # JWT protect + authorize + requireKYC
│       ├── models/           # Mongoose schemas
│       │   ├── User.js
│       │   ├── Product.js
│       │   ├── Order.js
│       │   ├── Subscription.js
│       │   └── Notification.js
│       ├── routes/           # Express routers
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── products.js
│       │   ├── orders.js
│       │   ├── analytics.js
│       │   ├── kyc.js
│       │   ├── subscriptions.js
│       │   ├── notifications.js
│       │   └── admin.js
│       ├── utils/
│       │   ├── notifications.js   # Notification helper
│       │   └── seed.js            # Demo data seeder
│       └── server.js         # Express entry point
│
└── frontend/
    └── public/
        ├── index.html        # SPA entry point
        ├── css/
        │   └── main.css      # Full design system
        └── js/
            ├── api.js        # API client (all endpoints)
            ├── auth.js       # Auth state management
            ├── router.js     # Hash-based SPA router
            ├── utils.js      # Toast, Modal, H helpers, Fmt
            ├── app.js        # App bootstrap & routes
            └── pages/
                ├── landing.js
                ├── auth.js
                ├── dashboard.js      # Shell + Creator overview
                ├── products.js
                ├── analytics.js
                ├── kyc.js
                ├── linkbio.js
                ├── admin.js          # All admin pages
                └── settings.js       # Settings + Notifications + Subscriptions
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install
```bash
git clone <repo>
cd createhub
cd backend && npm install
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env:
#   MONGODB_URI=mongodb://localhost:27017/createhub
#   JWT_SECRET=your_secret_here
```

### 3. Seed demo data
```bash
cd backend
npm run seed
```
This creates demo accounts:
| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@createhub.io       | admin123     |
| Creator | amara@example.com        | creator123   |
| Creator | jake@example.com         | creator123   |
| Buyer   | daniel@example.com       | user123      |

### 4. Start the server
```bash
cd backend
npm run dev
```

### 5. Open in browser
```
http://localhost:5000
```

---

## 🔑 API Endpoints

### Auth
| Method | Path                    | Access  | Description          |
|--------|-------------------------|---------|----------------------|
| POST   | /api/auth/register      | Public  | Register new user    |
| POST   | /api/auth/login         | Public  | Login                |
| GET    | /api/auth/me            | Private | Get current user     |
| PUT    | /api/auth/password      | Private | Update password      |

### Products
| Method | Path                         | Access         | Description          |
|--------|------------------------------|----------------|----------------------|
| GET    | /api/products                | Creator/Admin  | List my products     |
| POST   | /api/products                | Creator        | Create product       |
| PUT    | /api/products/:id            | Creator/Admin  | Update product       |
| DELETE | /api/products/:id            | Creator/Admin  | Delete product       |
| GET    | /api/products/public/:slug   | Public         | Get product by slug  |
| GET    | /api/products/:id/analytics  | Creator/Admin  | Product analytics    |

### Orders
| Method | Path                  | Access        | Description       |
|--------|-----------------------|---------------|-------------------|
| POST   | /api/orders           | Private       | Create order      |
| GET    | /api/orders/purchases | Private       | My purchases      |
| GET    | /api/orders/sales     | Creator/Admin | My sales          |
| POST   | /api/orders/:id/refund| Private       | Request refund    |
| GET    | /api/orders/admin     | Admin         | All orders        |

### KYC
| Method | Path                           | Access  | Description         |
|--------|--------------------------------|---------|---------------------|
| GET    | /api/kyc                       | Private | Get KYC status      |
| POST   | /api/kyc/submit                | Creator | Submit KYC          |
| GET    | /api/kyc/admin/pending         | Admin   | Pending submissions |
| PUT    | /api/kyc/admin/:userId/approve | Admin   | Approve KYC         |
| PUT    | /api/kyc/admin/:userId/reject  | Admin   | Reject KYC          |

### Analytics
| Method | Path                    | Access        | Description           |
|--------|-------------------------|---------------|-----------------------|
| GET    | /api/analytics/creator  | Creator/Admin | Creator dashboard     |
| GET    | /api/analytics/admin    | Admin         | Platform analytics    |

### Admin
| Method | Path                         | Access | Description        |
|--------|------------------------------|--------|--------------------|
| GET    | /api/admin/stats             | Admin  | Platform stats     |
| GET    | /api/admin/users             | Admin  | List all users     |
| GET    | /api/admin/users/:id         | Admin  | User detail        |
| PUT    | /api/admin/users/:id/status  | Admin  | Suspend/activate   |
| PUT    | /api/admin/users/:id/role    | Admin  | Change role        |

---

## 👥 User Roles

| Role    | Capabilities                                                                 |
|---------|------------------------------------------------------------------------------|
| public  | Browse, purchase products                                                    |
| creator | All public + create products, analytics, KYC, link-in-bio, subscriptions    |
| admin   | All creator + user management, KYC review, platform analytics, transactions  |

---

## 🔒 Security Features
- JWT authentication with 7-day expiry
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min global, 10 req/15min auth)
- Helmet.js security headers
- CORS configured for frontend origin
- KYC gating for monetization endpoints
- Role-based route protection

---

## 💳 Payment Integration
The platform is ready for Stripe integration. In `orderController.js`, the `createOrder` function returns the order — wire in your Stripe `PaymentIntent` creation here:

```javascript
// In createOrder(), after creating the order:
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(subtotal * 100),
  currency: 'usd',
  metadata: { orderId: order._id.toString() },
});
// Return paymentIntent.client_secret to frontend
```

Then handle webhook events in a new `/api/webhooks/stripe` route.

---

## 🌱 Extending the Platform

- **Email notifications** — Add Nodemailer in `src/utils/email.js` and call it from controllers
- **File uploads** — Multer is installed; add upload endpoints in products router
- **Stripe webhooks** — Add `POST /api/webhooks/stripe` to finalize orders on payment success
- **Custom domains** — Add domain field to User model and verify via DNS
- **Reviews/ratings** — Add Review model and endpoint on `POST /api/products/:id/reviews`

---

## 📦 Tech Stack

| Layer     | Tech                                              |
|-----------|---------------------------------------------------|
| Backend   | Node.js, Express 4, Mongoose 8                    |
| Database  | MongoDB                                           |
| Auth      | JWT (jsonwebtoken), bcryptjs                      |
| Validation| express-validator                                 |
| Security  | helmet, cors, express-rate-limit                  |
| Frontend  | Vanilla JS (SPA), HTML5, CSS3 (custom design sys) |
| Fonts     | Syne (headings), DM Sans (body) via Google Fonts  |

---

## 📄 License
MIT — free to use and modify.
