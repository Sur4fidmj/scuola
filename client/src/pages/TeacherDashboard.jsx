import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Upload, BookOpen, UserCheck, MessageSquare, ArrowRight, FileText } from 'lucide-react';
import '../styles/Dashboard.css';

const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ titolo: '', descrizione: '', categoria_id: '' });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/appunti/categories');
            if (Array.isArray(res.data)) setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories', err);
        }
    };

    useEffect(() => {
        console.log('TeacherDashboard loaded [v2.1]');
        fetchCategories();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !formData.categoria_id) {
            setMessage('Per favore, seleziona un file e una categoria.');
            return;
        }

        const formDataPayload = new FormData();
        formDataPayload.append('titolo', formData.titolo);
        formDataPayload.append('descrizione', formData.descrizione);
        formDataPayload.append('categoria_id', formData.categoria_id);
        formDataPayload.append('file', file);

        setUploading(true);
        setMessage('');

        try {
            // Note: Don't set 'Content-Type': 'multipart/form-data' manually. 
            // Axios will set it automatically with the correct boundary when data is FormData.
            await api.post('/appunti', formDataPayload);
            setMessage('Materiale caricato con successo!');
            setFormData({ titolo: '', descrizione: '', categoria_id: '' });
            setFile(null);
            // Reset file input manually if needed
            e.target.reset();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Errore durante il caricamento';
            const errorDetail = err.response?.data?.error || '';
            setMessage(`${errorMsg} ${errorDetail}`);
            console.error('Upload error:', err.response?.data);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="container" style={{ padding: '2rem' }}>
                <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GraduationCap /> Pannello Docente
                    </h1>
                    <a href="/docente/valutazioni" className="btn-primary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Valutazioni Studenti <ArrowRight size={18} />
                    </a>
                </header>

                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Upload size={20} /> Carica Nuovo Materiale
                        </h3>
                        {message && (
                            <div className={`msg-badge ${message.includes('successo') ? 'success' : 'error'}`}
                                style={{
                                    background: message.includes('successo') ? '#dcfce7' : '#fee2e2',
                                    color: message.includes('successo') ? '#166534' : '#991b1b',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    textAlign: 'center'
                                }}>
                                {message}
                            </div>
                        )}
                        <form onSubmit={handleUpload}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Titolo</label>
                                <input
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    value={formData.titolo}
                                    onChange={e => setFormData({ ...formData, titolo: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Categoria</label>
                                <select
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    value={formData.categoria_id}
                                    onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleziona Materia...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Descrizione</label>
                                <textarea
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    value={formData.descrizione}
                                    onChange={e => setFormData({ ...formData, descrizione: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>File (PDF, DOCX)</label>
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files[0])}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} disabled={uploading}>
                                {uploading ? 'Caricamento...' : 'Carica Materiale'}
                            </button>
                        </form>
                    </div>

                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={20} /> Le tue attività
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>Gestisci il materiale didattico e monitora gli studenti da qui.</p>

                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FileText size={24} color="var(--primary)" />
                            <span>Puoi gestire i tuoi file dalla pagina "Appunti"</span>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <UserCheck size={24} color="var(--primary)" />
                            <span>Controlla il rendimento degli studenti</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Help missing icon GraduationCap
const GraduationCap = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
);

export default TeacherDashboard;
