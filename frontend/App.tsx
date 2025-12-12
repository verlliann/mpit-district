import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { CreateContent } from './views/CreateContent';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { LibraryView } from './views/LibraryView';
import { LoginView } from './views/LoginView';
import { ToastProvider } from './components/Toast';
import { apolloClient, getAuthToken } from './services/apollo';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    apolloClient.clearStore();
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'create':
        return <CreateContent />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView onLogout={handleLogout} />;
      case 'library':
        return <LibraryView />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <Layout activeView={activeView} onChangeView={setActiveView} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ApolloProvider>
  );
};

export default App;