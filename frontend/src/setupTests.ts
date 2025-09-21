import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill for Radix UI components in JSDOM
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}
