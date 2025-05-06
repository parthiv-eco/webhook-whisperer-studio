
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/contexts/AppContext";
import { WebhookHeader } from "@/types";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const webhookFormSchema = z.object({
  name: z.string().min(2, {
    message: "Webhook name must be at least 2 characters.",
  }),
  description: z.string(),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  categoryId: z.string().uuid({
    message: "Please select a category.",
  }),
  defaultPayload: z.string(),
  headers: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      enabled: z.boolean(),
    })
  ),
  examplePayloads: z.array(
    z.object({
      name: z.string(),
      payload: z.string(),
    })
  ),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

const WebhookFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { categories, addWebhook, webhooks } = useApp();
  const [webhook, setWebhook] = useState(
    id ? webhooks.find((webhook) => webhook.id === id) : null
  );

  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: webhook?.name || "",
      description: webhook?.description || "",
      url: webhook?.url || "",
      method: webhook?.method || "GET",
      categoryId: webhook?.categoryId || "",
      defaultPayload: webhook?.defaultPayload || "",
      headers: webhook?.headers || [],
      examplePayloads: webhook?.examplePayloads || [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (id) {
      const existingWebhook = webhooks.find((webhook) => webhook.id === id);
      if (existingWebhook) {
        setWebhook(existingWebhook);
        form.reset({
          name: existingWebhook.name,
          description: existingWebhook.description || "",
          url: existingWebhook.url,
          method: existingWebhook.method,
          categoryId: existingWebhook.categoryId,
          defaultPayload: existingWebhook.defaultPayload || "",
          headers: existingWebhook.headers || [],
          examplePayloads: existingWebhook.examplePayloads || [],
        });
      } else {
        toast.error("Webhook not found");
        navigate("/admin/webhooks");
      }
    }
  }, [id, webhooks, navigate, form]);

  const onSubmit = async (values: WebhookFormValues) => {
    try {
      if (id) {
        // Update existing webhook
        // await updateWebhook(id, values);
        // toast.success("Webhook updated successfully!");
      } else {
        // Create new webhook
        await addWebhook(values);
        toast.success("Webhook created successfully!");
      }
      navigate("/admin/webhooks");
    } catch (error: any) {
      toast.error(`Failed to ${id ? "update" : "create"} webhook: ${error.message}`);
    }
  };

  const handleAddHeader = () => {
    const headers = [...(form.getValues("headers") || []), { key: "", value: "", enabled: true }];
    form.setValue("headers", headers);
  };

  const handleRemoveHeader = (index: number) => {
    const headers = [...(form.getValues("headers") || [])];
    headers.splice(index, 1);
    form.setValue("headers", headers);
  };

  const handleAddExamplePayload = () => {
    const examplePayloads = [...(form.getValues("examplePayloads") || []), { name: "", payload: "" }];
    form.setValue("examplePayloads", examplePayloads);
  };

  const handleRemoveExamplePayload = (index: number) => {
    const examplePayloads = [...(form.getValues("examplePayloads") || [])];
    examplePayloads.splice(index, 1);
    form.setValue("examplePayloads", examplePayloads);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{id ? "Edit Webhook" : "Create Webhook"}</CardTitle>
          <CardDescription>
            {id ? "Edit the webhook details." : "Create a new webhook."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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
                        placeholder="Webhook Description"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
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
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
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
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="headers">
                  <AccordionTrigger>Headers</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {form.getValues("headers")?.map((header, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name={`headers.${index}.key` as const}
                            render={({ field }) => (
                              <FormItem className="w-1/3">
                                <FormLabel>Key</FormLabel>
                                <FormControl>
                                  <Input placeholder="Header Key" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`headers.${index}.value` as const}
                            render={({ field }) => (
                              <FormItem className="w-1/3">
                                <FormLabel>Value</FormLabel>
                                <FormControl>
                                  <Input placeholder="Header Value" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`headers.${index}.enabled` as const}
                            render={({ field }) => (
                              <FormItem className="w-1/6 flex items-center justify-center pt-7">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    id={`header-enabled-${index}`}
                                  />
                                </FormControl>
                                <FormLabel htmlFor={`header-enabled-${index}`} className="ml-2">
                                  Enabled
                                </FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveHeader(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddHeader}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Header
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="examplePayloads">
                  <AccordionTrigger>Example Payloads</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {form.getValues("examplePayloads")?.map((payload, index) => (
                        <div key={index} className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`examplePayloads.${index}.name` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payload Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Payload Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`examplePayloads.${index}.payload` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payload Content</FormLabel>
                                <FormControl>
                                  <Textarea placeholder='{ "key": "value" }' className="resize-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveExamplePayload(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddExamplePayload}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Example Payload
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button type="submit">{id ? "Update Webhook" : "Create Webhook"}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookFormPage;
