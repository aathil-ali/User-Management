
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { ProfileView } from '@/components/profile/ProfileView';
import { User } from '@/types';

// Mock the isAdmin function from the types file
vi.mock('@/types', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    isAdmin: (role: string) => role === 'admin',
  };
});

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'user',
  isActive: true,
  avatar: 'https://example.com/avatar.png',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: true,
    timezone: 'UTC',
  },
};

const mockAdmin: User = {
  ...mockUser,
  id: '2',
  name: 'Jane Admin',
  email: 'jane.admin@example.com',
  role: 'admin',
};

describe('ProfileView', () => {
  it('renders user information correctly', () => {
    const handleEdit = vi.fn();
    render(<ProfileView user={mockUser} onEdit={handleEdit} />);

    // The user's name, email, role, and status appear in two places (header and details).
    // We can assert that we find exactly two instances of each.
    expect(screen.getAllByText('John Doe')).toHaveLength(2);
    expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2);
    expect(screen.getAllByText('user')).toHaveLength(2);
    expect(screen.getAllByText('Active')).toHaveLength(2);

    // Preferences should be unique
    expect(screen.getByText(/dark/i)).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('calls onEdit when the edit button is clicked', async () => {
    const handleEdit = vi.fn();
    render(<ProfileView user={mockUser} onEdit={handleEdit} />);

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await userEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('does not show admin privileges for a regular user', () => {
    const handleEdit = vi.fn();
    render(<ProfileView user={mockUser} onEdit={handleEdit} />);

    expect(screen.queryByText(/admin privileges/i)).not.toBeInTheDocument();
  });

  it('shows admin privileges for an admin user', () => {
    const handleEdit = vi.fn();
    render(<ProfileView user={mockAdmin} onEdit={handleEdit} />);

    expect(screen.getByText(/admin privileges/i)).toBeInTheDocument();
  });

  it('renders fallback avatar with initials', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined, name: 'Alice Bob' };
    render(<ProfileView user={userWithoutAvatar} onEdit={vi.fn()} />);

    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});
