
import React, { createContext, useContext, useState, useEffect } from "react";
import { Webhook, WebhookCategory, WebhookResponse, WebhookHeader, WebhookMethod } from "@/types";
import { defaultCategories, defaultWebhooks } from "@/lib/data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { Json } from "@/integrations/supabase/types";

interface AppContextType {
  categories: WebhookCategory[];
  webhooks: Webhook[];
  addCategory: (category: Omit<WebhookCategory, "id" | "createdAt">) => Promise<void>;
  updateCategory: (category: WebhookCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addWebhook: (webhook: Omit<Webhook, "id" | "createdAt">) => Promise<void>;
  updateWebhook: (webhook: Webhook) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  executeWebhook: (webhook: Webhook, payload: string) => Promise<WebhookResponse | null>;
  responses: Record<string, WebhookResponse>;
  clearResponse: (webhookId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<WebhookCategory[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [responses, setResponses] = useState<Record<string, WebhookResponse>>({});
  const { isAuthenticated } = useAuth();
  
  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      if (categoriesError) {
        throw categoriesError;
      }
      
      if (categoriesData && categoriesData.length > 0) {
        // Map the database fields to our type fields
        const mappedCategories: WebhookCategory[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          color: cat.color || '#6E42CE',
          createdAt: cat.created_at
        }));
        setCategories(mappedCategories);
      } else {
        // Use default categories if none exist in DB
        setCategories(defaultCategories);
        // If authenticated, add default categories to DB
        if (isAuthenticated) {
          for (const category of defaultCategories) {
            const { id, createdAt, ...categoryData } = category;
            await supabase.from('categories').insert({
              name: categoryData.name,
              description: categoryData.description,
              color: categoryData.color
            });
          }
        }
      }
      
      // Fetch webhooks
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*');
      
      if (webhooksError) {
        throw webhooksError;
      }
      
      if (webhooksData && webhooksData.length > 0) {
        // Map the database fields to our type fields
        const mappedWebhooks: Webhook[] = webhooksData.map(webhook => {
          // Parse headers and example_payloads as needed
          let parsedHeaders: WebhookHeader[] = [];
          if (typeof webhook.headers === 'string') {
            try {
              parsedHeaders = JSON.parse(webhook.headers);
            } catch (e) {
              parsedHeaders = [];
            }
          } else if (Array.isArray(webhook.headers)) {
            parsedHeaders = webhook.headers as unknown as WebhookHeader[];
          }
          
          let parsedExamplePayloads: {name: string, payload: string}[] = [];
          if (typeof webhook.example_payloads === 'string') {
            try {
              parsedExamplePayloads = JSON.parse(webhook.example_payloads);
            } catch (e) {
              parsedExamplePayloads = [];
            }
          } else if (Array.isArray(webhook.example_payloads)) {
            parsedExamplePayloads = webhook.example_payloads as unknown as {name: string, payload: string}[];
          }
          
          return {
            id: webhook.id,
            categoryId: webhook.category_id || '',
            name: webhook.name,
            description: webhook.description || '',
            url: webhook.url,
            method: webhook.method as WebhookMethod,
            headers: parsedHeaders,
            defaultPayload: webhook.default_payload || '',
            examplePayloads: parsedExamplePayloads,
            createdAt: webhook.created_at
          };
        });
        
        setWebhooks(mappedWebhooks);
      } else {
        // Use default webhooks if none exist in DB
        setWebhooks(defaultWebhooks);
        // If authenticated, add default webhooks to DB
        if (isAuthenticated) {
          for (const webhook of defaultWebhooks) {
            const { id, createdAt, categoryId, defaultPayload, examplePayloads, headers, ...webhookData } = webhook;
            await supabase.from('webhooks').insert({
              category_id: categoryId,
              name: webhookData.name,
              description: webhookData.description,
              url: webhookData.url,
              method: webhookData.method,
              headers: JSON.stringify(headers),
              default_payload: defaultPayload,
              example_payloads: JSON.stringify(examplePayloads)
            });
          }
        }
      }
      
      // Fetch responses
      if (isAuthenticated) {
        const { data: responsesData, error: responsesError } = await supabase
          .from('webhook_responses')
          .select('*');
        
        if (responsesError) {
          throw responsesError;
        }
        
        if (responsesData && responsesData.length > 0) {
          const responseMap: Record<string, WebhookResponse> = {};
          responsesData.forEach(response => {
            // Parse and convert headers to the expected format
            const headers: Record<string, string> = {};
            if (typeof response.headers === 'object' && response.headers !== null) {
              Object.entries(response.headers as Record<string, any>).forEach(([key, value]) => {
                headers[key] = String(value);
              });
            }
            
            responseMap[response.webhook_id] = {
              status: response.status,
              statusText: response.status_text,
              headers,
              data: response.data,
              timestamp: response.timestamp,
            };
          });
          setResponses(responseMap);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };
  
  // Initialize data from Supabase
  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const addCategory = async (category: Omit<WebhookCategory, "id" | "createdAt">) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          description: category.description,
          color: category.color
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      const newCategory: WebhookCategory = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        color: data.color || '#6E42CE',
        createdAt: data.created_at
      };
      
      setCategories([...categories, newCategory]);
      toast.success("Category created successfully");
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(`Failed to create category: ${error.message}`);
    }
  };

  const updateCategory = async (category: WebhookCategory) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description,
          color: category.color
        })
        .eq('id', category.id);
      
      if (error) throw error;
      
      setCategories(categories.map(c => c.id === category.id ? category : c));
      toast.success("Category updated successfully");
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(`Failed to update category: ${error.message}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Check if category has webhooks
      const hasWebhooks = webhooks.some(webhook => webhook.categoryId === id);
      if (hasWebhooks) {
        toast.error("Cannot delete category with webhooks");
        return;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted successfully");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(`Failed to delete category: ${error.message}`);
    }
  };

  const addWebhook = async (webhook: Omit<Webhook, "id" | "createdAt">) => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          category_id: webhook.categoryId,
          name: webhook.name,
          description: webhook.description,
          url: webhook.url,
          method: webhook.method,
          headers: JSON.stringify(webhook.headers),
          default_payload: webhook.defaultPayload,
          example_payloads: JSON.stringify(webhook.examplePayloads)
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      const newWebhook: Webhook = {
        id: data.id,
        categoryId: data.category_id || '',
        name: data.name,
        description: data.description || '',
        url: data.url,
        method: data.method as WebhookMethod,
        headers: webhook.headers, // Use the original headers as they're already in the correct format
        defaultPayload: data.default_payload || '',
        examplePayloads: webhook.examplePayloads, // Use the original examplePayloads as they're already in the correct format
        createdAt: data.created_at
      };
      
      setWebhooks([...webhooks, newWebhook]);
      toast.success("Webhook created successfully");
    } catch (error: any) {
      console.error("Error adding webhook:", error);
      toast.error(`Failed to create webhook: ${error.message}`);
    }
  };

  const updateWebhook = async (webhook: Webhook) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({
          category_id: webhook.categoryId,
          name: webhook.name,
          description: webhook.description,
          url: webhook.url,
          method: webhook.method,
          headers: JSON.stringify(webhook.headers),
          default_payload: webhook.defaultPayload,
          example_payloads: JSON.stringify(webhook.examplePayloads)
        })
        .eq('id', webhook.id);
      
      if (error) throw error;
      
      setWebhooks(webhooks.map(w => w.id === webhook.id ? webhook : w));
      toast.success("Webhook updated successfully");
    } catch (error: any) {
      console.error("Error updating webhook:", error);
      toast.error(`Failed to update webhook: ${error.message}`);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setWebhooks(webhooks.filter(w => w.id !== id));
      
      // Also remove any stored response
      const newResponses = { ...responses };
      delete newResponses[id];
      setResponses(newResponses);
      
      toast.success("Webhook deleted successfully");
    } catch (error: any) {
      console.error("Error deleting webhook:", error);
      toast.error(`Failed to delete webhook: ${error.message}`);
    }
  };

  const executeWebhook = async (webhook: Webhook, payload: string): Promise<WebhookResponse | null> => {
    try {
      toast.info("Sending webhook request...");
      
      // In a real app, this would send the actual request
      // Here we're simulating a response for demo purposes
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a simulated response
      const response: WebhookResponse = {
        status: 200,
        statusText: "OK",
        headers: {
          "content-type": "application/json",
          "x-request-id": crypto.randomUUID(),
        },
        data: {
          success: true,
          message: "Webhook received successfully",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      
      // Store the response in Supabase if authenticated
      if (isAuthenticated) {
        await supabase.from('webhook_responses').insert({
          webhook_id: webhook.id,
          status: response.status,
          status_text: response.statusText,
          headers: response.headers,
          data: response.data,
          timestamp: response.timestamp
        });
      }
      
      // Store the response in state
      setResponses({
        ...responses,
        [webhook.id]: response
      });
      
      toast.success("Webhook executed successfully!");
      return response;
    } catch (error) {
      console.error("Error executing webhook:", error);
      toast.error("Failed to execute webhook");
      return null;
    }
  };

  const clearResponse = (webhookId: string) => {
    const newResponses = { ...responses };
    delete newResponses[webhookId];
    setResponses(newResponses);
  };

  const value = {
    categories,
    webhooks,
    addCategory,
    updateCategory,
    deleteCategory,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    executeWebhook,
    responses,
    clearResponse,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
