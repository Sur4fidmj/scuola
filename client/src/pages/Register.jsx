import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success
    const [error, setError] = useState('');
    const { requestRegister } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('loading');
        try {
            await requestRegister(email);
            setStatus('success');
        } catch (err) {
            setStatus('idle');
            setError(err.response?.data?.message || 'Errore durante l\'invio del link');
        }
    };

    if (status === 'success') {
        return (
            <div className="auth-container">
                <div className="auth-card success-card">
                    <div className="success-icon">📧</div>
                    <h2>Controlla la tua Email</h2>
                    <p>Abbiamo inviato un link di registrazione a <strong>{email}</strong>.</p>
                    <p>Clicca sul link contenuto nell'email per completare la creazione del tuo account.</p>
                    <div className="auth-footer">
                        <Link to="/login">Torna al Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Crea Account</h2>
                <p>Inserisci la tua email per iniziare la registrazione</p>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Istituzionale</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="esempio@scuola.it"
                            required 
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Invio in corso...' : 'Invia Link di Registrazione'}
                    </button>
                </form>
                <div className="auth-footer">
                    Hai già un account? <Link to="/login">Accedi</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
