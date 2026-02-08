import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        nome: '', cognome: '', email: '', password: '', ruolo: 'studente'
    });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Crea Account</h2>
                <p>Unisciti alla nostra piattaforma</p>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nome</label>
                            <input name="nome" value={formData.nome} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Cognome</label>
                            <input name="cognome" value={formData.cognome} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="auth-btn">Registrati</button>
                </form>
                <div className="auth-footer">
                    Hai già un account? <Link to="/login">Accedi</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
