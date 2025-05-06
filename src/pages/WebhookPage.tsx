
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CodeEditor from "@/components/CodeEditor";
import ResponseViewer from "@/components/ResponseViewer";
import { ArrowLeft, Edit, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Webhook, WebhookResponse } from "@/types";
import { toast } from "sonner";

const WebhookPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { webhooks, categories, executeWebhook, responses } = useApp();
  const { isAdmin } = useAuth();
  
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [category, setCategory] = useState<{ name: string; color?: string } | null>(null);
  const [payload, setPayload] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<WebhookResponse | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    const foundWebhook = webhooks.find((w) => w.id === id);
    if (foundWebhook) {
      setWebhook(foundWebhook);
      setPayload(foundWebhook.defaultPayload);
      
      const foundCategory = categories.find((c) => c.id === foundWebhook.categoryId);
      if (foundCategory) {
        setCategory(foundCategory);
      }
    } else {
      toast.error("Webhook not found");
      navigate("/");
    }
  }, [id, webhooks, categories, navigate]);
  
  // Find the response for this webhook
  useEffect(() => {
    if (id && responses.length > 0) {
      const latestResponse = responses.find(r => r.webhookId === id);
      setWebhookResponse(latestResponse || null);
    } else {
      setWebhookResponse(null);
    }
  }, [id, responses]);
  
  const handleExecute = async () => {
    if (!webhook) return;
    
    try {
      setIsExecuting(true);
      await executeWebhook(webhook, payload);
    } finally {
      setIsExecuting(false);
    }
  };
  
  if (!webhook) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p>Loading webhook...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{webhook.name}</h1>
                {category && (
                  <Badge style={{ backgroundColor: category.color }} className="text-white">
                    {category.name}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{webhook.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Button asChild variant="outline" className="flex items-center gap-1">
                  <Link to={`/admin/webhooks/${id}/edit`}>
                    <Edit size={16} />
                    Edit
                  </Link>
                </Button>
                <Button 
                  onClick={handleExecute} 
                  className="flex items-center gap-1" 
                  disabled={isExecuting}
                >
                  <Send size={16} />
                  {isExecuting ? "Executing..." : "Execute"}
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Endpoint Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">URL</div>
                    <div className="mt-1 rounded-md bg-muted/60 p-2 text-sm font-mono break-all">
                      {webhook.url}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Method</div>
                    <div className="mt-1">
                      <Badge variant="outline">{webhook.method}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Headers</div>
                    <div className="mt-1 rounded-md bg-muted/60 p-2 font-mono">
                      <div className="space-y-1 text-sm">
                        {webhook.headers.filter(h => h.enabled).map((header, idx) => (
                          <div key={idx}>
                            <span className="text-purple-600">{header.key}</span>
                            <span className="text-muted-foreground">: </span>
                            <span>{header.value}</span>
                          </div>
                        ))}
                        {webhook.headers.filter(h => h.enabled).length === 0 && (
                          <span className="text-muted-foreground">No headers defined</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Payload</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeEditor 
                  value={payload} 
                  onChange={setPayload} 
                  examplePayloads={webhook.examplePayloads}
                />
                <div className="mt-4">
                  {isAdmin && (
                    <Button 
                      onClick={handleExecute} 
                      className="w-full flex items-center justify-center gap-1" 
                      disabled={isExecuting}
                    >
                      <Send size={16} />
                      {isExecuting ? "Executing..." : "Execute Webhook"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            {webhookResponse ? (
              <ResponseViewer response={webhookResponse} />
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      Execute the webhook to see the response here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WebhookPage;
