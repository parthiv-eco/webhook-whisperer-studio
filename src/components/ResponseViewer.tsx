
import { useState } from "react";
import { WebhookResponse } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface ResponseViewerProps {
  response: WebhookResponse;
}

const ResponseViewer = ({ response }: ResponseViewerProps) => {
  const isSuccess = response.status >= 200 && response.status < 300;
  
  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <Card className="animate-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Response</CardTitle>
          <Badge variant={isSuccess ? "outline" : "destructive"}>
            {response.status} {response.statusText}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Received {formatDistanceToNow(new Date(response.timestamp), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Accordion type="single" collapsible defaultValue="data">
            <AccordionItem value="data">
              <AccordionTrigger className="text-sm">Response Data</AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-[200px] rounded-md border bg-muted/40 p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap">{formatJson(response.data)}</pre>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="headers">
              <AccordionTrigger className="text-sm">Headers</AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-[200px] rounded-md border bg-muted/40 p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap">{formatJson(response.headers)}</pre>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseViewer;
