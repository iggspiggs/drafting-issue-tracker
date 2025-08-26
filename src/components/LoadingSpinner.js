import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  const spinnerStyle = {
    display: 'inline-block',
    width: spinnerSize,
    height: spinnerSize,
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    gap: '10px'
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {message && <span style={{ color: '#666', fontSize: '14px' }}>{message}</span>}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Full-screen loading overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <LoadingSpinner size="large" message={message} />
    </div>
  );
};

export default LoadingSpinner;