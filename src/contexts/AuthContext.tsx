import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean; 
  user: { id?: string; email?: string } | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  user: null,
  login: async () => {},
  logout: async () => {},
});

// Session duration constants
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const TEMP_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [user, setUser] = useState<{ id?: string; email?: string } | null>(null);

  // Check session validity
  const isSessionValid = (timestamp: string, rememberMe: boolean): boolean => {
    const sessionTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const duration = rememberMe ? SESSION_DURATION : TEMP_SESSION_DURATION;
    return currentTime - sessionTime < duration;
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication state...");
        
        // Check for persisted demo session
        const demoSession = localStorage.getItem("demoSession");
        if (demoSession) {
          try {
            const sessionData = JSON.parse(demoSession);
            console.log("Found demo session:", sessionData);
            
            // Check if session is still valid
            if (!isSessionValid(sessionData.timestamp, sessionData.rememberMe)) {
              console.log("Demo session expired");
              localStorage.removeItem("demoSession");
              setIsAuthenticated(false);
              setIsAdmin(false);
              setUser(null);
              setIsLoading(false);
              return;
            }
            
            // Validate the stored session by checking if the email exists in our db
            const { data } = await supabase
              .from('demo_credentials')
              .select('role')
              .eq('email', sessionData.email)
              .single();
            
            if (data) {
              console.log("Demo session validated, role:", data.role);
              setIsAuthenticated(true);
              setIsAdmin(data.role === 'admin');
              setUser({ email: sessionData.email });
            } else {
              console.log("Invalid email in demo session");
              localStorage.removeItem("demoSession");
              setIsAuthenticated(false);
              setIsAdmin(false);
              setUser(null);
            }
          } catch (e) {
            console.error("Error parsing demo session:", e);
            localStorage.removeItem("demoSession");
          }
        }

        // Check Supabase session
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        if (session) {
          console.log("Found Supabase session:", session.user.email);
          setIsAuthenticated(true);
          setUser({
            id: session.user.id,
            email: session.user.email
          });

          // Check if the user is an admin
          const { data: userData } = await supabase
            .from('demo_credentials')
            .select('role')
            .eq('email', session.user.email)
            .single();
          
          setIsAdmin(userData?.role === 'admin');
          console.log("User role:", userData?.role);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        localStorage.removeItem("demoSession");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email
          });
          
          // Check if the user is a demo user and get their role
          if (session.user.email) {
            const { data } = await supabase
              .from('demo_credentials')
              .select('role')
              .eq('email', session.user.email)
              .single();
            
            if (data) {
              setIsAdmin(data.role === 'admin');
              localStorage.setItem("demoSession", JSON.stringify({
                email: session.user.email,
                timestamp: new Date().toISOString()
              }));
            } else {
              setIsAdmin(false);
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
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

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      console.log(`Attempting login for ${email}`);
      
      // Check demo credentials using our Supabase function
      const { data, error } = await supabase.rpc('check_demo_credentials', {
        p_email: email,
        p_password: password
      });
      
      if (error) {
        console.error("Demo credentials check error:", error);
        throw error;
      }
      
      // If credentials are valid (function returns a row)
      if (data && data.length > 0 && data[0].is_valid) {
        console.log("Demo credentials valid:", data[0]);
        
        // Store demo session with remember me preference
        localStorage.setItem("demoSession", JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          rememberMe
        }));

        // Set authenticated state
        setIsAuthenticated(true);
        setIsAdmin(data[0].user_role === 'admin');
        setUser({ email });
        
        toast.success(`Logged in successfully as ${data[0].user_role}`);
        return;
      }
      
      // If no demo credentials match, try regular Supabase auth with session duration
      console.log("Trying Supabase auth...");
      const authResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authResult.error) {
        console.error("Supabase auth error:", authResult.error);
        throw authResult.error;
      }

      // Store the remember me preference in localStorage
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      console.log("Supabase auth successful");
      if (authResult.data.user) {
        setUser({
          id: authResult.data.user.id,
          email: authResult.data.user.email
        });
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
      console.log("Logout called");
      // Clear all auth state regardless of user type
      localStorage.removeItem("demoSession");
      
      // Always sign out from Supabase to ensure clean state
      await supabase.auth.signOut();
      
      // Update state AFTER Supabase signout (important for state consistency)
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      
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
    user,
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
