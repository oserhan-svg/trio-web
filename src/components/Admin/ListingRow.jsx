import React, { memo } from 'react';
import { TrashIcon, ExternalLinkIcon } from '../UI/Icons';

const ListingRow = memo(({ listing, onStatusChange, onDelete }) => {
    return (
        <tr>
            <td>
                <div className="admin-listing-info">
                    <img src={listing.imageUrl} alt="" className="admin-thumb" loading="lazy" />
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
                    onChange={(e) => onStatusChange(listing.id, e.target.value)}
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
                    <button className="delete-btn" onClick={() => onDelete(listing.id)} title="Sil">
                        <TrashIcon size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
});

export default ListingRow;
