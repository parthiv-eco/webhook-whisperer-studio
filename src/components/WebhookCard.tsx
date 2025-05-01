import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Webhook, WebhookCategory } from "@/types";
import { Link } from "react-router-dom";
import { SendIcon, EditIcon } from "lucide-react";

interface WebhookCardProps {
  webhook: Webhook;
  category?: WebhookCategory;
}

const WebhookCard = ({ webhook, category }: WebhookCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{webhook.name}</CardTitle>
            <CardDescription className="line-clamp-1">{webhook.description}</CardDescription>
          </div>
          {category && (
            <Badge style={{ backgroundColor: category.color }} className="text-white">
              {category.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-1.5">
          <div className="flex items-center text-sm">
            <span className="font-medium">URL:</span>
            <span className="ml-2 text-muted-foreground truncate max-w-[200px]">{webhook.url}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="font-medium">Method:</span>
            <Badge variant="outline" className="ml-2">
              {webhook.method}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/webhooks/${webhook.id}/edit`} className="flex items-center gap-1">
              <EditIcon size={14} />
              Edit
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to={`/webhooks/${webhook.id}`} className="flex items-center gap-1">
              <SendIcon size={14} />
              Execute
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WebhookCard;
