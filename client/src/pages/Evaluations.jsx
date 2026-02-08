import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import {
    Search, User, Star, Edit, Trash2, Plus,
    CheckCircle, XCircle, ChevronRight, UserCircle
} from 'lucide-react';
import '../styles/Dashboard.css';

const Evaluations = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [evaluations, setEvaluations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({ nome: '', cognome: '', email: '' });

    // Evaluation Form State
    const [isAddingVal, setIsAddingVal] = useState(false);
    const [editingValId, setEditingValId] = useState(null);
    const [formData, setFormData] = useState({
        qualita: 3,
        interessi: 3,
        interesse_lavoro: 3,
        tipo_lavoro: '',
        note: ''
    });

    useEffect(() => {
        console.log('Evaluations component loaded [v2.2 - fixed fetchStudents]');
        fetchStudents();
        fetchAllEvaluations();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/users');
            if (res.data && Array.isArray(res.data)) {
                setStudents(res.data.filter(u => u.ruolo === 'studente'));
            } else {
                console.error('Students data is not an array:', res.data);
                setStudents([]);
            }
        } catch (err) {
            console.error('Error fetching students', err);
        }
    };

    const fetchAllEvaluations = async () => {
        try {
            const res = await api.get('/valutazioni');
            if (res.data && Array.isArray(res.data)) {
                setEvaluations(res.data);
            } else {
                console.error('Evaluations data is not an array:', res.data);
                setEvaluations([]);
            }
        } catch (err) {
            console.error('Error fetching evaluations', err);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setProfileData({ nome: student.nome, cognome: student.cognome, email: student.email });
        setIsEditingProfile(false);
        setIsAddingVal(false);
        setEditingValId(null);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${selectedStudent.id}/profile`, profileData);
            alert('Profilo aggiornato!');
            setIsEditingProfile(false);
            fetchStudents(); // Refresh list
            setSelectedStudent({ ...selectedStudent, ...profileData });
        } catch (err) {
            alert('Errore aggiornamento profilo');
        }
    };

    const handleSubmitValutazione = async (e) => {
        e.preventDefault();
        try {
            if (editingValId) {
                await api.put(`/valutazioni/${editingValId}`, formData);
                alert('Valutazione aggiornata!');
            } else {
                await api.post('/valutazioni', { ...formData, student_id: selectedStudent.id });
                alert('Valutazione aggiunta!');
            }
            setIsAddingVal(false);
            setEditingValId(null);
            fetchAllEvaluations();
            resetForm();
        } catch (err) {
            const msg = err.response?.data?.message || 'Errore salvataggio';
            const detail = err.response?.data?.error || '';
            alert(`Errore: ${msg} ${detail}`);
            console.error('Save error:', err.response?.data);
        }
    };

    const handleDeleteValutazione = async (id) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa valutazione?')) return;
        try {
            await api.delete(`/valutazioni/${id}`);
            fetchAllEvaluations();
        } catch (err) {
            alert('Errore eliminazione');
        }
    };

    const startEditValutazione = (val) => {
        setEditingValId(val.id);
        setIsAddingVal(true);
        setFormData({
            qualita: val.qualita,
            interessi: val.interessi,
            interesse_lavoro: val.interesse_lavoro,
            tipo_lavoro: val.tipo_lavoro,
            note: val.note
        });
    };

    const resetForm = () => {
        setFormData({
            qualita: 3,
            interessi: 3,
            interesse_lavoro: 3,
            tipo_lavoro: '',
            note: ''
        });
    };

    const filteredStudents = (Array.isArray(students) ? students : []).filter(s =>
        `${s.nome} ${s.cognome}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const studentEvaluations = (Array.isArray(evaluations) ? evaluations : []).filter(e => e.studente_id === selectedStudent?.id);

    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="eval-layout">
                {/* Left Sidebar: Student List */}
                <div className="eval-sidebar">
                    <div className="sidebar-header">
                        <h3>Studenti</h3>
                        <div className="search-bar">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Cerca studente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="student-list">
                        {filteredStudents.map(s => (
                            <div
                                key={s.id}
                                className={`student-item ${selectedStudent?.id === s.id ? 'active' : ''}`}
                                onClick={() => handleSelectStudent(s)}
                            >
                                <div className="student-avatar">
                                    {s.nome[0]}{s.cognome[0]}
                                </div>
                                <div className="student-info">
                                    <span className="name">{s.nome} {s.cognome}</span>
                                    <span className="email">{s.email}</span>
                                </div>
                                <ChevronRight size={16} className="arrow" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Content: Details */}
                <div className="eval-content">
                    {selectedStudent ? (
                        <div className="student-details">
                            <div className="details-header">
                                <div className="profile-summary">
                                    <UserCircle size={48} className="profile-icon" />
                                    <div className="info">
                                        <h2>{selectedStudent.nome} {selectedStudent.cognome}</h2>
                                        <p>{selectedStudent.email}</p>
                                    </div>
                                </div>
                                <button
                                    className="btn-edit-profile"
                                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                                >
                                    <Edit size={16} /> Modifica Profilo
                                </button>
                            </div>

                            {isEditingProfile && (
                                <form className="profile-edit-form glass-card" onSubmit={handleUpdateProfile}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Nome</label>
                                            <input
                                                type="text"
                                                value={profileData.nome}
                                                onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Cognome</label>
                                            <input
                                                type="text"
                                                value={profileData.cognome}
                                                onChange={(e) => setProfileData({ ...profileData, cognome: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-primary">Salva Modifiche</button>
                                        <button type="button" className="btn-secondary" onClick={() => setIsEditingProfile(false)}>Annulla</button>
                                    </div>
                                </form>
                            )}

                            <div className="evaluations-section">
                                <div className="section-header">
                                    <h3>Valutazioni</h3>
                                    <button
                                        className="btn-add-eval"
                                        onClick={() => { setIsAddingVal(true); setEditingValId(null); resetForm(); }}
                                    >
                                        <Plus size={16} /> Nuova Valutazione
                                    </button>
                                </div>

                                {isAddingVal && (
                                    <form className="eval-form glass-card" onSubmit={handleSubmitValutazione}>
                                        <h4>{editingValId ? 'Modifica Valutazione' : 'Nuova Valutazione'}</h4>
                                        <div className="form-grid">
                                            <div className="range-group">
                                                <label>Qualità (1-5): {formData.qualita}</label>
                                                <input type="range" min="1" max="5" value={formData.qualita} onChange={(e) => setFormData({ ...formData, qualita: e.target.value })} />
                                            </div>
                                            <div className="range-group">
                                                <label>Interessi (1-5): {formData.interessi}</label>
                                                <input type="range" min="1" max="5" value={formData.interessi} onChange={(e) => setFormData({ ...formData, interessi: e.target.value })} />
                                            </div>
                                            <div className="range-group">
                                                <label>Interesse Lavoro (1-5): {formData.interesse_lavoro}</label>
                                                <input type="range" min="1" max="5" value={formData.interesse_lavoro} onChange={(e) => setFormData({ ...formData, interesse_lavoro: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label>Tipo di Lavoro Suggerito</label>
                                                <input type="text" value={formData.tipo_lavoro} onChange={(e) => setFormData({ ...formData, tipo_lavoro: e.target.value })} placeholder="Es. Backend, Design..." />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Note / Osservazioni</label>
                                            <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} rows="3"></textarea>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn-primary">{editingValId ? 'Aggiorna' : 'Carica'}</button>
                                            <button type="button" className="btn-secondary" onClick={() => setIsAddingVal(false)}>Annulla</button>
                                        </div>
                                    </form>
                                )}

                                <div className="eval-history">
                                    {(Array.isArray(studentEvaluations) ? studentEvaluations : []).map(val => (
                                        <div key={val.id} className="eval-card">
                                            <div className="eval-header">
                                                <div className="date">{new Date(val.data_valutazione).toLocaleDateString()}</div>
                                                <div className="prof">Prof. {val.prof_nome} {val.prof_cognome}</div>
                                                <div className="eval-actions">
                                                    <button onClick={() => startEditValutazione(val)}><Edit size={14} /></button>
                                                    <button onClick={() => handleDeleteValutazione(val.id)} className="delete"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="eval-stats">
                                                <div className="stat"><span>Qualità</span> <strong>{val.qualita}/5</strong></div>
                                                <div className="stat"><span>Interessi</span> <strong>{val.interessi}/5</strong></div>
                                                <div className="stat"><span>Lavoro</span> <strong>{val.interesse_lavoro}/5</strong></div>
                                            </div>
                                            {val.tipo_lavoro && <div className="eval-tag">Settore: {val.tipo_lavoro}</div>}
                                            {val.note && <p className="eval-note">{val.note}</p>}
                                        </div>
                                    ))}
                                    {studentEvaluations.length === 0 && !isAddingVal && (
                                        <div className="empty-state">Nessuna valutazione presente per questo studente.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="select-prompt">
                            <UserCircle size={64} />
                            <h3>Seleziona uno studente</h3>
                            <p>Scegli uno studente dalla lista a sinistra per visualizzare il suo profilo e la cronologia delle valutazioni.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Evaluations;
