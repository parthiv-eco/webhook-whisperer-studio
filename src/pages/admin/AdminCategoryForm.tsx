import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, SaveIcon, ShieldIcon } from "lucide-react";
import { toast } from "sonner";

const AdminCategoryForm = () => {
  const navigate = useNavigate();
  const { createCategory } = useApp();
  const { isAuthenticated, isAdmin, login } = useAuth();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6E42CE");
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createCategory({
        name,
        description,
        color,
      });
      navigate("/admin/categories");
    } catch (error: any) {
      console.error("Category creation error:", error);
      toast.error(`Failed to create category: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show authentication loading state
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to create categories.</p>
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
            You need admin privileges to create categories.
          </p>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create Category</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 max-w-xl">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., API Services"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 cursor-pointer"
                  />
                </div>
                <Input
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6E42CE"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-1" disabled={isLoading}>
              <SaveIcon size={16} />
              Create Category
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdminCategoryForm;
