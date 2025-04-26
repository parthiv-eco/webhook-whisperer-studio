
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WebhookCard from "@/components/WebhookCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Webhook } from "@/types";
import { PlusCircleIcon, SearchIcon, DatabaseIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const DashboardPage = () => {
  const { categories, webhooks } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">(categoryParam || "all");
  const [filteredWebhooks, setFilteredWebhooks] = useState<Webhook[]>([]);

  useEffect(() => {
    let filtered = [...webhooks];
    
    // Filter by category if selected
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((webhook) => webhook.categoryId === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (webhook) =>
          webhook.name.toLowerCase().includes(lowerSearchTerm) ||
          webhook.description.toLowerCase().includes(lowerSearchTerm) ||
          webhook.url.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredWebhooks(filtered);
  }, [webhooks, selectedCategory, searchTerm]);
  
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
  };

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
            <p className="text-muted-foreground">
              View, manage and execute your webhooks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/categories" className="flex items-center gap-1">
                <DatabaseIcon size={16} />
                Manage Categories
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/webhooks/new" className="flex items-center gap-1">
                <PlusCircleIcon size={16} />
                New Webhook
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search webhooks..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={cn(
          "grid gap-6",
          filteredWebhooks.length > 0 ? "md:grid-cols-2 lg:grid-cols-3" : ""
        )}>
          {filteredWebhooks.length > 0 ? (
            filteredWebhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                category={getCategoryById(webhook.categoryId)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 border border-dashed rounded-lg p-8">
              <div className="rounded-full bg-purple-100 p-3 mb-4">
                <DatabaseIcon className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="font-medium text-lg mb-1">No webhooks found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {webhooks.length === 0
                  ? "You haven't created any webhooks yet."
                  : "No webhooks match your search criteria."}
              </p>
              <Button asChild>
                <Link to="/webhooks/new">Create Webhook</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
