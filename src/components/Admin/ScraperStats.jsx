import React from 'react';

const ScraperStats = () => {
    // Mock data for scraper status
    const status = {
        lastRun: 'Bugün, 14:30',
        activeJobs: 0,
        successRate: '98%',
        sources: [
            { name: 'Wix Portföy', status: 'connected', lastSync: '10 dk önce' },
            { name: 'Resim Sunucusu', status: 'connected', lastSync: '2 saat önce' }
        ]
    };

    return (
        <div className="scraper-stats-widget">
            <div className="stats-grid-mini">
                <div className="mini-stat">
                    <span className="mini-label">Son Senkronizasyon</span>
                    <span className="mini-value">{status.lastRun}</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-label">Başarı Oranı</span>
                    <span className="mini-value text-green">{status.successRate}</span>
                </div>
            </div>

            <div className="source-list">
                {status.sources.map(src => (
                    <div key={src.name} className="source-item">
                        <div className={`status-dot ${src.status}`}></div>
                        <div className="source-info">
                            <div className="source-name">{src.name}</div>
                            <div className="source-time">{src.lastSync}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScraperStats;
