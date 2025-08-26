import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid #ff6b6b', 
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          color: '#c92a2a'
        }}>
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              <summary>Error Details (Development Mode)</summary>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '10px' }}>
                <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                <br />
                <strong>Stack Trace:</strong> {this.state.errorInfo.componentStack}
              </div>
            </details>
          )}
          
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#c92a2a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;