
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SettingsPage = () => {
  const [autoFormat, setAutoFormat] = useState(true);
  const [saveResponses, setSaveResponses] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const handleReset = () => {
    localStorage.clear();
    toast.success("All data has been reset. Reload the page to see changes.");
    setIsResetDialogOpen(false);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your webhook management preferences.
          </p>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>
                Configure general application settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-format">Auto-format JSON</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically format JSON when pasting into editors.
                    </p>
                  </div>
                  <Switch
                    id="auto-format"
                    checked={autoFormat}
                    onCheckedChange={setAutoFormat}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="save-responses">Save Responses</Label>
                    <p className="text-sm text-muted-foreground">
                      Save webhook responses for later reference.
                    </p>
                  </div>
                  <Switch
                    id="save-responses"
                    checked={saveResponses}
                    onCheckedChange={setSaveResponses}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark mode for the application. (Coming soon)
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your webhook data and application settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Reset Application</h3>
                  <p className="text-sm text-muted-foreground">
                    This will delete all your categories, webhooks, and settings. This action cannot be undone.
                  </p>
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="mt-4">
                        Reset All Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Reset</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to reset all data? This will delete all your categories, webhooks, and settings. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReset}>
                          Reset All Data
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Export all your webhooks and categories as JSON. (Coming soon)
                  </p>
                  <Button variant="outline" className="mt-4" disabled>
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                Information about this application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Version:</strong> 1.0.0
                </p>
                <p className="text-sm">
                  <strong>Created by:</strong> Webhook Whisperer Studio
                </p>
                <p className="text-sm">
                  A tool for managing and testing webhooks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
