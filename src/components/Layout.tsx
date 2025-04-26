
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon, LayoutDashboardIcon, SettingsIcon, DatabaseIcon, GitHubIcon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-purple-700 flex items-center justify-center">
                <DatabaseIcon size={18} className="text-white" />
              </div>
              <span className="font-semibold text-lg">Webhook Studio</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild active={isActive("/")}>
                      <Link to="/" className="flex items-center gap-2">
                        <LayoutDashboardIcon size={18} />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild active={isActive("/categories")}>
                      <Link to="/categories" className="flex items-center gap-2">
                        <DatabaseIcon size={18} />
                        <span>Categories</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild active={isActive("/settings")}>
                      <Link to="/settings" className="flex items-center gap-2">
                        <SettingsIcon size={18} />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="px-4 py-2 border-t">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                  className="flex items-center gap-1 hover:text-purple-500 transition-colors">
                  <GitHubIcon size={14} />
                  <span>GitHub</span>
                </a>
              </div>
              <div className="text-xs text-muted-foreground">
                v1.0.0
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="border-b h-14 flex items-center px-4 justify-between">
            <div className="flex items-center space-x-2">
              <SidebarTrigger />
            </div>
            <div>
              <Button asChild size="sm" className="gap-1">
                <Link to="/webhooks/new">
                  <PlusIcon size={16} />
                  <span>New Webhook</span>
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container py-6 md:py-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
