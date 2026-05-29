import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, AuthProvider, ToastProvider, WishProvider } from './store';
import Navbar            from './components/common/Navbar';
import Toast             from './components/common/Toast';
import HomePage          from './pages/HomePage';
import ProductListPage   from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage          from './pages/CartPage';
import OrderPage         from './pages/OrderPage';
import OrderDetailPage   from './pages/OrderDetailPage';
import { LoginPage, SignupPage } from './pages/AuthPage';
import MyPage            from './pages/MyPage';
import { BmiPage, WishlistPage } from './pages/BmiPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishProvider>
              <Navbar />
              <Routes>
                <Route path="/"              element={<HomePage />} />
                <Route path="/products"      element={<ProductListPage />} />
                <Route path="/products/:id"  element={<ProductDetailPage />} />
                <Route path="/cart"          element={<CartPage />} />
                <Route path="/order"         element={<OrderPage />} />
                <Route path="/orders/:id"    element={<OrderDetailPage />} />
                <Route path="/login"         element={<LoginPage />} />
                <Route path="/signup"        element={<SignupPage />} />
                <Route path="/mypage"        element={<MyPage />} />
                <Route path="/bmi"           element={<BmiPage />} />
                <Route path="/wishlist"      element={<WishlistPage />} />
              </Routes>
              <Toast />
            </WishProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
