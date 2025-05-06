import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { PlusIcon, EditIcon, TrashIcon, ShieldIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminCategories = () => {
  const { categories, deleteCategory, webhooks } = useApp();
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate(); // Added missing navigate hook
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Auto-login effect for demo purposes
  useEffect(() => {
    const autoLogin = async () => {
      if (!isAuthenticated) {
        try {
          await login("admin@example.com", "admin123");
          toast.success("Auto-logged in as admin for demo purposes");
        } catch (error) {
          console.error("Auto-login failed:", error);
        }
      }
    };
    
    autoLogin();
  }, [isAuthenticated, login]);

  const handleDelete = async (id: string) => {
    try {
      // Check if category has webhooks
      const hasWebhooks = webhooks.some(webhook => webhook.categoryId === id);
      if (hasWebhooks) {
        toast.error("Cannot delete category with webhooks");
        return;
      }
      
      await deleteCategory(id);
      setCategoryToDelete(null);
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete category: ${error.message}`);
    }
  };

  const getCategoryWebhooks = (categoryId: string) => {
    return webhooks.filter(webhook => webhook.categoryId === categoryId).length;
  };

  // Show authentication loading state
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to access the admin dashboard.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Logging in automatically as admin for demo purposes...
          </p>
        </div>
      </Layout>
    );
  }
  
  // Show admin check
  if (isAuthenticated && !isAdmin) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <div className="flex justify-center mb-6">
            <ShieldIcon size={64} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="mb-4">
            You need admin privileges to manage categories.
          </p>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
            <p className="text-muted-foreground">
              Create, edit and delete webhook categories.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/categories/new" className="flex items-center gap-1">
              <PlusIcon size={16} />
              New Category
            </Link>
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Webhooks</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="h-3 w-3 rounded-full p-0" 
                        style={{ backgroundColor: category.color || '#6E42CE' }} 
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryWebhooks(category.id)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/admin/categories/${category.id}/edit`}>
                          <EditIcon size={16} />
                        </Link>
                      </Button>
                      <Dialog open={categoryToDelete === category.id} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCategoryToDelete(category.id)}
                          >
                            <TrashIcon size={16} className="text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Category</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this category? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => category.id && handleDelete(category.id)}
                              disabled={getCategoryWebhooks(category.id) > 0}
                            >
                              {getCategoryWebhooks(category.id) > 0 ? "Cannot Delete" : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">No categories found</p>
                    <Button asChild className="mt-4">
                      <Link to="/admin/categories/new">Create your first category</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCategories;
