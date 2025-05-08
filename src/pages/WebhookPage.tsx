
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Webhook } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Edit, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import ResponseViewer from "@/components/ResponseViewer";

const WebhookPage = () => {
  const { id } = useParams<{ id: string }>();
  const { webhooks, executeWebhook, responses } = useApp();
  const [webhook, setWebhook] = useState<Webhook | undefined>(undefined);
  const [editorContent, setEditorContent] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const foundWebhook = webhooks.find((webhook) => webhook.id === id);
      setWebhook(foundWebhook);
      setEditorContent(foundWebhook?.defaultPayload || "");
    }
  }, [id, webhooks]);

  useEffect(() => {
    if (webhook) {
      setEditorContent(webhook.defaultPayload || "");
    }
  }, [webhook]);

  // Get the most recent response for this webhook
  useEffect(() => {
    if (id) {
      const webhookResponses = responses.filter(response => response.webhookId === id);
      if (webhookResponses.length > 0) {
        setResponse(webhookResponses[0]);
      }
    }
  }, [id, responses]);

  if (!webhook) {
    return <div>Webhook not found</div>;
  }

  const handleExecute = async () => {
    if (webhook && id) {
      setIsExecuting(true);
      try {
        await executeWebhook(id, editorContent);
        toast.success("Webhook executed successfully");
        
        // Find the latest response for this webhook
        const latestResponse = responses.find(response => response.webhookId === id);
        if (latestResponse) {
          setResponse(latestResponse);
        }
      } catch (error) {
        toast.error("Failed to execute webhook");
      } finally {
        setIsExecuting(false);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    toast.success("Payload copied to clipboard");
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{webhook.name}</h1>
          <p className="text-muted-foreground">{webhook.description}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/webhooks/${webhook.id}/edit`} className="flex items-center gap-2">
              <Edit size={16} />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" className="flex items-center gap-2">
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Webhook details and execution</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>URL</Label>
                <Input type="text" value={webhook.url} readOnly />
              </div>
              <div>
                <Label>Method</Label>
                <Input type="text" value={webhook.method} readOnly />
              </div>
            </div>

            <div>
              <Label>Payload</Label>
              <div className="border rounded-md">
                <Editor
                  height="300px"
                  defaultLanguage="json"
                  value={editorContent}
                  onChange={(value) => setEditorContent(value || "")}
                  options={{
                    wordWrap: "on",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    theme: "vs-dark"
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <Button variant="secondary" size="sm" onClick={handleCopy} className="flex items-center gap-2">
                  <Copy size={16} />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleExecute} 
                  className="flex items-center gap-2"
                  disabled={isExecuting}
                >
                  <Play size={16} />
                  {isExecuting ? "Executing..." : "Execute"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {response && (
          <ResponseViewer response={response} />
        )}
      </div>
    </div>
  );
};

export default WebhookPage;
