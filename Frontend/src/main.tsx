import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import { SocketProvider } from './contexts/SocketContext'
import './styles/globals.css'

// Google Client ID from environment variable
// This is a PUBLIC key - it identifies your app to Google
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

createRoot(rootElement).render(
  <StrictMode>
    {/* GoogleOAuthProvider must wrap any component that uses Google Sign-In */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)