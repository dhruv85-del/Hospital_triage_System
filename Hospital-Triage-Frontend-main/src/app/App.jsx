import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { QueueProvider } from '../context/QueueContext';
import { AppRoutes } from './routes';
import { ToastContainer } from '../components/notifications/ToastContainer';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <QueueProvider>
            <div className="min-h-screen bg-canvas text-ink selection:bg-primary/20 selection:text-primary font-body">
              <AppRoutes />
              {/* Toast Alerts Stack */}
              <ToastContainer />
            </div>
          </QueueProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
