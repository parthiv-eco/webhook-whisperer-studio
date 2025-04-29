
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminHeader = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {isAuthenticated && (
        <Badge variant={isAdmin ? "default" : "outline"} className="mr-2">
          {isAdmin ? "Admin" : "User"}
        </Badge>
      )}
      
      {isAuthenticated ? (
        <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-1">
          <LogOut size={16} />
          Logout
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm" className="flex items-center gap-1">
          <Link to="/login">
            <User size={16} />
            Login
          </Link>
        </Button>
      )}
    </div>
  );
};

export default AdminHeader;
