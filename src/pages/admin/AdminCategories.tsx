
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/contexts/AppContext";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

const AdminCategories = () => {
  const { categories, deleteCategory } = useApp();

  const handleDelete = (id: string) => {
    try {
      deleteCategory(id);
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error("Cannot delete category with webhooks");
    }
  };

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
            <Link to="/categories/new" className="flex items-center gap-1">
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
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <p className="text-muted-foreground">No categories found</p>
                    <Button asChild className="mt-4">
                      <Link to="/categories/new">Create your first category</Link>
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
