import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss';
import App from './App';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Analytics } from "@vercel/analytics/react"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
