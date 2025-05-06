import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import CategoryCard from "@/components/CategoryCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CategoriesPage = () => {
  const { categories, webhooks, createCategory } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#6E42CE",
  });

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = () => {
    if (newCategory.name.trim() === "") return;

    createCategory({
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color,
    });

    setNewCategory({
      name: "",
      description: "",
      color: "#6E42CE",
    });
    setIsDialogOpen(false);
  };

  const countWebhooksInCategory = (categoryId: string) => {
    return webhooks.filter((webhook) => webhook.categoryId === categoryId).length;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Organize your webhooks into categories for better management.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your webhooks.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., API Services"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="e.g., External API integrations"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border flex items-center justify-center overflow-hidden"
                    >
                      <input 
                        type="color" 
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        className="w-12 h-12 cursor-pointer"
                      />
                    </div>
                    <Input
                      id="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      placeholder="#6E42CE"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCategory}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={cn(
          "grid gap-6",
          filteredCategories.length > 0 ? "md:grid-cols-2 lg:grid-cols-3" : ""
        )}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                webhooksCount={countWebhooksInCategory(category.id)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 border border-dashed rounded-lg p-8">
              <div className="rounded-full bg-purple-100 p-3 mb-4">
                <SearchIcon className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="font-medium text-lg mb-1">No categories found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {categories.length === 0
                  ? "You haven't created any categories yet."
                  : "No categories match your search criteria."}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>Create Category</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
