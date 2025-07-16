import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDevice } from "@/hooks/useDevice";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useEffect, Suspense, lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConnectionStatus from "@/components/ConnectionStatus";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Loans = lazy(() => import("./pages/Loans"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Banking = lazy(() => import("./pages/Banking"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AcceptInvitationPage = lazy(() => import("./components/AcceptInvitationPage"));

const queryClient = new QueryClient();

// Loading component for suspense fallback
const LoadingSpinner = () => {
  const isCapacitor = window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
  const apiUrl = isCapacitor ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 mb-2">Loading ChamaHub...</p>
        <p className="text-xs text-gray-500 mb-1">Environment: {isCapacitor ? 'Mobile App' : 'Web'}</p>
        <p className="text-xs text-gray-500 mb-1">Protocol: {window.location.protocol}</p>
        <p className="text-xs text-gray-500">API: {apiUrl}</p>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { deviceInfo, isLoading } = useDevice();
  const { isRegistered } = usePushNotifications();

  useEffect(() => {
    if (deviceInfo.isNative) {
      console.log(`Running on ${deviceInfo.platform} platform`);
      console.log('Device info:', deviceInfo);
    }
  }, [deviceInfo]);

  useEffect(() => {
    if (isRegistered) {
      console.log('Push notifications registered successfully');
    }
  }, [isRegistered]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`min-h-screen ${deviceInfo.isNative ? 'pt-safe pb-safe' : ''}`}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/loans" element={
                <ProtectedRoute>
                  <Loans />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/banking" element={
                <ProtectedRoute>
                  <Banking />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <AppContent />
          <ConnectionStatus />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
