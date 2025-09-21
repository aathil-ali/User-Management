import { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, UserCheck, UserX, Eye, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User } from '@/types';
import { useAdminMutations } from '@/hooks/useAdminMutations';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserListProps } from '@/types';




export const UserList = ({ 
  users, 
  isLoading = false, 
  onUserClick, 
  onEditUser 
}: UserListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const { 
    deleteUser, 
    suspendUser, 
    unsuspendUser, 
    isLoading: mutationLoading 
  } = useAdminMutations();

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSuspendUser = (userId: string) => {
    suspendUser(userId);
  };

  const handleUnsuspendUser = (userId: string) => {
    unsuspendUser(userId);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
          No users found
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {user.id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin 
                      ? format(new Date(user.lastLogin), 'MMM dd, yyyy') 
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={mutationLoading}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => onUserClick?.(user.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => onEditUser?.(user)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        
                        {user.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-orange-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleUnsuspendUser(user.id)}
                            className="text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Unsuspend User
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
};