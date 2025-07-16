import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add error handling and fallback
try {
  const rootElement = document.getElementById("root")
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  const root = createRoot(rootElement)
  root.render(<App />)
} catch (error) {
  // Fallback if React fails
  document.body.innerHTML = `
    <div style="padding: 20px; background-color: #dc2626; color: white; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <h1>Error Loading App</h1>
      <p>Error: ${error.message}</p>
      <p>Please check the console for more details.</p>
    </div>
  `
}
