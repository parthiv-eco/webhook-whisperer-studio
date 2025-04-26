
import React, { createContext, useContext, useState, useEffect } from "react";
import { Webhook, WebhookCategory, WebhookResponse } from "@/types";
import { defaultCategories, defaultWebhooks } from "@/lib/data";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface AppContextType {
  categories: WebhookCategory[];
  webhooks: Webhook[];
  addCategory: (category: Omit<WebhookCategory, "id" | "createdAt">) => void;
  updateCategory: (category: WebhookCategory) => void;
  deleteCategory: (id: string) => void;
  addWebhook: (webhook: Omit<Webhook, "id" | "createdAt">) => void;
  updateWebhook: (webhook: Webhook) => void;
  deleteWebhook: (id: string) => void;
  executeWebhook: (webhook: Webhook, payload: string) => Promise<WebhookResponse | null>;
  responses: Record<string, WebhookResponse>;
  clearResponse: (webhookId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<WebhookCategory[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [responses, setResponses] = useState<Record<string, WebhookResponse>>({});

  // Initialize data from localStorage or use defaults
  useEffect(() => {
    const storedCategories = localStorage.getItem("webhookCategories");
    const storedWebhooks = localStorage.getItem("webhooks");

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(defaultCategories);
    }

    if (storedWebhooks) {
      setWebhooks(JSON.parse(storedWebhooks));
    } else {
      setWebhooks(defaultWebhooks);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("webhookCategories", JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (webhooks.length > 0) {
      localStorage.setItem("webhooks", JSON.stringify(webhooks));
    }
  }, [webhooks]);

  const addCategory = (category: Omit<WebhookCategory, "id" | "createdAt">) => {
    const newCategory = {
      ...category,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setCategories([...categories, newCategory]);
    toast.success("Category created successfully");
  };

  const updateCategory = (category: WebhookCategory) => {
    setCategories(categories.map(c => c.id === category.id ? category : c));
    toast.success("Category updated successfully");
  };

  const deleteCategory = (id: string) => {
    // Check if category has webhooks
    const hasWebhooks = webhooks.some(webhook => webhook.categoryId === id);
    if (hasWebhooks) {
      toast.error("Cannot delete category with webhooks");
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    toast.success("Category deleted successfully");
  };

  const addWebhook = (webhook: Omit<Webhook, "id" | "createdAt">) => {
    const newWebhook = {
      ...webhook,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setWebhooks([...webhooks, newWebhook]);
    toast.success("Webhook created successfully");
  };

  const updateWebhook = (webhook: Webhook) => {
    setWebhooks(webhooks.map(w => w.id === webhook.id ? webhook : w));
    toast.success("Webhook updated successfully");
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    // Also remove any stored response
    const newResponses = { ...responses };
    delete newResponses[id];
    setResponses(newResponses);
    toast.success("Webhook deleted successfully");
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
          "x-request-id": uuidv4(),
        },
        data: {
          success: true,
          message: "Webhook received successfully",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      
      // Store the response
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
