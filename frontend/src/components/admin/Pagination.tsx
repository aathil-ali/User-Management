import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAGINATION } from '@/lib/constants';
import { PaginationProps } from '@/types';

export const Pagination = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading = false
}: PaginationProps) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isLoading) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const pageSize = parseInt(newPageSize, 10);
    if (!isLoading) {
      onPageSizeChange(pageSize);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Show 2 pages before and after current page
    const pages: (number | string)[] = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Always show first page
    pages.push(1);

    // Add ellipsis if there's a gap after page 1
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Add pages in the middle range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis if there's a gap before last page
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Items per page selector */}
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={handlePageSizeChange}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page info and navigation */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Items count */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {startItem}-{endItem} of {totalItems}
        </div>

        {/* Page navigation */}
        <div className="flex items-center space-x-2">
          {/* First page */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || isLoading}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={page === currentPage ? 'default' : 'outline'}
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(page as number)}
                    disabled={isLoading}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || isLoading}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};