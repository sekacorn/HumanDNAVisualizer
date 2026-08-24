import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import AuthLayout from './components/layout/AuthLayout'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Explore from './pages/Explore'
import AnatomyViewer from './pages/AnatomyViewer'
import Import from './pages/Import'
import Samples from './pages/Samples'
import LearnMode from './pages/LearnMode'
import TourViewer from './pages/TourViewer'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import DisclaimerBanner from './components/DisclaimerBanner'
import DemoModeBanner from './components/DemoModeBanner'
import './App.css'

/** Routes that render inside the command-centre frame. */
function ShellRoutes() {
  return (
    <AppShell>
      <DemoModeBanner />
      <DisclaimerBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<LearnMode />} />
        <Route path="/learn/tour/:tourId" element={<TourViewer />} />
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
        <Route
          path="/anatomy"
          element={
            <ProtectedRoute>
              <AnatomyViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import"
          element={
            <ProtectedRoute>
              <Import />
            </ProtectedRoute>
          }
        />
        <Route
          path="/samples"
          element={
            <ProtectedRoute>
              <Samples />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth stands outside the shell: no rail, no tab bar, one job. */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route path="*" element={<ShellRoutes />} />
      </Routes>
    </Router>
  )
}

export default App
