import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const query = new URLSearchParams(useLocation().search);
    const token = query.get('token');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Token di verifica mancante.');
                return;
            }
            try {
                const res = await api.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(res.data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Errore durante la verifica dell\'email.');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="verify-page" style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
                {status === 'loading' && <Loader className="animate-spin" size={48} />}
                {status === 'success' && (
                    <>
                        <CheckCircle size={48} color="#0d9488" />
                        <h2>Email Verificata!</h2>
                        <p>{message}</p>
                        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Torna al Login</Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle size={48} color="#ef4444" />
                        <h2>Verifica Fallita</h2>
                        <p>{message}</p>
                        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Torna alla Home</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
