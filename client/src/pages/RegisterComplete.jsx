import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import '../styles/Auth.css';

const RegisterComplete = () => {
    const [formData, setFormData] = useState({
        nome: '', cognome: '', password: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');
    
    const query = new URLSearchParams(useLocation().search);
    const token = query.get('token');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setError('Token di registrazione mancante o non valido.');
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;
        
        setStatus('loading');
        setError('');
        
        try {
            await register({
                token,
                nome: formData.nome,
                cognome: formData.cognome,
                password: formData.password
            });
            setStatus('success');
            // Auto redirect after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus('idle');
            setError(err.response?.data?.message || 'Errore durante il completamento della registrazione');
        }
    };

    if (status === 'success') {
        return (
            <div className="auth-container">
                <div className="auth-card success-card">
                    <CheckCircle size={48} color="#0d9488" />
                    <h2>Registrazione Completata!</h2>
                    <p>Il tuo account è stato creato con successo.</p>
                    <p>Verrai reindirizzato al login tra pochi secondi...</p>
                    <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', textAlign: 'center', marginTop: '1rem' }}>
                        Vai al Login ora
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="auth-container">
                <div className="auth-card error-card">
                    <AlertCircle size={48} color="#ef4444" />
                    <h2>Errore</h2>
                    <p>{error}</p>
                    <Link to="/register" className="auth-btn" style={{ textDecoration: 'none', textAlign: 'center', marginTop: '1rem' }}>
                        Riprova registrazione
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Completa Profilo</h2>
                <p>Inserisci i tuoi dati per attivare l'account</p>
                
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nome</label>
                            <input 
                                name="nome" 
                                value={formData.nome} 
                                onChange={handleChange} 
                                placeholder="Il tuo nome"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Cognome</label>
                            <input 
                                name="cognome" 
                                value={formData.cognome} 
                                onChange={handleChange} 
                                placeholder="Il tuo cognome"
                                required 
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="Scegli una password sicura"
                            required 
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Creazione account...' : 'Attiva Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterComplete;
