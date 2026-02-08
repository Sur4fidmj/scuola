import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Appunti from './pages/Appunti';
import TeacherDashboard from './pages/TeacherDashboard';
import Evaluations from './pages/Evaluations';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import VerifyEmail from './pages/VerifyEmail';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/appunti" element={<Appunti />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Teacher Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['professore', 'admin']} />}>
                        <Route path="/docente/dashboard" element={<TeacherDashboard />} />
                        <Route path="/docente/valutazioni" element={<Evaluations />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
