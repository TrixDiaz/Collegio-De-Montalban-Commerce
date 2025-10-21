
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginForm } from '@/components/forms/login-form';
import { Dashboard } from '@/pages/Dashboard';
import { Users } from '@/pages/Users';
import { Products } from '@/pages/Products';
import { Brands } from '@/pages/Brands';
import { Categories } from '@/pages/Categories';
import { Orders } from '@/pages/Orders';
import { Analytics } from '@/pages/Analytics';
import { PromoCodes } from '@/pages/PromoCodes';
import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="admin-theme">
      <AuthProvider>
        <NotificationProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/brands"
                  element={
                    <ProtectedRoute>
                      <Brands />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/promos"
                  element={
                    <ProtectedRoute>
                      <PromoCodes />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
