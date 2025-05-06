import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useApp } from "@/contexts/AppContext";
import { WebhookMethod } from "@/types";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Webhook name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  url: z.string().url({ message: "Please enter a valid URL." }),
  method: z.enum([WebhookMethod.GET, WebhookMethod.POST, WebhookMethod.PUT, WebhookMethod.PATCH, WebhookMethod.DELETE]),
  categoryId: z.string().uuid({ message: "Please select a category." }),
  defaultPayload: z.string().optional(),
});

const AdminWebhookForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // Replace createWebhook with addWebhook
  const { categories, addWebhook, webhooks } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      method: WebhookMethod.POST,
      categoryId: "",
      defaultPayload: "",
    },
  });

  useEffect(() => {
    if (id) {
      const webhook = webhooks.find((w) => w.id === id);
      if (webhook) {
        form.reset({
          name: webhook.name,
          description: webhook.description,
          url: webhook.url,
          method: webhook.method,
          categoryId: webhook.categoryId,
          defaultPayload: webhook.defaultPayload,
        });
      }
    }
  }, [id, webhooks, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (id) {
        // Implement update logic here
        toast.success("Webhook updated successfully!");
      } else {
        await addWebhook(values);
        toast.success("Webhook created successfully!");
      }
      navigate("/admin/webhooks");
    } catch (error: any) {
      toast.error(`Failed to ${id ? 'update' : 'create'} webhook: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{id ? "Edit Webhook" : "Create Webhook"}</CardTitle>
          <CardDescription>
            {id ? "Edit an existing webhook." : "Create a new webhook."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Webhook Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of the webhook"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the purpose of this webhook.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/api/webhook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={WebhookMethod.GET}>GET</SelectItem>
                        <SelectItem value={WebhookMethod.POST}>POST</SelectItem>
                        <SelectItem value={WebhookMethod.PUT}>PUT</SelectItem>
                        <SelectItem value={WebhookMethod.PATCH}>PATCH</SelectItem>
                        <SelectItem value={WebhookMethod.DELETE}>DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultPayload"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Payload</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{ "key": "value" }'
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The default payload to send with the webhook.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWebhookForm;
