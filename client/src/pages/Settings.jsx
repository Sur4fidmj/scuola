import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Lock, ShieldCheck, Mail, CheckCircle, XCircle, QrCode } from 'lucide-react';
import '../styles/Settings.css';

const Settings = () => {
    const { user, setUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [profileData, setProfileData] = useState({
        nome: user?.nome || '',
        cognome: user?.cognome || '',
        email: user?.email || ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // 2FA State
    const [twoFAData, setTwoFAData] = useState({
        qrCode: '',
        secret: '',
        token: '',
        step: 0 // 0: disable/enable, 1: showing QR, 2: success
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${user.id}/profile`, profileData);
            setUser({ ...user, ...profileData });
            setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento del profilo.' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setMessage({ type: 'error', text: 'Le password non coincidono.' });
        }
        try {
            await api.post('/auth/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: 'Password modificata con successo!' });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Errore nel cambio password.' });
        }
    };

    const handleSetup2FA = async () => {
        try {
            const res = await api.post('/2fa/setup');
            setTwoFAData({ ...twoFAData, qrCode: res.data.qrCode, secret: res.data.secret, step: 1 });
        } catch (err) {
            setMessage({ type: 'error', text: 'Errore configurazione 2FA.' });
        }
    };

    const handleVerify2FA = async () => {
        try {
            await api.post('/2fa/verify', { token: twoFAData.token });
            setUser({ ...user, two_fa_enabled: true });
            setTwoFAData({ ...twoFAData, step: 2 });
            setMessage({ type: 'success', text: '2FA attivata!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Codice non valido.' });
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm('Sei sicuro di voler disattivare il 2FA?')) return;
        try {
            await api.post('/2fa/disable');
            setUser({ ...user, two_fa_enabled: false });
            setTwoFAData({ ...twoFAData, step: 0 });
            setMessage({ type: 'success', text: '2FA disattivata.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Errore disattivazione 2FA.' });
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container glass-card">
                <div className="settings-sidebar">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <User size={20} /> Profilo
                    </button>
                    <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                        <ShieldCheck size={20} /> Sicurezza
                    </button>
                    <button className={activeTab === 'password' ? 'active' : ''} onClick={() => setActiveTab('password')}>
                        <Lock size={20} /> Password
                    </button>
                </div>

                <div className="settings-content">
                    {message.text && (
                        <div className={`status-msg ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile}>
                            <h2>Il Tuo Profilo</h2>
                            <div className="verification-status">
                                {user.is_verified ? (
                                    <span className="verified"><CheckCircle size={14} /> Email Verificata</span>
                                ) : (
                                    <span className="unverified"><Mail size={14} /> Email non verificata</span>
                                )}
                            </div>
                            <div className="input-group">
                                <label>Nome</label>
                                <input type="text" value={profileData.nome} onChange={e => setProfileData({ ...profileData, nome: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Cognome</label>
                                <input type="text" value={profileData.cognome} onChange={e => setProfileData({ ...profileData, cognome: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary">Salva Modifiche</button>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handleChangePassword}>
                            <h2>Cambia Password</h2>
                            <div className="input-group">
                                <label>Password Attuale</label>
                                <input type="password" value={passwords.oldPassword} onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Nuova Password</label>
                                <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Conferma Nuova Password</label>
                                <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary">Aggiorna Password</button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <div className="security-section">
                            <h2>Sicurezza Avanzata (2FA)</h2>
                            <p>Proteggi il tuo account aggiungendo un ulteriore livello di sicurezza tramite autenticazione a due fattori.</p>

                            {!user.two_fa_enabled && twoFAData.step === 0 && (
                                <button className="btn-primary" onClick={handleSetup2FA}>Configura 2FA</button>
                            )}

                            {twoFAData.step === 1 && (
                                <div className="setup-2fa">
                                    <p>Scansiona questo QR code con la tua app di autenticazione (es. Google Authenticator):</p>
                                    <img src={twoFAData.qrCode} alt="2FA QR Code" />
                                    <p className="secret-text">Segreto manuale: <code>{twoFAData.secret}</code></p>
                                    <div className="verify-2fa">
                                        <input
                                            type="text"
                                            placeholder="Inserisci il codice di 6 cifre"
                                            value={twoFAData.token}
                                            onChange={e => setTwoFAData({ ...twoFAData, token: e.target.value })}
                                        />
                                        <button className="btn-primary" onClick={handleVerify2FA}>Attiva 2FA</button>
                                    </div>
                                </div>
                            )}

                            {user.two_fa_enabled && (
                                <div className="active-2fa">
                                    <div className="status-badge active"><ShieldCheck size={18} /> 2FA Attiva</div>
                                    <button className="btn-danger-outline" onClick={handleDisable2FA}>Disattiva 2FA</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
