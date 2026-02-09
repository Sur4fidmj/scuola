import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Search, Download, Trash2, FileText, Filter, Eye, MessageSquare, Send, X } from 'lucide-react';
import '../styles/Appunti.css';

const Appunti = () => {
    const { user } = useContext(AuthContext);
    const [appunti, setAppunti] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');

    // Modal & Comments State
    const [selectedItem, setSelectedItem] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        console.log('Appunti component loaded [v3.0 - Preview & Comments]');
        fetchCategories();
        fetchAppunti();
    }, []);

    useEffect(() => {
        fetchAppunti();
    }, [search, catFilter]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/appunti/categories');
            if (Array.isArray(res.data)) setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories', err);
        }
    };

    const fetchAppunti = async () => {
        try {
            const res = await api.get('/appunti', { params: { search, categoria_id: catFilter } });
            if (Array.isArray(res.data)) setAppunti(res.data);
        } catch (err) {
            console.error('Error fetching notes', err);
        }
    };

    const handleOpenPreview = async (item) => {
        setSelectedItem(item);
        setComments([]);
        setLoadingComments(true);
        try {
            const res = await api.get(`/appunti/${item.id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error('Error fetching comments', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/appunti/${selectedItem.id}/comments`, { testo: newComment });
            setComments([...comments, {
                ...res.data,
                testo: newComment,
                nome: user.nome,
                cognome: user.cognome,
                ruolo: user.ruolo
            }]);
            setNewComment('');
        } catch (err) {
            alert('Errore durante l\'invio del commento');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Vuoi eliminare questi appunti?')) return;
        try {
            await api.delete(`/appunti/${id}`);
            fetchAppunti();
            if (selectedItem?.id === id) setSelectedItem(null);
        } catch (err) {
            alert('Errore durante l\'eliminazione');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container appunti-page">
                <div className="page-header">
                    <h1>📚 Appunti & Materiali</h1>
                    {user.ruolo === 'professore' && (
                        <a href="/docente/dashboard" className="btn btn-primary">Carica Nuovo +</a>
                    )}
                </div>

                <div className="filters-bar">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Cerca per titolo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                        <option value="">Tutte le categorie</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="appunti-grid">
                    {appunti.map(item => (
                        <div key={item.id} className="card appunto-card">
                            <div className="card-icon"><FileText size={32} /></div>
                            <div className="card-content">
                                <h3>{item.titolo}</h3>
                                <span className="cat-badge">{item.categoria_nome}</span>
                                <p className="author">Prof. {item.autore_nome} {item.autore_cognome}</p>
                                <p className="desc">{item.descrizione}</p>
                                <div className="card-actions">
                                    <button onClick={() => handleOpenPreview(item)} className="btn-icon preview">
                                        <Eye size={18} /> Anteprima
                                    </button>
                                    <a target="_blank" href={`https://king-hosting.it/uploads/${item.file_path}`} className="btn-icon download" rel="noreferrer">
                                        <Download size={18} /> Scarica
                                    </a>
                                    {(user.ruolo === 'admin' || user.id === item.autore_id) && (
                                        <button onClick={() => handleDelete(item.id)} className="btn-icon delete">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {appunti.length === 0 && <p className="no-result">Nessun appunto trovato.</p>}
                </div>
            </div>

            {/* Preview & Commenti Modal */}
            {selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content preview-modal glass-card">
                        <button className="close-btn" onClick={() => setSelectedItem(null)}><X /></button>

                        <div className="preview-layout">
                            {/* Document Preview */}
                            <div className="document-container">
                                <h2>{selectedItem.titolo}</h2>
                                <div className="iframe-wrapper">
                                    <iframe
                                        src={`https://king-hosting.it/uploads/${selectedItem.file_path}`}
                                        title="Document Preview"
                                        frameBorder="0"
                                    ></iframe>
                                </div>
                            </div>

                            {/* Comment Section */}
                            <div className="comment-sidebar">
                                <h3><MessageSquare size={20} /> Commenti</h3>
                                <div className="comments-list">
                                    {loadingComments ? (
                                        <p>Caricamento commenti...</p>
                                    ) : comments.map(c => (
                                        <div key={c.id} className="comment-item">
                                            <div className="comment-header">
                                                <strong>{c.nome} {c.cognome}</strong>
                                                <span className={`role-badge ${c.ruolo}`}>{c.ruolo}</span>
                                            </div>
                                            <p>{c.testo}</p>
                                            <span className="comment-date">{new Date(c.data_creazione).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {comments.length === 0 && !loadingComments && <p className="no-comments">Ancora nessun commento. Sii il primo!</p>}
                                </div>

                                <form className="comment-input" onSubmit={handleAddComment}>
                                    <input
                                        type="text"
                                        placeholder="Scrivi un commento..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button type="submit"><Send size={18} /></button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Appunti;

