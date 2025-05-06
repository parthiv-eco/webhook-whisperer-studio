
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UseSessionManagerOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  autoLogin?: boolean;
  loginAsAdmin?: boolean;
}

export const useSessionManager = ({
  requireAuth = false,
  requireAdmin = false,
  redirectTo = "/login",
  autoLogin = false,
  loginAsAdmin = true
}: UseSessionManagerOptions = {}) => {
  const { isAuthenticated, isAdmin, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Handle auto-login for demo purposes
  useEffect(() => {
    const handleAutoLogin = async () => {
      if (autoLogin && !isAuthenticated && !isLoading) {
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
        }
      }
    };
    
    handleAutoLogin();
  }, [autoLogin, isAuthenticated, isLoading, login, loginAsAdmin]);

  // Handle auth requirements and redirects
  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        toast.error("Authentication required to access this page");
        navigate(redirectTo);
      } else if (requireAdmin && !isAdmin) {
        toast.error("Admin privileges required to access this page");
        navigate("/");
      }
      setIsAuthChecked(true);
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, navigate, redirectTo]);

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    isAuthChecked,
    isAuthorized: (!requireAuth || isAuthenticated) && (!requireAdmin || isAdmin)
  };
};
