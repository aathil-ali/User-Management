
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { LanguageSelector } from '@/components/common/LanguageSelector';

// Mock react-i18next's useTranslation hook
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        switch (key) {
          case 'languages.en': return 'English';
          case 'languages.es': return 'Español';
          case 'languages.fr': return 'Français';
          default: return key;
        }
      },
    }),
  };
});

// Update menuitem queries to match the new accessible names
// The accessible name is a concatenation of the uppercase code and the display name (e.g., "ENEnglish")
// Test 2: Opens Dropdown and Displays Options
// Test 3: Calls changeLanguage when a new language is selected
// Test 4: Renders in compact mode
// Test 5: Does not show the icon when showIcon is false


// Mock @heroicons/react/24/outline
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronDownIcon: vi.fn(() => <svg data-testid="chevron-down-icon" />),
  GlobeAltIcon: vi.fn(() => <svg data-testid="globe-alt-icon" />),
}));

// Mock @/i18n functions and constants
vi.mock('@/i18n', () => {
  const mockChangeLanguage = vi.fn();
  const mockGetCurrentLanguage = vi.fn(() => 'en');
  const mockGetLanguageDisplayName = vi.fn((lang) => {
    switch (lang) {
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      default: return lang;
    }
  });
  const mockSupportedLanguages = ['en', 'es', 'fr'];

  return {
    changeLanguage: mockChangeLanguage,
    getCurrentLanguage: mockGetCurrentLanguage,
    getLanguageDisplayName: mockGetLanguageDisplayName,
    SUPPORTED_LANGUAGES: mockSupportedLanguages,
  };
});

import * as i18nMock from '@/i18n';

describe('LanguageSelector', () => {
  beforeEach(() => {
    i18nMock.changeLanguage.mockClear();
    i18nMock.getCurrentLanguage.mockClear();
    i18nMock.getLanguageDisplayName.mockClear();
  });

  it('renders the current language correctly', () => {
    render(<LanguageSelector />);
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    expect(i18nMock.getCurrentLanguage).toHaveBeenCalledTimes(1);
  });

  it('opens the dropdown and displays all supported languages', async () => {
    render(<LanguageSelector />);
    await userEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /english/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /español/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /français/i })).toBeInTheDocument();
  });

  it('calls changeLanguage when a new language is selected', async () => {
    render(<LanguageSelector />);
    await userEvent.click(screen.getByRole('button', { name: 'English' }));

    await userEvent.click(screen.getByRole('menuitem', { name: /español/i }));

    await waitFor(() => {
      expect(i18nMock.changeLanguage).toHaveBeenCalledTimes(1);
      expect(i18nMock.changeLanguage).toHaveBeenCalledWith('es');
    });
  });

  it('renders in compact mode', () => {
    i18nMock.getCurrentLanguage.mockReturnValue('fr'); // Set current language for compact test
    render(<LanguageSelector compact={true} />);
    expect(screen.getByRole('button', { name: 'FR' })).toBeInTheDocument();
  });

  it('does not show the icon when showIcon is false', () => {
    render(<LanguageSelector showIcon={false} />);
    expect(screen.queryByTestId('globe-alt-icon')).not.toBeInTheDocument();
  });
});
