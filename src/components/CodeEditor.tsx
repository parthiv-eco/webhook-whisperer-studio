
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  examplePayloads?: Array<{ name: string; payload: string }>;
}

const CodeEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter JSON...", 
  className = "",
  examplePayloads = [] 
}: CodeEditorProps) => {
  const [isValidJson, setIsValidJson] = useState(true);

  useEffect(() => {
    try {
      if (value.trim()) {
        JSON.parse(value);
        setIsValidJson(true);
      } else {
        setIsValidJson(true);
      }
    } catch (e) {
      setIsValidJson(false);
    }
  }, [value]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // If not valid JSON, don't do anything
    }
  };

  const loadExample = (payload: string) => {
    onChange(payload);
  };

  return (
    <div className={`rounded-md border ${isValidJson ? 'border-border' : 'border-red-500'} ${className}`}>
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/40">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${isValidJson ? 'text-green-600' : 'text-red-500'}`}>
            {isValidJson ? 'Valid JSON' : 'Invalid JSON'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {examplePayloads.length > 0 && (
            <div className="flex gap-2">
              {examplePayloads.map((example, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs" 
                  onClick={() => loadExample(example.payload)}
                >
                  {example.name}
                </Button>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" className="text-xs" onClick={formatJson}>
            Format
          </Button>
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="code-editor border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[200px] font-mono text-sm"
      />
    </div>
  );
};

export default CodeEditor;
