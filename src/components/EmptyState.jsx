import './EmptyState.css'

export default function EmptyState({
  title = 'No Dishes Found',
  description = 'We could not find any items matching your current criteria.',
  actionText,
  onAction,
}) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">🍽️</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="empty-state-btn">
          {actionText}
        </button>
      )}
    </div>
  )
}
