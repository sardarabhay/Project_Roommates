import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SocketProvider } from './contexts/SocketContext'
import './styles/globals.css'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

createRoot(rootElement).render(
  <StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </StrictMode>,
)