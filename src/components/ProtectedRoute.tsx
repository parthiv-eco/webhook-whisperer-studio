
import { ReactNode } from "react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  autoLogin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  autoLogin = false
}: ProtectedRouteProps) => {
  const { isLoading, isAuthChecked, isAuthorized } = useSessionManager({
    requireAuth: true,
    requireAdmin,
    autoLogin
  });

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

  if (!isAuthChecked) {
    return null;
  }

  return isAuthorized ? <>{children}</> : null;
};

export default ProtectedRoute;
