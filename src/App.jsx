import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import CardGenerator from './pages/CardGenerator';
import Report from './pages/Report';
import TurnPass from './pages/TurnPass';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/cards" element={<CardGenerator />} />
            <Route path="/report" element={<Report />} />
            <Route path="/turn-pass" element={<TurnPass />} />
          </Route>

          <Route path="/" element={<Navigate to="/cards" replace />} />
          <Route path="*" element={<Navigate to="/cards" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
