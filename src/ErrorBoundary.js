import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown runtime error',
    };
  }

  componentDidCatch(error, info) {
    // Keep this for debugging in browser devtools.
    console.error('Runtime crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
          <h2>Application Error</h2>
          <p>The app crashed while rendering. Please share this message:</p>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
            {this.state.errorMessage}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
