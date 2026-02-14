
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Plugin to inject Firebase config into service worker after build
function injectFirebaseConfig() {
  return {
    name: 'inject-firebase-config',
    closeBundle() {
      const env = loadEnv('production', process.cwd(), 'VITE_')
      const distSwPath = resolve(__dirname, 'dist/firebase-messaging-sw.js')
      
      if (!existsSync(distSwPath)) {
        console.log('Service worker not found in dist, skipping Firebase config injection')
        return
      }
      
      try {
        let swContent = readFileSync(distSwPath, 'utf-8')
        
        // Replace placeholder references with actual values
        swContent = swContent
          .replace(/self\.FIREBASE_API_KEY \|\| ''/g, `'${env.VITE_FIREBASE_API_KEY || ''}'`)
          .replace(/self\.FIREBASE_AUTH_DOMAIN \|\| ''/g, `'${env.VITE_FIREBASE_AUTH_DOMAIN || ''}'`)
          .replace(/self\.FIREBASE_PROJECT_ID \|\| ''/g, `'${env.VITE_FIREBASE_PROJECT_ID || ''}'`)
          .replace(/self\.FIREBASE_STORAGE_BUCKET \|\| ''/g, `'${env.VITE_FIREBASE_STORAGE_BUCKET || ''}'`)
          .replace(/self\.FIREBASE_MESSAGING_SENDER_ID \|\| ''/g, `'${env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}'`)
          .replace(/self\.FIREBASE_APP_ID \|\| ''/g, `'${env.VITE_FIREBASE_APP_ID || ''}'`)
        
        writeFileSync(distSwPath, swContent)
        console.log('✅ Firebase config injected into service worker')
      } catch (error) {
        console.warn('Could not process firebase-messaging-sw.js:', error)
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), injectFirebaseConfig()],
  server: {
    port: 3001, // Use a different port than your original
  },
})