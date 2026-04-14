# IMS Frontend

A production-ready, scalable Inventory Management Dashboard built with Next.js 15+, TypeScript, and modern UI technologies.

## 🚀 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: ShadCN UI + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: 
  - TanStack Query (server state)
  - Zustand (UI state)
- **Forms**: React Hook Form + Yup
- **Tables**: TanStack Table
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios with interceptors

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   └── login/
│   ├── (dashboard)/               # Dashboard routes
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Dashboard home
│   │   └── products/             # Products module
│   ├── layout.tsx                # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                   # Shared UI Components
│   ├── ui/                       # ShadCN components
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   ├── tables/                   # Table components
│   │   └── data-table.tsx
│   └── providers/                # Context providers
│       ├── theme-provider.tsx
│       └── query-provider.tsx
│
├── lib/                          # Core Utilities
│   ├── api-client.ts             # API client wrapper
│   ├── axios.ts                  # Axios instance with interceptors
│   ├── query-client.ts            # TanStack Query config
│   ├── constants.ts              # App constants
│   └── utils.ts                 # Utility functions
│
├── hooks/                        # Global Hooks
│   ├── use-auth.ts               # Auth hooks
│   └── use-debounce.ts          # Debounce hook
│
├── store/                        # Zustand Stores
│   ├── auth-store.ts             # Auth state
│   └── ui-store.ts              # UI state
│
├── services/                     # API Layer
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── category.service.ts
│   ├── inventory.service.ts
│   ├── order.service.ts
│   └── user.service.ts
│
├── schemas/                      # Yup Validation Schemas
│   ├── auth.schema.ts
│   ├── product.schema.ts
│   └── category.schema.ts
│
├── types/                        # Global Types
│   └── index.ts
│
└── styles/                       # Theme System
    └── globals.css
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running the App

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## 🔐 Features

### Authentication
- Login with email/password
- JWT token handling (access + refresh)
- Auto token refresh
- Protected routes
- Logout functionality

### Dashboard
- Overview statistics
- Low stock alerts
- Recent orders
- Revenue tracking

### Products
- Full CRUD operations
- Search and filter
- Pagination
- Category management
- Stock level tracking

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Collapsible sidebar
- Toast notifications
- Loading states
- Error handling

## 🎨 Design System

Built on ShadCN UI with:
- Modern, clean aesthetic
- Accessible components
- Customizable theme
- Consistent spacing and typography

## 📊 State Management

### Server State (TanStack Query)
- API data caching
- Automatic refetching
- Optimistic updates
- Loading/error states

### UI State (Zustand)
- Sidebar state
- Theme preference
- Mobile menu state
- Auth state persistence

## 🔌 API Integration

All API calls go through a centralized service layer with:
- Axios interceptors for auth
- Auto token refresh
- Error normalization
- Type-safe responses

## 🚦 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t ims-frontend .
docker run -p 3000:3000 ims-frontend
```

## 📝 Code Style

- TypeScript strict mode enabled
- ESLint configured
- Prettier configured
- Absolute imports with path aliases

## 🔐 Security

- JWT token storage in httpOnly cookies (recommended)
- Protected routes via middleware
- CSRF protection
- XSS prevention

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

MIT
