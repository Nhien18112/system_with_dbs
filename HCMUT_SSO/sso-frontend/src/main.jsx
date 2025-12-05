import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Hoặc SsoLoginPage tùy cách bạn import
import './index.css'

// 1. IMPORT DÒNG NÀY
import { BrowserRouter } from 'react-router-dom' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. BỌC TOÀN BỘ APP BẰNG THẺ BrowserRouter */}
    <BrowserRouter>
      <App /> 
    </BrowserRouter>
    {/* ----------------------------------------- */}
  </React.StrictMode>,
)