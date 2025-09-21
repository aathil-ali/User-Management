import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return t('themes.light');
      case 'dark':
        return t('themes.dark');
      case 'system':
        return t('themes.auto');
      default:
        return t('common.theme', 'Toggle theme');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  );
};

export default ThemeToggle;
