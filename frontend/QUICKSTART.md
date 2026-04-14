# Quick Start Guide - IMS Frontend

## 🚀 Getting Started

### 1. Install Dependencies

Navigate to the frontend directory and install all required packages:

```bash
cd frontend
npm install
```

This will install:
- Next.js 15+ and React 19+
- TypeScript
- Tailwind CSS and related utilities
- ShadCN UI components (Radix UI)
- TanStack Query and Table
- Zustand for state management
- React Hook Form and Yup
- Axios for HTTP requests
- Lucide React icons
- Recharts for analytics
- And more...

### 2. Configure Environment

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📋 Project Overview

### Architecture

This frontend follows **Enterprise Frontend Architecture** with:

- **Feature-Based Modular Design**: Each module (auth, products, orders, etc.) is self-contained
- **Separation of Concerns**: Clear distinction between server state (TanStack Query) and UI state (Zustand)
- **Type Safety**: Full TypeScript strict mode with comprehensive type definitions
- **Reusable Components**: ShadCN UI components wrapped for consistency

### Key Features Implemented

1. **Authentication System**
   - Login page with form validation
   - JWT token handling (access + refresh)
   - Auto token refresh via axios interceptors
   - Protected routes via middleware
   - Logout functionality

2. **Dashboard Layout**
   - Responsive sidebar with collapsible design
   - Topbar with search and notifications
   - Mobile-friendly drawer menu
   - User profile display

3. **Dashboard Analytics**
   - Statistics cards (Products, Orders, Users, Revenue)
   - Low stock alerts
   - Recent orders list
   - Trend indicators

4. **Products Module**
   - Full CRUD operations
   - Advanced data table with sorting, filtering, pagination
   - Column visibility toggle
   - Search functionality
   - Create product dialog with form validation

5. **UI Components**
   - Button, Input, Label, Card
   - Dialog (modal)
   - Select dropdown
   - Toast notifications
   - Dropdown menu
   - Data table component

6. **State Management**
   - Auth store (Zustand with persistence)
   - UI store (theme, sidebar state)
   - TanStack Query for server state

7. **API Layer**
   - Centralized service layer
   - Axios instance with interceptors
   - Auto token refresh
   - Error normalization

8. **Theme System**
   - Light/Dark mode support
   - System preference detection
   - Persistent theme selection

## 🔧 Development Notes

### TypeScript Errors

You may see TypeScript errors initially because npm packages aren't installed yet. Run `npm install` to resolve them.

### API Integration

The frontend is configured to connect to your NestJS backend at `http://localhost:3001`. Ensure:
1. Backend is running
2. CORS is configured correctly
3. API endpoints match the backend routes

### Adding New Modules

To add a new module (e.g., Orders):

1. Create service file: `src/services/order.service.ts`
2. Create page: `src/app/(dashboard)/orders/page.tsx`
3. Add navigation item to `src/components/layout/sidebar.tsx`
4. Create validation schema if needed: `src/schemas/order.schema.ts`

### Customizing the Theme

Edit `frontend/src/styles/globals.css` to modify:
- Color palette
- Border radius
- Spacing
- Typography

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is in use:
```bash
# Kill the process or use a different port
PORT=3001 npm run dev
```

### API Connection Issues

Check:
1. Backend is running on port 3001
2. `.env` file has correct API URL
3. No firewall blocking the connection
4. CORS is enabled on backend

### Module Not Found Errors

If you see "Cannot find module" errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Complete the Products Module**: Add edit and delete functionality
2. **Build Orders Module**: Create POS interface
3. **Build Inventory Module**: Add stock adjustment features
4. **Build Categories Module**: Create category management UI
5. **Build Users Module**: Add user management with RBAC
6. **Add Charts**: Integrate Recharts for analytics
7. **Add Export**: Implement CSV/PDF export functionality
8. **Add Barcode Scanning**: Integrate barcode scanner for products

## 🤝 Support

For issues or questions:
- Check the backend API documentation
- Review Next.js documentation: https://nextjs.org/docs
- Review ShadCN UI: https://ui.shadcn.com

---

**Happy Coding! 🚀**
