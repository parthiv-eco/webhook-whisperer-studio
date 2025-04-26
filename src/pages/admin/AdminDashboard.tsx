
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { BarChart3, FolderIcon, WebhookIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { webhooks, categories } = useApp();

  const stats = [
    {
      title: "Webhooks",
      value: webhooks.length,
      description: "Total webhook endpoints",
      icon: <WebhookIcon className="h-5 w-5 text-purple-500" />,
      link: "/admin/webhooks",
      linkText: "Manage webhooks",
      addLink: "/admin/webhooks/new",
    },
    {
      title: "Categories",
      value: categories.length,
      description: "Total webhook categories",
      icon: <FolderIcon className="h-5 w-5 text-indigo-500" />,
      link: "/admin/categories",
      linkText: "Manage categories",
      addLink: "/categories/new",
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your webhooks and categories from a central location.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild className="gap-1">
              <Link to="/admin/webhooks/new">
                <PlusIcon size={16} />
                New Webhook
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="bg-muted/40 flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <CardTitle>{stat.title}</CardTitle>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Link to={stat.addLink}>
                    <PlusIcon size={16} />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <CardDescription>{stat.description}</CardDescription>
                <Button asChild variant="link" className="p-0 h-auto mt-2">
                  <Link to={stat.link}>{stat.linkText} →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="bg-muted/40 flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-500" />
                <CardTitle>Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold mb-1">--</div>
              <CardDescription>View webhook execution analytics</CardDescription>
              <Button disabled variant="link" className="p-0 h-auto mt-2">
                Coming soon →
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent webhook executions and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity to display.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/webhooks/new" className="flex items-center gap-2">
                  <PlusIcon size={16} />
                  Create New Webhook
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/categories/new" className="flex items-center gap-2">
                  <PlusIcon size={16} />
                  Create New Category
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/" className="flex items-center gap-2">
                  <WebhookIcon size={16} />
                  View User Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
