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
- **Deployment**: Vercel ready

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

### Alternative Deployment

You can also deploy to:
- **Netlify**: Drag and drop the built folder
- **Railway**: Push to GitHub and connect
- **Any static host**: Use `npm run build` output

---

**V2 Philosophy**: Simple, WhatsApp-first commerce. No complex order management, no payment processing - just direct creator-customer communication.
