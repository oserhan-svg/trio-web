import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const skeletons = Array.from({ length: count }, (_, index) => index);

    if (type === 'card') {
        return (
            <>
                {skeletons.map((index) => (
                    <div key={index} className="skeleton-card">
                        <div className="skeleton-image"></div>
                        <div className="skeleton-content">
                            <div className="skeleton-title"></div>
                            <div className="skeleton-text"></div>
                            <div className="skeleton-text short"></div>
                            <div className="skeleton-footer">
                                <div className="skeleton-icon"></div>
                                <div className="skeleton-icon"></div>
                                <div className="skeleton-icon"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (type === 'text') {
        return (
            <>
                {skeletons.map((index) => (
                    <div key={index} className="skeleton-text-line"></div>
                ))}
            </>
        );
    }

    return null;
};

export default SkeletonLoader;
