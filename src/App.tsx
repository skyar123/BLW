import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Dashboard,
  AddBabyPage,
  BabyProfilePage,
  LogFoodPage,
  FoodDetailPage,
  LogDetailPage,
  AllergenTrackerPage,
  LoginPage,
  FamilySettingsPage,
} from './pages';

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🥑</div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

// Protected route wrapper - requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Auth route wrapper - redirects to home if already authenticated
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public route - Login */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/babies/new"
        element={
          <ProtectedRoute>
            <AddBabyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/babies/:id"
        element={
          <ProtectedRoute>
            <BabyProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/log"
        element={
          <ProtectedRoute>
            <LogFoodPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/log/:babyId"
        element={
          <ProtectedRoute>
            <LogFoodPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foods/:foodId"
        element={
          <ProtectedRoute>
            <FoodDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs/:logId"
        element={
          <ProtectedRoute>
            <LogDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/allergens"
        element={
          <ProtectedRoute>
            <AllergenTrackerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/family"
        element={
          <ProtectedRoute>
            <FamilySettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
