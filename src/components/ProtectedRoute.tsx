
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  autoLogin?: boolean;
  loginAsAdmin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  autoLogin = false,
  loginAsAdmin = true
}: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading, login } = useAuth();
  const navigate = useNavigate();
  
  // Handle authentication redirection
  useEffect(() => {
    // Only check after initial loading is complete
    if (!isLoading) {
      // Check authentication requirements
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        
        // Auto-login for demo if requested
        if (autoLogin) {
          console.log(`Auto-login as ${loginAsAdmin ? 'admin' : 'user'}`);
          const performAutoLogin = async () => {
            try {
              if (loginAsAdmin) {
                await login("admin@example.com", "admin123");
                toast.success("Auto-logged in as admin for demo purposes");
              } else {
                await login("user@example.com", "user123");
                toast.success("Auto-logged in as regular user for demo purposes");
              }
            } catch (error) {
              console.error("Auto-login failed:", error);
              navigate("/login");
            }
          };
          
          performAutoLogin();
        } else {
          // Redirect to login if not auto-logging in
          navigate("/login");
        }
      } else if (requireAdmin && !isAdmin) {
        // User is logged in but not an admin when required
        console.log("Admin privileges required, redirecting to home");
        toast.error("Admin privileges required to access this page");
        navigate("/");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, navigate, autoLogin, loginAsAdmin, login]);
  
  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // Show content only if authenticated and meeting admin requirements
  const shouldRenderContent = isAuthenticated && (!requireAdmin || isAdmin);
  
  return shouldRenderContent ? <>{children}</> : null;
};

export default ProtectedRoute;
