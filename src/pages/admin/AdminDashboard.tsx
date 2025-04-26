
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";

const AdminDashboard = () => {
  const { webhooks, categories } = useApp();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your webhooks and categories.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Manage webhook endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{webhooks.length}</p>
                <p className="text-muted-foreground">Total webhooks</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage webhook categories</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-muted-foreground">Total categories</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
