
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Hardcoded admin credentials (in a real app, you would use environment variables)
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean; 
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        setIsAuthenticated(!!session);
        
        // Check if user is admin (in this case, matching the admin email)
        if (session?.user) {
          setIsAdmin(session.user.email === ADMIN_EMAIL);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      
      // Check admin status on auth changes
      if (session?.user) {
        setIsAdmin(session.user.email === ADMIN_EMAIL);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For demo admin user, bypass Supabase authentication
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Create a mock session for the admin user
        const mockSession = {
          user: {
            id: "admin-user-id",
            email: ADMIN_EMAIL,
            role: "admin"
          }
        };
        
        // Set authenticated state
        setIsAuthenticated(true);
        setIsAdmin(true);
        
        // Show success message
        toast.success("Logged in successfully as admin");
        return;
      }
      
      // For non-admin users, use regular Supabase auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      toast.success("Logged in successfully");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Login failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // For admin user, just clear the state
      if (isAdmin && !isAuthenticated) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        toast.success("Logged out successfully");
        return;
      }
      
      // For regular users, sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(`Logout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
