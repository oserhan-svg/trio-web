import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseIcon, ChevronLeftIcon } from './Icons';
import PropTypes from 'prop-types';

/**
 * Lightweight, accessible image lightbox component
 */
const Lightbox = memo(({ images, initialIndex = 0, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialIndex]);

    const handleNext = useCallback((e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback((e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
    }, [onClose, handleNext, handlePrev]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="lightbox-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)'
                }}
            >
                <motion.button
                    className="lightbox-close"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2.5rem',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 10001
                    }}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    whileTap={{ scale: 0.9 }}
                >
                    <CloseIcon size={24} />
                </motion.button>

                <div className="lightbox-content" onClick={e => e.stopPropagation()} style={{
                    position: 'relative',
                    width: '90vw',
                    height: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentIndex}
                            src={images[currentIndex]}
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                borderRadius: '4px'
                            }}
                        />
                    </AnimatePresence>

                    {images.length > 1 && (
                        <>
                            <motion.button
                                className="lightbox-nav prev"
                                onClick={handlePrev}
                                style={{
                                    position: 'absolute',
                                    left: '-4rem',
                                    color: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                }}
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ChevronLeftIcon size={32} />
                            </motion.button>
                            <motion.button
                                className="lightbox-nav next"
                                onClick={handleNext}
                                style={{
                                    position: 'absolute',
                                    right: '-4rem',
                                    color: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                }}
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ChevronLeftIcon size={32} style={{ transform: 'rotate(180deg)' }} />
                            </motion.button>
                        </>
                    )}

                    <div className="lightbox-counter" style={{
                        position: 'absolute',
                        bottom: '-4rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        letterSpacing: '0.1em'
                    }}>
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
});

Lightbox.propTypes = {
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    initialIndex: PropTypes.number,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default Lightbox;
