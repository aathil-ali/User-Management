
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { AccountDangerZone } from '@/components/profile/AccountDangerZone';

describe('AccountDangerZone', () => {
  it('renders the initial state correctly', () => {
    render(<AccountDangerZone onDeleteAccount={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /danger zone/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    expect(screen.queryByText(/are you absolutely sure/i)).not.toBeInTheDocument();
  });

  it('shows the confirmation dialog on delete button click', async () => {
    render(<AccountDangerZone onDeleteAccount={vi.fn()} />);

    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await userEvent.click(deleteButton);

    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, delete my account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('returns to the initial state when cancel is clicked', async () => {
    render(<AccountDangerZone onDeleteAccount={vi.fn()} />);

    // Open confirmation
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await userEvent.click(deleteButton);

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Check that we are back to the initial state
    expect(screen.queryByText(/are you absolutely sure/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
  });

  it('calls onDeleteAccount when deletion is confirmed', async () => {
    const handleDelete = vi.fn();
    render(<AccountDangerZone onDeleteAccount={handleDelete} />);

    // Open confirmation
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await userEvent.click(deleteButton);

    // Click confirm
    const confirmButton = screen.getByRole('button', { name: /yes, delete my account/i });
    await userEvent.click(confirmButton);

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows loading state when isDeleting is true', async () => {
    // Test the initial state when deleting
    const { rerender } = render(<AccountDangerZone onDeleteAccount={vi.fn()} isDeleting={true} />);
    expect(screen.getByRole('button', { name: /delete account/i })).toBeDisabled();

    // Test the confirmation state when deleting
    // Start in a non-deleting state to be able to click the button
    rerender(<AccountDangerZone onDeleteAccount={vi.fn()} isDeleting={false} />);
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await userEvent.click(deleteButton);

    // Now re-render in the `isDeleting` state
    rerender(<AccountDangerZone onDeleteAccount={vi.fn()} isDeleting={true} />);

    const confirmButton = screen.getByRole('button', { name: /deleting/i });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('displays an error message when an error is provided', () => {
    const error = { message: 'Could not delete account.' };
    render(<AccountDangerZone onDeleteAccount={vi.fn()} error={error} />);

    expect(screen.getByText('Could not delete account.')).toBeInTheDocument();
  });
});
