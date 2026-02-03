import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <h2 style={{
                        fontFamily: 'var(--font-family-heading)',
                        color: 'var(--color-primary)',
                        marginBottom: '1rem',
                    }}>
                        Bir şeyler yanlış gitti
                    </h2>
                    <p style={{
                        color: 'var(--color-text-light)',
                        marginBottom: '2rem',
                        maxWidth: '500px',
                    }}>
                        Üzgünüz, bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                        style={{
                            padding: '0.875rem 1.75rem',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        Sayfayı Yenile
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'var(--color-bg-alt)',
                            borderRadius: 'var(--radius-md)',
                            maxWidth: '800px',
                            width: '100%',
                            textAlign: 'left',
                        }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
                                Hata Detayları (Geliştirici Modu)
                            </summary>
                            <pre style={{
                                fontSize: '0.85rem',
                                overflow: 'auto',
                                color: 'var(--color-text)',
                            }}>
                                {this.state.error.toString()}
                                {'\n\n'}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
