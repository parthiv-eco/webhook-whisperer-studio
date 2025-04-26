
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WebhookCategory, Webhook } from "@/types";
import { Link } from "react-router-dom";
import { EditIcon } from "lucide-react";

interface CategoryCardProps {
  category: WebhookCategory;
  webhooksCount: number;
}

const CategoryCard = ({ category, webhooksCount }: CategoryCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <CardDescription className="line-clamp-1">{category.description}</CardDescription>
          </div>
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: category.color || '#6E42CE' }}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center text-sm">
          <Badge variant="outline">
            {webhooksCount} {webhooksCount === 1 ? 'webhook' : 'webhooks'}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link to={`/categories/${category.id}/edit`} className="flex items-center gap-1">
            <EditIcon size={14} />
            Edit
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={`/?category=${category.id}`}>
            View Webhooks
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
