
import { Webhook, WebhookCategory } from "@/types";

// Mock categories data
export const defaultCategories: WebhookCategory[] = [
  {
    id: "cat-1",
    name: "API Integrations",
    description: "Webhooks for various API services",
    color: "#6E42CE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-2",
    name: "Notification Services",
    description: "Webhooks for sending notifications",
    color: "#3B82F6",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-3",
    name: "CRM Tools",
    description: "Customer relationship management integrations",
    color: "#10B981",
    createdAt: new Date().toISOString(),
  },
];

// Mock webhooks data
export const defaultWebhooks: Webhook[] = [
  {
    id: "hook-1",
    categoryId: "cat-1",
    name: "GitHub Event",
    description: "Send data to GitHub webhook endpoint",
    url: "https://api.github.com/webhooks/example",
    method: "POST",
    headers: [
      { key: "Content-Type", value: "application/json", enabled: true },
      { key: "Authorization", value: "Bearer YOUR_TOKEN", enabled: true },
    ],
    defaultPayload: JSON.stringify({
      event: "push",
      repository: "user/repo",
      branch: "main",
      commit: {
        id: "abc123",
        message: "Update README.md",
        author: "username",
      },
    }, null, 2),
    examplePayloads: [
      {
        name: "Push Event",
        payload: JSON.stringify({
          event: "push",
          repository: "user/repo",
          branch: "main",
          commit: {
            id: "abc123",
            message: "Update README.md",
            author: "username",
          },
        }, null, 2),
      },
      {
        name: "Issue Created",
        payload: JSON.stringify({
          event: "issue",
          action: "created",
          repository: "user/repo",
          issue: {
            id: 123456,
            title: "Bug in login functionality",
            body: "There seems to be an issue with...",
            reporter: "username",
          },
        }, null, 2),
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "hook-2",
    categoryId: "cat-2",
    name: "Slack Notification",
    description: "Send notification to Slack channel",
    url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    method: "POST",
    headers: [
      { key: "Content-Type", value: "application/json", enabled: true },
    ],
    defaultPayload: JSON.stringify({
      text: "Hello from Webhook Studio!",
      channel: "#general",
      username: "Webhook Bot",
      icon_emoji: ":rocket:",
    }, null, 2),
    examplePayloads: [
      {
        name: "Simple Message",
        payload: JSON.stringify({
          text: "Hello from Webhook Studio!",
          channel: "#general",
          username: "Webhook Bot",
          icon_emoji: ":rocket:",
        }, null, 2),
      },
      {
        name: "Rich Message",
        payload: JSON.stringify({
          text: "New deployment completed",
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "Deployment Successful",
                emoji: true
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Project:* Application\n*Environment:* Production\n*Version:* v1.2.0"
              }
            }
          ],
          channel: "#deployments",
          username: "Deploy Bot",
          icon_emoji: ":rocket:",
        }, null, 2),
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "hook-3",
    categoryId: "cat-3",
    name: "HubSpot Contact",
    description: "Create or update contact in HubSpot",
    url: "https://api.hubspot.com/crm/v3/objects/contacts",
    method: "POST",
    headers: [
      { key: "Content-Type", value: "application/json", enabled: true },
      { key: "Authorization", value: "Bearer YOUR_HUBSPOT_TOKEN", enabled: true },
    ],
    defaultPayload: JSON.stringify({
      properties: {
        email: "contact@example.com",
        firstname: "John",
        lastname: "Doe",
        phone: "123-456-7890",
        company: "Acme Inc",
      },
    }, null, 2),
    examplePayloads: [
      {
        name: "Create Basic Contact",
        payload: JSON.stringify({
          properties: {
            email: "contact@example.com",
            firstname: "John",
            lastname: "Doe",
            phone: "123-456-7890",
            company: "Acme Inc",
          },
        }, null, 2),
      },
      {
        name: "Create Contact with Details",
        payload: JSON.stringify({
          properties: {
            email: "jane@company.com",
            firstname: "Jane",
            lastname: "Smith",
            phone: "987-654-3210",
            company: "Globex Corp",
            jobtitle: "Marketing Director",
            website: "www.company.com",
            address: "123 Main Street",
            city: "Boston",
            state: "MA",
            zip: "02108",
          },
        }, null, 2),
      },
    ],
    createdAt: new Date().toISOString(),
  },
];
