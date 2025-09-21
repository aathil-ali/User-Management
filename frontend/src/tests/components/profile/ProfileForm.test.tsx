
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { ProfileForm } from '@/components/profile/ProfileForm';
import { User } from '@/types';

// Mock dependencies
const mockSetTheme = vi.fn();
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ setTheme: mockSetTheme }),
}));

const mockChangeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

vi.mock('@/lib/validations', async () => {
  const { z } = await import('zod');
  return {
    backendProfileSchema: z.object({
      name: z.string().min(1, 'Name is required.'),
      avatar: z.string().optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system', 'auto']),
        notifications: z.object({
          email: z.boolean(),
          push: z.boolean(),
          marketing: z.boolean(),
        }),
        language: z.enum(['en', 'es', 'fr']),
        timezone: z.string().optional(),
      }),
    }),
  };
});

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'user',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: { email: true, push: false, marketing: false },
    timezone: 'UTC',
  },
};

describe('ProfileForm', () => {
  it('renders with initial user data', () => {
    render(<ProfileForm user={mockUser} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/avatar url/i)).toHaveValue(''); // Assuming avatar is not in mock
    expect(screen.getByLabelText(/theme/i)).toHaveValue('dark');
    expect(screen.getByLabelText(/language/i)).toHaveValue('en');
    expect(screen.getByLabelText(/enable notifications/i)).toBeChecked();
    expect(screen.getByLabelText(/timezone/i)).toHaveValue('UTC');
  });

  it('updates form state on user input', async () => {
    render(<ProfileForm user={mockUser} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const nameInput = screen.getByLabelText(/full name/i);

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');

    expect(nameInput).toHaveValue('Jane Doe');
  });

  it('calls onSubmit with updated data on successful submission', async () => {
    const handleSubmit = vi.fn();
    render(<ProfileForm user={mockUser} onSubmit={handleSubmit} onCancel={vi.fn()} />);

    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Jane Doe',
      }));
    });
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const handleCancel = vi.fn();
    render(<ProfileForm user={mockUser} onSubmit={vi.fn()} onCancel={handleCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('displays a validation error for required fields', async () => {
    const handleSubmit = vi.fn();
    render(<ProfileForm user={mockUser} onSubmit={handleSubmit} onCancel={vi.fn()} />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.clear(nameInput);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveButton);

    // The error message comes from our simplified mock of the zod schema
    await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('disables the form and shows loading state when isSubmitting is true', () => {
    render(<ProfileForm user={mockUser} onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={true} />);

    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toBeDisabled();
  });
});
