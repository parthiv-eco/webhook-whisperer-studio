
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import CategoriesPage from "@/pages/CategoriesPage";
import EditCategoryPage from "@/pages/EditCategoryPage";
import WebhookPage from "@/pages/WebhookPage";
import WebhookFormPage from "@/pages/WebhookFormPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminWebhooks from "@/pages/admin/AdminWebhooks";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCategoryForm from "@/pages/admin/AdminCategoryForm";
import AdminWebhookForm from "@/pages/admin/AdminWebhookForm";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin autoLogin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/webhooks" element={<ProtectedRoute requireAdmin autoLogin><AdminWebhooks /></ProtectedRoute>} />
              <Route path="/admin/webhooks/new" element={<ProtectedRoute requireAdmin autoLogin><WebhookFormPage /></ProtectedRoute>} />
              <Route path="/admin/webhooks/:id/edit" element={<ProtectedRoute requireAdmin autoLogin><WebhookFormPage /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute requireAdmin autoLogin><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/categories/new" element={<ProtectedRoute requireAdmin autoLogin><AdminCategoryForm /></ProtectedRoute>} />
              <Route path="/admin/categories/:id/edit" element={<ProtectedRoute requireAdmin autoLogin><EditCategoryPage /></ProtectedRoute>} />
              
              {/* Protected User Routes */}
              <Route path="/webhooks/:id" element={<ProtectedRoute autoLogin><WebhookPage /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute autoLogin><CategoriesPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute autoLogin><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
