
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CodeEditor from "./CodeEditor";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, TrashIcon } from "lucide-react";

interface ExamplePayloadProps {
  examples: Array<{
    name: string;
    payload: string;
  }>;
  onChange: (examples: Array<{ name: string; payload: string }>) => void;
}

const ExamplePayloads = ({ examples, onChange }: ExamplePayloadProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExampleName, setNewExampleName] = useState("");
  const [newExamplePayload, setNewExamplePayload] = useState("{\n  \n}");

  const addExample = () => {
    if (newExampleName.trim() === "") return;

    onChange([
      ...examples,
      {
        name: newExampleName,
        payload: newExamplePayload,
      },
    ]);

    setNewExampleName("");
    setNewExamplePayload("{\n  \n}");
    setIsDialogOpen(false);
  };

  const removeExample = (index: number) => {
    const newExamples = [...examples];
    newExamples.splice(index, 1);
    onChange(newExamples);
  };

  const updateExamplePayload = (index: number, payload: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], payload };
    onChange(newExamples);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Example Payloads</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <PlusIcon size={14} />
              Add Example
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Example Payload</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Example Name
                </label>
                <Input
                  id="name"
                  value={newExampleName}
                  onChange={(e) => setNewExampleName(e.target.value)}
                  placeholder="e.g., Basic Example"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="payload" className="text-sm font-medium">
                  Payload
                </label>
                <CodeEditor
                  value={newExamplePayload}
                  onChange={setNewExamplePayload}
                  placeholder="Enter JSON payload..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addExample}>Add Example</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {examples.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No example payloads added yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsDialogOpen(true)}
          >
            Add your first example
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {examples.map((example, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{example.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeExample(index)}
                  >
                    <TrashIcon size={16} className="text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <CodeEditor
                  value={example.payload}
                  onChange={(value) => updateExamplePayload(index, value)}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamplePayloads;
