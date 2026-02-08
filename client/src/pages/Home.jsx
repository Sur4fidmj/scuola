import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Book, Users, Star, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <>
            <Navbar />
            <div className="container">
                <header className="hero">
                    <div className="hero-content">
                        <h1>
                            Benvenuto nella Scuola <span className="gradient-text">Del Futuro</span>
                        </h1>
                        <p>La piattaforma completa per gestire studio, valutazioni e orientamento.</p>
                        {!user && (
                            <Link to="/login" className="btn btn-primary">Inizia Ora <ArrowRight size={18} /></Link>
                        )}
                    </div>
                </header>

                <section className="features-grid">
                    <div className="feature-card">
                        <div className="icon-wrapper bg-indigo"><Book size={24} /></div>
                        <h3>Materiale Didattico</h3>
                        <p>Accedi a migliaia di appunti e dispense condivise dai professori.</p>
                        <Link to="/appunti">Vai agli Appunti →</Link>
                    </div>
                    <div className="feature-card">
                        <div className="icon-wrapper bg-pink"><Star size={24} /></div>
                        <h3>Valutazioni & Orientamento</h3>
                        <p>Monitora i tuoi progressi e scopri il percorso lavorativo più adatto a te.</p>
                        <Link to={user?.ruolo === 'studente' ? '#' : '/docente/valutazioni'}>Scopri di più →</Link>
                    </div>
                    <div className="feature-card">
                        <div className="icon-wrapper bg-emerald"><Users size={24} /></div>
                        <h3>Community</h3>
                        <p>Uno spazio connesso per studenti, docenti e amministrazione.</p>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Home;
