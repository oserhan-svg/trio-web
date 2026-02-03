import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ListingManager from '../components/Admin/ListingManager';
import ScraperStats from '../components/Admin/ScraperStats';
import { LogOutIcon } from '../components/UI/Icons';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import { useNotification } from '../components/UI/NotificationSystem';
import config from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleLogout = () => {
        if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            localStorage.removeItem('trio_admin_session');
            showNotification('Çıkış yapıldı', 'success');
            navigate('/login');
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/stats`);
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Stats fetch failed');
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="admin-dashboard-page">
            <header className="admin-header">
                <div className="admin-header-left">
                    <h1>Yönetim Paneli</h1>
                    <p>Portföy ve sistem durumunu buradan yönetebilirsiniz.</p>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Çıkış Yap">
                    <LogOutIcon size={20} />
                    <span>Çıkış</span>
                </button>
                {stats ? (
                    <div className="admin-quick-stats">
                        <div className="stat-card">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Toplam İlan</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value text-gold">{stats.active}</span>
                            <span className="stat-label">Yayında</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value text-red">{stats.sold}</span>
                            <span className="stat-label">Satılan</span>
                        </div>
                    </div>
                ) : (
                    <div className="admin-quick-stats">
                        <div className="stat-card skeleton">
                            <SkeletonLoader type="text" count={2} />
                        </div>
                        <div className="stat-card skeleton">
                            <SkeletonLoader type="text" count={2} />
                        </div>
                        <div className="stat-card skeleton">
                            <SkeletonLoader type="text" count={2} />
                        </div>
                    </div>
                )}
            </header>

            <main className="admin-content">
                <div className="admin-grid-layout">
                    <section className="admin-section main-area">
                        <div className="section-header">
                            <h2>İlan Yönetimi</h2>
                        </div>
                        <ListingManager />
                    </section>

                    <aside className="admin-sidebar">
                        <section className="admin-section">
                            <div className="section-header">
                                <h2>Sistem Durumu</h2>
                            </div>
                            <div className="section-body">
                                <ScraperStats />
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
