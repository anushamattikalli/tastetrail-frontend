import { AlertCircle, RefreshCw } from 'lucide-react'
import './ErrorState.css'

export default function ErrorState({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while fetching information from the server.',
  onRetry,
}) {
  return (
    <div className="error-state-card">
      <div className="error-icon-wrap">
        <AlertCircle size={32} />
      </div>
      <h3 className="error-title">{title}</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="error-retry-btn">
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  )
}
