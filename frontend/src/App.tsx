import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemMonitoring from './pages/admin/SystemMonitoring';
import CRMConfiguration from './pages/admin/CRMConfiguration';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

// Voice Assistant Pages
import VoiceAssistant from './pages/voice/VoiceAssistant';
import ConversationHistory from './pages/voice/ConversationHistory';
import VoiceSettings from './pages/voice/VoiceSettings';

// CRM Pages
import LeadManagement from './pages/crm/LeadManagement';
import TaskManager from './pages/crm/TaskManager';
import MeetingScheduler from './pages/crm/MeetingScheduler';
import EmailSummarization from './pages/crm/EmailSummarization';

// Settings Pages
import Profile from './pages/settings/Profile';
import NotificationSettings from './pages/settings/NotificationSettings';
import IntegrationSettings from './pages/settings/IntegrationSettings';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { VoiceProvider } from './contexts/VoiceContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VoiceProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Protected Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Dashboard */}
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Admin Routes */}
                  <Route path="admin">
                    <Route path="users" element={<UserManagement />} />
                    <Route path="monitoring" element={<SystemMonitoring />} />
                    <Route path="crm-config" element={<CRMConfiguration />} />
                    <Route path="analytics" element={<AnalyticsDashboard />} />
                  </Route>
                  
                  {/* Voice Assistant Routes */}
                  <Route path="voice">
                    <Route path="assistant" element={<VoiceAssistant />} />
                    <Route path="history" element={<ConversationHistory />} />
                    <Route path="settings" element={<VoiceSettings />} />
                  </Route>
                  
                  {/* CRM Routes */}
                  <Route path="crm">
                    <Route path="leads" element={<LeadManagement />} />
                    <Route path="tasks" element={<TaskManager />} />
                    <Route path="meetings" element={<MeetingScheduler />} />
                    <Route path="emails" element={<EmailSummarization />} />
                  </Route>
                  
                  {/* Settings Routes */}
                  <Route path="settings">
                    <Route path="profile" element={<Profile />} />
                    <Route path="notifications" element={<NotificationSettings />} />
                    <Route path="integrations" element={<IntegrationSettings />} />
                  </Route>
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </Router>
        </VoiceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;