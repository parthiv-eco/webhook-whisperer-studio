import { WebhookCategory } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Only used for initializing an empty database
export const defaultCategories: WebhookCategory[] = [
  {
    id: uuidv4(),
    name: "General",
    description: "Default category for webhooks",
    color: "#6E42CE",
    createdAt: new Date().toISOString(),
  }
];
