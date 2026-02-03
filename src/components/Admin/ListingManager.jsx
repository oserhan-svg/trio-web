import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, EditIcon, ExternalLinkIcon } from '../UI/Icons';
import { useNotification } from '../UI/NotificationSystem';
import useListings from '../../hooks/useListings';
import SkeletonLoader from '../UI/SkeletonLoader';
import config from '../../config';

const ListingManager = () => {
    const { allListings: listings, loading, refreshCache } = useListings();
    const { showNotification } = useNotification();

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/listings/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Update cache globally so changes reflect everywhere
                refreshCache();
                showNotification(`Durum ${newStatus} olarak güncellendi`);
            }
        } catch (error) {
            showNotification('Güncelleme başarısız', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu ilanı tamamen silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/listings/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                refreshCache();
                showNotification('İlan silindi');
            }
        } catch (error) {
            showNotification('Silme işlemi başarısız', 'error');
        }
    };

    if (loading && listings.length === 0) {
        return (
            <div className="listing-manager">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>İlan</th>
                                <th>Fiyat</th>
                                <th>Kategori</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan="5" style={{ padding: '20px' }}>
                                        <SkeletonLoader type="text" count={1} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="listing-manager">
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>İlan</th>
                            <th>Fiyat</th>
                            <th>Kategori</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map(listing => (
                            <tr key={listing.id}>
                                <td>
                                    <div className="admin-listing-info">
                                        <img src={listing.imageUrl} alt="" className="admin-thumb" />
                                        <div>
                                            <div className="admin-listing-title">{listing.title}</div>
                                            <div className="admin-listing-id">ID: {listing.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{listing.price}</td>
                                <td>{listing.type}</td>
                                <td>
                                    <select
                                        className={`status-select ${listing.status}`}
                                        value={listing.status}
                                        onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                                    >
                                        <option value="active">Yayında</option>
                                        <option value="sold">Satıldı</option>
                                        <option value="passive">Pasif</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="admin-actions">
                                        <button onClick={() => window.open(`/ilan/${listing.id}`, '_blank')} title="Görüntüle">
                                            <ExternalLinkIcon size={18} />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(listing.id)} title="Sil">
                                            <TrashIcon size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListingManager;
