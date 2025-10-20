import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Explore from './pages/Explore'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import authService from './services/authService'
import './App.css'

function Navigation() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
  const [user, setUser] = useState(authService.getCurrentUser())

  useEffect(() => {
    // Check authentication status periodically
    const interval = setInterval(() => {
      setIsAuthenticated(authService.isAuthenticated())
      setUser(authService.getCurrentUser())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              HumanDNAVisualizer
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/analyze" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                  Analyze
                </Link>
                <Link to="/explore" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                  Explore 3D
                </Link>
                <div className="flex items-center space-x-3 ml-4 border-l border-gray-600 pl-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">{user?.username}</span>
                      <span className="text-gray-400 text-xs">{user?.roles?.[0] || 'USER'}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition bg-red-600 bg-opacity-20 hover:bg-opacity-30"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Navigation />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <Analyze />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
