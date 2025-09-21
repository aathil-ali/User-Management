import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { UserFilters } from '@/components/admin/UserFilters';

// Mock constants
vi.mock('@/lib/constants', () => ({
  USER_ROLES: { ADMIN: 'admin', USER: 'user' },
  USER_STATUS: { ACTIVE: 'active', INACTIVE: 'inactive' },
}));

describe('UserFilters', () => {
  it('renders all filter controls', () => {
    render(<UserFilters onFiltersChange={vi.fn()} onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByText(/all roles/i)).toBeInTheDocument();
    expect(screen.getByText(/all status/i)).toBeInTheDocument();
  });

  it('calls onFiltersChange when a role is selected', async () => {
    const handleFiltersChange = vi.fn();
    render(<UserFilters onFiltersChange={handleFiltersChange} onSearch={vi.fn()} />);

    // Find the button by its content, as it has no accessible name
    const roleDropdown = screen.getByText(/all roles/i).closest('button');
    await userEvent.click(roleDropdown!);
    
    const option = await screen.findByRole('option', { name: 'Admin' });
    await userEvent.click(option);

    await waitFor(() => {
      expect(handleFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
    });
  });

  it('calls onFiltersChange when a status is selected', async () => {
    const handleFiltersChange = vi.fn();
    render(<UserFilters onFiltersChange={handleFiltersChange} onSearch={vi.fn()} />);

    const statusDropdown = screen.getByText(/all status/i).closest('button');
    await userEvent.click(statusDropdown!);

    const option = await screen.findByRole('option', { name: 'Active' });
    await userEvent.click(option);

    await waitFor(() => {
      expect(handleFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
    });
  });

  it('calls onSearch after user types', async () => {
    const handleSearch = vi.fn();
    render(<UserFilters onFiltersChange={vi.fn()} onSearch={handleSearch} />);

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    await userEvent.type(searchInput, 'test');

    // Check that the callback is eventually called
    await waitFor(() => {
      expect(handleSearch).toHaveBeenCalledWith('test');
    }, { timeout: 500 }); // Wait a bit longer than the debounce
  });

  it('clears all filters when "Clear all" is clicked', async () => {
    const handleFiltersChange = vi.fn();
    render(<UserFilters onFiltersChange={handleFiltersChange} onSearch={vi.fn()} />);

    // Apply a filter
    const roleDropdown = screen.getByText(/all roles/i).closest('button');
    await userEvent.click(roleDropdown!);
    await userEvent.click(await screen.findByRole('option', { name: 'Admin' }));

    // Click the clear button
    const clearButton = await screen.findByRole('button', { name: /clear all/i });
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(handleFiltersChange).toHaveBeenLastCalledWith({
        role: undefined,
        status: undefined,
        search: ''
      });
    });
  });

  it('clears an individual filter from a badge', async () => {
    const handleFiltersChange = vi.fn();
    render(<UserFilters onFiltersChange={handleFiltersChange} onSearch={vi.fn()} />);

    const roleDropdown = screen.getByText(/all roles/i).closest('button');
    await userEvent.click(roleDropdown!);
    await userEvent.click(await screen.findByRole('option', { name: 'Admin' }));

    // Wait for the badge to appear, then find the 'X' svg inside it and click
    const roleBadge = await screen.findByText(/role: admin/i);
    const clearBadgeButton = roleBadge.querySelector('svg');
    await userEvent.click(clearBadgeButton!);

    await waitFor(() => {
      expect(handleFiltersChange).toHaveBeenLastCalledWith(expect.objectContaining({ role: undefined }));
    });
  });
});