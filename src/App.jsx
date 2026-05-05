import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import CartProvider from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Loader2 } from 'lucide-react';

import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminAddProductPage from './pages/AdminAddProductPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import AdminClientsPage from './pages/AdminClientsPage';
import AdminPosPage from './pages/AdminPosPage';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFDFD' }}>
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="animate-spin w-12 h-12" style={{ color: '#FFB347' }} />
      <p className="text-text-dim font-medium">Carregando Faciil...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<StorePage />} />
      <Route path="/produto/:id" element={<ProductDetailPage />} />
      <Route path="/pedidos" element={<OrdersPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminAddProductPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="clients" element={<AdminClientsPage />} />
        <Route path="pos" element={<AdminPosPage />} />
        <Route path="reports" element={<div className="text-text-dim">Relatórios em breve...</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <ThemeProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ThemeProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
