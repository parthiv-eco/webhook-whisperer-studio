import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

const AdminWebhookForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { webhooks, categories, createWebhook, updateWebhook } = useApp();
  const { isAdmin } = useAuth();
  
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

  // Load existing webhook data if editing
  useEffect(() => {
    if (isEditing && id) {
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
        navigate("/admin/webhooks");
      }
    } else if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [isEditing, id, webhooks, categories, navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Admin access required");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    
    setIsLoading(true);
    
    const webhookData = {
      name,
      description,
      url,
      method,
      categoryId,
      headers,
      defaultPayload,
      examplePayloads,
    };
    
    try {
      if (isEditing && id) {
        await updateWebhook(id, webhookData);
      } else {
        await createWebhook(webhookData);
      }
      
      navigate("/admin/webhooks");
    } catch (error: any) {
      console.error("Webhook operation error:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} webhook: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
            {isEditing ? "Edit Webhook" : "Create New Webhook"}
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
                  <Select value={categoryId} onValueChange={setCategoryId} required>
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

export default AdminWebhookForm;
