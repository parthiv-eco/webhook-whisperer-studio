
import React, { createContext, useContext, useState, useEffect } from "react";
import { Webhook, WebhookCategory, WebhookResponse } from "@/types";
import { defaultCategories, defaultWebhooks } from "@/lib/data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

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
        setCategories(categoriesData as WebhookCategory[]);
      } else {
        // Use default categories if none exist in DB
        setCategories(defaultCategories);
        // If authenticated, add default categories to DB
        if (isAuthenticated) {
          for (const category of defaultCategories) {
            const { id, createdAt, ...categoryData } = category;
            await supabase.from('categories').insert(categoryData);
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
        setWebhooks(webhooksData.map(webhook => ({
          ...webhook,
          headers: webhook.headers || [],
          examplePayloads: webhook.example_payloads || [],
        })) as Webhook[]);
      } else {
        // Use default webhooks if none exist in DB
        setWebhooks(defaultWebhooks);
        // If authenticated, add default webhooks to DB
        if (isAuthenticated) {
          for (const webhook of defaultWebhooks) {
            const { id, createdAt, ...webhookData } = webhook;
            await supabase.from('webhooks').insert({
              ...webhookData,
              headers: JSON.stringify(webhookData.headers),
              example_payloads: JSON.stringify(webhookData.examplePayloads)
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
            responseMap[response.webhook_id] = {
              status: response.status,
              statusText: response.status_text,
              headers: response.headers,
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
        .insert(category)
        .select('*')
        .single();
      
      if (error) throw error;
      
      setCategories([...categories, data as WebhookCategory]);
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
          headers: webhook.headers,
          default_payload: webhook.defaultPayload,
          example_payloads: webhook.examplePayloads
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      const newWebhook: Webhook = {
        id: data.id,
        categoryId: data.category_id,
        name: data.name,
        description: data.description,
        url: data.url,
        method: data.method,
        headers: data.headers,
        defaultPayload: data.default_payload,
        examplePayloads: data.example_payloads,
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
          headers: webhook.headers,
          default_payload: webhook.defaultPayload,
          example_payloads: webhook.examplePayloads
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
