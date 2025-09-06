import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CreateProductPage from './pages/CreateProductPage';
import EditProductPage from './pages/EditProductPage';
import MyListingsPage from './pages/MyListingsPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Loading Component
import LoadingScreen from './components/common/LoadingScreen';

function App() {
  return (
    <>
      <Helmet>
        <title>EcoFinds - Sustainable Second-Hand Marketplace</title>
        <meta 
          name="description" 
          content="Buy and sell pre-owned items to reduce waste and promote a circular economy. Join EcoFinds for sustainable shopping." 
        />
        <meta 
          name="keywords" 
          content="sustainable, second-hand, marketplace, eco-friendly, recycling, circular economy, pre-owned items" 
        />
        <meta property="og:title" content="EcoFinds - Sustainable Second-Hand Marketplace" />
        <meta property="og:description" content="Buy and sell pre-owned items to reduce waste and promote a circular economy." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EcoFinds - Sustainable Second-Hand Marketplace" />
        <meta name="twitter:description" content="Buy and sell pre-owned items to reduce waste and promote a circular economy." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="users/:userId" element={<ProfilePage />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/" element={<Layout />}>
            <Route 
              path="create-product" 
              element={
                <ProtectedRoute>
                  <CreateProductPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="edit-product/:id" 
              element={
                <ProtectedRoute>
                  <EditProductPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-listings" 
              element={
                <ProtectedRoute>
                  <MyListingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="cart" 
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="purchases" 
              element={
                <ProtectedRoute>
                  <PurchaseHistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="sales" 
              element={
                <ProtectedRoute>
                  <SalesHistoryPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
