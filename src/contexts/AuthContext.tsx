
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Hardcoded demo credentials
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";
const USER_EMAIL = "user@example.com";
const USER_PASSWORD = "user123";

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
        // Check for persisted demo session
        const demoSession = localStorage.getItem("demoSession");
        if (demoSession) {
          try {
            const sessionData = JSON.parse(demoSession);
            const isAdminUser = sessionData.email === ADMIN_EMAIL;
            const isRegularUser = sessionData.email === USER_EMAIL;
            
            if (isAdminUser || isRegularUser) {
              setIsAuthenticated(true);
              setIsAdmin(isAdminUser);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // Invalid session data, remove it
            localStorage.removeItem("demoSession");
          }
        }

        // Check Supabase session
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        if (session) {
          setIsAuthenticated(true);
          setIsAdmin(session.user.email === ADMIN_EMAIL);
          
          // Store session if it's a demo user
          if (session.user.email === ADMIN_EMAIL || session.user.email === USER_EMAIL) {
            localStorage.setItem("demoSession", JSON.stringify({
              email: session.user.email,
              timestamp: new Date().toISOString()
            }));
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem("demoSession");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
        localStorage.removeItem("demoSession");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        if (session?.user.email === ADMIN_EMAIL) {
          setIsAdmin(true);
          localStorage.setItem("demoSession", JSON.stringify({
            email: session.user.email,
            timestamp: new Date().toISOString()
          }));
        } else if (session?.user.email === USER_EMAIL) {
          setIsAdmin(false);
          localStorage.setItem("demoSession", JSON.stringify({
            email: session.user.email,
            timestamp: new Date().toISOString()
          }));
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        localStorage.removeItem("demoSession");
      }
    });

    // Check auth status periodically
    const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      authListener.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For demo admin user
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Persist admin session
        localStorage.setItem("demoSession", JSON.stringify({
          email: ADMIN_EMAIL,
          timestamp: new Date().toISOString()
        }));

        // Set authenticated state
        setIsAuthenticated(true);
        setIsAdmin(true);
        
        toast.success("Logged in successfully as admin");
        return;
      }
      
      // For demo regular user
      if (email === USER_EMAIL && password === USER_PASSWORD) {
        // Persist user session
        localStorage.setItem("demoSession", JSON.stringify({
          email: USER_EMAIL,
          timestamp: new Date().toISOString()
        }));

        // Set authenticated state
        setIsAuthenticated(true);
        setIsAdmin(false);
        
        toast.success("Logged in successfully as regular user");
        return;
      }
      
      // For non-demo users, use regular Supabase auth
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
      // Clear all auth state regardless of user type
      localStorage.removeItem("demoSession");
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      // Always sign out from Supabase to ensure clean state
      await supabase.auth.signOut();
      
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
