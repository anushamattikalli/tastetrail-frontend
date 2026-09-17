import { CATEGORY_METADATA } from '../utils/foodImages'
import './CategoryFilter.css'

export default function CategoryFilter({
  selectedCategory = 'ALL',
  onSelectCategory,
  counts = {},
}) {
  return (
    <div className="category-filter-wrapper">
      <div className="category-filter-scroll">
        {CATEGORY_METADATA.map((cat) => {
          const isSelected =
            selectedCategory.toUpperCase() === cat.id.toUpperCase()
          const count = counts[cat.id]

          return (
            <button
              key={cat.id}
              className={`category-chip ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
              {typeof count === 'number' && (
                <span className="category-count">({count})</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
