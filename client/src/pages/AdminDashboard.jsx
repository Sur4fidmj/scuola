import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Trash2, UserCog } from 'lucide-react';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            if (Array.isArray(res.data)) setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users', err);
        }
    };

    const handleRoleChange = async (id, ruolo) => {
        try {
            await api.put(`/admin/users/${id}/role`, { ruolo });
            fetchUsers();
        } catch (err) {
            alert('Errore aggiornamento ruolo');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sicuro di voler eliminare questo utente?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Errore eliminazione utente');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container dashboard-page">
                <div className="page-header">
                    <h1>🛡️ Gestione Utenti Admin</h1>
                </div>

                <div className="card">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Ruolo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.nome} {u.cognome}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <select
                                            value={u.ruolo}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            className={`badge badge-${u.ruolo === 'professore' ? 'prof' : u.ruolo === 'admin' ? 'admin' : 'student'}`}
                                            style={{ border: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="studente">Studente</option>
                                            <option value="professore">Professore</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(u.id)} className="btn-icon delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
