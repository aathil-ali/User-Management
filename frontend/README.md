# 🎨 Frontend - User Management System

A modern React 19 frontend built with TypeScript, Vite, and TailwindCSS, featuring comprehensive user management capabilities with enterprise-grade authentication and internationalization.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Architecture

### Component Structure

```
src/
├── 🧩 components/              # Reusable UI components
│   ├── admin/                  # Admin-specific components
│   │   ├── AdminStats.tsx      # Dashboard statistics
│   │   ├── UserList.tsx        # User management table
│   │   ├── UserFilters.tsx     # Search and filter controls
│   │   └── Pagination.tsx      # Pagination component
│   ├── auth/                   # Authentication components
│   │   ├── LoginForm.tsx       # Login form
│   │   ├── RegisterForm.tsx    # Registration form
│   │   └── PasswordReset.tsx   # Password reset flow
│   ├── common/                 # Shared components
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   └── LanguageSelector.tsx # i18n language switcher
│   ├── layout/                 # Layout components
│   │   ├── MainLayout.tsx      # Main application layout
│   │   ├── AdminLayout.tsx     # Admin panel layout
│   │   ├── AuthLayout.tsx      # Authentication layout
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── Sidebar.tsx         # Sidebar navigation
│   │   └── Footer.tsx          # Footer component
│   ├── profile/                # User profile components
│   │   ├── ProfileView.tsx     # Profile display
│   │   ├── ProfileForm.tsx     # Profile editing
│   │   └── AccountDangerZone.tsx # Account deletion
│   └── ui/                     # Base UI components
│       ├── Button.tsx          # Button component
│       ├── Input.tsx           # Input component
│       ├── Card.tsx            # Card component
│       ├── Alert.tsx           # Alert component
│       ├── Loading.tsx         # Loading spinner
│       └── ThemeToggle.tsx     # Dark/light theme toggle
│
├── 🎣 hooks/                   # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   ├── useProfile.ts           # User profile hook
│   ├── useAdminUsers.ts        # Admin user management
│   ├── useAdminMutations.ts    # Admin mutations
│   ├── useToast.ts             # Toast notifications
│   ├── useLocalStorage.ts      # Local storage hook
│   └── useUI.ts                # UI state management
│
├── 🌐 contexts/                # React contexts
│   ├── AuthContext.tsx         # Authentication context
│   ├── ThemeContext.tsx        # Theme management
│   └── ToastContext.tsx        # Toast notifications
│
├── 📄 pages/                   # Page components
│   ├── auth/                   # Authentication pages
│   │   ├── LoginPage.tsx       # Login page
│   │   ├── RegisterPage.tsx    # Registration page
│   │   ├── ForgotPasswordPage.tsx # Password reset
│   │   └── VerifyEmailPage.tsx # Email verification
│   ├── admin/                  # Admin pages
│   │   ├── AdminDashboard.tsx  # Admin dashboard
│   │   ├── AdminUsersPage.tsx  # User management
│   │   ├── AdminUserDetailPage.tsx # User details
│   │   └── CreateUserPage.tsx  # Create new user
│   ├── profile/                # Profile pages
│   │   ├── ProfilePage.tsx     # User profile
│   │   ├── SettingsPage.tsx    # User settings
│   │   └── ChangePasswordPage.tsx # Password change
│   ├── errors/                 # Error pages
│   │   ├── NotFoundPage.tsx    # 404 page
│   │   ├── ServerErrorPage.tsx # 500 page
│   │   └── UnauthorizedPage.tsx # 403 page
│   └── DashboardPage.tsx       # Main dashboard
│
├── 🔧 services/                # API service layer
│   ├── api-client.ts           # Base API client
│   ├── auth.service.ts         # Authentication API
│   ├── user.service.ts         # User management API
│   └── admin.service.ts        # Admin operations API
│
├── 🛣️ router/                  # Routing configuration
│   ├── index.tsx               # Main router setup
│   └── ProtectedRoute.tsx      # Route protection
│
├── 🌍 locales/                 # Internationalization
│   ├── en/common.json          # English translations
│   ├── es/common.json          # Spanish translations
│   └── fr/common.json          # French translations
│
├── 📚 lib/                     # Utilities and configurations
│   ├── api.constants.ts        # API endpoints
│   ├── routes.constants.ts     # Route definitions
│   ├── ui.constants.ts         # UI constants
│   ├── validation.constants.ts # Validation rules
│   ├── validations.ts          # Form validations
│   ├── utils.ts                # Utility functions
│   ├── query-client.ts         # TanStack Query setup
│   └── query-keys.ts           # Query key definitions
│
├── 🏷️ types/                   # TypeScript type definitions
│   ├── api.types.ts            # API response types
│   ├── auth.types.ts           # Authentication types
│   ├── user.types.ts           # User-related types
│   ├── ui.types.ts             # UI component types
│   ├── component.types.ts      # Component prop types
│   ├── components/             # Component-specific types
│   ├── hooks/                  # Hook-specific types
│   └── pages/                  # Page-specific types
│
└── 🧪 tests/                   # Test files
    ├── components/             # Component tests
    ├── hooks/                  # Hook tests
    ├── pages/                  # Page tests
    └── utils/                  # Utility tests
```

## 🔧 Technology Stack

### Core Technologies
- **React 19** - Latest React with concurrent features and improved performance
- **TypeScript 5.8** - Type safety and enhanced developer experience
- **Vite 7.1** - Lightning-fast build tool and development server
- **TailwindCSS 3.4** - Utility-first CSS framework for rapid UI development

### State Management & Data Fetching
- **TanStack Query 5.89** - Powerful server state management
- **React Context** - Global state management for auth, theme, and UI
- **React Hook Form** - Performant form handling with validation

### Routing & Navigation
- **React Router 6** - Declarative routing for React applications
- **Protected Routes** - Route-level authentication and authorization

### UI & Styling
- **TailwindCSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Lucide React** - Beautiful & consistent icon library
- **clsx** - Utility for constructing className strings

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React integration for i18next
- **Supported Languages**: English, Spanish, French

### Development & Testing
- **Vitest** - Fast unit testing framework
- **Testing Library** - Simple and complete testing utilities
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking

## 🌟 Key Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** - Secure token-based auth
- **Role-based Access Control** - Different access levels (Super Admin, Admin, User, Guest)
- **Protected Routes** - Route-level security
- **Automatic Token Refresh** - Seamless session management
- **Login/Register Forms** - Complete authentication flow
- **Password Reset** - Secure password recovery

### 👥 User Management
- **User Dashboard** - Personalized user experience
- **Profile Management** - Complete profile editing
- **Admin Panel** - Comprehensive user administration
- **User Search & Filtering** - Advanced user discovery
- **Bulk Operations** - Efficient user management
- **User Statistics** - Visual analytics and insights

### 🎨 UI/UX Features
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - User preference-based theming
- **Toast Notifications** - User feedback system
- **Loading States** - Smooth user experience
- **Error Boundaries** - Graceful error handling
- **Accessibility** - WCAG 2.1 AA compliant

### 🌍 Internationalization
- **Multi-language Support** - English, Spanish, French
- **Dynamic Language Switching** - Runtime language changes
- **Localized Content** - Dates, numbers, and text
- **RTL Support Ready** - Right-to-left language preparation

## 🚀 Development

### Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_NAME="User Management System"
VITE_APP_VERSION="1.0.0"

# Feature Flags
VITE_ENABLE_MOCK_API=false
VITE_ENABLE_DEBUG=true

# Theme Configuration
VITE_DEFAULT_THEME=light
VITE_DEFAULT_LANGUAGE=en
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:host         # Start with network access

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript checks

# Analysis
npm run analyze          # Analyze bundle size
npm run build:stats      # Generate build statistics
```

## 🧪 Testing Strategy

### Testing Approach
- **Unit Tests** - Component and utility function testing
- **Integration Tests** - API integration and user flow testing
- **E2E Tests** - Complete user journey testing
- **Accessibility Tests** - WCAG compliance testing

### Test Structure
```
tests/
├── components/         # Component tests
│   ├── admin/         # Admin component tests
│   ├── auth/          # Auth component tests
│   ├── common/        # Common component tests
│   ├── layout/        # Layout component tests
│   └── profile/       # Profile component tests
├── hooks/             # Custom hook tests
├── pages/             # Page component tests
├── services/          # API service tests
├── utils/             # Utility function tests
└── setup.ts           # Test setup configuration
```

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- UserList.test.tsx

# Run tests matching pattern
npm test -- --grep "authentication"
```

## 📦 Build & Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

### Docker Deployment
```bash
# Build development image
docker build -f Dockerfile.dev -t frontend-dev .

# Build production image
docker build -f Dockerfile.prod -t frontend-prod .

# Run container
docker run -p 3000:3000 frontend-prod
```

### Performance Optimization
- **Code Splitting** - Automatic route-based splitting
- **Tree Shaking** - Dead code elimination
- **Asset Optimization** - Image and font optimization
- **Lazy Loading** - Component lazy loading
- **Bundle Analysis** - Regular bundle size monitoring

## 🔧 Configuration

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
        },
      },
    },
  },
});
```

### TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

## 🤝 Contributing

### Development Guidelines
1. **Code Style** - Follow ESLint and Prettier configurations
2. **Component Structure** - Use functional components with hooks
3. **Type Safety** - Ensure proper TypeScript typing
4. **Testing** - Write tests for new components and features
5. **Accessibility** - Follow WCAG 2.1 AA guidelines
6. **Performance** - Consider bundle size and runtime performance

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes with proper tests
3. Ensure all tests pass and linting is clean
4. Update documentation if needed
5. Submit a pull request with clear description

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)

---

**Built with ❤️ using modern React ecosystem**