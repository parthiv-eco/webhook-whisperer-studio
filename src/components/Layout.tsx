
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { WebhookIcon, LayoutGridIcon, BookmarkIcon, SettingsIcon } from "lucide-react";
import AdminHeader from "./layout/AdminHeader";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutGridIcon className="h-4 w-4" />,
      active: isActive("/") || isActive("/webhooks"),
    },
    {
      name: "Categories",
      href: "/categories",
      icon: <BookmarkIcon className="h-4 w-4" />,
      active: isActive("/categories"),
    },
    {
      name: "Admin",
      href: "/admin",
      icon: <WebhookIcon className="h-4 w-4" />,
      active: isActive("/admin"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <SettingsIcon className="h-4 w-4" />,
      active: isActive("/settings"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <WebhookIcon className="h-6 w-6" />
          <span>Webhook Manager</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <AdminHeader />
        </nav>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:text-foreground",
                  item.active && "bg-muted text-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <main className="flex flex-col p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
