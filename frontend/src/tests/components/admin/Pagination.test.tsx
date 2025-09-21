
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Pagination } from '@/components/admin/Pagination';
import { Pagination as PaginationType } from '@/types';

// Mock constants
vi.mock('@/lib/constants', () => ({
  PAGINATION: {
    PAGE_SIZE_OPTIONS: [10, 20, 50],
  },
}));

const mockPagination: PaginationType = {
  currentPage: 5,
  totalPages: 10,
  totalItems: 100,
  itemsPerPage: 10,
};

describe('Pagination', () => {
  it('renders nothing if totalItems is 0', () => {
    const { container } = render(
      <Pagination
        pagination={{ ...mockPagination, totalItems: 0 }}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correct item count and page info', () => {
    render(
      <Pagination
        pagination={mockPagination}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );
    expect(screen.getByText('41-50 of 100')).toBeInTheDocument();
  });

  it('disables previous/first buttons on the first page', () => {
    render(
      <Pagination
        pagination={{ ...mockPagination, currentPage: 1 }}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );
    expect(screen.getByTitle(/first page/i)).toBeDisabled();
    expect(screen.getByTitle(/previous page/i)).toBeDisabled();
    expect(screen.getByTitle(/next page/i)).toBeEnabled();
    expect(screen.getByTitle(/last page/i)).toBeEnabled();
  });

  it('disables next/last buttons on the last page', () => {
    render(
      <Pagination
        pagination={{ ...mockPagination, currentPage: 10 }}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );
    expect(screen.getByTitle(/first page/i)).toBeEnabled();
    expect(screen.getByTitle(/previous page/i)).toBeEnabled();
    expect(screen.getByTitle(/next page/i)).toBeDisabled();
    expect(screen.getByTitle(/last page/i)).toBeDisabled();
  });

  it('calls onPageChange with the correct page number', async () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        pagination={mockPagination}
        onPageChange={handlePageChange}
        onPageSizeChange={vi.fn()}
      />
    );

    await userEvent.click(screen.getByTitle(/next page/i));
    expect(handlePageChange).toHaveBeenCalledWith(6);

    await userEvent.click(screen.getByTitle(/previous page/i));
    expect(handlePageChange).toHaveBeenCalledWith(4);

    await userEvent.click(screen.getByRole('button', { name: '1' }));
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageSizeChange with the correct size', async () => {
    const handlePageSizeChange = vi.fn();
    render(
      <Pagination
        pagination={mockPagination}
        onPageChange={vi.fn()}
        onPageSizeChange={handlePageSizeChange}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    // Use findByRole to wait for the async appearance of the option
    await userEvent.click(await screen.findByRole('option', { name: '20' }));

    expect(handlePageSizeChange).toHaveBeenCalledWith(20);
  });

  it('renders ellipses for a large number of pages', () => {
    render(
      <Pagination
        pagination={{ ...mockPagination, totalPages: 20, currentPage: 10 }}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    // Should show something like: 1 ... 8 9 10 11 12 ... 20
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBe(2);
  });
});
