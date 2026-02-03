import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import MetaTags from './components/MetaTags';
import { initPerformanceMonitoring } from './utils/PerformanceMonitor';
import ScrollToTop from './components/UI/ScrollToTop';
import { NotificationProvider } from './components/UI/NotificationSystem';
import './index.css';

// Initialize performance monitoring
initPerformanceMonitoring();

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const PortfoyPazari = lazy(() => import('./pages/PortfoyPazari'));
const TrioPrime = lazy(() => import('./pages/TrioPrime'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserControl = lazy(() => import('./pages/UserControl'));
const Login = lazy(() => import('./pages/Login'));
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <NotificationProvider>
          <MetaTags />
          <MainLayout>
            <ScrollToTop />
            <Suspense fallback={
              <div className="loading-screen" aria-live="polite">
                <div className="loading-spinner"></div>
                Yükleniyor...
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfoy-pazari" element={<PortfoyPazari />} />
                <Route path="/trio-prime" element={<TrioPrime />} />
                <Route path="/iletisim" element={<ContactPage />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/hesabim" element={<UserControl />} />
                <Route path="/:categoryId" element={<CategoryPage />} />
                <Route path="/ilan/:id" element={<PropertyDetails />} />
                {/* Fallback for other routes */}
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </NotificationProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
