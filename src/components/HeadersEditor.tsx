
import { useState } from "react";
import { WebhookHeader } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, TrashIcon } from "lucide-react";

interface HeadersEditorProps {
  headers: WebhookHeader[];
  onChange: (headers: WebhookHeader[]) => void;
}

const HeadersEditor = ({ headers, onChange }: HeadersEditorProps) => {
  const addHeader = () => {
    onChange([...headers, { key: "", value: "", enabled: true }]);
  };

  const updateHeader = (index: number, field: keyof WebhookHeader, value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    onChange(newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    onChange(newHeaders);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Enabled</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No headers added. Click "Add Header" to add one.
                </TableCell>
              </TableRow>
            ) : (
              headers.map((header, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Switch
                      checked={header.enabled}
                      onCheckedChange={(checked) => updateHeader(index, "enabled", checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={header.key}
                      onChange={(e) => updateHeader(index, "key", e.target.value)}
                      placeholder="Header name"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={header.value}
                      onChange={(e) => updateHeader(index, "value", e.target.value)}
                      placeholder="Header value"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeader(index)}
                      className="h-8 w-8"
                    >
                      <TrashIcon size={16} className="text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center gap-1" 
        onClick={addHeader}
      >
        <PlusIcon size={16} />
        Add Header
      </Button>
    </div>
  );
};

export default HeadersEditor;
