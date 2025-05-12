
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { WebhookCategory, Webhook, WebhookResponse, WebhookMethod, WebhookHeader } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

// Load environment variables from .env file
import.meta.env.VITE_SUPABASE_URL;
import.meta.env.VITE_SUPABASE_ANON_KEY;
import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Define types for database responses to fix TypeScript errors
interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
}

interface WebhookRow {
  id: string;
  name: string;
  description: string | null;
  url: string;
  method: string;
  category_id: string | null;
  headers: any;
  default_payload: string;
  example_payloads: any;
  created_at: string;
}

interface WebhookResponseRow {
  id: string;
  webhook_id: string;
  status: number;
  status_text: string;
  headers: Record<string, any>;
  data: any;
  timestamp: string;
}

interface AppContextType {
  webhooks: Webhook[];
  categories: WebhookCategory[];
  responses: WebhookResponse[];
  deleteWebhook: (id: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addWebhook: (webhook: Omit<Webhook, "id" | "createdAt">) => Promise<Webhook>;
  updateWebhook: (id: string, webhook: Partial<Omit<Webhook, "id" | "createdAt">>) => Promise<void>;
  addCategory: (category: Omit<WebhookCategory, "id" | "createdAt">) => Promise<WebhookCategory>;
  updateCategory: (id: string, category: Partial<Omit<WebhookCategory, "id" | "createdAt">>) => Promise<void>;
  executeWebhook: (webhookId: string, payload?: string) => Promise<void>;
  clearResponse: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [categories, setCategories] = useState<WebhookCategory[]>([]);
  const [responses, setResponses] = useState<WebhookResponse[]>([]);
  const { isAuthenticated } = useAuth();

  // Fetch data from Supabase when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Fetch all data from Supabase
  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await (supabase
        .from("categories") as any)
        .select("*") as { data: CategoryRow[] | null; error: PostgrestError | null };

      if (categoriesError) {
        throw categoriesError;
      }

      // Map categories to our app's format
      if (categoriesData) {
        const formattedCategories: WebhookCategory[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          color: cat.color || '#6E42CE',
          createdAt: cat.created_at
        }));

        setCategories(formattedCategories);
      }

      // Fetch webhooks
      const { data: webhooksData, error: webhooksError } = await (supabase
        .from("webhooks") as any)
        .select("*") as { data: WebhookRow[] | null; error: PostgrestError | null };

      if (webhooksError) {
        throw webhooksError;
      }

      // Map webhooks to our app's format
      if (webhooksData) {
        const formattedWebhooks: Webhook[] = webhooksData.map(hook => {
          let parsedHeaders: WebhookHeader[] = [];
          try {
            if (typeof hook.headers === 'string') {
              parsedHeaders = JSON.parse(hook.headers);
            } else if (Array.isArray(hook.headers)) {
              parsedHeaders = hook.headers;
            }
          } catch (e) {
            console.error("Error parsing headers:", e);
          }
          
          let parsedExamplePayloads: Array<{ name: string; payload: string }> = [];
          try {
            if (typeof hook.example_payloads === 'string') {
              parsedExamplePayloads = JSON.parse(hook.example_payloads);
            } else if (Array.isArray(hook.example_payloads)) {
              parsedExamplePayloads = hook.example_payloads;
            }
          } catch (e) {
            console.error("Error parsing example payloads:", e);
          }
          
          return {
            id: hook.id,
            name: hook.name,
            description: hook.description || '',
            url: hook.url,
            method: hook.method as WebhookMethod,
            categoryId: hook.category_id || '',
            headers: parsedHeaders,
            defaultPayload: hook.default_payload || '',
            examplePayloads: parsedExamplePayloads,
            createdAt: hook.created_at
          };
        });

        setWebhooks(formattedWebhooks);
      }

      // Fetch responses
      const { data: responsesData, error: responsesError } = await (supabase
        .from("webhook_responses") as any)
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10) as { data: WebhookResponseRow[] | null; error: PostgrestError | null };

      if (responsesError) {
        throw responsesError;
      }

      // Map responses to our app's format - fixing the type issues
      if (responsesData) {
        const formattedResponses: WebhookResponse[] = responsesData.map(response => {
          // Convert headers to Record<string, string> format
          const stringHeaders: Record<string, string> = {};
          if (typeof response.headers === 'object' && response.headers !== null) {
            Object.entries(response.headers).forEach(([key, value]) => {
              stringHeaders[key] = String(value);
            });
          }
          
          return {
            id: response.id,
            webhookId: response.webhook_id,
            status: response.status,
            statusText: response.status_text,
            headers: stringHeaders,
            data: response.data,
            timestamp: response.timestamp
          };
        });

        setResponses(formattedResponses);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const addWebhook = async (webhook: Omit<Webhook, "id" | "createdAt">): Promise<Webhook> => {
    try {
      // Convert webhook to database format
      const webhookData = {
        name: webhook.name,
        description: webhook.description,
        url: webhook.url,
        method: webhook.method,
        category_id: webhook.categoryId || null,
        headers: JSON.stringify(webhook.headers),
        default_payload: webhook.defaultPayload,
        example_payloads: JSON.stringify(webhook.examplePayloads)
      };
      
      // Insert webhook into Supabase
      const { data, error } = await (supabase
        .from("webhooks") as any)
        .insert([webhookData])
        .select("*")
        .single() as { data: WebhookRow | null; error: PostgrestError | null };

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from insert operation");
      }

      // Parse webhook data
      let parsedHeaders: WebhookHeader[] = [];
      try {
        if (typeof data.headers === 'string') {
          parsedHeaders = JSON.parse(data.headers);
        } else if (Array.isArray(data.headers)) {
          parsedHeaders = data.headers;
        }
      } catch (e) {
        console.error("Error parsing headers:", e);
      }
      
      let parsedExamplePayloads: Array<{ name: string; payload: string }> = [];
      try {
        if (typeof data.example_payloads === 'string') {
          parsedExamplePayloads = JSON.parse(data.example_payloads);
        } else if (Array.isArray(data.example_payloads)) {
          parsedExamplePayloads = data.example_payloads;
        }
      } catch (e) {
        console.error("Error parsing example payloads:", e);
      }

      // Convert response to our app's format
      const newWebhook: Webhook = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        url: data.url,
        method: data.method as WebhookMethod,
        categoryId: data.category_id || '',
        headers: parsedHeaders,
        defaultPayload: data.default_payload || '',
        examplePayloads: parsedExamplePayloads,
        createdAt: data.created_at
      };

      setWebhooks(prev => [...prev, newWebhook]);
      return newWebhook;
    } catch (error: any) {
      console.error("Error adding webhook:", error);
      throw new Error(`Failed to add webhook: ${error.message}`);
    }
  };

  const updateWebhook = async (id: string, webhook: Partial<Omit<Webhook, "id" | "createdAt">>): Promise<void> => {
    try {
      // Convert webhook to database format
      const webhookData: Record<string, any> = {};
      if (webhook.name !== undefined) webhookData.name = webhook.name;
      if (webhook.description !== undefined) webhookData.description = webhook.description;
      if (webhook.url !== undefined) webhookData.url = webhook.url;
      if (webhook.method !== undefined) webhookData.method = webhook.method;
      if (webhook.categoryId !== undefined) webhookData.category_id = webhook.categoryId || null;
      if (webhook.headers !== undefined) webhookData.headers = JSON.stringify(webhook.headers);
      if (webhook.defaultPayload !== undefined) webhookData.default_payload = webhook.defaultPayload;
      if (webhook.examplePayloads !== undefined) webhookData.example_payloads = JSON.stringify(webhook.examplePayloads);

      // Update webhook in Supabase
      const { error } = await (supabase
        .from("webhooks") as any)
        .update(webhookData)
        .eq("id", id) as { error: PostgrestError | null };

      if (error) {
        throw error;
      }

      // Update local state
      setWebhooks(prev => 
        prev.map(w => 
          w.id === id 
            ? { ...w, ...webhook } 
            : w
        )
      );
    } catch (error: any) {
      console.error("Error updating webhook:", error);
      throw new Error(`Failed to update webhook: ${error.message}`);
    }
  };

  const deleteWebhook = async (id: string): Promise<void> => {
    try {
      const { error } = await (supabase
        .from("webhooks") as any)
        .delete()
        .eq("id", id) as { error: PostgrestError | null };

      if (error) {
        throw error;
      }

      setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
    } catch (error: any) {
      console.error("Error deleting webhook:", error);
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  };

  const addCategory = async (category: Omit<WebhookCategory, "id" | "createdAt">): Promise<WebhookCategory> => {
    try {
      // Convert category to database format
      const categoryData = {
        name: category.name,
        description: category.description,
        color: category.color || '#6E42CE'
      };
      
      // Insert category into Supabase
      const { data, error } = await (supabase
        .from("categories") as any)
        .insert([categoryData])
        .select("*")
        .single() as { data: CategoryRow | null; error: PostgrestError | null };

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from insert operation");
      }

      // Convert response to our app's format
      const newCategory: WebhookCategory = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        color: data.color || '#6E42CE',
        createdAt: data.created_at
      };

      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error: any) {
      console.error("Error adding category:", error);
      throw new Error(`Failed to add category: ${error.message}`);
    }
  };

  const updateCategory = async (id: string, category: Partial<Omit<WebhookCategory, "id" | "createdAt">>): Promise<void> => {
    try {
      // Convert category to database format
      const categoryData: Record<string, any> = {};
      if (category.name !== undefined) categoryData.name = category.name;
      if (category.description !== undefined) categoryData.description = category.description;
      if (category.color !== undefined) categoryData.color = category.color;

      // Update category in Supabase
      const { error } = await (supabase
        .from("categories") as any)
        .update(categoryData)
        .eq("id", id) as { error: PostgrestError | null };

      if (error) {
        throw error;
      }

      // Update local state
      setCategories(prev => 
        prev.map(c => 
          c.id === id 
            ? { ...c, ...category } 
            : c
        )
      );
    } catch (error: any) {
      console.error("Error updating category:", error);
      throw new Error(`Failed to update category: ${error.message}`);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      const { error } = await (supabase
        .from("categories") as any)
        .delete()
        .eq("id", id) as { error: PostgrestError | null };

      if (error) {
        throw error;
      }

      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error: any) {
      console.error("Error deleting category:", error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  };

  const executeWebhook = async (webhookId: string, payload?: string): Promise<void> => {
    try {
      const webhook = webhooks.find(w => w.id === webhookId);
      if (!webhook) {
        throw new Error("Webhook not found");
      }

      // Use the provided payload or default payload
      const requestPayload = payload || webhook.defaultPayload;

      // Generate a unique ID for this response
      const responseId = uuidv4();

      // Create headers object from webhook configuration
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add custom headers from webhook configuration
      if (webhook.headers && Array.isArray(webhook.headers)) {
        webhook.headers
          .filter(h => h.enabled)
          .forEach(header => {
            headers[header.key] = header.value;
          });
      }

      console.log(`Executing webhook: ${webhook.method} ${webhook.url}`);
      console.log('Headers:', headers);
      console.log('Payload:', requestPayload);

      // Send the actual HTTP request
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: headers,
        body: webhook.method !== 'GET' ? requestPayload : undefined,
      });

      // Parse response
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Convert headers to a plain object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Create WebhookResponse object
      const webhookResponse: WebhookResponse = {
        id: responseId,
        webhookId,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        timestamp: new Date().toISOString()
      };

      // Save response in Supabase
      const { error } = await (supabase
        .from('webhook_responses') as any)
        .insert([{
          id: responseId,
          webhook_id: webhookId,
          status: response.status,
          status_text: response.statusText,
          headers: responseHeaders,
          data: responseData,
          timestamp: new Date().toISOString()
        }]) as { error: PostgrestError | null };

      if (error) {
        console.error("Error saving webhook response:", error);
      }

      // Update local state with the new response
      setResponses(prev => [webhookResponse, ...prev]);
    } catch (error: any) {
      console.error("Error executing webhook:", error);
      toast.error(`Failed to execute webhook: ${error.message}`);
      throw error;
    }
  };

  const clearResponse = () => {
    setResponses([]);
  };

  const value = {
    webhooks,
    categories,
    responses,
    deleteWebhook,
    deleteCategory,
    addWebhook,
    updateWebhook,
    addCategory,
    updateCategory,
    executeWebhook,
    clearResponse
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
