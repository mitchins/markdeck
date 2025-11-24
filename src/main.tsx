import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'

import "./index.css"
import "./styles/theme.css"
import "./main.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThemeProvider attribute="data-appearance" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
   </ErrorBoundary>
)
