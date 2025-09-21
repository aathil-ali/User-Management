
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AdminStats } from '@/components/admin/AdminStats';
import { AdminDashboardStats } from '@/types';

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback, // Return the fallback string
  }),
}));

const mockStats: AdminDashboardStats = {
  totalUsers: 123,
  activeUsers: 100,
  suspendedUsers: 10,
  adminUsers: 13,
};

describe('AdminStats', () => {
  it('renders the loading skeleton when isLoading is true', () => {
    const { container } = render(<AdminStats stats={mockStats} isLoading={true} />);

    // Check for presence of pulse animation, indicating a skeleton loader
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);

    // Ensure no actual stat numbers are rendered
    expect(screen.queryByText('123')).not.toBeInTheDocument();
  });

  it('renders the stats correctly when data is provided', () => {
    render(<AdminStats stats={mockStats} isLoading={false} />);

    // Find each card by its unique heading and then check the value within it
    const totalUsersCard = screen.getByRole('heading', { name: /total users/i }).closest('div.rounded-lg');
    expect(within(totalUsersCard!).getByText('123')).toBeInTheDocument();

    const activeUsersCard = screen.getByRole('heading', { name: /active users/i }).closest('div.rounded-lg');
    expect(within(activeUsersCard!).getByText('100')).toBeInTheDocument();

    const suspendedCard = screen.getByRole('heading', { name: /suspended/i }).closest('div.rounded-lg');
    expect(within(suspendedCard!).getByText('10')).toBeInTheDocument();

    const adminsCard = screen.getByRole('heading', { name: /administrators/i }).closest('div.rounded-lg');
    expect(within(adminsCard!).getByText('13')).toBeInTheDocument();
  });

  it('renders 0 when stats are not provided or are zero', () => {
    const emptyStats = { totalUsers: 0, activeUsers: 0, suspendedUsers: 0, adminUsers: 0 };
    render(<AdminStats stats={emptyStats} isLoading={false} />);

    const totalUsersCard = screen.getByRole('heading', { name: /total users/i }).closest('div.rounded-lg');
    expect(within(totalUsersCard!).getAllByText('0').length).toBeGreaterThan(0);

    const activeUsersCard = screen.getByRole('heading', { name: /active users/i }).closest('div.rounded-lg');
    expect(within(activeUsersCard!).getAllByText('0').length).toBeGreaterThan(0);

    const suspendedCard = screen.getByRole('heading', { name: /suspended/i }).closest('div.rounded-lg');
    expect(within(suspendedCard!).getAllByText('0').length).toBeGreaterThan(0);

    const adminsCard = screen.getByRole('heading', { name: /administrators/i }).closest('div.rounded-lg');
    expect(within(adminsCard!).getAllByText('0').length).toBeGreaterThan(0);
  });
});
