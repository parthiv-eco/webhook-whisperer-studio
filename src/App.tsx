
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/webhooks/:id" element={<WebhookPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/webhooks" element={<AdminWebhooks />} />
            <Route path="/admin/webhooks/new" element={<WebhookFormPage />} />
            <Route path="/admin/webhooks/:id/edit" element={<WebhookFormPage />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/categories/new" element={<AdminCategoryForm />} />
            <Route path="/admin/categories/:id/edit" element={<EditCategoryPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/new" element={<AdminCategoryForm />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
