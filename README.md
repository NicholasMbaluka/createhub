# CreateHub V2 - WhatsApp Creator Commerce Platform

A simplified creator commerce platform focused on WhatsApp-based ordering with no backend needed.

## Features

- **Authentication**: Supabase email/password auth
- **Creator Profiles**: Public storefronts (`/store/[store-name]`)
- **Product Management**: Add/edit products with stock tracking
- **WhatsApp Orders**: Direct customer ordering via WhatsApp
- **No Order Management**: Handle everything through WhatsApp
- **Role-Based Access**: Creators manage their products
- **Mobile-First**: Works perfectly on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS with dark theme
- **Deployment**: Vercel/Netlify ready

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Supabase account

### Installation

```bash
# Clone and install
cd createhub
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Setup

Create these tables in your Supabase project:

```sql
-- Users table (created by Supabase Auth)
create table users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  role text check (role in ('creator', 'founder')) not null,
  created_at timestamp default now()
);

-- Creators table
create table creators (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users not null,
  store_name text unique not null,
  phone text not null,
  created_at timestamp default now()
);

-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references creators not null,
  name text not null,
  price numeric not null,
  description text,
  image_url text,
  stock integer not null default 0,
  created_at timestamp default now()
);
```

## How It Works

### WhatsApp Integration

When a customer clicks "Order via WhatsApp":

1. **Product Details**: Product name, price, and description are captured
2. **Customer Info**: Customer fills name, phone, and location
3. **WhatsApp Redirect**: Customer is redirected to creator's WhatsApp
4. **Pre-filled Message**: WhatsApp opens with a formatted order message
5. **Direct Communication**: Creator handles payment and delivery via WhatsApp

### Benefits

- **No Order Management**: No database orders to track
- **Direct Communication**: Customers talk directly with creators
- **Simple Payment**: Handle payment however you prefer (cash, mobile money, etc.)
- **Mobile-Friendly**: WhatsApp works on all devices
- **No Fees**: No payment processing fees

## Database Schema

The system uses only 3 tables:

### Users
- `id` (UUID, primary key)
- `email` (unique)
- `role` ('creator' or 'founder')
- `created_at`

### Creators  
- `id` (UUID, primary key)
- `user_id` (references users)
- `store_name` (unique)
- `phone` (WhatsApp number)
- `created_at`

### Products
- `id` (UUID, primary key)  
- `creator_id` (references creators)
- `name` (product name)
- `price` (numeric)
- `description` (text)
- `image_url` (optional)
- `stock` (integer)
- `created_at`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add Supabase environment variables
4. Deploy

### Netlify

1. Build: `npm run build`
2. Add environment variables
3. Deploy

---

**V2 Philosophy**: Simple, WhatsApp-first commerce. No complex order management, no payment processing - just direct creator-customer communication.
createhub/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   │   ├── creator/
│   │   │   └── founder/
│   │   ├── creator/
│   │   │   └── [id]/
│   │   ├── product/
│   │   │   └── [id]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       └── supabase.ts
├── public/
├── next.config.js
├── tsconfig.json
└── package.json
```

## 🔄 Core Flows

### Buyer Flow
1. Visit creator storefront (`/creator/[id]`)
2. View product details (`/product/[id]`)
3. Click "Order Now" → Fill order form
4. Order saved as "pending"
5. Creator manually approves/rejects

### Creator Flow
1. Login/Register as creator
2. Set up store with products
3. View dashboard with stats and orders
4. Approve/reject orders manually
5. Stock management

### Founder Flow
1. Login as founder
2. View all creators and orders
3. Platform statistics
4. User management

## 🎯 Key Features

### Authentication Module
- Email/password signup/login
- Role-based access (creator/founder)
- Session management

### Product Module
- Create/edit/delete products
- Image uploads via Supabase Storage
- Manual stock management
- Price and description

### Order Module (Core)
- Simple order form (no cart)
- Required fields: name, phone, location
- Status tracking: pending → approved/rejected
- Manual approval workflow

### Dashboard Modules
- **Creator**: Stats, products, order management
- **Founder**: Platform overview, all orders, user management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: CSS with CSS variables
- **Deployment**: Vercel (frontend), Supabase (backend)

## 📱 Mobile-First Design

- Responsive layouts for all screen sizes
- Touch-friendly interfaces
- Optimized for mobile order management

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel
```

### Backend (Supabase)
1. Create Supabase project
2. Run SQL setup scripts
3. Configure environment variables
4. Enable storage bucket for products

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📊 Database Schema

### Users
- `id`: UUID (auth.users reference)
- `email`: User email
- `role`: 'creator' | 'founder'
- `created_at`: Timestamp

### Creators
- `id`: UUID
- `user_id`: User reference
- `store_name`: Store display name
- `phone`: Contact phone
- `created_at`: Timestamp

### Products
- `id`: UUID
- `creator_id`: Creator reference
- `name`: Product name
- `price`: Product price
- `description`: Product details
- `image_url`: Supabase storage URL
- `stock`: Available quantity
- `created_at`: Timestamp

### Orders
- `id`: UUID
- `product_id`: Product reference
- `creator_id`: Creator reference
- `buyer_name`: Customer name
- `buyer_phone`: Customer phone
- `location`: Delivery location
- `status`: 'pending' | 'approved' | 'rejected'
- `created_at`: Timestamp

## 🎯 V1 Philosophy

Simple, focused, and production-ready:
- Manual order approval (no auto-payments)
- Stock tracking with manual updates
- Role-based access control
- Mobile-first design
- No unnecessary features

---

Built with ❤️ using Next.js and Supabase
