import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewInterview from './pages/NewInterview'
import Interview from './pages/Interview'
import Feedback from './pages/Feedback'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/interview/new" element={<PrivateRoute><NewInterview /></PrivateRoute>} />
        <Route path="/interview/:id" element={<PrivateRoute><Interview /></PrivateRoute>} />
        <Route path="/feedback/:id" element={<PrivateRoute><Feedback /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App