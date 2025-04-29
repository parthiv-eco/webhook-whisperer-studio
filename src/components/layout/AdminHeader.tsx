
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOutIcon, LockIcon } from "lucide-react";

const AdminHeader = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-1">
          <LogOutIcon size={16} />
          Logout
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm" className="flex items-center gap-1">
          <Link to="/login">
            <LockIcon size={16} />
            Login
          </Link>
        </Button>
      )}
    </div>
  );
};

export default AdminHeader;
