import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Eye, EyeOff, ShieldIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("admin");
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if user had previously selected remember me
    return localStorage.getItem("rememberMe") === "true";
  });

  // Use a safer navigation approach that doesn't cause rendering issues
  useEffect(() => {
    // Only navigate if the user is authenticated and not in an initial loading state
    if (isAuthenticated && !isLoading) {
      const destination = isAdmin ? "/admin" : "/";
      console.log(`User authenticated, redirecting to: ${destination}`);
      
      // Use a short timeout to ensure state is fully updated before navigation
      const timer = setTimeout(() => {
        navigate(destination);
        toast.success(`Logged in as ${isAdmin ? "Admin" : "User"}`);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      console.log(`Attempting login with ${activeTab} credentials`);
      const credentials = activeTab === "admin" 
        ? { email, password } 
        : { email: userEmail, password: userPassword };
      
      await login(credentials.email, credentials.password, rememberMe);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.message || "Login failed. Please check your credentials.");
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Webhook Manager Login</CardTitle>
          <CardDescription>
            Login with credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="admin" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                User
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <div className="relative">
                    <Input 
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
                </div>
                <Button 
                  type="submit"
                  className="w-full mt-4" 
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login as Admin"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="user">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input 
                    id="userEmail" 
                    type="email" 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter user email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPassword">Password</Label>
                  <div className="relative">
                    <Input 
                      id="userPassword"
                      type={showUserPassword ? "text" : "password"}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Enter user password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                    >
                      {showUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMeUser"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="rememberMeUser" className="text-sm">Remember me</Label>
                </div>
                <Button 
                  type="submit"
                  className="w-full mt-4" 
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login as User"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="text-sm text-destructive p-2 mt-4 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
