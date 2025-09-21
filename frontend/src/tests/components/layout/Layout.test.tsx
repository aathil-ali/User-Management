
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Import all layout components
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminNavbar } from '@/components/layout/AdminNavbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Footer } from '@/components/layout/Footer';
import { MainLayout } from '@/components/layout/MainLayout';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock react-router-dom's Link component and useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: vi.fn().mockImplementation(({ children, to }) => <a href={to}>{children}</a>),
    useNavigate: vi.fn(),
  };
});

// Mock react-i18next's useTranslation hook
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, fallback: string) => fallback, // Return the fallback string
    }),
  };
});

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
    logout: vi.fn(),
  }),
}));

// Mock ThemeContext
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock ToastContext (if used by any layout components)
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

// Custom render function with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};


describe('Layout Components', () => {
  it('renders AdminLayout without crashing', () => {
    const { container } = renderWithProviders(<AdminLayout><div data-testid="child">Test Child</div></AdminLayout>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders AdminNavbar without crashing', () => {
    const { container } = renderWithProviders(<AdminNavbar />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders AdminSidebar without crashing', () => {
    const { container } = renderWithProviders(<AdminSidebar />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders AuthLayout without crashing', () => {
    const { container } = renderWithProviders(<AuthLayout><div data-testid="child">Test Child</div></AuthLayout>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders Footer without crashing', () => {
    const { container } = renderWithProviders(<Footer />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders MainLayout without crashing', () => {
    const { container } = renderWithProviders(<MainLayout><div data-testid="child">Test Child</div></MainLayout>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders Navbar without crashing', () => {
    const { container } = renderWithProviders(<Navbar />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders Sidebar without crashing', () => {
    const { container } = renderWithProviders(<Sidebar />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
