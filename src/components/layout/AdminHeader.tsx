
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AdminHeader = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Logout button clicked");
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="flex items-center gap-4">
      {isAdmin && isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Settings size={16} />
              Quick Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/admin/webhooks/new" className="flex items-center gap-2">
                <Plus size={16} />
                New Webhook
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/categories/new" className="flex items-center gap-2">
                <Plus size={16} />
                New Category
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {isAuthenticated && (
        <Badge variant={isAdmin ? "default" : "outline"} className="mr-2">
          {isAdmin ? "Admin" : "User"}
        </Badge>
      )}
      
      {isAuthenticated ? (
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
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
