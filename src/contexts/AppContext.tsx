
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { Webhook as AppWebhook, WebhookCategory, WebhookMethod, WebhookResponse as AppWebhookResponse } from "@/types";
import { mapDbWebhookToAppWebhook, mapDbCategoryToAppCategory, mapDbResponseToAppResponse, mapAppWebhookToDbWebhook } from "@/utils/typeMappers";

// AppContext interface
interface AppContextType {
  categories: WebhookCategory[];
  webhooks: AppWebhook[];
  loading: boolean;
  createWebhook: (webhook: Partial<AppWebhook>) => Promise<string | null>;
  updateWebhook: (id: string, webhook: Partial<AppWebhook>) => Promise<boolean>;
  deleteWebhook: (id: string) => Promise<boolean>;
  getWebhook: (id: string) => Promise<AppWebhook | null>;
  executeWebhook: (id: string, payload?: string) => Promise<AppWebhookResponse | null>;
  getWebhookResponses: (webhookId: string) => Promise<AppWebhookResponse[]>;
  createCategory: (category: CategoryFormData) => Promise<string | null>;
  updateCategory: (id: string, category: CategoryFormData) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  clearWebhookResponses: (webhookId: string) => Promise<boolean>;
}

// Data types from database
export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
}

export interface Webhook {
  id: string;
  name: string;
  description: string | null;
  url: string;
  method: WebhookMethod;
  category_id: string | null;
  headers: string;
  default_payload: string;
  example_payloads: string;
  created_at: string;
  category?: Category;
}

export interface WebhookResponse {
  id: string;
  webhook_id: string;
  status: number;
  status_text: string;
  headers: Record<string, any>;
  data: Record<string, any> | null;
  timestamp: string;
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  categories: [],
  webhooks: [],
  loading: false,
  createWebhook: async () => null,
  updateWebhook: async () => false,
  deleteWebhook: async () => false,
  getWebhook: async () => null,
  executeWebhook: async () => null,
  getWebhookResponses: async () => [],
  createCategory: async () => null,
  updateCategory: async () => false,
  deleteCategory: async () => false,
  clearWebhookResponses: async () => false,
});

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<WebhookCategory[]>([]);
  const [webhooks, setWebhooks] = useState<AppWebhook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch categories and webhooks on load
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCategories(), fetchWebhooks()]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load app data. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const mappedCategories = (data || []).map(mapDbCategoryToAppCategory);
      setCategories(mappedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      throw err;
    }
  };

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*, category:categories(*)');

      if (error) throw error;

      // Map database webhooks to application webhooks
      const mappedWebhooks = (data || []).map((webhook) => {
        return mapDbWebhookToAppWebhook({
          ...webhook,
          category: webhook.category
        });
      });

      setWebhooks(mappedWebhooks);
    } catch (err) {
      console.error("Error fetching webhooks:", err);
      throw err;
    }
  };

  const createWebhook = async (webhook: Partial<AppWebhook>): Promise<string | null> => {
    try {
      const dbWebhook = {
        name: webhook.name || "",
        description: webhook.description || null,
        url: webhook.url || "",
        method: webhook.method || "GET",
        category_id: webhook.categoryId || null,
        headers: JSON.stringify(webhook.headers || []),
        default_payload: webhook.defaultPayload || "",
        example_payloads: JSON.stringify(webhook.examplePayloads || []),
      };

      const { data, error } = await supabase
        .from('webhooks')
        .insert(dbWebhook)
        .select('id')
        .single();

      if (error) throw error;

      await fetchWebhooks(); // Refresh the list
      toast({
        title: "Webhook Created",
        description: "Your new webhook has been created successfully.",
      });

      return data.id;
    } catch (err) {
      console.error("Error creating webhook:", err);
      toast({
        title: "Creation Error",
        description: "Failed to create webhook. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWebhook = async (id: string, webhook: Partial<AppWebhook>): Promise<boolean> => {
    try {
      const dbWebhook = {
        name: webhook.name,
        description: webhook.description || null,
        url: webhook.url,
        method: webhook.method,
        category_id: webhook.categoryId || null,
        headers: webhook.headers ? JSON.stringify(webhook.headers) : undefined,
        default_payload: webhook.defaultPayload || "",
        example_payloads: webhook.examplePayloads ? JSON.stringify(webhook.examplePayloads) : undefined,
      };

      const { error } = await supabase
        .from('webhooks')
        .update(dbWebhook)
        .eq('id', id);

      if (error) throw error;

      await fetchWebhooks(); // Refresh the list
      toast({
        title: "Webhook Updated",
        description: "Your webhook has been updated successfully.",
      });

      return true;
    } catch (err) {
      console.error("Error updating webhook:", err);
      toast({
        title: "Update Error",
        description: "Failed to update webhook. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteWebhook = async (id: string): Promise<boolean> => {
    try {
      // First delete all responses for this webhook
      await supabase.from('webhook_responses').delete().eq('webhook_id', id);
      
      // Then delete the webhook itself
      const { error } = await supabase.from('webhooks').delete().eq('id', id);

      if (error) throw error;

      // Update local state
      setWebhooks((prev) => prev.filter((webhook) => webhook.id !== id));
      
      toast({
        title: "Webhook Deleted",
        description: "The webhook has been deleted successfully.",
      });

      return true;
    } catch (err) {
      console.error("Error deleting webhook:", err);
      toast({
        title: "Deletion Error",
        description: "Failed to delete webhook. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getWebhook = async (id: string): Promise<AppWebhook | null> => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return mapDbWebhookToAppWebhook({
        ...data,
        category: data.category
      });
    } catch (err) {
      console.error("Error fetching webhook:", err);
      toast({
        title: "Fetch Error",
        description: "Failed to load webhook details.",
        variant: "destructive",
      });
      return null;
    }
  };

  const executeWebhook = async (id: string, payload?: string): Promise<AppWebhookResponse | null> => {
    try {
      // First get the webhook details
      const webhook = await getWebhook(id);
      if (!webhook) throw new Error("Webhook not found");

      // Execute the webhook
      const response = await fetch("/api/execute-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhook.url,
          method: webhook.method,
          headers: webhook.headers,
          payload: payload || webhook.defaultPayload,
        }),
      });

      const responseData = await response.json();
      
      // Store the response in the database
      const { data, error } = await supabase
        .from('webhook_responses')
        .insert({
          webhook_id: id,
          status: responseData.status,
          status_text: responseData.statusText,
          headers: responseData.headers,
          data: responseData.data,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: `${responseData.status} ${responseData.statusText}`,
        description: "Webhook executed successfully.",
        variant: responseData.status >= 200 && responseData.status < 300 ? "default" : "destructive",
      });

      return mapDbResponseToAppResponse(data);
    } catch (err) {
      console.error("Error executing webhook:", err);
      toast({
        title: "Execution Error",
        description: "Failed to execute webhook. Check the console for details.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getWebhookResponses = async (webhookId: string): Promise<AppWebhookResponse[]> => {
    try {
      const { data, error } = await supabase
        .from('webhook_responses')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(mapDbResponseToAppResponse);
    } catch (err) {
      console.error("Error fetching webhook responses:", err);
      toast({
        title: "Fetch Error",
        description: "Failed to load webhook responses.",
        variant: "destructive",
      });
      return [];
    }
  };

  const createCategory = async (category: CategoryFormData): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          description: category.description || null,
          color: category.color || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      await fetchCategories(); // Refresh the list
      toast({
        title: "Category Created",
        description: "Your new category has been created successfully.",
      });

      return data.id;
    } catch (err) {
      console.error("Error creating category:", err);
      toast({
        title: "Creation Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCategory = async (id: string, category: CategoryFormData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description || null,
          color: category.color || null,
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh data to show changes
      await Promise.all([fetchCategories(), fetchWebhooks()]);
      
      toast({
        title: "Category Updated",
        description: "Your category has been updated successfully.",
      });

      return true;
    } catch (err) {
      console.error("Error updating category:", err);
      toast({
        title: "Update Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      // First update all webhooks that use this category to have null category_id
      await supabase.from('webhooks').update({ category_id: null }).eq('category_id', id);
      
      // Then delete the category
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;

      // Update local state
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      
      // Also update the webhooks to reflect the category change
      await fetchWebhooks();
      
      toast({
        title: "Category Deleted",
        description: "The category has been deleted successfully.",
      });

      return true;
    } catch (err) {
      console.error("Error deleting category:", err);
      toast({
        title: "Deletion Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const clearWebhookResponses = async (webhookId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('webhook_responses')
        .delete()
        .eq('webhook_id', webhookId);

      if (error) throw error;
      
      toast({
        title: "Responses Cleared",
        description: "All responses for this webhook have been deleted.",
      });

      return true;
    } catch (err) {
      console.error("Error clearing webhook responses:", err);
      toast({
        title: "Clear Error",
        description: "Failed to clear responses. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        categories,
        webhooks,
        loading,
        createWebhook,
        updateWebhook,
        deleteWebhook,
        getWebhook,
        executeWebhook,
        getWebhookResponses,
        createCategory,
        updateCategory,
        deleteCategory,
        clearWebhookResponses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook for using the context
export const useApp = () => useContext(AppContext);
