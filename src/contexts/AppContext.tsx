import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Webhook, WebhookData, WebhookCategory, WebhookResponse } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { defaultCategories } from "@/lib/data";

interface AppContextType {
  webhooks: WebhookData[];
  categories: WebhookCategory[];
  responses: WebhookResponse[];
  createWebhook: (webhook: Omit<WebhookData, "id" | "createdAt">) => Promise<WebhookData>;
  updateWebhook: (id: string, webhook: Partial<WebhookData>) => Promise<WebhookData>;
  deleteWebhook: (id: string) => Promise<void>;
  createCategory: (category: Omit<WebhookCategory, "id" | "createdAt">) => Promise<WebhookCategory>;
  updateCategory: (id: string, category: Partial<WebhookCategory>) => Promise<WebhookCategory>;
  deleteCategory: (id: string) => Promise<void>;
  executeWebhook: (webhook: WebhookData, payload: string) => Promise<void>;
  clearResponse: (webhookId: string) => void;
  isLoading: boolean;
  error: Error | null;
  refetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [categories, setCategories] = useState<WebhookCategory[]>([]);
  const [responses, setResponses] = useState<WebhookResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw new Error(`Error fetching categories: ${categoriesError.message}`);
      
      // If no categories exist, create default ones
      if (categoriesData && categoriesData.length === 0) {
        const { data: defaultCategoriesData, error: defaultCategoriesError } = await supabase
          .from("categories")
          .insert(defaultCategories)
          .select();
          
        if (defaultCategoriesError) throw new Error(`Error creating default categories: ${defaultCategoriesError.message}`);
        
        // Transform the data to match our app's schema
        const transformedCategories: WebhookCategory[] = (defaultCategoriesData || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || "",
          color: cat.color || "#6E42CE",
          createdAt: cat.created_at
        }));
        
        setCategories(transformedCategories);
      } else {
        // Transform the data to match our app's schema
        const transformedCategories: WebhookCategory[] = (categoriesData || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || "",
          color: cat.color || "#6E42CE",
          createdAt: cat.created_at
        }));
        
        setCategories(transformedCategories);
      }

      // Fetch webhooks
      const { data: webhooksData, error: webhooksError } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (webhooksError) throw new Error(`Error fetching webhooks: ${webhooksError.message}`);
      
      // Transform webhook data to match our app's schema
      const transformedWebhooks: WebhookData[] = (webhooksData || []).map(webhook => ({
        id: webhook.id,
        name: webhook.name,
        description: webhook.description || "",
        url: webhook.url,
        method: webhook.method,
        categoryId: webhook.category_id || "",
        headers: webhook.headers || [],
        defaultPayload: webhook.default_payload || "",
        examplePayloads: webhook.example_payloads || [],
        createdAt: webhook.created_at
      }));
      
      setWebhooks(transformedWebhooks);

      // Fetch webhook responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("webhook_responses")
        .select("*")
        .order("timestamp", { ascending: false });

      if (responsesError) throw new Error(`Error fetching webhook responses: ${responsesError.message}`);
      
      // Transform response data to match our app's schema
      const transformedResponses: WebhookResponse[] = (responsesData || []).map(response => ({
        id: response.id,
        webhookId: response.webhook_id,
        status: response.status,
        statusText: response.status_text,
        headers: response.headers as Record<string, string> || {},
        data: response.data || null,
        timestamp: response.timestamp
      }));
      
      setResponses(transformedResponses);
      
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err);
      toast.error(`Failed to load data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      // Reset data when not authenticated
      setWebhooks([]);
      setCategories([]);
      setResponses([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Subscribe to realtime changes when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const webhooksChannel = supabase
      .channel('webhook-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'webhooks'
      }, () => {
        fetchData();
      })
      .subscribe();
      
    const categoriesChannel = supabase
      .channel('category-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories'
      }, () => {
        fetchData();
      })
      .subscribe();
      
    const responsesChannel = supabase
      .channel('response-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'webhook_responses'
      }, () => {
        fetchData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(webhooksChannel);
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [isAuthenticated]);

  const createWebhook = async (webhook: Omit<WebhookData, "id" | "createdAt">) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      const newWebhook = {
        name: webhook.name,
        description: webhook.description,
        url: webhook.url,
        method: webhook.method,
        category_id: webhook.categoryId,
        headers: webhook.headers || [],
        default_payload: webhook.defaultPayload || "",
        example_payloads: webhook.examplePayloads || []
      };

      const { data, error } = await supabase
        .from("webhooks")
        .insert([newWebhook])
        .select()
        .single();

      if (error) throw new Error(`Failed to create webhook: ${error.message}`);
      if (!data) throw new Error("No data returned after creating webhook");

      const createdWebhook: WebhookData = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        url: data.url,
        method: data.method,
        categoryId: data.category_id || "",
        headers: data.headers || [],
        defaultPayload: data.default_payload || "",
        examplePayloads: data.example_payloads || [],
        createdAt: data.created_at
      };

      setWebhooks(prev => [createdWebhook, ...prev]);
      toast.success(`Webhook "${webhook.name}" created successfully`);
      return createdWebhook;
    } catch (err: any) {
      console.error("Error creating webhook:", err);
      toast.error(`Failed to create webhook: ${err.message}`);
      throw err;
    }
  };

  const updateWebhook = async (id: string, webhook: Partial<WebhookData>) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      const updateData = {
        ...(webhook.name !== undefined && { name: webhook.name }),
        ...(webhook.description !== undefined && { description: webhook.description }),
        ...(webhook.url !== undefined && { url: webhook.url }),
        ...(webhook.method !== undefined && { method: webhook.method }),
        ...(webhook.categoryId !== undefined && { category_id: webhook.categoryId }),
        ...(webhook.headers !== undefined && { headers: webhook.headers }),
        ...(webhook.defaultPayload !== undefined && { default_payload: webhook.defaultPayload }),
        ...(webhook.examplePayloads !== undefined && { example_payloads: webhook.examplePayloads })
      };

      const { data, error } = await supabase
        .from("webhooks")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update webhook: ${error.message}`);
      if (!data) throw new Error("No data returned after updating webhook");

      const updatedWebhook: WebhookData = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        url: data.url,
        method: data.method,
        categoryId: data.category_id || "",
        headers: data.headers || [],
        defaultPayload: data.default_payload || "",
        examplePayloads: data.example_payloads || [],
        createdAt: data.created_at
      };

      setWebhooks(prev => prev.map(w => w.id === id ? updatedWebhook : w));
      toast.success(`Webhook "${updatedWebhook.name}" updated successfully`);
      return updatedWebhook;
    } catch (err: any) {
      console.error("Error updating webhook:", err);
      toast.error(`Failed to update webhook: ${err.message}`);
      throw err;
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      const webhookToDelete = webhooks.find(w => w.id === id);
      if (!webhookToDelete) throw new Error("Webhook not found");

      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Failed to delete webhook: ${error.message}`);

      setWebhooks(prev => prev.filter(w => w.id !== id));
      toast.success(`Webhook "${webhookToDelete.name}" deleted successfully`);
    } catch (err: any) {
      console.error("Error deleting webhook:", err);
      toast.error(`Failed to delete webhook: ${err.message}`);
      throw err;
    }
  };

  const createCategory = async (category: Omit<WebhookCategory, "id" | "createdAt">) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      const newCategory = {
        name: category.name,
        description: category.description || null,
        color: category.color || "#6E42CE"
      };

      const { data, error } = await supabase
        .from("categories")
        .insert([newCategory])
        .select()
        .single();

      if (error) throw new Error(`Failed to create category: ${error.message}`);
      if (!data) throw new Error("No data returned after creating category");

      const createdCategory: WebhookCategory = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        color: data.color || "#6E42CE",
        createdAt: data.created_at
      };

      setCategories(prev => [...prev, createdCategory]);
      toast.success(`Category "${category.name}" created successfully`);
      return createdCategory;
    } catch (err: any) {
      console.error("Error creating category:", err);
      toast.error(`Failed to create category: ${err.message}`);
      throw err;
    }
  };

  const updateCategory = async (id: string, category: Partial<WebhookCategory>) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      const updateData = {
        ...(category.name !== undefined && { name: category.name }),
        ...(category.description !== undefined && { description: category.description }),
        ...(category.color !== undefined && { color: category.color })
      };

      const { data, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update category: ${error.message}`);
      if (!data) throw new Error("No data returned after updating category");

      const updatedCategory: WebhookCategory = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        color: data.color || "#6E42CE",
        createdAt: data.created_at
      };

      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      toast.success(`Category "${updatedCategory.name}" updated successfully`);
      return updatedCategory;
    } catch (err: any) {
      console.error("Error updating category:", err);
      toast.error(`Failed to update category: ${err.message}`);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      const categoryToDelete = categories.find(c => c.id === id);
      if (!categoryToDelete) throw new Error("Category not found");

      // Check if any webhooks use this category
      const webhooksUsingCategory = webhooks.filter(w => w.categoryId === id);
      if (webhooksUsingCategory.length > 0) {
        throw new Error(`Cannot delete category "${categoryToDelete.name}" because it is used by ${webhooksUsingCategory.length} webhook(s)`);
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Failed to delete category: ${error.message}`);

      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
    } catch (err: any) {
      console.error("Error deleting category:", err);
      toast.error(`Failed to delete category: ${err.message}`);
      throw err;
    }
  };
  
  const executeWebhook = async (webhook: WebhookData, payload: string) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      // Execute the webhook and store response in database
      // This would normally call an API endpoint that executes the webhook
      // For now, let's simulate a response
      const timestamp = new Date().toISOString();
      const response = {
        id: uuidv4(),
        webhook_id: webhook.id,
        status: 200,
        status_text: "OK",
        headers: { "content-type": "application/json" },
        data: { success: true, message: "Webhook executed successfully" },
        timestamp
      };
      
      const { error } = await supabase
        .from("webhook_responses")
        .insert([response]);
        
      if (error) throw new Error(`Failed to store webhook response: ${error.message}`);
      
      toast.success(`Webhook "${webhook.name}" executed successfully`);
      await fetchData(); // Refresh data to get the new response
    } catch (err: any) {
      console.error("Error executing webhook:", err);
      toast.error(`Failed to execute webhook: ${err.message}`);
      throw err;
    }
  };
  
  const clearResponse = (webhookId: string) => {
    setResponses(prev => prev.filter(r => r.webhookId !== webhookId));
  };

  const refetchData = async () => {
    await fetchData();
  };

  const value = {
    webhooks,
    categories,
    responses,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    createCategory,
    updateCategory,
    deleteCategory,
    executeWebhook,
    clearResponse,
    isLoading,
    error,
    refetchData
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
