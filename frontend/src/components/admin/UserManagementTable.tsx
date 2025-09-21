import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Users, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getInitials } from '@/lib/utils';
import { UserManagementTableProps, UserRole } from '@/types';

const roleColors = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    [UserRole.USER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
} as const;

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
    users,
    isLoading = false,
    pagination,
    onPageChange,
    showActions = true,
}) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                    {t('admin.users.noUsers', 'No users found')}
                </h3>
            </div>
        );
    }

    return (
        <>
            {/* Users Table */}
            <div className="rounded-md border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    {t('admin.users.table.user', 'User')}
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    {t('admin.users.table.role', 'Role')}
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    {t('admin.users.table.status', 'Status')}
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    {t('admin.users.table.joined', 'Joined')}
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    {t('admin.users.table.lastLogin', 'Last Login')}
                                </th>
                                {showActions && (
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                        {t('admin.users.table.actions', 'Actions')}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                                <AvatarFallback>
                                                    {getInitials(user.name || user.email)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {user.name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                                            {t(`roles.${user.role?.toLowerCase()}`) || user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={user.isActive ? "default" : "secondary"}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {user.lastLogin ? formatDate(user.lastLogin, { relative: true }) : t('common.never', 'Never')}
                                    </td>
                                    {showActions && (
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/admin/users/${user.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View user details</span>
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.total > pagination.limit && onPageChange && (
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                            disabled={pagination.page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {t('common.previous', 'Previous')}
                        </Button>
                        <div className="text-sm">
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(pagination.totalPages || 1, pagination.page + 1))}
                            disabled={pagination.page >= (pagination.totalPages || 1)}
                        >
                            {t('common.next', 'Next')}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserManagementTable;