
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Hardcoded admin credentials (in a real app, you would use environment variables)
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean; // Add admin role check
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add admin state

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
      // Try to login with Supabase first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If login fails, check if it's the demo admin credentials
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          // Try to sign up with demo credentials
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                is_admin: true,
              }
            }
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          if (signUpData.session) {
            // Signup and auto-login successful
            setIsAdmin(true);
            toast.success("Registered and logged in successfully as admin");
            return;
          } else {
            // If account was created but email confirmation is required
            toast.info("Account created. Please check your email for confirmation.");
            throw new Error("Account created. Email confirmation required.");
          }
        } else {
          // Not admin credentials, just throw the original error
          throw error;
        }
      } else {
        // Successful login
        if (data.user?.email === ADMIN_EMAIL) {
          setIsAdmin(true);
          toast.success("Logged in successfully as admin");
        } else {
          toast.success("Logged in successfully");
        }
      }
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
