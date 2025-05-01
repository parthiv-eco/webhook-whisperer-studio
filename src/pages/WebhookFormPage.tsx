
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebhookMethod, WebhookHeader } from "@/types";
import CodeEditor from "@/components/CodeEditor";
import HeadersEditor from "@/components/HeadersEditor";
import ExamplePayloads from "@/components/ExamplePayloads";
import { toast } from "sonner";
import { ArrowLeftIcon, SaveIcon, ShieldIcon } from "lucide-react";

const WebhookFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { webhooks, categories, addWebhook, updateWebhook } = useApp();
  const { isAuthenticated, isAdmin, login } = useAuth();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<WebhookMethod>("POST");
  const [categoryId, setCategoryId] = useState("");
  const [headers, setHeaders] = useState<WebhookHeader[]>([
    { key: "Content-Type", value: "application/json", enabled: true }
  ]);
  const [defaultPayload, setDefaultPayload] = useState("{\n  \n}");
  const [examplePayloads, setExamplePayloads] = useState<Array<{ name: string; payload: string }>>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!id;
  
  // Auto-login effect for demo purposes
  useEffect(() => {
    const autoLogin = async () => {
      if (!isAuthenticated) {
        try {
          // Using the hardcoded admin credentials from AuthContext
          await login("admin@example.com", "admin123");
          toast.success("Auto-logged in as admin for demo purposes");
        } catch (error) {
          console.error("Auto-login failed:", error);
        }
      }
    };
    
    autoLogin();
  }, [isAuthenticated, login]);
  
  useEffect(() => {
    if (isEditing) {
      const webhook = webhooks.find((w) => w.id === id);
      if (webhook) {
        setName(webhook.name);
        setDescription(webhook.description);
        setUrl(webhook.url);
        setMethod(webhook.method);
        setCategoryId(webhook.categoryId);
        setHeaders(webhook.headers);
        setDefaultPayload(webhook.defaultPayload);
        setExamplePayloads(webhook.examplePayloads);
      } else {
        toast.error("Webhook not found");
        navigate("/");
      }
    } else if (categories.length > 0) {
      // Set default category for new webhook
      setCategoryId(categories[0].id);
    }
  }, [isEditing, id, webhooks, categories, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Ensure categoryId is set
    const finalCategoryId = categoryId || (categories.length > 0 ? categories[0].id : '');
    
    if (!finalCategoryId) {
      toast.error("Please select a category or create one first");
      return;
    }
    
    // Ensure user is authenticated before submitting
    if (!isAuthenticated) {
      toast.error("You must be logged in to create or edit webhooks");
      return;
    }
    
    // Check if user has admin privileges
    if (!isAdmin) {
      toast.error("You must have admin privileges to create or edit webhooks");
      return;
    }
    
    setIsLoading(true);
    
    const webhookData = {
      name,
      description,
      url,
      method,
      categoryId: finalCategoryId,
      headers,
      defaultPayload,
      examplePayloads,
    };
    
    try {
      if (isEditing && id) {
        const webhook = webhooks.find((w) => w.id === id);
        if (webhook) {
          await updateWebhook({
            ...webhook,
            ...webhookData,
          });
          toast.success("Webhook updated successfully");
          navigate(`/webhooks/${id}`);
        }
      } else {
        await addWebhook(webhookData);
        toast.success("Webhook created successfully");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(`Failed to ${isEditing ? "update" : "create"} webhook: ${error.message}`);
      console.error("Webhook operation error:", error);
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
          <p className="mb-4">You need to be logged in to create or edit webhooks.</p>
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
            You need admin privileges to create or edit webhooks.
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
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Webhook" : "Create Webhook"}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., GitHub Webhook"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Webhook for GitHub events"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                {categories.length > 0 ? (
                  <Select value={categoryId} onValueChange={(value) => setCategoryId(value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No categories found. Please create a category first.
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g., https://api.example.com/webhook"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="method">Method *</Label>
                <Select value={method} onValueChange={(value) => setMethod(value as WebhookMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="headers">
            <TabsList className="mb-4">
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="payload">Default Payload</TabsTrigger>
              <TabsTrigger value="examples">Example Payloads</TabsTrigger>
            </TabsList>
            
            <TabsContent value="headers">
              <div className="space-y-2">
                <Label>Request Headers</Label>
                <HeadersEditor headers={headers} onChange={setHeaders} />
              </div>
            </TabsContent>
            
            <TabsContent value="payload">
              <div className="space-y-2">
                <Label>Default Payload</Label>
                <CodeEditor 
                  value={defaultPayload} 
                  onChange={setDefaultPayload} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="examples">
              <ExamplePayloads 
                examples={examplePayloads} 
                onChange={setExamplePayloads} 
              />
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-1" disabled={isLoading}>
              <SaveIcon size={16} />
              {isEditing ? "Save Changes" : "Create Webhook"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default WebhookFormPage;
