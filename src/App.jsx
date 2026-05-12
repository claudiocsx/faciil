import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import CartProvider from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { ThemeProvider } from './contexts/ThemeContext';
import CustomerAuthProvider from './contexts/CustomerAuthContext';
import LoadingScreen from './components/LoadingScreen';
import Analytics from './components/Analytics';

import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import MyOrdersPage from './pages/MyOrdersPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminAddProductPage from './pages/AdminAddProductPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import AdminClientsPage from './pages/AdminClientsPage';
import AdminPosPage from './pages/AdminPosPage';
import AdminBannersPage from './pages/AdminBannersPage';
import AdminReportsPage from './pages/AdminReportsPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user || !user.role) return <Navigate to="/login" replace />;
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
      <Route path="/meus-pedidos" element={<MyOrdersPage />} />
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
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="clients" element={<AdminClientsPage />} />
        <Route path="pos" element={<AdminPosPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="perfil" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <ProductProvider>
          <CartProvider>
            <ThemeProvider>
              <BrowserRouter>
                <Helmet>
                  <meta name="theme-color" content="#FFB347" />
                  <link rel="canonical" href="https://faciil.vercel.app" />
                </Helmet>
                <Analytics />
                <AppRoutes />
              </BrowserRouter>
            </ThemeProvider>
          </CartProvider>
        </ProductProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}
