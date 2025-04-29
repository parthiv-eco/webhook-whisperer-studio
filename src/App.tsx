
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
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/webhooks/:id" element={<WebhookPage />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/webhooks" element={<ProtectedRoute><AdminWebhooks /></ProtectedRoute>} />
              <Route path="/admin/webhooks/new" element={<ProtectedRoute><WebhookFormPage /></ProtectedRoute>} />
              <Route path="/admin/webhooks/:id/edit" element={<ProtectedRoute><WebhookFormPage /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/categories/new" element={<ProtectedRoute><AdminCategoryForm /></ProtectedRoute>} />
              <Route path="/admin/categories/:id/edit" element={<ProtectedRoute><EditCategoryPage /></ProtectedRoute>} />
              
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/new" element={<ProtectedRoute><AdminCategoryForm /></ProtectedRoute>} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
