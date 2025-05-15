import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss';
import App from './App';
import { Analytics } from "@vercel/analytics/react"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
