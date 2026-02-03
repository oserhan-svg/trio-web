import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, EditIcon, ExternalLinkIcon } from '../UI/Icons';
import { useNotification } from '../UI/NotificationSystem';
import useListings from '../../hooks/useListings';
import SkeletonLoader from '../UI/SkeletonLoader';
import ListingRow from './ListingRow';
import config from '../../config';

const ListingManager = () => {
    const { allListings: listings, loading, refreshCache, updateListing, removeListing } = useListings();
    const { showNotification } = useNotification();

    // Use callbacks to ensure stable references for child components
    const handleStatusChange = React.useCallback(async (id, newStatus) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/listings/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Optimistic update
                updateListing(id, { status: newStatus });
                showNotification(`Durum ${newStatus} olarak güncellendi`);
            }
        } catch (error) {
            showNotification('Güncelleme başarısız', 'error');
        }
    }, [updateListing, showNotification]);

    const handleDelete = React.useCallback(async (id) => {
        if (!window.confirm('Bu ilanı tamamen silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/listings/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Optimistic update
                removeListing(id);
                showNotification('İlan silindi');
            }
        } catch (error) {
            showNotification('Silme işlemi başarısız', 'error');
        }
    }, [removeListing, showNotification]);

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
                            <ListingRow
                                key={listing.id}
                                listing={listing}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListingManager;
