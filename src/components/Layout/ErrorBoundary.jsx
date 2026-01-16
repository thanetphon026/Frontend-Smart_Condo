import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
                    <div className="text-center p-5 bg-white rounded shadow-sm">
                        <h1 className="text-danger mb-3">
                            <i className="bi bi-exclamation-triangle"></i>
                        </h1>
                        <h3 className="mb-3">เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h3>
                        <p className="text-muted mb-4">
                            ระบบพบปัญหาบางอย่าง กรุณารีโหลดหน้าเว็บใหม่
                        </p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={this.handleReload}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            รีโหลดหน้าเว็บ
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 text-start bg-light p-3 rounded" style={{ maxWidth: '500px', overflow: 'auto' }}>
                                <small className="text-danger font-monospace">
                                    {this.state.error && this.state.error.toString()}
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
