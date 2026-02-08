import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Book, User, GraduationCap, LayoutDashboard } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">🎓 ScuolaPlatform</Link>
            </div>
            <div className="navbar-links">
                <Link to="/appunti" className="nav-link"><Book size={18} /> Appunti</Link>

                {user.ruolo === 'professore' && (
                    <Link to="/docente/dashboard" className="nav-link"><LayoutDashboard size={18} /> Docente</Link>
                )}

                {user.ruolo === 'admin' && (
                    <Link to="/admin/dashboard" className="nav-link"><LayoutDashboard size={18} /> Admin</Link>
                )}

                <div className="user-menu">
                    <div className="user-info">
                        <span className="user-name"><User size={18} /> {user.nome}</span>
                        <span className="user-role-badge">{user.ruolo}</span>
                    </div>
                    <div className="user-actions">
                        <Link to="/settings" title="Impostazioni" className="nav-icon-btn"><LayoutDashboard size={18} /></Link>
                        <button onClick={handleLogout} className="logout-btn" title="Esci"><LogOut size={18} /></button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
