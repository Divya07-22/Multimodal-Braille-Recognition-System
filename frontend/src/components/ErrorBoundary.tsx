import React, { ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState(prev => ({
      ...prev,
      errorInfo
    }))
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-4">
          <div className="text-center max-w-2xl">
            <div className="mb-6 text-red-400">
              <AlertTriangle className="w-20 h-20 mx-auto mb-4" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              Oops! Something Went Wrong
            </h1>

            <p className="text-white/80 text-lg mb-6">
              We're sorry for the inconvenience. An unexpected error has occurred.
            </p>

            {/* Error Details */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 mb-6 text-left max-h-64 overflow-y-auto">
              <h3 className="text-white font-bold mb-3">Error Details:</h3>
              <p className="text-red-300 font-mono text-sm mb-3">
                {this.state.error?.message || 'Unknown error'}
              </p>
              {this.state.errorInfo && (
                <details className="text-white/70 text-xs">
                  <summary className="cursor-pointer hover:text-white mb-2">
                    Stack Trace
                  </summary>
                  <pre className="whitespace-pre-wrap break-words bg-black/50 p-3 rounded mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} /> Try Again
              </button>

              <Link
                to="/"
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <Home size={20} /> Go Home
              </Link>
            </div>

            {/* Support */}
            <p className="text-white/60 text-sm mt-8">
              If this problem persists, please{' '}
              <a href="mailto:support@braille.com" className="text-pink-400 hover:underline">
                contact our support team
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary