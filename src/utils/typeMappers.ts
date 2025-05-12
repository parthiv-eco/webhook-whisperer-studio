
import { Webhook as AppWebhook, WebhookCategory, WebhookHeader, WebhookResponse as AppWebhookResponse } from "@/types";
import { Category, Webhook, WebhookResponse } from "@/contexts/AppContext";

/**
 * Maps a database webhook object to the application webhook type
 */
export function mapDbWebhookToAppWebhook(webhook: Webhook): AppWebhook {
  return {
    id: webhook.id,
    categoryId: webhook.category_id || "",
    name: webhook.name,
    description: webhook.description || "",
    url: webhook.url,
    method: webhook.method,
    headers: parseHeaders(webhook.headers),
    defaultPayload: webhook.default_payload || "",
    examplePayloads: parseExamplePayloads(webhook.example_payloads),
    createdAt: webhook.created_at,
  };
}

/**
 * Maps a database category to the application category type
 */
export function mapDbCategoryToAppCategory(category: Category): WebhookCategory {
  return {
    id: category.id,
    name: category.name,
    description: category.description || "",
    color: category.color || "#000000",
    createdAt: category.created_at,
  };
}

/**
 * Maps a database webhook response to the application webhook response type
 */
export function mapDbResponseToAppResponse(response: WebhookResponse): AppWebhookResponse {
  return {
    id: response.id,
    webhookId: response.webhook_id,
    status: response.status,
    statusText: response.status_text,
    headers: response.headers,
    data: response.data,
    timestamp: response.timestamp,
  };
}

/**
 * Maps an application webhook to the database webhook type
 */
export function mapAppWebhookToDbWebhook(webhook: AppWebhook): Omit<Webhook, "id" | "created_at" | "category"> {
  return {
    name: webhook.name,
    description: webhook.description,
    url: webhook.url,
    method: webhook.method,
    category_id: webhook.categoryId || null,
    headers: JSON.stringify(webhook.headers),
    default_payload: webhook.defaultPayload,
    example_payloads: JSON.stringify(webhook.examplePayloads),
  };
}

/**
 * Parse headers from string to WebhookHeader[]
 */
function parseHeaders(headersStr: string): WebhookHeader[] {
  try {
    if (!headersStr) return [];
    const parsed = JSON.parse(headersStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error parsing webhook headers:", e);
    return [];
  }
}

/**
 * Parse example payloads from string to array of named payloads
 */
function parseExamplePayloads(payloadsStr: string): { name: string; payload: string }[] {
  try {
    if (!payloadsStr) return [];
    const parsed = JSON.parse(payloadsStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error parsing webhook example payloads:", e);
    return [];
  }
}
