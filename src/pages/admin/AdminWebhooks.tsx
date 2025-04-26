
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/contexts/AppContext";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

const AdminWebhooks = () => {
  const { webhooks, categories, deleteWebhook } = useApp();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      deleteWebhook(id);
      toast.success("Webhook deleted successfully");
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "Uncategorized";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Webhooks</h1>
            <p className="text-muted-foreground">
              Create, edit and delete webhook endpoints.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/webhooks/new" className="flex items-center gap-1">
              <PlusIcon size={16} />
              New Webhook
            </Link>
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>{webhook.name}</TableCell>
                  <TableCell>{getCategoryName(webhook.categoryId)}</TableCell>
                  <TableCell>{webhook.method}</TableCell>
                  <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/admin/webhooks/${webhook.id}/edit`}>
                          <EditIcon size={16} />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(webhook.id)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {webhooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No webhooks found</p>
                    <Button asChild className="mt-4">
                      <Link to="/admin/webhooks/new">Create your first webhook</Link>
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

export default AdminWebhooks;
