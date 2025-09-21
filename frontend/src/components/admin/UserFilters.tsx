import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { USER_ROLES, USER_STATUS } from '@/lib/constants';
import { UserFiltersProps, UserFilterState } from '@/types';





export const UserFilters = ({
  onFiltersChange,
  onSearch,
  totalUsers = 0,
  isLoading = false
}: UserFiltersProps) => {
  const [filters, setFilters] = useState<UserFilterState>({
    role: undefined,
    status: undefined,
    search: '',
  });

  const [searchValue, setSearchValue] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
      setFilters(prev => ({ ...prev, search: searchValue }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  // Emit filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleRoleChange = (value: string) => {
    const newRole = value === 'all' ? undefined : value;
    setFilters(prev => ({ ...prev, role: newRole }));
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value === 'all' ? undefined : value;
    setFilters(prev => ({ ...prev, status: newStatus }));
  };

  const clearFilters = () => {
    setFilters({
      role: undefined,
      status: undefined,
      search: '',
    });
    setSearchValue('');
  };

  const hasActiveFilters = filters.role || filters.status || filters.search;
  const activeFilterCount = [filters.role, filters.status, filters.search].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Search and Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Filter Users</h3>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
              ) : (
                <span>{totalUsers} users</span>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter */}
            <Select value={filters.role || 'all'} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
                <SelectItem value={USER_ROLES.USER}>User</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={USER_STATUS.ACTIVE}>Active</SelectItem>
                <SelectItem value={USER_STATUS.INACTIVE}>Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              
              {filters.search && (
                <Badge variant="outline" className="gap-1">
                  Search: "{filters.search}"
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => {
                      setSearchValue('');
                      setFilters(prev => ({ ...prev, search: '' }));
                    }}
                  />
                </Badge>
              )}
              
              {filters.role && (
                <Badge variant="outline" className="gap-1">
                  Role: {filters.role}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => setFilters(prev => ({ ...prev, role: undefined }))}
                  />
                </Badge>
              )}
              
              {filters.status && (
                <Badge variant="outline" className="gap-1">
                  Status: {filters.status}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => setFilters(prev => ({ ...prev, status: undefined }))}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};