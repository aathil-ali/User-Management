
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { UserList } from '@/components/admin/UserList';
import { User } from '@/types';

// Mock hooks and components
const mockDeleteUser = vi.fn();
const mockSuspendUser = vi.fn();
const mockUnsuspendUser = vi.fn();

vi.mock('@/hooks/useAdminMutations', () => ({
  useAdminMutations: () => ({
    deleteUser: mockDeleteUser,
    suspendUser: mockSuspendUser,
    unsuspendUser: mockUnsuspendUser,
    isLoading: false,
  }),
}));

vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: (props: any) => {
    if (!props.open) return null;
    return (
      <div>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
        <button onClick={props.onConfirm}>Confirm</button>
        <button onClick={() => props.onOpenChange(false)}>Cancel</button>
      </div>
    );
  },
}));

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'user',
    status: 'suspended',
    createdAt: new Date().toISOString(),
    lastLogin: null,
  },
];

describe('UserList', () => {
  it('renders a loading state', () => {
    const { container } = render(<UserList users={[]} isLoading={true} />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders an empty state', () => {
    render(<UserList users={[]} isLoading={false} />);
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('renders a list of users', () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('calls onEditUser when edit is clicked', async () => {
    const handleEditUser = vi.fn();
    render(<UserList users={mockUsers} onEditUser={handleEditUser} />);

    const firstRow = screen.getByText('Alice').closest('tr');
    const menuButton = within(firstRow!).getByRole('button');
    await userEvent.click(menuButton);

    const editMenuItem = await screen.findByText(/edit user/i);
    await userEvent.click(editMenuItem);

    expect(handleEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('calls suspendUser when suspend is clicked for an active user', async () => {
    render(<UserList users={mockUsers} />);
    const firstRow = screen.getByText('Alice').closest('tr');
    const menuButton = within(firstRow!).getByRole('button');
    await userEvent.click(menuButton);

    const suspendMenuItem = await screen.findByText(/suspend user/i);
    await userEvent.click(suspendMenuItem);

    expect(mockSuspendUser).toHaveBeenCalledWith('1');
  });

  it('calls unsuspendUser when unsuspend is clicked for a suspended user', async () => {
    render(<UserList users={mockUsers} />);
    const secondRow = screen.getByText('Bob').closest('tr');
    const menuButton = within(secondRow!).getByRole('button');
    await userEvent.click(menuButton);

    const unsuspendMenuItem = await screen.findByText(/unsuspend user/i);
    await userEvent.click(unsuspendMenuItem);

    expect(mockUnsuspendUser).toHaveBeenCalledWith('2');
  });

  it('shows a confirmation dialog and calls deleteUser on confirm', async () => {
    render(<UserList users={mockUsers} />);
    const firstRow = screen.getByText('Alice').closest('tr');
    const menuButton = within(firstRow!).getByRole('button');
    await userEvent.click(menuButton);

    const deleteMenuItem = await screen.findByText(/delete user/i);
    await userEvent.click(deleteMenuItem);

    // Check if dialog is shown
    expect(screen.getByText('Delete User')).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    await userEvent.click(confirmButton);

    expect(mockDeleteUser).toHaveBeenCalledWith('1');
  });
});
