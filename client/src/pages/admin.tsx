import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Trash2, Shield, ShieldOff, Crown, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean | null;
  subscriptionStatus: string | null;
  isAdmin: boolean | null;
  createdAt: string | null;
}

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/admin/users", { credentials: "include" });
  if (!res.ok) {
    if (res.status === 403) throw new Error("Access denied - Admin only");
    throw new Error("Failed to fetch users");
  }
  return res.json();
}

async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

async function updateUser(userId: string, updates: Partial<AdminUser>): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update user");
}

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<AdminUser> }) =>
      updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const handleToggleAdmin = (user: AdminUser) => {
    updateMutation.mutate({
      userId: user.id,
      updates: { isAdmin: !user.isAdmin },
    });
  };

  const handleToggleSubscription = (user: AdminUser) => {
    const newStatus = user.subscriptionStatus === "active" ? "free" : "active";
    updateMutation.mutate({
      userId: user.id,
      updates: { subscriptionStatus: newStatus },
    });
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Card className="p-6">
            <CardContent className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-lg font-semibold text-destructive">
                {error instanceof Error ? error.message : "Access Denied"}
              </p>
              <p className="text-muted-foreground mt-2">
                You don't have permission to view this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <span className="font-medium">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                : "No name"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.email || "No email"}
                            {user.emailVerified && (
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.subscriptionStatus === "active" ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleToggleSubscription(user)}
                            data-testid={`badge-subscription-${user.id}`}
                          >
                            {user.subscriptionStatus === "active" ? (
                              <><Crown className="w-3 h-3 mr-1" /> Premium</>
                            ) : (
                              "Free"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isAdmin ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleToggleAdmin(user)}
                            data-testid={`badge-admin-${user.id}`}
                          >
                            {user.isAdmin ? (
                              <><Shield className="w-3 h-3 mr-1" /> Admin</>
                            ) : (
                              "User"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt
                            ? format(new Date(user.createdAt), "MMM d, yyyy")
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.id === currentUser?.id ? (
                            <span className="text-xs text-muted-foreground">You</span>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  data-testid={`button-delete-${user.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This will permanently
                                    remove their account and all associated data. This action cannot
                                    be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => deleteMutation.mutate(user.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              Total users: {users.length}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
