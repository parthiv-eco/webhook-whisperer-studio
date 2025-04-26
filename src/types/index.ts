
export type WebhookMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface WebhookCategory {
  id: string;
  name: string;
  description: string;
  color?: string;
  createdAt: string;
}

export interface WebhookHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export interface Webhook {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  url: string;
  method: WebhookMethod;
  headers: WebhookHeader[];
  defaultPayload: string;
  examplePayloads: Array<{
    name: string;
    payload: string;
  }>;
  createdAt: string;
}

export interface WebhookResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  timestamp: string;
}
