
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LockIcon } from "lucide-react";

const LoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  if (isAuthenticated) {
    navigate("/admin");
    return null;
  }
  
  const handleLogin = async () => {
    await login();
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LockIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Login with admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>This is a demo with hardcoded credentials:</p>
            <p className="font-mono mt-1">admin@example.com / admin123</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
